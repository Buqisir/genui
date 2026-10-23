import os
import subprocess
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import check_numbers as cn  # noqa: E402
import check_spec as cs  # noqa: E402

EXAMPLE = """正文提到 0.238 和 0.0709 与 98.45。
```check
m1 = 0.4
m2 = 0.2
p_mag = m1*0.198 + m2*0.794 ≈ 0.238
k_mag = 0.5*m1*0.198^2 + 0.5*m2*0.794^2 ≈ 0.0709
r_mag = k_mag/0.072*100 ≈ 98.45
r_bad = k_mag/0.072*100 ≈ 98.4
```
"""


def blk(body):
    return "```check\n" + body + "\n```\n"


class NumbersTest(unittest.TestCase):
    def status(self, body):
        res, warn, code, has = cn.run(blk(body))
        return [r["status"] for r in res], code, res

    def test_example(self):
        res, warn, code, has = cn.run(EXAMPLE)
        st = [r["status"] for r in res]
        self.assertEqual(st, ["def", "def", "ok", "ok", "ok", "bad"])
        self.assertEqual(code, 1)
        self.assertAlmostEqual(res[-1]["value"], 98.45056, places=3)
        self.assertFalse(any("98.45" in w and "r_mag" in w for w in warn))
        self.assertEqual(len(warn), 1)  # 98.4 在正文里没有独立出现
        self.assertIn("98.4", warn[0])

    def test_power_and_funcs(self):
        st, code, _ = self.status("a = 2^10 ≈ 1024\nb = sqrt(16) + abs(-3) ≈ 7\n"
                                  "c = -2^2 ≈ -4\nd = max(1,2,3) - min(4,5) ≈ -1\n"
                                  "e1 = pi*2 ≈ 6.28\nf = g*2 ≈ 19.6\nh = 2^3^2 ≈ 512")
        self.assertEqual(st, ["ok"] * 7)
        self.assertEqual(code, 0)

    def test_round_half_up(self):
        st, _, _ = self.status("a = 0.285 ≈ 0.29\nb = 2.5 ≈ 3\nc = 1/3 ≈ 0.333")
        self.assertEqual(st, ["ok", "ok", "ok"])

    def test_g_overridable(self):
        st, _, _ = self.status("g = 10\nx = g*2 ≈ 20")
        self.assertEqual(st, ["def", "ok"])

    def test_undefined(self):
        st, code, res = self.status("a = b + 1")
        self.assertEqual(st, ["error"])
        self.assertEqual(code, 1)
        self.assertIn("未定义", res[0]["msg"])

    def test_malicious(self):
        for expr in ["__import__('os').system('echo hi')", "().__class__",
                     "open('x')", "[1,2]", "'a'", "x.y", "(lambda: 1)()",
                     "sqrt(a=1)", "True", "1 if 1 else 2", "10**10**10"]:
            st, code, _ = self.status("a = " + expr)
            self.assertEqual(st, ["error"], expr)
            self.assertEqual(code, 1)

    def test_syntax_and_comments(self):
        st, code, _ = self.status("# 注释\n\na = 1 + # x\nb = 2  # ok\nc 3")
        self.assertEqual(st, ["error", "def", "error"])

    def test_bad_value(self):
        st, _, _ = self.status("a = 1 ≈ abc")
        self.assertEqual(st, ["error"])

    def test_no_block(self):
        self.assertFalse(cn.run("没有代码块")[3])
        p = os.path.join(HERE, "_tmp_noblock.md")
        with open(p, "w", encoding="utf-8") as f:
            f.write("hello")
        try:
            out = subprocess.run([sys.executable, os.path.join(HERE, "check_numbers.py"), p],
                                 capture_output=True, text=True)
        finally:
            os.remove(p)
        self.assertEqual(out.returncode, 0)
        self.assertIn("没有 check 块", out.stdout)

    def test_cli_exit_code(self):
        p = os.path.join(HERE, "_tmp_ex.md")
        with open(p, "w", encoding="utf-8") as f:
            f.write(EXAMPLE)
        try:
            out = subprocess.run([sys.executable, os.path.join(HERE, "check_numbers.py"), p],
                                 capture_output=True, text=True)
        finally:
            os.remove(p)
        self.assertEqual(out.returncode, 1)
        self.assertIn("✗", out.stdout)
        self.assertIn("✓", out.stdout)


GOOD = """# 示例课

## 课标定位
- 内容要求：通过实验理解动量
- 学业要求：能用动量分析现象
- 教学提示：从生活现象引入

## 核心问题
为什么撞车时安全气囊有用？

## 目标与检验
| # | 学完能做到 | 重点/难点 | 检验它的题 |
|---|---|---|---|
| 1 | 会算动量 | 重点 | 题1、2 |
| 2 | 会解释缓冲 | 难点 | 题3、4 |

## 先修
| 条目 | 开头怎么确认 |
|---|---|
| 速度 | 一道小题 |

## 错误想法清单
| 错误想法 | 学生会怎么错 | 在哪一步推翻 | 哪道题的哪个选项查出它 |
|---|---|---|---|
| 速度大动量大 | 只比速度 | 第2步 | 题1 B |

## 前后连接
- 接住上一课：速度
- 留给下一课：冲量

## 问题线
| 步 | 段 | 这一步要达成什么 | 问 | 留下的问题 |
|---|---|---|---|---|
| 1 | 引入 | 引出动量 | 谁更难停？ | 怎么量化？ |
| 2 | 收束 | 总结 | 回忆 | — |

## 步数预算
| 段 | 步数 | 超出时先砍 |
|---|---|---|
| 引入 | 2 | 第2步 |

## 题目
| 题 | 对应目标 | 近题/迁移 | 题型 | 预估首答正确率 | 意图 |
|---|---|---|---|---|---|
| 1 | 1 | 近题 | 单选 | 约 50% | a |
| 2 | 目标1 | 迁移 | 排序 | 0.6 | a |
| 3 | 2 | 近题 | 单选 | 45% | a |
| 4 | 2 | 迁移 | 填空 | 55% | a |

### 作业
| 题 | 层 | 目标 | 意图 |
|---|---|---|---|
| 必做 1 | 基础 | 1 | 巩固 |
| 选做 | 拓展 | 2 | 拓展 |

## 结论区
| # | 内容 |
|---|---|
| 1 | p = mv |

## 证据表
| 设计决定 | 依据 | 证据等级 |
|---|---|---|
| 用冰壶 | 数值核对 | 已计算 |
| 先预测 | Smith 2020《某书》（读了原文） | 有研究支持 |

## 课件要记录的数据
- 每步选项

```check
a = 1 + 1 ≈ 2
```
"""


def results(text):
    return {c: (st, d) for c, _, st, d in cs.run_checks(text)}


class SpecTest(unittest.TestCase):
    def setUp(self):
        self.base = results(GOOD)

    def mod(self, old, new, code):
        self.assertIn(old, GOOD, old)
        return results(GOOD.replace(old, new))[code]

    def test_all_pass(self):
        for c, (st, d) in self.base.items():
            self.assertEqual(st, cs.PASS, (c, d))
        self.assertEqual(len(self.base), 16)

    def test_S1(self):
        self.assertEqual(self.mod("- 教学提示：从生活现象引入", "- 教学提示：", "S1")[0], cs.FAIL)
        self.assertEqual(self.mod("## 课标定位", "## 别的", "S1")[0], cs.SKIP)

    def test_S2(self):
        self.assertEqual(self.mod("有用？", "有用？为什么？", "S2")[0], cs.FAIL)
        self.assertEqual(self.mod("为什么撞车时安全气囊有用？", "想一想。", "S2")[0], cs.FAIL)
        self.assertEqual(self.mod("有用？", "有用？\n这是说明文字。", "S2")[0], cs.PASS)

    def test_S3(self):
        self.assertEqual(self.mod("| 题3、4 |", "| |", "S3")[0], cs.FAIL)
        self.assertEqual(self.mod("| 难点 |", "| 重点 |", "S3")[0], cs.FAIL)
        self.assertEqual(self.mod("| 2 | 会解释缓冲 | 难点 | 题3、4 |\n", "", "S3")[0], cs.FAIL)

    def test_S4(self):
        self.assertEqual(self.mod("| 速度 | 一道小题 |", "| 速度 | |", "S4")[0], cs.FAIL)
        self.assertEqual(self.mod("开头怎么确认", "别的", "S4")[0], cs.SKIP)

    def test_S5(self):
        self.assertEqual(self.mod("| 只比速度 |", "| |", "S5")[0], cs.FAIL)

    def test_S6(self):
        self.assertEqual(self.mod("- 留给下一课：冲量", "- 留给下一课：", "S6")[0], cs.FAIL)

    def test_K1(self):
        self.assertEqual(self.mod("| 引出动量 |", "| |", "K1")[0], cs.FAIL)
        self.assertEqual(self.mod("| 怎么量化？ |", "| |", "K1")[0], cs.FAIL)

    def test_K3(self):
        self.assertEqual(self.mod("超出时先砍", "备注", "K3")[0], cs.FAIL)
        self.assertEqual(self.mod("## 步数预算", "## 其他", "K3")[0], cs.FAIL)

    def test_Q1(self):
        self.assertEqual(self.mod("| 2 | 迁移 |", "| 2 | 近题 |", "Q1")[0], cs.FAIL)
        t = GOOD.replace("| 3 | 2 | 近题", "| 3 | 1 | 近题").replace("| 选做 | 拓展 | 2 |", "| 选做 | 拓展 | 1 |")
        self.assertEqual(results(t)["Q1"][0], cs.FAIL)

    def test_Q5(self):
        self.assertEqual(self.mod("| 排序 |", "| 单选 |", "Q5")[0], cs.FAIL)
        self.assertEqual(self.mod("| 题型 |", "| 别的 |", "Q5")[0], cs.SKIP)

    def test_Q6(self):
        self.assertEqual(self.mod("约 50%", "80%", "Q6")[0], cs.FAIL)
        self.assertEqual(self.mod("| 0.6 |", "| 0.2 |", "Q6")[0], cs.FAIL)
        self.assertEqual(self.mod("| 45% |", "| |", "Q6")[0], cs.FAIL)

    def test_Q6_blocks(self):
        t = GOOD + "\n## 九、题目\n\n**第 1 步　甲**（估计 50%）\n- a\n\n**第 2 步　乙**\n- b\n"
        st, d = results(t)["Q6"]
        self.assertEqual(st, cs.FAIL)
        t2 = t.replace("**第 2 步　乙**", "**第 2 步　乙**（估计 40%）")
        self.assertEqual(results(t2)["Q6"][0], cs.PASS)

    def test_Q7(self):
        self.assertEqual(self.mod("| 选做 | 拓展 | 2 | 拓展 |", "| 选做 | 拓展 | 2 | |", "Q7")[0], cs.FAIL)
        self.assertEqual(self.mod("| 选做 |", "| 附加 |", "Q7")[0], cs.FAIL)

    def test_C1(self):
        self.assertEqual(self.mod("| 1 | p = mv |", "", "C1")[0], cs.FAIL)
        self.assertEqual(self.mod("## 结论区", "## 其他", "C1")[0], cs.FAIL)

    def test_E1(self):
        self.assertEqual(self.mod("| 已计算 |", "| 差不多 |", "E1")[0], cs.FAIL)
        self.assertEqual(self.mod("（读了原文）", "", "E1")[0], cs.FAIL)
        self.assertEqual(self.mod("## 证据表", "## 其他", "E1")[0], cs.FAIL)

    def test_D1(self):
        self.assertEqual(self.mod("- 每步选项", "", "D1")[0], cs.FAIL)

    def test_N1(self):
        self.assertEqual(self.mod("```check", "```text", "N1")[0], cs.FAIL)

    def test_fenced_headings_ignored(self):
        t = "# x\n\n```\n## 课标定位\n- 内容要求：a\n```\n"
        self.assertEqual(results(t)["S1"][0], cs.SKIP)

    def test_exit_codes(self):
        p = os.path.join(HERE, "_tmp_spec.md")
        for text, want in ((GOOD, 0), (GOOD.replace("```check", "```text"), 1)):
            with open(p, "w", encoding="utf-8") as f:
                f.write(text)
            out = subprocess.run([sys.executable, os.path.join(HERE, "check_spec.py"), p],
                                 capture_output=True, text=True)
            self.assertEqual(out.returncode, want, out.stdout)
        os.remove(p)


if __name__ == "__main__":
    unittest.main()
