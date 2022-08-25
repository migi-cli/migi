
## migi-cli

**前端一站式脚手架工具，为项目提供从初始化、标准化GitFlow到自定义部署的全流程解决方案**

<div align="center">
  <img src="https://raw.githubusercontent.com/tian0o0/pic/master/20220708212912.png" width="80" />
</div>

### 特性
- 项目初始化 :tada: 
  - 开箱即用的项目模板
  - EJS动态渲染
  - 支持模板缓存以及强制更新模版
- 项目发布 :tada: 
  - GitFlow自动化
  - 持续集成CI
  - 持续部署CD
  - 支持配置缓存以及强制更新配置
  - 可选静态资源发布平台
    - OSS
    - Nginx
  - 可选Git Server
    - Github
    - Gitee
    - Gitlab

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
![](https://raw.githubusercontent.com/tian0o0/pic/master/20220825223217.png)

**项目发布**
```sh
migi publish

# 别名
migi p

# 更多使用方式
migi publish -h
```
![](https://raw.githubusercontent.com/tian0o0/pic/master/20220825223335.png)



