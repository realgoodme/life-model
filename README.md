# 人生先天参数评分模型

基于社会学、经济学、心理学、教育学的人生轨迹预测系统。

## 在线体验

部署后访问：`https://你的用户名.github.io/life-model/`

## 功能特性

- 58 道专业问卷，覆盖 5 大先天维度
- 五维雷达图可视化
- 12 项人生轨迹预测指标（收入/阶层/婚恋/职场上限等）
- 深度分析报告 + 后天偏移建议
- 后台数据管理（查看/导出/搜索所有测评记录）
- 纯前端，无需服务器，直接部署 GitHub Pages

## 部署步骤

1. Fork 或上传本项目到 GitHub 仓库
2. 进入仓库 Settings → Pages
3. Source 选 `main` 分支，目录选 `/(root)` 或 `/life-model` 文件夹
4. 保存后等待 1-2 分钟即可访问

## 目录结构

```
life-model/
├── index.html      # 主页面
├── style.css       # 样式
├── questions.js    # 题库（58题）
├── scoring.js      # 评分引擎 & 预测模型
└── app.js          # 应用逻辑
```

## 技术栈

- 纯 HTML5 + CSS3 + Vanilla JavaScript
- Canvas 绘制雷达图和评分环
- localStorage 存储测评数据
- 无任何外部依赖，100% 离线可用

<!-- AUTO_UPDATE -->
## 最近更新

- 2026-05-12 15:30:47: 完善分享功能（图片/链接/二维码）、优化概率区间显示、增强后天偏移策略建议

**网站地址**: https://realgoodme.github.io/life-model/
