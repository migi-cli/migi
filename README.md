
<div align="center">
  <h2>migi-cli</h2>
  <img src="https://raw.githubusercontent.com/tian0o0/pic/master/20220708212912.png" width="120" />
  <p>前端一站式脚手架工具，为项目提供从初始化、开发到部署的全流程解决方案</p>
</div>

> 看过《寄生兽》的朋友都知道，ミギ（migi）吃掉了新一的右手并成为了他身体的一部分，从此，普通高中生新一的人生发生了翻天覆地的变化......

### 特性
- [x] :tada: 项目初始化
  - [x] 开箱即用的项目模板
  - [x] EJS动态渲染
  - [x] 支持模板缓存以及强制更新模版
- [x] :tada: 项目发布
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


