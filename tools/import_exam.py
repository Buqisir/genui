#!/usr/bin/env python3
"""Turn one exam's Word files into draft problem files.

Mechanical and deterministic: locate the blank paper and the answer paper for a
province + year, convert .doc to .docx, walk the document in order, keep formulas
(OMML as text, MathType as text when LibreOffice rewrote them), save embedded
figures, split on question numbers, and pair each question with its answer.

Anything that needs judgment is left as TODO and listed in <out>/<prefix>/review.md.
Drafts land in <out>/<id>.md plus <out>/expected-<prefix>.yaml. They are not the
hand-written problems/*.md files and are not checked into the bank.

    python3 tools/import_exam.py --province 山东 --year 2025 --out problems/_import
    python3 tools/import_exam.py --all --out problems/_import
"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
import zipfile
from dataclasses import dataclass, field
from pathlib import Path

from lxml import etree

ROOT = Path(__file__).resolve().parent.parent
CACHE = Path("/tmp/genui-import-cache")

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
M = "http://schemas.openxmlformats.org/officeDocument/2006/math"
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
WP = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
V = "urn:schemas-microsoft-com:vml"

EMU = 9525  # 1 px at 96 dpi

# Province folder key, short code, display name. zj has no Word exams in the repo.
PROVINCES = [
    ("山东", "sd", "山东"),
    ("江苏", "js", "江苏"),
    ("广东", "gd", "广东"),
    ("湖南", "hn", "湖南"),
    ("河北", "hb", "河北"),
    ("河南", "ha", "河南"),
    ("四川", "sc", "四川"),
    ("浙江", "zj", "浙江"),
]
CODE = {name: code for name, code, _ in PROVINCES}

# A real figure, not an inline formula glyph. Tuned against 2025 山东 and 2024 湖南:
# formula images are short (a symbol or one equation line); diagrams are taller.
FIG_MIN_H = 60  # pt; option rows of equation images sit around 30-45pt
FIG_MIN_W = 120  # pt, only counts when the image is also reasonably tall
FIG_MIN_TALL = 50

# Questions are "1." or "1．"; the instructions at the top are "1、" and must not match.
# "3." starts a question; "3.40" is a measurement and must not. A fullwidth dot
# always starts a question, since measurements use a halfwidth dot.
QSTART = re.compile(r"^\s*(\d{1,2})\s*(?:\.(?!\d)|[\uff0e\u3002])")
SECTION = re.compile(r"^[\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341]+、")
# A line that introduces what follows instead of being part of a question.
HEADING = re.compile(r"(试卷|试题|选择题|非选择题|实验题|选考|必考|参考答案)")
PAGE = re.compile(r"^\u7b2c\s*\d+\s*页")
CHOICE_LINE = re.compile(r"^[A-D][.\uff0e\u3001\s]")
ANSWER_HEAD = re.compile(r"^\s*【\s*答\u6848\s*】")
ANSWER_LINE = re.compile(r"(?:故选|\u7b54\u6848)\s*[:\uff1a]\s*([A-D]{1,4})")
LETTERS = re.compile(r"^[A-D]{1,6}$")

# Lines that are the publisher's analysis, not the problem. Dropped from the body.
META_MARK = re.compile(r"^\s*【\s*(答\u6848|解析|详解|解答|分析|点评|考点|专题)\s*】")


@dataclass
class Image:
    name: str          # media/imageN.ext inside the docx
    width: float       # pt
    height: float
    kind: str          # figure | formula | deco
    top: float = 0     # pt from the top of the page, 0 when unknown


@dataclass
class Block:
    text: str
    images: list[Image] = field(default_factory=list)
    formulas: int = 0          # OMML / MathType turned into text
    formula_images: int = 0    # formula left as an image


@dataclass
class Question:
    number: int
    blocks: list[Block]
    section: str = ""
    answer: str = ""
    explanation: str = ""
    figures: list[Image] = field(default_factory=list)


@dataclass
class Exam:
    province: str
    code: str
    year: int
    label: str                 # what the filename calls the paper
    blank: Path
    answer: Path | None
    questions: list[Question] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)
    converted: bool = False

    @property
    def prefix(self) -> str:
        return f"{self.code}{self.year % 100:02d}"


def qn(tag: str) -> str:
    return f"{{{W}}}{tag}"


# ---------------------------------------------------------------- location

def exam_dirs() -> list[tuple[str, Path]]:
    found = []
    for name, code, _ in PROVINCES:
        hits = [p for p in ROOT.iterdir() if p.is_dir() and name in p.name and "2008" in p.name]
        if hits:
            found.append((code, hits[0]))
    return found


def classify_file(path: Path) -> tuple[int, str, str] | None:
    """(year, role, label). role is blank or answer."""
    name = path.name
    m = re.search(r"(20\d{2})", name)
    if not m or path.suffix.lower() not in {".doc", ".docx", ".pdf"}:
        return None
    if "空白" in name:
        role = "blank"
    elif "解析" in name or "含答案" in name:
        role = "answer"
    else:
        return None
    label = re.search(r"（([^）]+)）", name)
    return int(m.group(1)), role, label.group(1) if label else ""


def find_exam(province: str, year: int) -> Exam | None:
    code = CODE.get(province, province)
    for c, folder in exam_dirs():
        if c != code and province not in folder.name:
            continue
        blank = answer = None
        label = ""
        for path in sorted(folder.iterdir()):
            info = classify_file(path)
            if not info or info[0] != year:
                continue
            _, role, lab = info
            label = label or lab
            if role == "blank":
                blank = path
            else:
                answer = path
        if blank:
            return Exam(province, code, year, label or province, blank, answer)
    return None


def list_exams() -> list[Exam]:
    out = []
    for code, folder in exam_dirs():
        province = next(n for n, c, _ in PROVINCES if c == code)
        years: dict[int, Exam] = {}
        for path in sorted(folder.iterdir()):
            info = classify_file(path)
            if not info:
                continue
            year, role, label = info
            exam = years.setdefault(year, Exam(province, code, year, label or province, path, None))
            exam.label = exam.label or label
            if role == "blank":
                exam.blank = path
            else:
                exam.answer = path
        out.extend(years[y] for y in sorted(years))
    return out


# ---------------------------------------------------------------- convert

def to_docx(src: Path) -> Path | None:
    """Return a .docx path. .doc goes through LibreOffice, which keeps OMML."""
    if src.suffix.lower() == ".docx":
        return src
    if src.suffix.lower() != ".doc":
        return None
    if not shutil.which("soffice"):
        return None
    dest_dir = CACHE / "docx"
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / (src.stem + ".docx")
    if dest.exists() and dest.stat().st_mtime >= src.stat().st_mtime:
        return dest
    subprocess.run(
        ["soffice", "--headless", "--convert-to", "docx", "--outdir", str(dest_dir), str(src)],
        check=False, capture_output=True, timeout=180,
    )
    return dest if dest.exists() else None


# ---------------------------------------------------------------- OMML

def _mtext(node: etree._Element) -> str:
    return "".join(t.text or "" for t in node.iter(f"{{{M}}}t"))


def omml_to_text(node: etree._Element) -> str:
    """Readable, LaTeX-ish text. Good enough to read; not a typeset formula."""
    tag = etree.QName(node).localname
    kids = [c for c in node if isinstance(c.tag, str)]

    def child(name: str) -> str:
        el = node.find(f"{{{M}}}{name}")
        return omml_to_text(el) if el is not None else ""

    if tag in {"oMath", "oMathPara", "e", "num", "den", "sup", "sub", "deg", "lim"}:
        return "".join(omml_to_text(c) for c in kids)
    if tag == "f":
        return f"({child('num')})/({child('den')})"
    if tag == "sSup":
        return f"{child('e')}^{child('sup')}"
    if tag == "sSub":
        return f"{child('e')}_{child('sub')}"
    if tag == "sSubSup":
        return f"{child('e')}_{child('sub')}^{child('sup')}"
    if tag == "rad":
        deg = child("deg")
        body = child("e")
        return f"sqrt({body})" if not deg.strip() else f"({body})^(1/{deg})"
    if tag == "nary":
        op = _mtext(node.find(f"{{{M}}}naryPr")) or "Σ"
        sub, sup = child("sub"), child("sup")
        return f"{op}_{sub}^{sup} {child('e')}"
    if tag == "d":
        beg = end = ""
        pr = node.find(f"{{{M}}}dPr")
        if pr is not None:
            b = pr.find(f"{{{M}}}begChr")
            e = pr.find(f"{{{M}}}endChr")
            beg = b.get(qn("val")) if b is not None and b.get(qn("val")) else "("
            end = e.get(qn("val")) if e is not None and e.get(qn("val")) else ")"
        return beg + "".join(omml_to_text(c) for c in kids if etree.QName(c).localname == "e") + end
    if tag in {"m", "mr", "func", "limLow", "limUpp", "groupChr", "bar", "eqArr", "box", "borderBox", "phant"}:
        return "".join(omml_to_text(c) for c in kids)
    if tag == "t":
        return node.text or ""
    return "".join(omml_to_text(c) for c in kids)


def tidy(text: str) -> str:
    text = text.translate(str.maketrans("０１２３４５６７８９", "0123456789"))
    text = text.replace("\u00a0", " ").replace("\u2002", " ").replace("\u2003", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n+", "\n", text)
    return text.strip()


# ---------------------------------------------------------------- walk

def _pt(shape_style: str, key: str) -> float:
    m = re.search(rf"{key}:([0-9.]+)pt", shape_style)
    return float(m.group(1)) if m else 0.0


def shape_top(style: str) -> float:
    """Distance from the top of the page. Negative when the shape is not page-anchored."""
    if "mso-position-vertical-relative:page" not in style:
        return -1
    return _pt(style, "margin-top")


def classify_image(width: float, height: float, name: str) -> str:
    ext = name.rsplit(".", 1)[-1].lower()
    if ext == "wmf" and height and height <= FIG_MIN_TALL:
        return "formula"
    # A diagram is both wide and tall. Option rows and stacked equations are
    # wide but short, or tall but narrow, so they stay formula images.
    if width >= FIG_MIN_W and height >= FIG_MIN_H:
        return "figure"
    if width or height:
        return "formula"
    return "deco"


def load_docx(path: Path) -> tuple[list[Block], dict[str, bytes]]:
    """Paragraphs in order, plus the raw media bytes keyed by media/name."""
    z = zipfile.ZipFile(path)
    rels = etree.fromstring(z.read("word/_rels/document.xml.rels"))
    targets = {r.get("Id"): r.get("Target") for r in rels}
    media = {n[len("word/"):]: z.read(n) for n in z.namelist() if n.startswith("word/media/")}
    root = etree.fromstring(z.read("word/document.xml"))
    body = root.find(qn("body"))
    blocks: list[Block] = []

    def image_of(rid: str, width: float, height: float, top: float = 0) -> Image | None:
        target = targets.get(rid) or ""
        target = target.removeprefix("/")
        if target.startswith("../"):
            target = target[3:]
        if not target:
            return None
        return Image(target, width, height, classify_image(width, height, target), top)

    for para in body.iterchildren():
        if etree.QName(para).localname not in {"p", "tbl"}:
            continue
        parts: list[str] = []
        images: list[Image] = []
        formulas = 0

        def walk(node: etree._Element) -> None:
            nonlocal formulas
            ln = etree.QName(node).localname
            if ln == "oMath":
                text = tidy(omml_to_text(node))
                if text:
                    parts.append(text)
                    formulas += 1
                return
            if ln == "drawing":
                ext = node.find(f".//{{{WP}}}extent")
                blip = node.find(f".//{{{A}}}blip")
                if blip is None:
                    return
                w = int(ext.get("cx") or 0) / EMU / 96 * 72 if ext is not None else 0
                h = int(ext.get("cy") or 0) / EMU / 96 * 72 if ext is not None else 0
                rid = blip.get(f"{{{R}}}embed") or ""
                img = image_of(rid, w, h)
                if img:
                    images.append(img)
                    parts.append("【图】" if img.kind == "figure" else "【公式】")
                return
            if ln == "pict":
                shape = node.find(f".//{{{V}}}shape")
                style = shape.get("style") if shape is not None else ""
                data = node.find(f".//{{{V}}}imagedata")
                rid = data.get(f"{{{R}}}id") if data is not None else ""
                img = image_of(rid or "", _pt(style or "", "width"), _pt(style or "", "height"), shape_top(style or ""))
                if img and "ole" not in (style or ""):
                    images.append(img)
                    parts.append("【图】" if img.kind == "figure" else "【公式】")
                return
            for child in node:
                if not isinstance(child.tag, str):
                    continue
                cln = etree.QName(child).localname
                if cln == "t" and child.text:
                    parts.append(child.text)
                elif cln == "tab":
                    parts.append(" ")
                elif cln == "br":
                    parts.append("\n")
                else:
                    walk(child)

        walk(para)
        text = tidy("".join(parts))
        # Floating figures are anchored to whatever paragraph Word happened to
        # use, often the page header. Keep them as their own block so the
        # splitter can hand them to the question that follows.
        floating = [i for i in images if i.kind == "figure"]
        inline = [i for i in images if i.kind != "figure"]
        if text or inline:
            blocks.append(Block(text, inline, formulas, sum(1 for i in inline if i.kind == "formula")))
        for img in floating:
            blocks.append(Block("", [img], 0, 0))
    return blocks, media


def split_glued(blocks: list[Block]) -> list[Block]:
    """A floating figure and the next question often share one paragraph.

    "【图】17．……" would hide the question number, so cut it into the figure
    marker and the question that follows.
    """
    out: list[Block] = []
    for block in blocks:
        text = block.text
        # A section heading and the first question of that section share a paragraph.
        # A question number wrapped onto the end of the previous paragraph.
        tail = re.match(r"^(.*\n)(\d{1,2}\s*[.\uff0e](?!\d).*)$", text, re.S)
        if tail and not QSTART.match(text):
            out.append(Block(tail.group(1).strip(), block.images, block.formulas, block.formula_images))
            out.append(Block(tail.group(2).strip(), [], 0, 0))
            continue
        head, sep, rest = text.partition("\n")
        if sep and (SECTION.match(head.strip()) or HEADING.search(head)) and QSTART.match(rest.strip()):
            out.append(Block(head.strip(), [], 0, 0))
            out.append(Block(rest.strip(), block.images, block.formulas, block.formula_images))
            continue
        cut = re.match(r"^((?:【[图公式]{1,2}】)+)\s*(.*)$", text, re.S)
        if cut and QSTART.match(cut.group(2).strip()):
            out.append(Block(cut.group(1), block.images, 0, block.formula_images))
            out.append(Block(cut.group(2).strip(), [], block.formulas, 0))
            continue
        out.append(block)
    return out
    return blocks, media


# ---------------------------------------------------------------- split

def is_noise(text: str) -> bool:
    t = text.strip()
    if not t:
        return True
    if PAGE.match(t):
        return True
    if t in {"物理", "注意事项：", "答题卡"}:
        return True
    return False


def split_questions(blocks: list[Block]) -> tuple[list[Question], list[str]]:
    """Cut the paper into questions. Notes collect anything the cut was unsure about."""
    blocks = split_glued(blocks)
    notes: list[str] = []
    current: Question | None = None
    section = ""
    questions: list[Question] = []
    seen: set[int] = set()
    restarted = False
    # Floating figures are anchored to the page footer, so in document order a
    # page's figures appear just before the next page's first question. Hold
    # them and give the whole batch to the questions of that page.
    held: list[Block] = []
    page: list[Question] = []

    def flush() -> None:
        nonlocal current
        if current and current.blocks:
            questions.append(current)
        current = None

    for block in blocks:
        text = block.text.strip()
        if not text and block.images and all(i.kind == "figure" for i in block.images):
            held.append(block)
            continue
        head = text.split("\n", 1)[0]
        if is_noise(head):
            continue
        if SECTION.match(head) and not QSTART.match(head):
            section = head
            continue
        m = QSTART.match(head)
        if m:
            n = int(m.group(1))
            # Instructions are numbered too, but they come before any section.
            if not section and n <= 5 and "考生" in head:
                continue
            if n in seen and not restarted and n <= 3 and len(seen) >= 8:
                # 选考题 restart at 1. Keep them, but say so.
                restarted = True
                notes.append(f"题号在第 {len(questions)} 题后从 {n} 重新开始（多半是选考题），后面的题另编号")
                seen = set()
            if n in seen:
                # Numbered again inside the current question, e.g. a sub-step.
                if current:
                    current.blocks.append(block)
                continue
            if held:
                give_figures(page, held, notes)
                held = []
                page = []
            flush()
            seen.add(n)
            current = Question(n, [block], section)
            page.append(current)
            continue
        if current:
            current.blocks.append(block)
    if held:
        give_figures(page, held, notes)
    flush()
    if not questions:
        notes.append("没有切出任何题目")
    return questions, notes


def give_figures(page: list[Question], held: list[Block], notes: list[str]) -> None:
    """Hand one page's floating figures to that page's questions.

    Figures carry their distance from the top of the page, so they divide
    between the page's questions in that order: the top band goes to the first
    question, the next band to the second, and so on.
    """
    if not page or not held:
        return
    if len(page) == 1:
        page[0].blocks.extend(held)
        return
    # Several questions share the page, and a figure's anchor says nothing
    # about which one it illustrates. Keep the batch, but say it is uncertain.
    nums = "、".join(str(q.number) for q in page)
    notes.append(
        f"第 {nums} 题在同一页，{len(held)} 张题图分不清属于哪一题，都附在了第 {page[0].number} 题下"
    )
    page[0].blocks.extend(sorted(held, key=lambda b: b.images[0].top))


def _strip_marker(text: str) -> str:
    return META_MARK.sub("", text, count=1).strip()


def take_answer(q: Question) -> None:
    """Pull 【答案】 / 【解答】 / 故选：X out of a question that came from the 解析卷."""
    body: list[Block] = []
    answer: list[str] = []
    explanation: list[str] = []
    mode = ""
    for block in q.blocks:
        text = block.text.strip()
        # The marker can sit mid-paragraph when a PDF wraps the line before it.
        split_at = re.search(r"【\s*(?:答案|解析|详解|解答|分析|点评|考点|专题)\s*】", text)
        if split_at and split_at.start() > 0:
            before, after = text[:split_at.start()].strip(), text[split_at.start():].strip()
            if before:
                body.append(Block(before, block.images, block.formulas, block.formula_images))
            text, head = after, after.split("\n", 1)[0]
        else:
            head = text.split("\n", 1)[0]
        mark = META_MARK.match(head)
        if mark:
            kind = mark.group(1)
            rest = _strip_marker(head)
            tail = text[len(head):].strip()
            piece = "\n".join(p for p in (rest, tail) if p)
            if kind == "答案":
                mode = "answer"
                if piece:
                    answer.append(piece)
            elif kind in {"解析", "详解", "解答", "分析"}:
                mode = "explanation"
                if piece:
                    explanation.append(piece)
            else:
                mode = "drop"  # 考点 / 专题 / 点评 belong to the publisher
            continue
        found = ANSWER_LINE.search(text)
        if found and not answer:
            answer.append(found.group(1))
            mode = "explanation"
            continue
        if mode == "answer":
            if text:
                answer.append(text)
        elif mode == "explanation":
            if text:
                explanation.append(text)
        elif mode == "drop":
            continue
        else:
            body.append(block)
    q.blocks = body
    q.answer = tidy("\n".join(answer))
    q.explanation = tidy("\n".join(explanation))


def choice_letters(answer: str) -> str:
    """'B' or 'ACD' when the answer is nothing but option letters."""
    first = answer.strip().split("\n", 1)[0]
    first = re.sub(r"[\s.\.\u3001，,；;\uff1a:]", "", first)
    first = first.replace("和", "").replace("与", "")
    if LETTERS.match(first):
        letters = "".join(sorted(set(first)))
        return letters
    return ""


def answer_key_table(blocks: list[Block]) -> dict[int, str]:
    """The "参考答案" list some papers put at the end: "16．C 17．AC"."""
    found = False
    out: dict[int, str] = {}
    for block in blocks:
        text = block.text.strip()
        if "参考答案" in text or "答案要点" in text:
            found = True
            continue
        if not found:
            continue
        for num, letters in re.findall(r"(\d{1,2})\s*[.\uff0e]\s*([A-D]{1,4})", text):
            out[int(num)] = "".join(sorted(set(letters)))
    return out


def pair(blank: list[Question], answered: list[Question], notes: list[str],
         blocks: list[Block] | None = None) -> None:
    """Copy answers onto the blank-paper questions, matched by printed number."""
    by_num: dict[int, list[Question]] = {}
    for q in answered:
        by_num.setdefault(q.number, []).append(q)
    table = answer_key_table(blocks or [])
    used: set[int] = set()
    for q in blank:
        group = by_num.get(q.number) or []
        pick = next((g for g in group if id(g) not in used and g.answer), None)
        if pick is None and group:
            pick = next((g for g in group if id(g) not in used), None)
        if pick is not None:
            used.add(id(pick))
            q.answer = pick.answer
            q.explanation = pick.explanation
        if not q.answer and q.number in table:
            q.answer = table[q.number]
        if pick is None and q.number not in table:
            notes.append(f"第 {q.number} 题在解析卷里没有对应答案")
        elif not q.answer:
            notes.append(f"第 {q.number} 题对上了解析卷，但没有抽出答案")


# ---------------------------------------------------------------- render

KIND_WORD = {
    "single": "单选",
    "multi": "多选",
    "experiment": "实验",
    "calc": "计算",
    "fill": "填空",
}


def guess_kind(q: Question) -> tuple[str, bool]:
    """A first guess from the section heading and the options. Flagged, not trusted."""
    text = "\n".join(b.text for b in q.blocks)
    options = set(re.findall(r"(?m)^([A-D])\s*[.\uff0e\u3001]", text))
    sec = q.section
    if "实验" in sec:
        return "experiment", False
    if "多项" in sec or "多选" in sec:
        return "multi", False
    if "单项" in sec or "单选" in sec:
        return "single", False
    if "选择" in sec and options:
        # 旧卷把单选和多选写在同一大题里，这个判断留给人。
        return ("multi" if len(choice_letters(q.answer)) > 1 else "single"), True
    if "非选择" in sec or "计算" in sec or "解答" in sec:
        return ("experiment" if "实验" in text[:40] else "calc"), "实验" not in text[:40]
    if len(options) >= 3:
        return ("multi" if len(choice_letters(q.answer)) > 1 else "single"), True
    if re.search(r"求[:\uff1a]|\uff08\s*1\s*\uff09", text):
        return "calc", True
    return "fill", True


def save_figures(q: Question, media: dict[str, bytes], dest: Path) -> list[str]:
    dest.mkdir(parents=True, exist_ok=True)
    saved = []
    n = 0
    seen: set[str] = set()
    for block in q.blocks:
        for img in block.images:
            if img.kind != "figure" or img.name in seen:
                continue
            seen.add(img.name)
            blob = media.get(img.name)
            if not blob:
                continue
            n += 1
            ext = img.name.rsplit(".", 1)[-1].lower()
            if ext == "jpeg":
                ext = "jpg"
            filename = f"fig{n}.{ext}"
            (dest / filename).write_bytes(blob)
            q.figures.append(img)
            saved.append(filename)
    return saved


def render_body(q: Question) -> str:
    out: list[str] = []
    fig = 0
    total = sum(1 for b in q.blocks for i in b.images if i.kind == "figure")
    for block in q.blocks:
        text = block.text
        own = [i for i in block.images if i.kind == "figure"]
        if own and not text:
            # The figure floated free of its paragraph; mark where the file is.
            fig += len(own)
            label = "、".join(f"图 {fig - len(own) + 1 + k}" for k in range(len(own)))
            out.append(f"【图】{label}（见本题目录，题图在卷面中的位置需核对）")
            continue
        for img in block.images:
            if img.kind == "figure":
                fig += 1
                label = f"【图 {fig}】" if total > 1 else "【图】"
                text = text.replace("【图】", label, 1)
        text = text.replace("【公式】", "【公式图】")
        if text:
            out.append(text)
    return "\n\n".join(out).strip() + "\n"


def yaml_quote(text: str) -> str:
    return text.replace("\\", "\\\\").replace('"', '\\"')


def write_exam(exam: Exam, questions: list[Question], media: dict[str, bytes], out: Path) -> dict:
    out.mkdir(parents=True, exist_ok=True)
    prefix = exam.prefix
    paper = exam.label if "卷" in exam.label else f"{exam.label}卷"
    stats = {"questions": len(questions), "paired": 0, "formulas": 0,
             "formula_images": 0, "figures": 0, "choice": 0, "todo_kind": 0}
    key_lines = [f"# {exam.year} {paper} 答案键（机器导入草稿，计算题未核）。不发给模型。"]
    reviews = list(exam.notes)

    for i, q in enumerate(questions, start=1):
        qid = f"{prefix}-{i:02d}"
        kind, unsure = guess_kind(q)
        if unsure:
            stats["todo_kind"] += 1
        letters = choice_letters(q.answer)
        saved = save_figures(q, media, out / qid)
        formula_images = sum(b.formula_images for b in q.blocks)
        formulas = sum(b.formulas for b in q.blocks)
        stats["formulas"] += formulas
        stats["formula_images"] += formula_images
        stats["figures"] += len(saved)

        if letters and kind in {"single", "multi"}:
            reference = f"{letters}。（解析见下，需要人工核对）"
            if q.explanation:
                reference += "\n  " + q.explanation[:400].replace("\n", "\n  ")
            key_lines.append(f"{qid}:")
            key_lines.append(f'  - {{ q: "选项", choice: "{letters}" }}')
            stats["choice"] += 1
            stats["paired"] += 1
        elif q.answer:
            reference = "TODO 核对。解析卷原文：\n  " + q.answer[:500].replace("\n", "\n  ")
            key_lines.append(f"{qid}:")
            key_lines.append(f'  - {{ q: "TODO", text: "{yaml_quote(q.answer.splitlines()[0][:80])}", manual: true }}')
            stats["paired"] += 1
        else:
            reference = "TODO 没有配上答案"
            reviews.append(f"{qid}（原卷第 {q.number} 题）没有答案")

        if formula_images:
            reviews.append(f"{qid} 有 {formula_images} 处公式只剩下图片（MathType / 公式截图），正文里标了【公式图】")
        if unsure:
            reviews.append(f"{qid} 的 kind 是猜的（{kind}），题型和标题需要人工确认")
        title = f"TODO 第 {q.number} 题"
        source = f"{exam.year} {paper} 第 {q.number} 题（{KIND_WORD.get(kind, kind)}）"
        header = (
            f"---\nid: {qid}\ntitle: {title}\nsource: {source}\nkind: {kind}\n"
            f"topic: TODO\npages: []\nfigures: {len(saved)}\nreference: |\n  {reference}\n---\n\n"
        )
        (out / f"{qid}.md").write_text(header + render_body(q), encoding="utf-8")

    (out / f"expected-{prefix}.yaml").write_text("\n".join(key_lines) + "\n", encoding="utf-8")
    review = [f"# {exam.year} {paper} 导入复核", "",
              f"-空白卷：`{exam.blank.name}`", ""]
    if exam.answer:
        review.append(f"-解析卷：`{exam.answer.name}`")
        review.append("")
    review.append(f"切出 {stats['questions']} 题，配上答案 {stats['paired']} 题，"
                  f"其中选择题答案 {stats['choice']} 题。")
    review.append(f"公式：转成文字 {stats['formulas']} 处，只剩图片 {stats['formula_images']} 处。")
    review.append(f"题图：导出 {stats['figures']} 张。kind 待确认 {stats['todo_kind']} 题。")
    review += ["", "## 需要人工或模型看的", ""]
    review += [f"- {n}" for n in reviews] or ["-没有"]
    (out / "review.md").write_text("\n".join(review) + "\n", encoding="utf-8")
    return stats


# ---------------------------------------------------------------- pdf dry run

def pdf_text(path: Path) -> str:
    if not shutil.which("pdftotext"):
        return ""
    out = subprocess.run(["pdftotext", "-layout", str(path), "-"], capture_output=True, timeout=90)
    return out.stdout.decode("utf-8", errors="replace")


def pdf_numbers(path: Path) -> list[int]:
    nums = []
    for line in pdf_text(path).splitlines():
        m = QSTART.match(line.strip())
        if m:
            n = int(m.group(1))
            if 1 <= n <= 40:
                nums.append(n)
    return nums


def load_pdf(path: Path) -> list[Block]:
    """Plain text only: PDF formulas come out garbled, so nothing is counted as one."""
    raw = pdf_text(path)
    raw = raw.replace("\x0c", "\n")
    raw = re.sub(r"(?m)^\s*第\s*\d+\s*页.*\n(?:\s*\d{1,3}\s*\n)?", "\n", raw)
    # A question number wrapped onto the tail of the previous paragraph.
    raw = re.sub(r"(?m)^(\d{1,2})\s*[.\uff0e]\s*\n\s*\n", r"\n\n\1. ", raw)
    blocks = []
    for para in re.split(r"\n\s*\n", raw):
        text = tidy(para)
        if text:
            blocks.append(Block(text, [], 0, 0))
    return blocks


def dry_pdf(exam: Exam) -> dict:
    nums = pdf_numbers(exam.blank)
    rising = [n for i, n in enumerate(nums) if i == 0 or n >= nums[i - 1]]
    # Count a clean run: longest strictly-rising stretch from 1.
    run = 0
    expect = 1
    for n in nums:
        if n == expect:
            run += 1
            expect += 1
        elif n == 1 and run >= 8:
            break
    answer_marks = 0
    if exam.answer and exam.answer.suffix.lower() == ".pdf":
        out = subprocess.run(["pdftotext", str(exam.answer), "-"], capture_output=True, timeout=60)
        text = out.stdout.decode("utf-8", errors="replace")
        answer_marks = text.count("【答案】") + text.count("故选")
    return {"questions": run, "raw_numbers": len(nums), "answer_marks": answer_marks,
            "status": "pdf"}


# ---------------------------------------------------------------- driver

def import_exam(exam: Exam, out_root: Path, write: bool) -> dict:
    result = {"province": exam.province, "year": exam.year, "label": exam.label,
              "blank": exam.blank.name, "status": "ok"}
    if exam.blank.suffix.lower() == ".pdf":
        if not write:
            result.update(dry_pdf(exam))
            result["status"] = "pdf-only"
            return result
        blocks = load_pdf(exam.blank)
        questions, notes = split_questions(blocks)
        exam.notes.extend(notes)
        exam.notes.append("PDF 没有公式结构，公式是 pdftotext 的乱码，需要人工或 OCR 重录")
        if exam.answer and exam.answer.suffix.lower() == ".pdf":
            ablocks = load_pdf(exam.answer)
            answered, _ = split_questions(ablocks)
            for q in answered:
                take_answer(q)
            pair(questions, answered, exam.notes, ablocks)
        result["questions"] = len(questions)
        result["paired"] = sum(1 for q in questions if q.answer)
        result["formulas"] = 0
        result["formula_images"] = 0
        result["figures"] = 0
        result["notes"] = len(exam.notes)
        result["status"] = "ok" if len(questions) >= 5 else "split-failed"
        if write:
            stats = write_exam(exam, questions, {}, out_root / exam.prefix)
            result["out"] = str(out_root / exam.prefix)
            result["choice"] = stats["choice"]
        return result
    docx = to_docx(exam.blank)
    if docx is None:
        result["status"] = "convert-failed"
        return result
    blocks, media = load_docx(docx)
    questions, notes = split_questions(blocks)
    exam.notes.extend(notes)
    if exam.answer:
        adocx = to_docx(exam.answer)
        if adocx is None:
            exam.notes.append("解析卷转换失败")
        else:
            ablocks, _ = load_docx(adocx)
            answered, anotes = split_questions(ablocks)
            for q in answered:
                take_answer(q)
            pair(questions, answered, exam.notes, ablocks)
    else:
        exam.notes.append("没有解析卷")
    result["questions"] = len(questions)
    result["paired"] = sum(1 for q in questions if q.answer)
    result["formulas"] = sum(b.formulas for q in questions for b in q.blocks)
    result["formula_images"] = sum(b.formula_images for q in questions for b in q.blocks)
    result["figures"] = sum(1 for q in questions for b in q.blocks for i in b.images if i.kind == "figure")
    result["notes"] = len(exam.notes)
    if len(questions) < 5:
        result["status"] = "split-failed"
    if write:
        stats = write_exam(exam, questions, media, out_root / exam.prefix)
        result["out"] = str(out_root / exam.prefix)
        result["choice"] = stats["choice"]
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="把一套高考卷的 Word 导成草稿题")
    parser.add_argument("--province", help="山东 / 江苏 / 广东 / 湖南 / 河北 / 河南 / 四川 / 浙江，或者 sd js gd hn hb ha sc zj")
    parser.add_argument("--year", type=int)
    parser.add_argument("--out", default="problems/_import")
    parser.add_argument("--all", action="store_true", help="只统计，不写题目文件")
    args = parser.parse_args()
    out = Path(args.out)
    if not out.is_absolute():
        out = ROOT / out

    if args.all:
        rows = [import_exam(e, out, write=False) for e in list_exams()]
        print(f"{'province':<6}{'year':<6}{'status':<16}{'qs':>4}{'paired':>8}{'formula':>9}{'figimg':>8}{'figs':>6}")
        groups: dict[str, int] = {}
        for r in rows:
            groups[r["status"]] = groups.get(r["status"], 0) + 1
            print(f"{r['province']:<6}{r['year']:<6}{r['status']:<16}{r.get('questions',''):>4}"
                  f"{r.get('paired',''):>8}{r.get('formulas',''):>9}{r.get('formula_images',''):>8}"
                  f"{r.get('figures', r.get('answer_marks','')):>6}")
        print()
        for status, n in sorted(groups.items()):
            print(f"{status}: {n}")
        return 0

    if not args.province or not args.year:
        parser.error("要么给 --province 和 --year，要么给 --all")
    province = args.province
    if province in CODE.values():
        province = next(n for n, c, _ in PROVINCES if c == province)
    exam = find_exam(province, args.year)
    if exam is None:
        print(f"找不到 {args.province} {args.year}", file=sys.stderr)
        return 1
    result = import_exam(exam, out, write=True)
    print(f"{result['province']} {result['year']} {result['label']} -> {result.get('out','')}")
    for key in ("status", "questions", "paired", "choice", "formulas", "formula_images", "figures", "notes"):
        if key in result:
            print(f"  {key}: {result[key]}")
    return 0 if result["status"] == "ok" else 1


if __name__ == "__main__":
    sys.exit(main())
