#!/usr/bin/env python3
"""检查课的规格里第七节自检清单中能机械判断的条目。用法：python3 check_spec.py <规格.md>

逐条输出 通过 / 不通过 / 查不了。有"不通过"退出码 1；"查不了"不算失败，但会单独提示。
节按标题关键词查找（不看"一、""二、"这样的序号）。
"""
import re
import sys

PASS, FAIL, SKIP = "通过", "不通过", "查不了"
LEVELS = ["已计算", "已自动检查", "已盲评", "已模拟走查", "有研究支持", "待真人测试"]


# ---------- 解析 ----------
class Table:
    def __init__(self, line, headers, rows):
        self.line, self.headers, self.rows = line, headers, rows  # rows: [(行号, [格])]

    def col(self, *kws):
        for kw in kws:
            for i, h in enumerate(self.headers):
                if kw in clean(h):
                    return i
        return None


class Section:
    def __init__(self, title, line):
        self.title, self.line = title, line
        self.lines = []   # [(行号, 文本)]，不含围栏代码块内的行
        self.tables = []

    def text(self):
        return "\n".join(t for _, t in self.lines)


def clean(s):
    return re.sub(r"[\s*`]", "", s)


def is_empty(cell):
    c = clean(cell)
    return c in ("", "—", "-", "–", "待填", "TODO", "…", "...")


def split_row(line):
    s = line.strip()
    if s.startswith("|"):
        s = s[1:]
    if s.endswith("|") and not s.endswith("\\|"):
        s = s[:-1]
    return [c.strip().replace("\\|", "|") for c in re.split(r"(?<!\\)\|", s)]


def parse(text):
    """返回 (sections, check_blocks)。check_blocks: [起始行号]"""
    sections, cur, fence, checks = [], None, None, []
    pending = []  # 当前连续的表格行 [(行号, 文本)]

    def flush():
        nonlocal pending
        if cur is not None and len(pending) >= 2:
            sep = pending[1][1].strip()
            if re.fullmatch(r"\|?[\s:\-|]+\|?", sep) and "-" in sep:
                headers = split_row(pending[0][1])
                rows = [(n, split_row(t)) for n, t in pending[2:]]
                cur.tables.append(Table(pending[0][0], headers, rows))
        pending = []

    for n, line in enumerate(text.split("\n"), 1):
        m = re.match(r"^\s*(```+|~~~+)(.*)$", line)
        if m:
            flush()
            if fence is None:
                fence = m.group(1)[:3]
                if m.group(2).strip() == "check":
                    checks.append(n)
            elif m.group(1).startswith(fence) and not m.group(2).strip():
                fence = None
            continue
        if fence is not None:
            continue
        h = re.match(r"^##\s+(.*?)\s*$", line)
        if h and not line.startswith("###"):
            flush()
            cur = Section(h.group(1), n)
            sections.append(cur)
            continue
        if cur is None:
            continue
        cur.lines.append((n, line))
        if line.strip().startswith("|"):
            pending.append((n, line))
        else:
            flush()
    flush()
    return sections, checks


def find(sections, *kws):
    for kw in kws:
        for s in sections:
            if kw in s.title:
                return s
    return None


def find_all(sections, *kws):
    return [s for s in sections if any(k in s.title for k in kws)]


def nonblank(sec):
    return [(n, t) for n, t in sec.lines if t.strip() and not t.lstrip().startswith("###")]


# ---------- 工具 ----------
def pct_in(s):
    """从一格里读百分比，读不出返回 None。支持 50%、约 50%、0.5。"""
    m = re.search(r"(\d+(?:\.\d+)?)\s*%", s)
    if m:
        return float(m.group(1))
    m = re.search(r"(?<![\d.])(0?\.\d+|1(?:\.0+)?|0)(?![\d.])", s)
    if m:
        return float(m.group(1)) * 100
    return None


def goal_ids(cell):
    return {int(x) for x in re.findall(r"\d+", cell)}


class R:
    def __init__(self):
        self.items = []

    def add(self, code, name, status, *details):
        self.items.append((code, name, status, list(details)))


def segment_contents(text, keys):
    """在 text 里找每个 key，返回 {key: 内容或 None}（None 表示没出现）。内容到下一个 key 为止。"""
    pos = {k: text.find(k) for k in keys}
    out = {}
    for k, p in pos.items():
        if p < 0:
            out[k] = None
            continue
        end = min([q for q in pos.values() if q > p] + [len(text)])
        seg = text[p + len(k):end]
        m = re.search(r"[:：]", seg[:15])
        if m:
            seg = seg[m.end():]
        seg = re.sub(r"[\s*:：\-、，。；;·•`（）()]+", "", seg.replace("**", ""))
        out[k] = seg
    return out


# ---------- 各条 ----------
def run_checks(text):
    secs, checks = parse(text)
    r = R()

    # S1
    s = find(secs, "课标定位", "课标", "定位")
    if not s:
        r.add("S1", "课标定位", SKIP, "找不到含“课标定位”的节")
    else:
        keys = ["内容要求", "学业要求", "教学提示"]
        seg = segment_contents(s.text(), keys)
        bad = ["缺少或为空：%s" % k for k in keys if not seg[k]]
        r.add("S1", "课标定位", FAIL if bad else PASS,
              *(["行 %d：%s" % (s.line, b) for b in bad]))

    # S2
    s = find(secs, "核心问题")
    if not s:
        r.add("S2", "核心问题", SKIP, "找不到“核心问题”节")
    else:
        qs = [(n, t) for n, t in nonblank(s) for _ in re.findall(r"[？?]", t)]
        if len(qs) == 1:
            r.add("S2", "核心问题", PASS)
        elif not qs:
            r.add("S2", "核心问题", FAIL, "行 %d：没有以“？”结尾的问句" % s.line)
        else:
            r.add("S2", "核心问题", FAIL,
                  "行 %s：有 %d 个问号，应恰好一句问句" % (
                      "、".join(sorted({str(n) for n, _ in qs}, key=int)), len(qs)))

    # 目标表（S3、Q1 共用）
    goal_sec = find(secs, "目标与检验", "目标")
    goal_tab = None
    if goal_sec:
        for t in goal_sec.tables:
            if t.col("检验") is not None:
                goal_tab = t
                break
    # S3
    if not goal_sec:
        r.add("S3", "目标", SKIP, "找不到“目标”节")
    elif not goal_tab:
        r.add("S3", "目标", SKIP, "行 %d：节里没有表头含“检验”的表" % goal_sec.line)
    else:
        t, probs = goal_tab, []
        if not 2 <= len(t.rows) <= 3:
            probs.append("行 %d：目标 %d 行，应为 2–3 行" % (t.line, len(t.rows)))
        ci = t.col("检验")
        for n, cells in t.rows:
            if ci >= len(cells) or is_empty(cells[ci]):
                probs.append("行 %d：该目标没写检验它的题" % n)
        pi = t.col("重点", "难点")
        alltxt = " ".join(" ".join(c) for _, c in t.rows) if pi is None else \
            " ".join(c[pi] for _, c in t.rows if pi < len(c))
        for w in ("重点", "难点"):
            if w not in alltxt:
                probs.append("行 %d：全表没有标“%s”" % (t.line, w))
        r.add("S3", "目标", FAIL if probs else PASS, *probs)

    # S4
    s = find(secs, "先修")
    if not s:
        r.add("S4", "先修", SKIP, "找不到“先修”节")
    else:
        t = next((t for t in s.tables if t.col("确认") is not None), None)
        if not t:
            r.add("S4", "先修", SKIP, "行 %d：没有表头含“怎么确认”的表" % s.line)
        else:
            ci, probs = t.col("确认"), []
            if len(t.rows) < 1:
                probs.append("行 %d：先修表没有数据行" % t.line)
            for n, c in t.rows:
                if ci >= len(c) or is_empty(c[ci]):
                    probs.append("行 %d：“怎么确认”为空" % n)
            r.add("S4", "先修", FAIL if probs else PASS, *probs)

    # S5
    s = find(secs, "错误想法")
    if not s:
        r.add("S5", "错误想法", SKIP, "找不到“错误想法”节")
    else:
        t = next((t for t in s.tables if t.col("错误想法") is not None), None)
        idx = [t.col(k) for k in ("错误想法", "怎么错", "推翻", "哪道题")] if t else []
        if not t or None in idx:
            r.add("S5", "错误想法", SKIP,
                  "行 %d：表头里没找齐“错误想法/怎么错/推翻/哪道题”四栏" % s.line)
        else:
            probs = []
            if not t.rows:
                probs.append("行 %d：没有数据行" % t.line)
            for n, c in t.rows:
                for k, i in zip(("错误想法", "怎么错", "在哪一步推翻", "哪道题"), idx):
                    if i >= len(c) or is_empty(c[i]):
                        probs.append("行 %d：“%s”为空" % (n, k))
            r.add("S5", "错误想法", FAIL if probs else PASS, *probs)

    # S6
    s = find(secs, "前后连接")
    if not s:
        r.add("S6", "前后连接", SKIP, "找不到“前后连接”节")
    else:
        seg = segment_contents(s.text(), ["接住", "留给"])
        bad = [k for k, v in seg.items() if not v]
        r.add("S6", "前后连接", FAIL if bad else PASS,
              *["行 %d：“%s”缺少或为空" % (s.line, k) for k in bad])

    # K1
    s = find(secs, "问题线")
    if not s:
        r.add("K1", "问题线", SKIP, "找不到“问题线”节")
    else:
        t = next((t for t in s.tables if t.col("要达成") is not None), None)
        if not t:
            r.add("K1", "问题线", SKIP, "行 %d：没有表头含“这一步要达成什么”的表" % s.line)
        else:
            a, b, probs = t.col("要达成"), t.col("留下"), []
            if b is None:
                r.add("K1", "问题线", SKIP, "行 %d：表头没有“留下的问题”栏" % t.line)
            else:
                for k, (n, c) in enumerate(t.rows):
                    if a >= len(c) or is_empty(c[a]):
                        probs.append("行 %d：“这一步要达成什么”为空" % n)
                    if k < len(t.rows) - 1 and (b >= len(c) or is_empty(c[b])):
                        probs.append("行 %d：“留下的问题”为空（非最后一步）" % n)
                r.add("K1", "问题线", FAIL if probs else PASS, *probs)

    # K3
    s = find(secs, "步数预算")
    if not s:
        r.add("K3", "步数预算", FAIL, "没有“步数预算”节")
    elif "先砍" not in s.text():
        r.add("K3", "步数预算", FAIL, "行 %d：节里没有“先砍”一栏或字样" % s.line)
    else:
        r.add("K3", "步数预算", PASS)

    # 题目表：表头有“目标”栏、首栏或有“题目”栏
    qtabs = []
    for sec in secs:
        for t in sec.tables:
            if t.col("目标") is not None and (
                    clean(t.headers[0]) == "题" or t.col("题目") is not None):
                qtabs.append(t)

    # Q1
    if not goal_tab:
        r.add("Q1", "目标配题", SKIP, "没有可用的目标表（见 S3）")
    elif not qtabs:
        r.add("Q1", "目标配题", SKIP, "找不到表头含“目标”栏的题目表（课中的题若只写在列表里，读不到）")
    else:
        gids = []
        for n, c in goal_tab.rows:
            m = re.search(r"\d+", c[0]) if c else None
            if m:
                gids.append(int(m.group(0)))
        probs = []
        for g in gids:
            cnt, mig = 0, 0
            for t in qtabs:
                gi, mi = t.col("目标"), t.col("迁移")
                for n, c in t.rows:
                    if gi < len(c) and g in goal_ids(c[gi]):
                        cnt += 1
                        cell = c[mi] if mi is not None and mi < len(c) else " ".join(c)
                        if "迁移" in cell:
                            mig += 1
            if cnt < 2:
                probs.append("目标 %d：只有 %d 道题引用，应至少 2 道" % (g, cnt))
            if mig < 1:
                probs.append("目标 %d：没有标“迁移”的题" % g)
        r.add("Q1", "目标配题", FAIL if probs else PASS, *probs)

    # Q5
    kinds, found = set(), False
    for sec in secs:
        for t in sec.tables:
            ki = t.col("题型")
            if ki is not None:
                found = True
                for n, c in t.rows:
                    if ki < len(c) and not is_empty(c[ki]):
                        kinds.add(clean(c[ki]))
    if not found:
        r.add("Q5", "题型", SKIP, "没有表头含“题型”栏的表")
    else:
        other = {k for k in kinds if "单选" not in k and "选择" not in k}
        if len(other) >= 2:
            r.add("Q5", "题型", PASS)
        else:
            r.add("Q5", "题型", FAIL,
                  "单选以外的题型只有 %d 种（%s），应至少 2 种" % (len(other), "、".join(sorted(other)) or "无"))

    # Q6：表（有“估计/正确率”栏）+ 题目节里 **第 N 步 …** 的块
    rates, probs, seen = [], [], False
    for sec in secs:
        for t in sec.tables:
            ei = t.col("估计", "正确率")
            if ei is None:
                continue
            seen = True
            for n, c in t.rows:
                v = pct_in(c[ei]) if ei < len(c) else None
                if v is None:
                    probs.append("行 %d：这道题没有预估首答正确率" % n)
                elif not 35 <= v <= 70:
                    probs.append("行 %d：预估 %g%% 不在 35%%–70%%" % (n, v))
    for sec in find_all(secs, "题目"):
        blocks, cur = [], None
        for n, t in sec.lines:
            if re.match(r"^\*\*第", t.strip()):
                cur = [n, []]
                blocks.append(cur)
            elif t.startswith("###") or t.startswith("##"):
                cur = None
            elif cur is not None:
                cur[1].append(t)
        for n, body in blocks:
            seen = True
            head = next(t for m, t in sec.lines if m == n)
            vals = re.findall(r"估计\s*(\d+(?:\.\d+)?)\s*%", head + "\n" + "\n".join(body))
            if not vals:
                probs.append("行 %d：这道题没有标“估计 N%%”" % n)
            for v in vals:
                if not 35 <= float(v) <= 70:
                    probs.append("行 %d：预估 %s%% 不在 35%%–70%%" % (n, v))
    if not seen:
        r.add("Q6", "预估首答正确率", SKIP, "找不到带“估计”栏的题目表，也找不到 **第 N 步** 题块")
    else:
        r.add("Q6", "预估首答正确率", FAIL if probs else PASS, *probs)

    # Q7
    full = text
    probs = []
    for w in ("必做", "选做"):
        if w not in full:
            probs.append("全文没有“%s”" % w)
    hw = [t for sec in secs for t in sec.tables if t.col("意图") is not None]
    hw = [t for t in hw if any("必做" in c[0] or "选做" in c[0] for _, c in t.rows if c)]
    if probs:
        r.add("Q7", "作业分层与意图", FAIL, *probs)
    elif not hw:
        r.add("Q7", "作业分层与意图", SKIP, "找到“必做/选做”字样，但没有表头含“意图”栏的作业表")
    else:
        for t in hw:
            ii = t.col("意图")
            for n, c in t.rows:
                if ii >= len(c) or is_empty(c[ii]):
                    probs.append("行 %d：这道作业题没写意图" % n)
        r.add("Q7", "作业分层与意图", FAIL if probs else PASS, *probs)

    # C1
    s = find(secs, "结论区")
    if not s:
        r.add("C1", "结论区", FAIL, "没有“结论区”节")
    else:
        rows = sum(len(t.rows) for t in s.tables)
        items = sum(1 for _, t in s.lines
                    if re.match(r"^\s*(?:[-*+]|\d+[.、)])\s+\S", t))
        if rows + items >= 1:
            r.add("C1", "结论区", PASS)
        else:
            r.add("C1", "结论区", FAIL, "行 %d：节里没有一条结论" % s.line)

    # E1
    s = find(secs, "证据表")
    if not s:
        r.add("E1", "证据表", FAIL, "没有“证据表”节")
    else:
        t = next((t for t in s.tables if t.col("设计决定") is not None), None)
        di, bi, li = (t.col("设计决定"), t.col("依据"), t.col("证据等级")) if t else (0, None, None)
        if not t or bi is None or li is None:
            r.add("E1", "证据表", FAIL, "行 %d：表头应含“设计决定”“依据”“证据等级”" % s.line)
        else:
            probs = []
            if not t.rows:
                probs.append("行 %d：证据表没有数据行" % t.line)
            for n, c in t.rows:
                lv = clean(c[li]) if li < len(c) else ""
                if not any(lv.startswith(x) for x in LEVELS):
                    probs.append("行 %d：证据等级“%s”不是六档之一" % (n, lv))
                basis = c[bi] if bi < len(c) else ""
                if re.search(r"(?:19|20)\d{2}|《|https?://|arXiv", basis) and not (
                        "读了原文" in basis or "只读摘要" in basis):
                    probs.append("行 %d：依据含出处，须标“读了原文”或“只读摘要”" % n)
            r.add("E1", "证据表", FAIL if probs else PASS, *probs)

    # D1
    s = find(secs, "课件要记录的数据")
    if not s:
        r.add("D1", "要记录的数据", FAIL, "没有“课件要记录的数据”节")
    elif not nonblank(s):
        r.add("D1", "要记录的数据", FAIL, "行 %d：节是空的" % s.line)
    else:
        r.add("D1", "要记录的数据", PASS)

    # N1
    if checks:
        r.add("N1", "check 块", PASS)
    else:
        r.add("N1", "check 块", FAIL,
              "没有 ```check 块；请按 check_numbers.py 的格式补（名字 = 表达式 ≈ 值）")
    return r.items


def main(argv):
    if len(argv) != 2:
        print("用法：python3 check_spec.py <规格.md>")
        return 2
    with open(argv[1], encoding="utf-8") as f:
        text = f.read()
    items = run_checks(text)
    for code, name, st, details in items:
        print("[%s] %s %s" % (st, code, name))
        for d in details:
            print("    - " + d)
    cnt = {k: sum(1 for i in items if i[2] == k) for k in (PASS, FAIL, SKIP)}
    print("汇总：通过 %d / 不通过 %d / 查不了 %d" % (cnt[PASS], cnt[FAIL], cnt[SKIP]))
    if cnt[SKIP]:
        print("!! 注意：有 %d 条“查不了”，需要人工看（不计入失败）" % cnt[SKIP])
    return 1 if cnt[FAIL] else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
