'use strict';

var fs = require('fs');
var path = require('path');
var nunjucks = require('nunjucks');
var parser = nunjucks.parser;
var Environment = nunjucks.Environment;

// options 的定义 http://mozilla.github.io/nunjucks/api.html#browser-usage
var defaultOptions = {
  autoescape: true,
  throwOnUndefined: false,
  trimBlocks: true,
  lstripBlocks: true,
  noCache: true,
  // tags 的属性定义: http://mozilla.github.io/nunjucks/api.html#customizing-syntax
  // tags: {
  //   blockStart: '<%',
  //   blockEnd: '%>',
  //   variableStart: '<$',
  //   variableEnd: '$>',
  //   commentStart: '<#',
  //   commentEnd: '#>'
  // }
};
var root = fis.project.getProjectPath();

module.exports = function(content, file, conf) {
  conf = conf || {};

  var isPrecompile = !!conf.precompile;
  var viewDir = conf.root || path.dirname(file.fullname);
  var basename = file.basename;
  var data = readDate(content, file) || conf.data;
  var nunjOptions = Object.assign({}, conf || {}, defaultOptions);

  if (isPrecompile) {
    var env = new Environment(new nunjucks.FileSystemLoader(viewDir), nunjOptions);
    var str = normalize(file, content, env);
    return nunjucks.precompileString(str, data);
  } else {
    nunjucks.configure(viewDir, nunjOptions);
    return clearDataTag(nunjucks.render(basename, data));
  }
};

function readDate(content, file) {
  var res = content.match(/^\s*<!--!\s*([^!]+?)\s*!-->/);
  if (!res) {
    return res;
  }

  var url = res[1].trim();
  var dir = url.indexOf('/') === 0 ? root : file.dirname;
  var filePath = path.join(dir, url);
  res = null;
  if (fs.existsSync(filePath)) {
    res = require(filePath);
    if (typeof res === 'function') {
      res = res();
    }
  }

  return res;
}

function clearDataTag(content) {
  return content.replace(/^\s*<!--!\s*([^!]+?)\s*!-->\s*/, '');
}

function normalize(file, src, env){
    var added = {};
    var pathinfo = fis.util.pathinfo(file.toString());
    var tokens = parser.parse(src, env.extensions);

    function addDep(token){
        token.children && token.children.forEach(function(child){
            if (child.template && !added[child.template.value]){
                added[child.template.value] = true;
                var childPath =
                    child.template.value.indexOf("/") === 0 ?
                    child.template.value :
                    pathinfo.dirname + "/" + child.template.value;
                if (fis.util.isFile(childPath)){
                    var id = fis.file(childPath).getId();
                    file.addRequire(id);
                    //TODO 用更靠谱的办法替换相对路径与ID
                    src = src.replace(child.template.value, id);
                }
            }
            addDep(child);
        });
        token.body && addDep(token.body);
    }

    src = fis.compile.extHtml(src);
    addDep(tokens);
    return src;
}
