# Life Model — 人生先天参数评分模型

## 项目定位

一个纯前端的量化人生评估工具，用户回答 92 道问卷后，基于 7 个先天维度生成综合评分和 12 项人生轨迹预测。附带后台数据管理和分享功能。

## 技术栈

- 纯 HTML5 + CSS3 + Vanilla JavaScript（ES6）
- 无框架、无构建工具、无外部运行时依赖
- Canvas API 绘制图表（雷达图、分数环、饼图、柱状图）
- localStorage 存储测评数据和密钥哈希
- sessionStorage 存储管理员登录态
- Web Crypto API（SHA-256）做密钥验证
- html2canvas 生成分享图片，QRCode.js 生成二维码
- 部署目标：GitHub Pages（纯静态）

## 目录结构约定

```
life-model/
├── index.html           # 唯一入口，包含全部页面 DOM
├── style.css            # 全部样式（按页面分区，CSS 变量在 :root）
├── questions.js         # 题库（92题，7维度）+ DIMENSIONS 定义
├── crypto.js            # 管理员认证（SHA-256 密钥管理）
├── scoring.js           # 评分引擎、预测模型、分析/建议/时间线生成
├── app.js               # 核心逻辑：问卷流程、结果展示、数据存储、toast
├── share.js             # 分享模块：图片生成、链接、二维码
├── admin.js             # 后台管理：数据查看、统计图表、CSV 导出
├── html2canvas.min.js   # 第三方库：DOM → 图片
├── qrcode.min.js        # 第三方库：二维码生成
├── CLAUDE.md            # 本文档
├── ROADMAP.md           # 进度与规划
├── README.md            # 项目说明（面向用户）
└── test-scoring.html    # scoring.js 单元测试
```

### 命名约定

- 文件名：kebab-case，中文项目可用中文目录名
- 函数名：camelCase
- 全局变量：camelCase（`currentQ`, `userName`, `qrcodeInstance`）
- 常量：UPPER_SNAKE_CASE（`QUESTIONS`, `DIMENSIONS`, `WEIGHTS`, `CRYPTO_KEY`）
- CSS 类名：kebab-case，按页面分区注释
- 注释语言：中文

## 脚本加载顺序（严格依赖）

```
questions.js  →  crypto.js  →  scoring.js  →  app.js  →  share.js  →  admin.js
     ↑              ↑              ↑              ↑           ↑            ↑
  DIMENSIONS     SHA-256       calcScores    showPage    需要 app.js   需要 app.js
  QUESTIONS      认证函数      getLevel...   showToast   中的工具函数   crypto.js
                              encode/decode  getRecords                scoring.js
```

crypto.js 对 app.js/admin.js 的函数引用是运行时调用（用户点击按钮时），不存在加载时序问题。

## 编码规范

- 不使用 this 绑定，所有函数通过全局作用域调用
- 错误处理使用 try/catch，关键路径有 console.log 日志
- 数据持久化用 localStorage，不涉及后端
- 密钥不进代码（上次审计已移除默认密钥 `admin2026`）
- CSS 在 style.css 中集中管理，禁止内联 style 标签
- 新增 JS 功能拆独立文件，不追加到 app.js，在 index.html 末尾加 `<script>` 标签

## 部署

```bash
git push origin master
# GitHub Pages auto-deploys from master branch root
```

## 禁止事项

- 禁止引入 npm/Node.js 依赖（破坏纯静态部署）
- 禁止在 HTML 中写内联脚本（除少量事件绑定如 onclick）
- 禁止修改 questions.js 的 DIMENSIONS 键名（会影响 scoring.js 的 WEIGHTS 表）
- 禁止在 crypto.js 中硬编码任何密钥或密码
