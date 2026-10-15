#!/usr/bin/env node
// 配置驱动版 skill 跨工具分发
// 用法：node fanout_skills_v2.mjs <config.json> [--uninstall] [--dry-run]
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const HOME = os.homedir();
const cfgPath = process.argv[2];
if (!cfgPath) { console.error("用法: node fanout_skills_v2.mjs <config.json> [--uninstall] [--dry-run]"); process.exit(1); }
const UNINSTALL = process.argv.includes("--uninstall");
const DRY = process.argv.includes("--dry-run");

const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const SRC = path.join(HOME, cfg.source);
const SKILLS = cfg.skills;
const TARGETS = cfg.targets.map(t => (Array.isArray(t) ? t : [t, t]));

if (!fs.existsSync(SRC)) { console.error("实体目录不存在: " + SRC); process.exit(1); }

const missingSrc = SKILLS.filter(s => !fs.existsSync(path.join(SRC, s)));
if (missingSrc.length) { console.error("实体缺失: " + missingSrc.join(", ")); process.exit(1); }

let created = 0, skipped = 0, failed = 0;
const problems = [];

for (const [rel, label] of TARGETS) {
  const dir = path.join(HOME, rel);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    problems.push(`目标不存在: ${rel}`);
    failed++;
    continue;
  }
  for (const s of SKILLS) {
    const src = path.join(SRC, s);
    const dst = path.join(dir, s);
    try {
      let exists = false;
      try { fs.lstatSync(dst); exists = true; } catch { exists = false; }

      if (UNINSTALL) {
        if (!exists) { skipped++; continue; }
        if (fs.lstatSync(dst).isSymbolicLink()) { if (!DRY) fs.rmdirSync(dst); created++; }
        else { problems.push(`非链接未删: ${rel}/${s}`); skipped++; }
        continue;
      }
      if (exists) { skipped++; continue; }
      if (!DRY) fs.symlinkSync(src, dst, "junction");
      created++;
    } catch (e) {
      problems.push(`失败 ${rel}/${s}: ${e.code || e.message}`);
      failed++;
    }
  }
}

console.log(`\n${UNINSTALL ? "解链" : "建链"}${DRY ? "(演练)" : ""}：成功 ${created} / 跳过 ${skipped} / 失败 ${failed}`);
if (problems.length) { console.log("异常项:"); problems.forEach(p => console.log("  - " + p)); }

console.log("\n=== 逐目标校验 ===");
for (const [rel, label] of TARGETS) {
  const dir = path.join(HOME, rel);
  let ok = 0, bad = 0;
  for (const s of SKILLS) {
    const p = path.join(dir, s);
    try {
      const st = fs.lstatSync(p);
      if (!st.isSymbolicLink()) { bad++; continue; }
      fs.readlinkSync(p);
      const f = fs.readFileSync(path.join(p, "SKILL.md"));
      if (fs.readdirSync(p).length > 0 && f.length > 0) ok++; else bad++;
    } catch { bad++; }
  }
  const mark = ok === SKILLS.length ? "OK " : "!! ";
  console.log(`  ${mark}${label.padEnd(16)} ${String(rel).padEnd(52)} 可读 ${ok}/${SKILLS.length}`);
}
