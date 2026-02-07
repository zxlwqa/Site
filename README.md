# 导航站
## 基于 Gemini 3 Pro开发的导航站，项目在持续开发中…

<p align="center">
  <img src="./zxlwq.webp" alt="Site" />
</p>

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 预览

<div align="center">
<img width="1920" height="879" alt="Site" src="./Site.webp" />
</div>

# Cloudflare Pages 部署
## 部署步骤：

1. **Fork该项目**
2. **部署到 Cloudflare Pages**
   - 访问 [Cloudflare Pages](https://pages.cloudflare.com/)
   - 连接 GitHub 仓库
   - 选择框架：React(Vite)
   - 添加环境变量
   - 部署完成后绑定KV命名空间
   - 添加自定义名
   - 重试部署

3. **创建KV命名空间**
   - 在Pages项目设置中绑定KV命名空间，绑定名称为 `KV`

# 环境变量

| 变量名 | 说明 | 示例 | 需否 |
|--------|------|------|------|
| `PASSWORD` | 删除导航卡片密码 | `123456` |  ✅ |
| `API_KEY` | 使用AI助手需添加Gemini API | `AIzaSyxxxxxvv` | ❌ |
