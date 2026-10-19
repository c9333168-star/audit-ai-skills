#!/usr/bin/env python3
"""audit-ai-skills 入库/体检五项扫描器(白名单 §七 第 2 步配套)。

五项与 content 侧《skill-分享白名单.md》口径一致:
  1 本机路径      硬项:盘符绝对路径、/c/Users、/d/desktop 等机器痕迹
  2 真人姓名与公司 硬项:在世真人与事务所/公司名(名单见 PERSON_NAMES)
  3 内部技能引用  疑似:引用未随本仓库分发的技能(带注引用合法,人工判断)
  4 github.com    疑似:fork/第三方件残留上游引用(合规署名合法,人工判断)
  5 密钥模式      疑似:sk- 串、赋值式 key(多为误报,人工判断)

用法:
  py -3 scripts/preflight_check.py                 # 扫 skills/ 与 docs/
  py -3 scripts/preflight_check.py --path skills/chen-data-cleaning
  py -3 scripts/preflight_check.py --all-suspects  # 疑似项默认只计数,加此参展开明细

退出码:硬项命中 1,否则 0。疑似项不阻断,逐条人工复核后在体检 commit 里注明。
"""

import argparse
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

# 硬项名单:出现在公开仓库即需清洗(来源:白名单 §五/§六 实测)
PERSON_NAMES = [
    "田川", "信永中和", "少年怒", "审计小哥", "卡兹克", "陈奕蔚", "钱会计",
]

# 疑似项名单:引用未随仓库分发的技能;SKILL.md 里带「外部技能,未随本仓库分发」
# 一类注释的引用是合法的,所以只报告不阻断。注意只列仓库外技能,仓库自身的技能名不算
INTERNAL_SKILL_REFS = [
    "chen-tidy-data", "chen-r-router", "chen-ml-mlr3",
    "tencent-docs-sheet-generation", "audit-content-studio",
    "wechat-illustrator", "writing-dna-skill",
]

HARD_PATTERNS = [
    ("本机路径", re.compile(
        r"(?<![A-Za-z])[A-Za-z]:[\\/](?:Users|desktop|Desktop|R)[\\/]"
        r"|/c/Users/|/d/desktop|/d/Desktop")),
    ("真人姓名与公司", None),  # 走名单
]

SUSPECT_PATTERNS = [
    ("内部技能引用", None),
    ("github.com 引用", re.compile(r"github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+")),
    ("密钥模式", re.compile(
        r"sk-[A-Za-z0-9_-]{16,}"
        r"|\b(?:api_key|apikey|secret|password|token)\s*[=:]\s*['\"][^'\"]{8,}['\"]")),
]

TEXT_SUFFIXES = {
    ".md", ".py", ".r", ".json", ".txt", ".js", ".html", ".css",
    ".yaml", ".yml", ".toml", ".csv", ".ps1", ".sh", ".qmd", ".stan",
}


def iter_text_files(root: Path):
    for p in sorted(root.rglob("*")):
        if not p.is_file():
            continue
        if p.suffix.lower() not in TEXT_SUFFIXES:
            continue
        if any(part in {".git", "node_modules", "__pycache__"} for part in p.parts):
            continue
        yield p


def read_text(p: Path):
    for enc in ("utf-8-sig", "utf-8", "gbk"):
        try:
            return p.read_text(encoding=enc)
        except (UnicodeDecodeError, ValueError):
            continue
    return None


def safe_rel(p: Path):
    try:
        return str(p.relative_to(REPO))
    except ValueError:
        return str(p)


def scan(root: Path, all_suspects: bool):
    hard, suspects = [], []
    files = list(iter_text_files(root))
    for p in files:
        text = read_text(p)
        if text is None:
            print(f"[跳过] 无法解码: {safe_rel(p)}")
            continue
        rel = safe_rel(p)
        for lineno, line in enumerate(text.splitlines(), 1):
            for label, pat in HARD_PATTERNS:
                if pat is None:
                    hits = [n for n in PERSON_NAMES if n in line]
                else:
                    hits = pat.findall(line)
                for h in hits:
                    hard.append((label, rel, lineno, line.strip()[:160]))
            for label, pat in SUSPECT_PATTERNS:
                if pat is None:
                    hits = [n for n in INTERNAL_SKILL_REFS if n in line]
                else:
                    hits = pat.findall(line)
                for h in hits:
                    suspects.append((label, rel, lineno, line.strip()[:160]))
    return files, hard, suspects


def main():
    ap = argparse.ArgumentParser(description="audit-ai-skills 五项体检扫描")
    ap.add_argument("--path", default=None, help="只扫某个子目录(默认 skills/ 与 docs/)")
    ap.add_argument("--all-suspects", action="store_true",
                    help="展开疑似项明细(默认只计数)")
    args = ap.parse_args()

    roots = [REPO / args.path] if args.path else [REPO / "skills", REPO / "docs"]
    roots = [r for r in roots if r.exists()]

    total_files, all_hard, all_suspects = 0, [], []
    for root in roots:
        files, hard, suspects = scan(root, args.all_suspects)
        total_files += len(files)
        all_hard += hard
        all_suspects += suspects

    print(f"扫描范围: {', '.join(safe_rel(r) for r in roots)} | 文本文件 {total_files} 个")
    print()

    print(f"== 硬项(命中即清洗,阻断入库)== 计 {len(all_hard)}")
    for label, rel, lineno, line in all_hard:
        print(f"  [{label}] {rel}:{lineno}  {line}")
    print()

    print(f"== 疑似项(逐条人工复核,不阻断)== 计 {len(all_suspects)}")
    by_label = {}
    for label, *_ in all_suspects:
        by_label[label] = by_label.get(label, 0) + 1
    for label, n in by_label.items():
        print(f"  {label}: {n} 处")
    if args.all_suspects:
        for label, rel, lineno, line in all_suspects:
            print(f"  [{label}] {rel}:{lineno}  {line}")

    print()
    if all_hard:
        print("结论: FAIL——硬项有命中,清洗后重跑。")
        sys.exit(1)
    print("结论: 硬项零命中。疑似项逐条人工判断:真问题修掉,误报/合法引用在体检 commit 里注明。")


if __name__ == "__main__":
    main()
