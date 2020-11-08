学习笔记

    本周主要学习了发布系统的搭建，主要分为4部分

###### server
    使用 express 搭建的web服务器

###### publish-tool
    客户端使用的发布工具

###### publish-server
    发布服务

###### OAuth
    使用 GitHub OAuth 进行用户鉴权


###### 发布流程
  1. 使用 [GitHub OAuth](https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/) 进行用户授权，拿到用户 token
  2. 对前端资源打包，带上用户 token，发送到 publish-server 端
  3. publish-server 端对用户进行鉴权
  4. 鉴权成功则将前端资源包解压缩到 webserver 端