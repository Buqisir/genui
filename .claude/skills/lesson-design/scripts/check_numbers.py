#!/usr/bin/env python3
"""核对课的规格里 ```check 代码块的数值。用法：python3 check_numbers.py <规格.md>

块内每行：
    名字 = 表达式            定义中间量
    名字 = 表达式 ≈ 值        定义并核对（按"值"的小数位数四舍五入，ROUND_HALF_UP）
# 后是注释，空行忽略。只允许数字、名字、+ - * / ^ 括号、一元负号、白名单函数。
"""
import ast
import math
import re
import sys
from decimal import Decimal, ROUND_HALF_UP

FUNCS = {
    "sqrt": math.sqrt, "sin": math.sin, "cos": math.cos, "tan": math.tan,
    "asin": math.asin, "acos": math.acos, "atan": math.atan,
    "exp": math.exp, "log": math.log, "log10": math.log10,
    "abs": abs, "min": min, "max": max, "round": round,
}
CONSTS = {"pi": math.pi, "e": math.e}
G_DEFAULT = 9.8
NAME_RE = r"[^\W\d]\w*"
VALUE_RE = r"[+-]?\d+(?:\.\d+)?"


class EvalError(Exception):
    pass


def _norm(s):
    return (s.replace("−", "-").replace("×", "*")
             .replace("÷", "/").replace("–", "-"))


def safe_eval(expr, env):
    expr = _norm(expr).replace("^", "**")
    try:
        tree = ast.parse(expr.strip(), mode="eval")
    except SyntaxError as ex:
        raise EvalError("语法错误: %s" % (ex.msg,))

    def ev(n):
        if isinstance(n, ast.Expression):
            return ev(n.body)
        if isinstance(n, ast.Constant):
            if isinstance(n.value, bool) or not isinstance(n.value, (int, float)):
                raise EvalError("不允许的常量: %r" % (n.value,))
            return float(n.value)
        if isinstance(n, ast.Name):
            if n.id in env:
                return env[n.id]
            if n.id in CONSTS:
                return CONSTS[n.id]
            if n.id == "g":
                return G_DEFAULT
            raise EvalError("未定义的名字: %s" % n.id)
        if isinstance(n, ast.UnaryOp) and isinstance(n.op, (ast.USub, ast.UAdd)):
            v = ev(n.operand)
            return -v if isinstance(n.op, ast.USub) else v
        if isinstance(n, ast.BinOp) and isinstance(
                n.op, (ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Pow)):
            a, b = ev(n.left), ev(n.right)
            try:
                if isinstance(n.op, ast.Add):
                    return a + b
                if isinstance(n.op, ast.Sub):
                    return a - b
                if isinstance(n.op, ast.Mult):
                    return a * b
                if isinstance(n.op, ast.Div):
                    return a / b
                if abs(b) > 1000:
                    raise EvalError("乘方指数过大")
                r = a ** b
                if isinstance(r, complex):
                    raise EvalError("乘方结果不是实数")
                return r
            except ZeroDivisionError:
                raise EvalError("除以 0")
            except OverflowError:
                raise EvalError("数值溢出")
        if isinstance(n, ast.Call):
            if (not isinstance(n.func, ast.Name) or n.func.id not in FUNCS
                    or n.keywords):
                raise EvalError("不允许的函数调用")
            args = [ev(a) for a in n.args]
            try:
                r = FUNCS[n.func.id](*args)
            except (ValueError, TypeError, ZeroDivisionError, OverflowError) as ex:
                raise EvalError("函数 %s 出错: %s" % (n.func.id, ex))
            return float(r)
        raise EvalError("不允许的写法: %s" % type(n).__name__)

    return ev(tree)


def round_to(x, places):
    d = Decimal(format(x, ".12g"))
    return d.quantize(Decimal(1).scaleb(-places), rounding=ROUND_HALF_UP)


def extract_blocks(text):
    """返回 (blocks, body)。blocks: [(起始行号, [(行号, 行文)])]；body: check 块以外的正文。"""
    blocks, body, cur, start = [], [], None, 0
    for i, line in enumerate(text.split("\n"), 1):
        if cur is None:
            if re.match(r"^\s*```check\s*$", line):
                cur, start = [], i
            else:
                body.append(line)
        else:
            if re.match(r"^\s*```\s*$", line):
                blocks.append((start, cur))
                cur = None
            else:
                cur.append((i, line))
    if cur is not None:
        blocks.append((start, cur))
    return blocks, "\n".join(body)


def run(text):
    """返回 (results, warnings, exit_code)。results 每项 dict: line,name,status(ok/bad/def/error),..."""
    blocks, body = extract_blocks(text)
    if not blocks:
        return [], [], 0, False
    env, results, warnings = {}, [], []
    for _, lines in blocks:
        for ln, raw in lines:
            line = raw.split("#", 1)[0].strip()
            if not line:
                continue
            m = re.match(r"^(%s)\s*=\s*(.+)$" % NAME_RE, _norm(line))
            if not m:
                results.append(dict(line=ln, name="?", status="error",
                                    msg="语法错误: 应为 名字 = 表达式 [≈ 值]"))
                continue
            name, rest = m.group(1), m.group(2)
            expect = None
            if "≈" in rest:
                expr, val = rest.split("≈", 1)
                val = val.strip()
                if not re.fullmatch(VALUE_RE, val):
                    results.append(dict(line=ln, name=name, status="error",
                                        msg="语法错误: ≈ 后面应是数值，得到 %r" % val))
                    continue
                expect = val
            else:
                expr = rest
            try:
                x = safe_eval(expr, env)
            except EvalError as ex:
                results.append(dict(line=ln, name=name, status="error", msg=str(ex)))
                continue
            env[name] = x
            if expect is None:
                results.append(dict(line=ln, name=name, status="def", value=x))
                continue
            places = len(expect.split(".")[1]) if "." in expect else 0
            ok = round_to(x, places) == Decimal(expect)
            results.append(dict(line=ln, name=name, status="ok" if ok else "bad",
                                value=x, expect=expect))
            unsigned = expect.lstrip("+-")
            if not re.search(r"(?<![\d.])%s(?!\d)" % re.escape(unsigned), body):
                warnings.append("警告：行 %d 的 %s 写的值 %s 在规格正文里一次都没出现过"
                                "（可能写错，或正文没用上）" % (ln, name, expect))
    code = 1 if any(r["status"] in ("bad", "error") for r in results) else 0
    return results, warnings, code, True


def main(argv):
    if len(argv) != 2:
        print("用法：python3 check_numbers.py <规格.md>")
        return 2
    with open(argv[1], encoding="utf-8") as f:
        text = f.read()
    results, warnings, code, has = run(text)
    if not has:
        print("没有 check 块")
        return 0
    for r in results:
        if r["status"] == "error":
            print("行 %d  %s  ✗ %s" % (r["line"], r["name"], r["msg"]))
        elif r["status"] == "def":
            print("行 %d  %s = %s  (中间量)" % (r["line"], r["name"], format(r["value"], ".6g")))
        else:
            print("行 %d  %s = %s  写的值 %s  %s" % (
                r["line"], r["name"], format(r["value"], ".6g"), r["expect"],
                "✓" if r["status"] == "ok" else "✗"))
    for w in warnings:
        print(w)
    bad = sum(r["status"] in ("bad", "error") for r in results)
    n = sum(r["status"] in ("ok", "bad") for r in results)
    print("核对 %d 条，失败/错误 %d 条" % (n, bad))
    return code


if __name__ == "__main__":
    sys.exit(main(sys.argv))
