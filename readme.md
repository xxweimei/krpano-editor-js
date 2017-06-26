# krpano-editor-js
## 简介
krpano官方提供的编辑功能都是通过内嵌flash实现的，对于不懂flash开发的同学不太友好。于是就做了一个jquery版本的编辑器。如果觉得此项目对您有用，请不要吝啬您的star哦。

[demo编辑页](https://xxweimei.github.io/static/krpano/tour_editor.html)（无后台无法保存）
## 食用说明书
+ clone项目到本地
+ 安装nodejs（已装的同学跳过）
+ 在项目根目录执行 `npm install` 安装相关依赖包
+ 在项目根目录执行 `node app.js` 启动项目
+ 访问编辑页——http://127.0.0.1:3000/tour_editor.html
+ 访问结果页——http://127.0.0.1:3000/tour.html
## 关于项目的一些说明
+ 使用简单的nodejs express提供静态资源服务器功能，以及提供保存接口实现本地tour.xml文件的修改，具体参考app.js文件
+ 项目核心难点是对krpano的各种html api的理解，具体参考官网文档即可
+ 项目css以及jquery写法不要太在意，毕竟不是专业的
+ 有bug可以提issue，或者联系QQ793271105，当然有不懂的同学也可以沟通，有时间一定耐心解答
+ 感谢Satan（QQ昵称）同学提供的全景图片
