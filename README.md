# Sharkbook AI Form Filler

一款由 Sharkbook AI 驱动的智能表单自动填充 Chrome 扩展插件。

## 🚀 核心功能

### 🤖 AI 智能表单填充
侧边栏式 AI 助手，为你自动分析和填充网页表单。

- **智能识别**：自动扫描当前页面的所有表单字段（输入框、文本域等）
- **AI 生成**：基于字段名称和上下文，智能生成合适的填充内容
- **一键填充**：一键将 AI 生成的内容填入表单

## 🛠 安装方法

1. 克隆或下载本项目源代码
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启右上角的 **开发者模式**
4. 点击左上角 **加载已解压的扩展程序**
5. 选择 `sharkbook-chrome-extension` 目录

## 📖 使用指南

1. 点击工具栏中的 **Sharkbook 图标**，自动打开侧边栏
2. 打开任意包含表单的网页（如注册页、联系表单等）
3. 点击 **开始分析**
4. 扩展会识别表单字段并生成 AI 建议内容
5. 点击 **一键填充** 将内容应用到页面

## 📂 项目结构

```
├── manifest.json       # 扩展配置文件 (Manifest V3)
├── sidepanel.html      # 侧边栏界面
├── sidepanel.js        # 侧边栏逻辑（AI 调用核心）
├── content.js          # 内容脚本（表单识别与填充）
├── background.js       # Service Worker
└── icons/              # 扩展图标
```

## 🔧 技术栈

- **Chrome Manifest V3**
- **Chrome Side Panel API** - 侧边栏 UI
- **Sharkbook AI API** - 智能内容生成
- **Chrome Scripting API** - 页面交互

## 📄 许可证

MIT License
