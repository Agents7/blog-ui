# 博客论坛系统 API 设计文档

## 1. 接口设计规范 (API Standards)

### 1.1 基础路径
所有 API 均通过网关统一访问，基础路径格式为：`/api/{service-name}/{resource}`

| 服务名称 | 路由前缀 | 描述 |
| :--- | :--- | :--- |
| **用户服务** | `/api/user` | 用户注册、登录、个人信息 |
| **内容服务** | `/api/content` | 文章、分类、标签管理 |
| **互动服务** | `/api/interaction` | 点赞、评论、关注 |
| **管理服务** | `/api/admin` | 后台管理功能 |

### 1.2 统一响应格式
所有接口返回数据均封装在 `Result<T>` 对象中。

```json
{
  "code": 200,          // 状态码：200-成功, 500-系统错误, 400-参数错误, 401-未认证
  "message": "操作成功", // 提示信息
  "data": { ... }       // 业务数据
}
```

---

## 2. 用户服务 (User Service)
**Base URL**: `/api/user`

### 2.1 用户认证

#### 注册用户
- **URL**: `POST /auth/register`
- **Body**:
  ```json
  {
    "username": "user123",
    "password": "securePassword"
  }
  ```

#### 用户登录
- **URL**: `POST /auth/login`
- **Body**:
  ```json
  {
    "username": "user123",  // 或手机号
    "password": "securePassword"
  }
  ```
- **Response**: 返回 JWT Token

### 2.2 个人中心

#### 获取当前用户信息
- **URL**: `GET /users/me`
- **Header**: `Authorization: Bearer <token>`

#### 更新个人信息
- **URL**: `PUT /users/me`
- **Body**:
  ```json
  {
    "nickname": "新的昵称",
    "avatar": "http://oss.aliyun.com/..."
  }
  ```

---

## 3. 内容服务 (Content Service)
**Base URL**: `/api/content`

### 3.1 文章管理

#### 发布文章
- **URL**: `POST /articles`
- **Body**:
  ```json
  {
    "title": "Spring Cloud 实战",
    "content": "Markdown 内容...",
    "cover": "封面图片URL",
    "categoryId": 1,
    "tagIds": [1, 2, 3]
  }
  ```

#### 修改文章
- **URL**: `PUT /articles/{id}`

#### 删除文章
- **URL**: `DELETE /articles/{id}`

#### 获取文章详情
- **URL**: `GET /articles/{id}`

#### 分页获取文章列表
- **URL**: `GET /articles`
- **Query**:
  - `page`: 页码 (默认1)
  - `size`: 每页数量 (默认10)
  - `categoryId`: 分类ID (可选)
  - `keyword`: 搜索关键词 (可选)

### 3.2 分类与标签

#### 获取所有分类
- **URL**: `GET /categories`

#### 获取所有标签
- **URL**: `GET /tags`

---

## 4. 互动服务 (Interaction Service)
**Base URL**: `/api/interaction`

### 4.1 点赞

#### 点赞/取消点赞
- **URL**: `POST /likes`
- **Body**:
  ```json
  {
    "targetId": 1001,      // 文章ID或评论ID
    "targetType": 1        // 1-文章, 2-视频, 3-评论
  }
  ```
  *说明：重复调用该接口可在点赞与取消点赞之间切换。*

### 4.2 评论

#### 发表评论
- **URL**: `POST /comments`
- **Body**:
  ```json
  {
    "articleId": 1001,
    "content": "写得真好！",
    "parentId": 0          // 0表示一级评论，否则为回复某条评论
  }
  ```

#### 获取文章评论列表
- **URL**: `GET /comments`
- **Query**: `articleId=1001&page=1&size=20`

### 4.3 关注

#### 关注用户
- **URL**: `POST /follows/{userId}`

#### 取消关注
- **URL**: `DELETE /follows/{userId}`

---

## 5. 管理服务 (Admin Service)
**Base URL**: `/api/admin`

### 5.1 用户管理

#### 获取用户列表
- **URL**: `GET /users`
- **Query**: `username=abc&status=1&page=1&size=10`

#### 封禁用户
- **URL**: `PUT /users/{id}/ban`
- **Body**:
  ```json
  {
    "reason": "发布违规内容",
    "duration": 7200 // 封禁时长(秒)
  }
  ```

### 5.2 内容审核

#### 获取举报列表
- **URL**: `GET /reports`
- **Query**: `status=0` (0-待处理, 1-已处理)

#### 处理举报
- **URL**: `PUT /reports/{id}/handle`
- **Body**:
  ```json
  {
    "result": 1,        // 1-违规下架, 2-驳回举报
    "remark": "内容包含敏感词"
  }
  ```