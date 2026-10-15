# audit-ai-skills

给财务、审计和天天跟表格打交道的人的 AI 技能箱。大部分技能不限行业,任何用 AI 编程工具的人都可以直接拿去用。

## 这是什么

`skills/<名称>/` 里的每个目录是一支可安装的 Agent Skill:核心是一份 `SKILL.md`,写清这支技能**什么时候用、按什么流程做、有哪些实测踩过的坑**。把它装进你的 AI 编程工具(Claude Code / ZCode / Codex / OpenCode / Trae 等),之后正常对话就能触发,Agent 会按里面的流程干活——不是聊天模板,是一整套带验收标准的作业规程。

安装方法见 [docs/install.md](docs/install.md)。

## 技能索引

| 技能 | 干什么 | 适合谁 | 怎么触发 |
| --- | --- | --- | --- |
| [xlsx-batch-text-surgery](skills/xlsx-batch-text-surgery/) | 上百个 xlsx 的批量文案修订与全库残留验证(手术式补丁,不重生成) | 维护大量报表/模板文件的人 | 「把这批 Excel 里的旧文案统一换成新文案」「检查所有 xlsx 里还有没有这句话」 |
| [screenshot-table-to-excel](skills/screenshot-table-to-excel/) | 把截图/照片里的表格忠实还原成 Excel(小图放大识读、截断复原、双层表头) | 收到表格图片就想落表的人 | 发一张表格截图 + 「做成 Excel」 |
| [paper-form-to-html](skills/paper-form-to-html/) | 把纸质单据复刻成可录入、自动算账、打印即所得的单文件 HTML 生成器 | 想把凭证/报销单/出入库单做成电子工具的人 | 发一张单据照片 + 「照着这个做一份能填的」 |
| [skill-fanout-windows](skills/skill-fanout-windows/) | 一支技能一次装进本机所有 AI 工具(Windows junction 单点维护) | 同时用好几个 AI 工具的人 | 「让所有 AI 工具都能用上这个技能」 |
| [chen-data-cleaning](skills/chen-data-cleaning/) | 表格数据先审计、后清洗、可追溯交付(R tidyverse,含连接关系诊断) | 做底稿/分析前要先收拾数据的人 | 「先审计一下这张表」「清洗数据」「这两个文件能连起来吗」 |
| [chen-ggplot2-pub](skills/chen-ggplot2-pub/) | 出版级 ggplot2 作图,含中文渲染防线与交付前验收 | 用 R 出报告和论文图的人 | 「画个图」「导出的 PDF 中文变成点号了」 |

`chen-` 前缀是作者的 R 数据技能套件标记;`chen-data-cleaning` 与 `chen-ggplot2-pub` 可独立使用,互不依赖。

## 运行时依赖

| 技能 | 依赖 |
| --- | --- |
| xlsx-batch-text-surgery | Python + openpyxl |
| screenshot-table-to-excel | Python + openpyxl + Pillow |
| paper-form-to-html | 无(可选 Chrome 做自检截图) |
| skill-fanout-windows | Node.js |
| chen-data-cleaning | R ≥ 4.2 + tidyverse(Quarto 报告可选) |
| chen-ggplot2-pub | R ≥ 4.2 + ggplot2 ≥ 3.5 |

## 更新节奏

本仓库长期更新:公众号每讲一期用法,仓库就多一支(或升级一支)技能。点 Star 跟进即可。

## 数据安全提醒

这些技能在你本机的 AI 编程工具里运行,本身不联网上传文件。但请注意:你与 AI 工具的对话内容(可能包含贴进来的数据)会经过模型服务提供方。处理客户数据、底稿数据时,遵守你所在行业的保密义务——工具不改变你的责任。

## 许可

[MIT](LICENSE)。内含的第三方组件及致谢见 [docs/attribution.md](docs/attribution.md)。
