根据您的需求和提供的 API 设计文档，我制定了以下计划来封装 Axios 请求工具。

### 1. 安装依赖
首先需要安装 `axios` 库。

### 2. 创建工具目录和文件
在 `src` 目录下创建 `utils` 文件夹，并在其中创建 `request.ts` 文件。

### 3. 封装 Axios (`src/utils/request.ts`)
根据 `API_DESIGN.md` 的规范，封装内容将包含：
- **基础配置**：设置 `baseURL` 为 `/api`（便于配合 Vite 代理），超时时间等。
- **类型定义**：定义统一的响应结构 `ApiResponse<T>`，包含 `code`, `message`, `data`。
- **请求拦截器**：自动从 `localStorage` 获取 Token 并添加到 `Authorization` 头中。
- **响应拦截器**：
    - 统一处理 HTTP 状态码错误。
    - 统一处理业务状态码（非 200 的情况）。
    - 使用 Element Plus 的 `ElMessage` 进行全局错误提示。
    - 处理 401 未授权情况（清除 Token）。

### 4. (可选) 配置 Vite 代理
为了在开发环境中解决跨域问题并正确转发 `/api` 请求，建议在 `vite.config.ts` 中配置代理。如果您需要，我也可以一并配置。

确认计划后，我将执行安装和文件创建操作。