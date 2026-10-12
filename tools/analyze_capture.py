#!/usr/bin/env python3
"""Summarize ChatGPT conversation JSON captures (backend-api/conversation/{id} responses).

Usage:
  python3 tools/analyze_capture.py captures/*.json      # per-file summary + cross-file tables
  python3 tools/analyze_capture.py -v captures/foo.json # also print the model's raw output
"""
import argparse
import base64
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

# Tags must be followed by whitespace, "/" or ">", so JS comparisons like `i<schedule.length` don't count.
TAG_RE = re.compile(r"(?<![\w)\]])<([A-Za-z][\w-]*)(?=[\s/>])")
DIL_API_RE = re.compile(r"\b((?:DIL|GenUI)\.\w+)")
TEMPLATE_RE = re.compile(r"\{([#:/@]\w+)")
# How the answer moves: used to compare reasoning efforts on the same prompt.
MOTION_RES = {
    "requestAnimationFrame": re.compile(r"requestAnimationFrame"),
    "setInterval/setTimeout": re.compile(r"\bset(?:Interval|Timeout)\s*\("),
    "按时间差推进(dt)": re.compile(r"performance\.now\(\)|\bdt\s*=|\bdelta\w*\s*="),
    "canvas": re.compile(r"getContext\(\s*['\"]2d"),
    "CSS transition": re.compile(r"transition\s*:"),
    "CSS @keyframes": re.compile(r"@keyframes"),
    "SVG <animate>": re.compile(r"<animate(?:Motion|Transform)?[\s/>]"),
    "缓动函数": re.compile(r"ease(?:In|Out|InOut)\w*\s*\(|\bcubic-bezier\(|easing"),
    "播放/暂停": re.compile(r"[>'\"]\s*(?:▶|❚❚|播放|暂停|继续)|\bis_?playing\b|\bplaying\s*[=:]|\bpaused\s*[=:]", re.I),
    "倍速": re.compile(r"倍速|playbackRate|timeScale"),
    "进度条": re.compile(r"进度|\bprogress\b", re.I),
    "轨迹/拖尾": re.compile(r"\btrail\w*|拖尾|轨迹线|\.push\(\s*\{\s*x\s*:|\.push\(\s*\[\s*x\b", re.I),
}


def load(path):
    text = Path(path).read_text(encoding="utf-8").strip()
    if not text:
        return None, "empty"
    if text.startswith("<"):
        return None, "html (copy the {} request instead of the page)"
    try:
        return json.loads(text), None
    except json.JSONDecodeError as e:
        return None, f"invalid json: {e}"


def messages(conv):
    if isinstance(conv.get("messages"), list):
        return conv["messages"]
    mapping = conv.get("mapping") or {}
    return [n["message"] for n in mapping.values() if n.get("message")]


def final_answers(msgs):
    return [
        m
        for m in msgs
        if m["author"]["role"] == "assistant"
        and m.get("channel") == "final"
        and m["content"].get("content_type") == "text"
    ]


def decode_b64_json(s):
    try:
        return json.loads(base64.b64decode(s))
    except Exception:
        return s


def analyze(path, verbose=False):
    conv, err = load(path)
    if err:
        return {"file": path, "error": err}
    msgs = messages(conv)
    finals = final_answers(msgs)
    raw = "\n\n".join(m["content"]["parts"][0] for m in finals if m["content"].get("parts"))
    user = next((m for m in msgs if m["author"]["role"] == "user"), None)
    tools_called = [m.get("recipient") for m in msgs if m["author"]["role"] == "assistant" and m.get("recipient") not in (None, "all")]
    tool_queries = [
        (m.get("recipient"), m["content"].get("text"))
        for m in msgs
        if m.get("recipient") == "genui.search"
    ]

    learning_blocks, widgets, genui_types, required = [], [], [], set()
    dil_code = ""
    for m in finals:
        md = m.get("metadata", {})
        for ref in md.get("content_references") or []:
            if ref.get("type") != "client_defined_widget":
                continue
            data = ref.get("data") or {}
            if data.get("matched_type"):
                learning_blocks.append(
                    {
                        "type_id": data["matched_type"],
                        "widget_type": data.get("widget_type"),
                        "version": data.get("server_learning_block_version"),
                        "initial_values": decode_b64_json(data.get("encoded_initial_values", "")),
                        "description": ref.get("matched_text", "").split("\n\nInitial values")[0],
                    }
                )
            else:
                widgets.append({"widget_type": data.get("widget_type"), "category": ref.get("category")})
        genui_types += [c.get("type") for c in md.get("genui_components") or []]
        dil = md.get("model_dil_v2") or {}
        required |= set(dil.get("requiredComponents") or [])
        dil_code += dil.get("code", "")

    efforts = sorted({m["metadata"]["thinking_effort"] for m in msgs if (m.get("metadata") or {}).get("thinking_effort")})
    durations = [m["metadata"]["finished_duration_sec"] for m in msgs if (m.get("metadata") or {}).get("finished_duration_sec")]
    code = raw + "\n" + dil_code
    motion = Counter({k: len(r.findall(code)) for k, r in MOTION_RES.items()})
    motion = Counter({k: v for k, v in motion.items() if v})

    return {
        "file": path,
        "title": conv.get("title"),
        "model": next((m["metadata"].get("model_slug") for m in finals if m.get("metadata")), None),
        "effort": "/".join(efforts) or None,
        "thinking_sec": sum(durations) if durations else None,
        "motion": motion,
        "raw_len": len(raw),
        "prompt": user["content"]["parts"][0] if user else None,
        "tools_called": tools_called,
        "genui_search_queries": [q for _, q in tool_queries],
        "learning_blocks": learning_blocks,
        "widgets": widgets,
        "genui_component_types": genui_types,
        "required_components": sorted(required),
        "tags": Counter(TAG_RE.findall(raw)),
        "template_syntax": Counter(TEMPLATE_RE.findall(raw)),
        "apis": Counter(DIL_API_RE.findall(raw)),
        "dil_code_len": len(dil_code),
        "raw": raw if verbose else None,
    }


def print_report(r):
    print("=" * 80)
    print(r["file"])
    if r.get("error"):
        print("  !!", r["error"])
        return
    sec = f"{r['thinking_sec']} s" if r["thinking_sec"] is not None else "?"
    print(f"  标题: {r['title']}    模型: {r['model']}    推理强度: {r['effort'] or '?'}    思考: {sec}    输出: {r['raw_len']} 字符")
    print(f"  提问: {r['prompt']}")
    print(f"  工具调用: {r['tools_called'] or '无'}")
    for q in r["genui_search_queries"]:
        print(f"  genui.search: {q}")
    route = "预制组件" if r["learning_blocks"] else ""
    if any(t[0].islower() for t in r["tags"]):
        route = (route + " + " if route else "") + "现场组合"
    print(f"  路线: {route or '纯文字'}    DIL 代码长度: {r['dil_code_len']}")
    for lb in r["learning_blocks"]:
        print(f"  LearningBlock: {lb['type_id']} (v{lb['version']}, {lb['widget_type']})")
        print(f"    初始值: {json.dumps(lb['initial_values'], ensure_ascii=False)}")
        print(f"    说明: {lb['description']}")
    for w in r["widgets"]:
        print(f"  预制 widget: {w['widget_type']} ({w['category']})")
    if r["tags"]:
        print("  标签: " + ", ".join(f"{k}×{v}" for k, v in r["tags"].most_common()))
    if r["template_syntax"]:
        print("  模板语法: " + ", ".join(f"{k}×{v}" for k, v in r["template_syntax"].most_common()))
    if r["apis"]:
        print("  接口: " + ", ".join(f"{k}×{v}" for k, v in r["apis"].most_common()))
    print("  动效: " + (", ".join(f"{k}×{v}" for k, v in r["motion"].items()) or "无（静态或只靠滑块）"))
    if r["raw"]:
        print("-" * 30 + " 模型原始输出 " + "-" * 30)
        print(r["raw"])


def print_summary(results):
    ok = [r for r in results if not r.get("error")]
    if len(ok) < 2:
        return
    print("\n" + "#" * 80)
    print("汇总")
    blocks = defaultdict(list)
    for r in ok:
        for lb in r["learning_blocks"]:
            blocks[lb["type_id"]].append(lb)
    print(f"\nLearning Block（{len(blocks)} 个）:")
    for tid, lbs in sorted(blocks.items()):
        keys = sorted({k for lb in lbs if isinstance(lb["initial_values"], dict) for k in lb["initial_values"]})
        print(f"  {tid}: 参数 {keys}")
        print(f"    {lbs[0]['description']}")
    tags = Counter()
    for r in ok:
        tags.update(r["tags"].keys())
    print("\n标签出现在几个样本里:")
    print("  " + ", ".join(f"{k}:{v}" for k, v in sorted(tags.items(), key=lambda kv: (-kv[1], kv[0]))))
    apis = Counter()
    for r in ok:
        apis.update(r["apis"].keys())
    if apis:
        print("\n接口:")
        print("  " + ", ".join(f"{k}:{v}" for k, v in apis.most_common()))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="+")
    ap.add_argument("-v", "--verbose", action="store_true", help="print the model's raw output")
    args = ap.parse_args()
    results = [analyze(f, args.verbose) for f in args.files]
    for r in results:
        print_report(r)
    print_summary(results)


if __name__ == "__main__":
    sys.exit(main())
