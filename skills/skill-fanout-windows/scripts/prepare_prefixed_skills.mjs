#!/usr/bin/env node
// 批 2 预处理：把 WorkBuddy 的 __skillhub 侧车目录，复制成规范名放进 ~/.agents/skills/
// 并修正 SKILL.md 的 frontmatter name 使其等于目录名（跨工具挂载的硬要求）
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const HOME = os.homedir();
const SRC_ROOT = path.join(HOME, ".workbuddy", "skills");
const DST_ROOT = path.join(HOME, ".agents", "skills");

// 原目录 -> 规范名（已在检查阶段确认：find-skills / ui-ux-pro-max 已通过干净名共享，故排除）
const MAP = {
  "agent-browser__skillhub": "agent-browser",
  "contextweave-interactive-architecture__skillhub": "interactive-architecture-diagram",
  "excel-xlsx__skillhub": "excel-xlsx",
  "humanizer__skillhub": "humanizer",
  "luban-skill-pro__skillhub": "luban-skill",
  "office__skillhub": "office",
  "parenting-expert__skillhub": "parenting-expert",
  "self-improving-agent__skillhub": "self-improvement",
  "self-improving__skillhub": "self-improving",
  "wechat-article-pro__skillhub": "wechat-article-pro",
};

const SKIP = new Set([".git", "node_modules", ".DS_Store"]);

function copyTree(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  let n = 0;
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) n += copyTree(s, d);
    else if (e.isFile()) { fs.copyFileSync(s, d); n++; }
  }
  return n;
}

function fixName(skillMd, canonical) {
  let t = fs.readFileSync(skillMd, "utf8");
  const m = t.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!m) return "无 frontmatter";
  const before = (m[1].match(/^name:\s*(.+)$/m) || [])[1];
  if (before === undefined) return "无 name 字段";
  const newFm = m[1].replace(/^name:\s*.+$/m, `name: ${canonical}`);
  fs.writeFileSync(skillMd, t.replace(m[0], `---\n${newFm}\n---\n`), "utf8");
  return `name: ${before} → ${canonical}`;
}

console.log("=== 批 2 预处理 ===");
const done = [];
for (const [orig, canonical] of Object.entries(MAP)) {
  const src = path.join(SRC_ROOT, orig);
  const dst = path.join(DST_ROOT, canonical);
  if (!fs.existsSync(src)) { console.log(`  !! 源缺失: ${orig}`); continue; }
  if (fs.existsSync(dst)) { console.log(`  !! 目标已存在，跳过: ${canonical}`); continue; }
  const n = copyTree(src, dst);
  const r = fixName(path.join(dst, "SKILL.md"), canonical);
  console.log(`  OK ${canonical.padEnd(34)} ${String(n).padStart(3)} 文件  ${r}`);
  done.push(canonical);
}
console.log(`\n完成 ${done.length} 个 → ${DST_ROOT}`);
fs.writeFileSync("batch2-skills.json", JSON.stringify(done, null, 1), "utf8");
