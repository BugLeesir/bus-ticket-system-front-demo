# 汽车购票系统前端

> 一个基于 Vue 的公交车票系统前端项目，提供订单管理、个人中心、车次查询等功能模块。

## 功能模块

- **订单管理**：查看订单、更新订单状态、删除订单、查看订单详情。
- **个人中心**：管理个人信息，查看和管理个人订单。
- **车次查询**：根据出发地、目的地、时间和票价范围搜索车次信息。
- **公告管理**：查看最新公告，管理员可管理公告内容。
- **留言管理**：用户可留言、回复留言，管理员可管理留言。
- **登录与注册**：用户认证功能，包括登录和注册。

## 技术栈

- **Vue 2.x**：用于构建用户界面。
- **Element UI**：用于快速搭建 UI 组件。
- **Axios**：用于与后端 API 交互。
- **SCSS**：用于样式设计。

## 项目启动

```bash
# 克隆项目
git clone https://github.com/your-repo/bus-ticket-system-front.git

# 进入项目目录
cd bus-ticket-system-front

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器访问 [http://localhost:8080](http://localhost:8080)

## 构建

```bash
# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod
```

## 其它命令

```bash
# 代码格式检查
npm run lint

# 代码格式检查并自动修复
npm run lint -- --fix
```

## 浏览器支持

现代浏览器和 Internet Explorer 10+。

|</br>IE / Edge | </br>Firefox |</br>Chrome |</br>Safari |
| --------- | --------- | --------- | --------- |
| IE10, IE11, Edge| last 2 versions| last 2 versions| last 2 versions

## License

[MIT](https://github.com/your-repo/bus-ticket-system-front/blob/master/LICENSE) license.

Copyright (c) 2025-present BugLeesir
