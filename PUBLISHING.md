# 发布指南

本文档说明如何将 `cnlunar-bun` 发布到 npm。

## 前置准备

### 1. 创建 npm 账号

如果还没有 npm 账号，需要先注册：

1. 访问 https://www.npmjs.com/signup
2. 填写用户名、邮箱和密码
3. 验证邮箱

### 2. 生成 NPM Access Token

1. 登录 npm 网站
2. 点击右上角头像，选择 "Access Tokens"
3. 点击 "Generate New Token"
4. 选择 "Automation" 类型（用于 CI/CD）
5. 复制生成的 token（只会显示一次！）

### 3. 在 GitHub 中配置 NPM_TOKEN

1. 进入 GitHub 仓库页面
2. 点击 Settings > Secrets and variables > Actions
3. 点击 "New repository secret"
4. Name 填写：`NPM_TOKEN`
5. Secret 填写：刚才复制的 npm token
6. 点击 "Add secret"

## 发布流程

### 方式一：手动发布（推荐用于首次发布）

1. **确保所有测试通过**
   ```bash
   cd cnlunar-bun
   bun test
   ```

2. **检查包内容**
   ```bash
   npm pack --dry-run
   ```

3. **登录 npm**
   ```bash
   npm login
   ```

4. **发布到 npm**
   ```bash
   npm publish --access public
   ```

### 方式二：通过 GitHub Release 自动发布

1. **更新版本号**

   编辑 `package.json`，更新 `version` 字段：
   ```json
   {
     "version": "0.1.0"  // 修改为新版本号，如 0.1.1, 0.2.0 等
   }
   ```

2. **提交代码**
   ```bash
   git add .
   git commit -m "chore: bump version to 0.1.0"
   git push
   ```

3. **创建 GitHub Release**

   在 GitHub 仓库页面：
   - 点击 "Releases"
   - 点击 "Create a new release"
   - 在 "Choose a tag" 中输入新版本号，如 `v0.1.0`
   - 填写 Release 标题和说明
   - 点击 "Publish release"

4. **自动发布**

   创建 Release 后，GitHub Actions 会自动：
   - 运行所有测试
   - 发布到 npm

## 版本号规范

遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)：

- **MAJOR（主版本）**：不兼容的 API 修改
- **MINOR（次版本）**：向下兼容的功能性新增
- **PATCH（修订版本）**：向下兼容的问题修正

示例：
- `0.1.0` -> `0.1.1`：修复 bug
- `0.1.0` -> `0.2.0`：新增功能
- `0.1.0` -> `1.0.0`：重大更新或 API 变更

## 发布检查清单

在发布前确认：

- [ ] 所有测试通过（`bun test`）
- [ ] README.md 文档更新
- [ ] package.json 版本号已更新
- [ ] CHANGELOG 或 Release Notes 已准备
- [ ] 无未提交的代码更改
- [ ] 已在本地测试包安装（`npm pack` 然后在其他项目测试）

## 常见问题

### Q: 发布失败，提示 "You do not have permission to publish"

A: 检查以下几点：
1. NPM_TOKEN 是否正确配置在 GitHub Secrets
2. Token 是否有发布权限（应选择 "Automation" 类型）
3. 包名是否已被占用（需要修改 package.json 中的 name）

### Q: 如何撤回已发布的版本？

A: npm 只允许在发布后 72 小时内撤回版本：
```bash
npm unpublish cnlunar-bun@0.1.0
```

注意：撤回后该版本号不能再次使用。

### Q: 如何发布 beta 或 alpha 版本？

A: 使用 tag 标记：
```bash
# 更新版本为 0.2.0-beta.1
npm version 0.2.0-beta.1

# 发布到 beta tag
npm publish --tag beta --access public
```

用户安装时：
```bash
npm install cnlunar-bun@beta
```

## CI/CD 工作流

项目配置了两个 GitHub Actions workflow：

### 1. CI Workflow (.github/workflows/ci.yml)

**触发条件**：
- 推送到 master/main 分支
- Pull Request 到 master/main 分支

**执行内容**：
- 在 Node.js 18.x, 20.x, 22.x 上运行测试
- 检查包的完整性

### 2. Publish Workflow (.github/workflows/publish.yml)

**触发条件**：
- 创建 GitHub Release

**执行内容**：
- 运行所有测试
- 自动发布到 npm

## 下一步

发布成功后：

1. 在 README 中添加 npm 徽章：
   ```markdown
   [![npm version](https://badge.fury.io/js/cnlunar-bun.svg)](https://www.npmjs.com/package/cnlunar-bun)
   ```

2. 更新文档中的安装说明

3. 在社交媒体或相关社区分享

4. 监控 npm 下载量和 GitHub issues
