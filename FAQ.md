### 与自动化构建工具的区别

> jebkins/travis 等自动化构建工具已经十分成熟，为什么需要自研脚手架？

- 不满足需求： jenkins/travis 通常在`git hooks`当中触发，需要在服务端执行，无法覆盖研发人员本地的功能，如：创建项目自动化/本地 git 操作自动化等
- 定制复杂：jenkins/travis 定制过程需要使用 java 开发插件，对前端不够友好

### Windows上运行命令失败
目前暂时只支持`MacOS`/`Linux`系统，windows需要做额外的兼容性处理