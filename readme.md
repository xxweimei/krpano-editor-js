#krpano_editor_html
##简介
网上几乎所有的krpano全景编辑后台都是html内嵌flash实现的，于是就做了一个jquery版本的编辑器。图片由于版权问题先删除，后续会补官方提供的demo图片
##demo
+ clone项目到本地
+ 在项目根目录执行 python -m SimpleHTTPServer 80（也可用其他静态服务器，这个简单省事）
+ index_editor.html为编辑页
+ index.html为结果页
+ 页面公用tour.xml,编辑页保存时调用后台接口操作tour.xml
