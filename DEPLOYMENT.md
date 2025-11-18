# 温馨笔记 - 部署指南

## Vercel 部署步骤

### 方式一:通过 Vercel Dashboard 部署(推荐)

1. **准备代码仓库**
   - 将项目代码推送到 GitHub/GitLab/Bitbucket
   - 确保所有文件都已提交

2. **连接 Vercel**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "New Project"
   - 选择你的代码仓库并导入

3. **配置环境变量**
   在 Vercel 项目设置中添加以下环境变量:
   ```
   DATABASE_URL=your_mysql_connection_string
   JWT_SECRET=your_random_secret_key
   OAUTH_SERVER_URL=https://api.manus.im
   OWNER_OPEN_ID=your_owner_open_id
   OWNER_NAME=your_name
   BUILT_IN_FORGE_API_URL=your_forge_api_url
   BUILT_IN_FORGE_API_KEY=your_forge_api_key
   VITE_APP_ID=your_app_id
   VITE_OAUTH_PORTAL_URL=https://login.manus.im
   VITE_APP_TITLE=温馨笔记
   VITE_APP_LOGO=/logo.svg
   VITE_FRONTEND_FORGE_API_KEY=your_frontend_api_key
   VITE_FRONTEND_FORGE_API_URL=your_frontend_forge_api_url
   ```

4. **配置构建设置**
   - Framework Preset: `Other`
   - Build Command: `pnpm install && pnpm build`
   - Output Directory: `client/dist`
   - Install Command: `pnpm install`

5. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成
   - 访问 Vercel 提供的域名

### 方式二:通过 Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   cd /home/ubuntu/cozy-notes
   vercel
   ```

4. **配置环境变量**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   # ... 添加其他环境变量
   ```

5. **生产部署**
   ```bash
   vercel --prod
   ```

## 数据库配置

### 使用 PlanetScale(推荐)

1. 访问 [PlanetScale](https://planetscale.com/)
2. 创建新数据库
3. 获取连接字符串
4. 在 Vercel 中设置 `DATABASE_URL` 环境变量

### 使用 MySQL

确保你的 MySQL 数据库:
- 支持远程连接
- 已创建数据库
- 连接字符串格式: `mysql://user:password@host:port/database`

## OAuth 配置

本项目使用 Manus OAuth 进行用户认证:
1. 在 Manus 平台创建应用
2. 获取 `VITE_APP_ID` 和相关配置
3. 设置回调 URL 为: `https://your-domain.vercel.app/api/oauth/callback`

## 部署后检查

1. ✅ 访问首页,检查样式是否正常
2. ✅ 测试登录功能
3. ✅ 创建分类和笔记
4. ✅ 上传图片功能
5. ✅ 编辑和删除笔记

## 常见问题

**Q: 部署后页面空白?**
A: 检查构建日志,确保 `pnpm build` 成功执行

**Q: 数据库连接失败?**
A: 检查 `DATABASE_URL` 环境变量是否正确,确保数据库允许外部连接

**Q: 图片上传失败?**
A: 检查 S3 相关环境变量是否配置正确

**Q: OAuth 登录失败?**
A: 确认回调 URL 已在 Manus 平台正确配置

## 自定义域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录
4. 等待 SSL 证书自动配置完成

## 性能优化建议

- 启用 Vercel 的 Edge Caching
- 配置 CDN 加速静态资源
- 使用数据库连接池
- 启用图片压缩和懒加载

---

需要帮助?访问 [Vercel 文档](https://vercel.com/docs) 或 [Manus 帮助中心](https://help.manus.im)
