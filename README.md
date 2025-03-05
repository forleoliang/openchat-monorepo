# OpenChat

<p align="center">
  <img src="docs/logo.png" alt="OpenChat Logo" width="200"/>
</p>

<p align="center">
  一个现代化的全栈应用，具有AI驱动的聊天功能，使用React和多后端架构(Cloudflare Workers/Node.js/Golang)构建，支持Web、移动App和桌面端全平台客户端
</p>

<p align="center">
  <a href="#功能特点">功能特点</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#入门指南">入门指南</a> •
  <a href="#部署">部署</a> •
  <a href="#项目结构">项目结构</a> •
  <a href="#贡献">贡献</a> •
  <a href="#许可证">许可证</a>
</p>

<p align="right">
  <a href="README.en.md">English</a>
</p>

---

<p align="center">
  <a href="https://chat.antonai.com" target="_blank"><strong>🔥 在线体验Demo</strong></a>
</p>

<div align="center">
  <p><strong>扫码登录功能</strong></p>
  <img src="docs/signin.png" alt="OpenChat 登录界面" width="600"/>
  
  <p><strong>安卓应用</strong></p>
  <img src="docs/app.png" alt="OpenChat 安卓应用" width="400"/>
  
  <p><strong>智能搜索功能</strong></p>
  <img src="docs/search.png" alt="OpenChat 搜索功能" width="800"/>
</div>

## ✨ 为什么选择 OpenChat？

OpenChat 不只是另一个 AI 聊天应用。它采用现代技术栈构建，提供全方位的 AI 对话体验：

- 💪 **全栈TypeScript** - 前后端类型安全，提高开发效率
- 🚀 **极速部署** - 基于Cloudflare Workers，一键全球部署
- 🔄 **全平台无缝同步** - 网页、手机、电脑三端数据实时同步，随时随地无缝切换，继续您的对话
- 📦 **完整包装** - 开箱即用的完整功能，无需额外配置
- 🧩 **高度可扩展** - 易于添加新模型和功能的模块化设计

## 功能特点

- 🤖 **AI驱动交互**: 集成OpenAI GPT-4进行自然语言对话
- 🎨 **文本生成图像**: 支持Flux AI模型进行文生图
- 🔍 **网络搜索功能**: 集成Brave Web搜索功能
- 📱 **多平台支持**: 同时支持Web浏览器和原生应用(通过Tauri)
- 📊 **现代数据库架构**: 使用PostgreSQL与Drizzle ORM和Cloudflare Hyperdrive优化
- 🔒 **类型安全API通信**: 使用Connect RPC和Protocol Buffers
- 📷 **扫码登录**: 支持在Tauri客户端应用中通过扫描二维码登录
- 🖼️ **图像存储**: 使用Cloudflare R2高效存储图像
- ⚡ **实时响应**: 使用现代React组件构建快速响应的界面
- 📲 **三端同步**: 网页、手机和电脑之间无缝切换和实时同步所有聊天记录

## 技术栈

### 前端
- **框架**: React与React Router
- **UI库**: Chakra UI
- **客户端支持**: Tauri

### 后端
- **无服务器**: Cloudflare Workers (Node.js和Golang后端实现正在开发中)
- **API**: Connect RPC与Protocol Buffers
- **类型生成**: buf

### 数据库
- **数据库**: Neon (PostgreSQL)
- **ORM**: Drizzle ORM
- **连接优化**: Cloudflare Hyperdrive

### 开发工具
- **Monorepo管理**: pnpm workspaces
- **代码格式化**: Biome
- **部署**: Cloudflare

## 入门指南

### 环境要求

- [Node.js](https://nodejs.org/) (v18或更高)
- [pnpm](https://pnpm.io/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler/install-update/)
- [buf CLI](https://buf.build/docs/installation)

### 安装

1. 克隆仓库:
   ```bash
   git clone https://github.com/akazwz/openchat-monorepo.git
   cd openchat-monorepo
   ```

2. 安装依赖:
   ```bash
   pnpm install
   ```

3. 设置环境变量:
   ```bash
   # 基于示例创建环境文件
   cp packages/workers/.dev.vars.example packages/workers/.dev.vars
   cp packages/frontend/.env.example packages/frontend/.env
   ```

4. 生成Protocol Buffer类型:
   ```bash
   pnpm gen
   ```

### 开发

启动开发服务器:
```bash
pnpm dev
```

这将同时启动前端和Cloudflare Worker的开发模式。

## 部署

将应用部署到Cloudflare:
```bash
pnpm fly
```

## 项目结构

```
├── packages
│   ├── frontend         # React前端应用
│   ├── workers          # Cloudflare Workers后端服务
│   ├── nodejs           # Node.js后端实现
│   └── golang           # Golang后端实现
├── proto                # Protocol Buffer定义
```

## 下载

- [Android APK 安装包](https://cdn.bytepacker.com/05eb5d86-a1a1-4076-bf63-5dd810288e25/app-universal-release.apk)
- [Mac (Apple Silicon) DMG 安装包](https://cdn.bytepacker.com/2f02716a-d9bf-43db-b511-4fd0fd810813/openchat_0.1.0_aarch64.dmg)

## 贡献

欢迎贡献！请随时提交Pull Request。

1. Fork仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m '添加一些很棒的特性'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 许可证

我们还在考虑使用哪种开源许可证，敬请期待！如果您有任何建议或想法，欢迎分享。

---

## ⚠️ 警告

**此项目目前正在积极开发中。** 功能可能会发生变化，API可能不稳定，并且可能存在错误。在生产环境中使用需自行承担风险。

---