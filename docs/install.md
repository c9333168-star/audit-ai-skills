# 安装指南

## 一分钟装好

一支技能 = 一个文件夹。把 `skills/<技能名>/` **整个目录**复制进你的 AI 工具的技能目录,就装完了。没有依赖安装器,没有配置文件,复制完重新开一个会话即可生效。

```bash
# 示例:把 xlsx-batch-text-surgery 装进 Claude Code(全局)
git clone https://github.com/<你的用户名>/audit-ai-skills.git
cp -r audit-ai-skills/skills/xlsx-batch-text-surgery ~/.claude/skills/

# Windows(Git Bash)同理;PowerShell 用 Copy-Item -Recurse
```

## 各工具的技能目录

| 工具 | 全局技能目录 | 项目级技能目录 |
| --- | --- | --- |
| Claude Code | `~/.claude/skills/` | `<项目>/.claude/skills/` |
| ZCode | `~/.zcode/skills/` | `<项目>/.agents/skills/` |
| Codex | `~/.codex/skills/` | `<项目>/.agents/skills/` |
| OpenCode | `~/.config/opencode/skills/` | 同左 |
| Trae | `~/.trae-cn/skills/` | 以工具文档为准 |

> 表格以 2026 年 10 月的目录约定为准;工具更新可能调整路径,以你所用工具的官方文档为准。支持 Agent Skills(`SKILL.md`)标准的工具都认这套目录。

## 三条铁律

1. **目录名 = SKILL.md 里的 `name`**。不要给目录改名、加后缀(比如 `xxx__skillhub`),改了工具就挂不上。
2. **整个目录一起复制**。技能可能带 `references/`、`scripts/`、`templates/`,少复制会断链。
3. **装完验证一次**:新开一个会话,对 AI 说索引表里的触发语(比如「把这批 Excel 里的旧文案统一换成新文案」),看它是否按技能流程行动。部分工具支持 `--debug` 或技能列表命令,可以直接确认技能已被扫描到。

## 运行时依赖

技能分两类:

- **纯文档型**(paper-form-to-html、skill-fanout-windows):装完即用,最多需要 Node.js/Chrome 做自检。
- **带执行代码型**(xlsx-batch-text-surgery、screenshot-table-to-excel、chen-data-cleaning、chen-ggplot2-pub):需要本机装有 Python 或 R,详见各技能的 SKILL.md 和 README 依赖表。缺依赖时技能会明确报缺什么,照提示装即可。

## 一支技能,多个工具共用

如果你同时用几个 AI 工具,不想复制多份:把实体目录放在 `~/.agents/skills/`(跨工具约定目录),再往各工具目录建 Windows 目录联接(junction)。这套方案(含市场安装件的例外处理)已经封装成仓库里的 [skill-fanout-windows](../skills/skill-fanout-windows/) 技能,装上它对 AI 说「让所有工具都能用上这个技能」就行。

## 卸载

删除对应技能目录即可(如果按上面方式建过联接,删的是链接、实体还在,按 skill-fanout-windows 的卸载脚本操作更稳妥)。
