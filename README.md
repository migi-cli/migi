## migi-cli

> 前端一站式脚手架工具，为项目提供从`初始化、开发到部署`的全流程解决方案

### 用途

- Init
- Git Flow
- CI/CD

### 与自动化构建工具的区别

> jebkins/travis 等自动化构建工具已经十分成熟，为什么需要自研脚手架？

- 不满足需求： jenkins/travis 通常在`git hooks`当中触发，需要在服务端执行，无法覆盖研发人员本地的功能，如：创建项目自动
  化/本地 git 操作自动化等
- 定制复杂：jenkins/travis 定制过程需要使用 java 开发插件，对前端不够友好

### TODO
- [x] 初始化项目
  - [ ] ejs动态渲染
  - [ ] 模版更新判断
- [ ] Git Flow自动化
- [ ] 云构建CI
- [ ] 云发布CD


