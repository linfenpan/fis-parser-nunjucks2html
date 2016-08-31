# fis-parser-nunjucks2html

这是把 nunjucks 模板，转为 html 或 precompile代码的一个 fis-parser。

# 使用

``` javascript
fis.match('*.tmpl', {
  // 默认参数，如下:  http://mozilla.github.io/nunjucks/api.html#browser-usage
  parser: fis.plugin('nunjucks2html', {
    autoescape: true,
    throwOnUndefined: false,
    trimBlocks: true,
    lstripBlocks: true,
    noCache: true,
    // tags 属性，参考: http://mozilla.github.io/nunjucks/api.html#customizing-syntax
    // 额外增加参数:
    data: { /* nunjucks 渲染需要的数据 */ },
    root: '', // 模板所在的文件夹路径，一般不需要填写
    precompile: false, // 是否编译为可运行的脚本？
  }),
  rExt: '.html'
});
```

# 拓展

如果在 nunjucks 的模板文件顶部，添加注释，如:
``` html
<!--! /test/test.js !-->
{% extends "base.tmpl" %}

{% block header %}
  {{ super() }} <br/>
  I'm new test.
{% endblock %}
```
那么，当前模板，将在根目录，找到 ``` /test/test.js ``` 文件，如果该文件，
返回一个 json，则使用该返回的 json 渲染模板，
如果返回一个函数，则执行该函数，获取其返回值，进行渲染。

注意：如果渲染的数据，不是 json 格式，会出错。

如果不以 "/" 开头，则从当前模板所在目录开始，寻找相对路径的文件。
