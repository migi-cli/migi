
## migi-cli

:tada: **前端一站式脚手架工具，为项目提供从初始化、标准化GitFlow到自定义部署的全流程解决方案**

<div align="center">
  <img src="https://raw.githubusercontent.com/tian0o0/pic/master/20220708212912.png" width="80" />
</div>

### 特性
- [x] 项目初始化 :tada: 
  - [x] 开箱即用的项目模板
  - [x] EJS动态渲染
  - [x] 支持模板缓存以及强制更新模版
- [x] 项目发布 :tada: 
  - [x] GitFlow自动化
  - [x] 持续集成CI
  - [x] 持续部署CD
  - [x] 支持配置缓存以及强制更新配置
  - [x] 可选静态资源发布平台
    - [x] OSS
    - [x] Nginx
  - [x] 可选Git Server
    - [x] Github
    - [x] Gitee
    - [x] Gitlab

### 安装
```sh
npm i migi-cli -g
```
### 使用方式

**项目初始化**
```sh
migi create

# 别名
migi c

# 更多使用方式
migi create -h
```
**项目发布**
```sh
migi publish

# 别名
migi p

# 更多使用方式
migi publish -h
```


