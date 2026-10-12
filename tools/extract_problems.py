"""Pull round 5/6 problems out of capture-plan.md into problems/<id>.md.

Each file keeps the problem text (what the generator sees) and the reference answer
(for human review only; never sent to the model).
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
plan = (ROOT / "capture-plan.md").read_text(encoding="utf-8")
out_dir = ROOT / "problems"
out_dir.mkdir(exist_ok=True)

TAIL = "请完整解答，并用可交互的图演示整个过程。"

for heading in ("## 第五轮", "## 第六轮"):
    start = plan.index(heading)
    end = plan.find("\n## ", start + 1)
    section = plan[start : end if end > 0 else None]

    rows = re.findall(r"^\| (\d\d) \| `([\w-]+)\.json` \| ([^|]+) \|.*\| ([^|]+) \|\s*$", section, re.M)
    blocks = re.findall(r"^\*\*(\d\d) ([^*]+)\*\*\n```\n(.*?)\n```", section, re.M | re.S)
    texts = {num: (title.strip(), body.strip()) for num, title, body in blocks}

    for num, pid, source, answer in rows:
        title, body = texts[num]
        body = re.sub(r"\n?请完整解答[^\n]*$", "", body).strip()
        content = (
            f"---\nid: {pid}\ntitle: {title}\nsource: {source.strip()}\n"
            f"reference: |\n  {answer.strip()}\n---\n\n{body}\n"
        )
        (out_dir / f"{pid}.md").write_text(content, encoding="utf-8")
        print(pid, "-", title)
