### 与自动化构建工具的区别

> jebkins/travis 等自动化构建工具已经十分成熟，为什么需要自研脚手架？

- 不满足需求： jenkins/travis 通常在`git hooks`当中触发，需要在服务端执行，无法覆盖研发人员本地的功能，如：创建项目自动化/本地 git 操作自动化等
- 定制复杂：jenkins/travis 定制过程需要使用 java 开发插件，对前端不够友好

### Windows上运行命令失败
> 无法加载文件 C:\Program Files\nodejs\migi.ps1，因为在此系统上禁止运行脚本。

解决方式如下：
- 1.右键点击左下角任务栏开始菜单按钮，点击 "Windows powerShell(管理员)(A)"，以管理员的权限打开命令终端。
- 2.输入命令：`set-executionpolicy remotesigned` 然后回车。
- 3.输入y按回车。问题解决。

### 持续集成（发布至Nginx）最后一步发布失败
原因目前暂时不明，因为发布时会在Migi服务器上利用`node-scp`传输文件至目标服务器，`node-scp`底层利用了`ssh2`这个包，由于ssh不通（可能也ping不通，但是在本地完全没问题），因此无法进行连接（报错为：`Error: Timed out while waiting for handshake`）。