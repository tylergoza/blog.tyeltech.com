const fs = require('fs'); 
const path = require('path'); 
const crypto = require('crypto');

function filehash(filepath, digitlength) {
  fs.stat(path.resolve(filepath), (error, status) => {
    if (error || !status.isFile()) {
      return filepath;
    }
    var hash = crypto.createHash('md5').update(fs.readFileSync(filepath)).digest('hex');
    var prefix = hash.slice(0, digitlength);
    return prefix + '.' + path.basename(filepath);
  })
}

var themeSourcePath = path.resolve(__dirname, '../source'); // we need the theme source path to find the assets folder
var hashLength = 8;
// this is define of the generator.
hexo.extend.generator.register('filerev', function(locals) {
  // find all directories in theme source directory.
  var directories = fs.readdirSync(themeSourcePath);
  var outputData = [];
  directories.filter(function(dir){
    return dir === 'css' || dir === 'js';
  }).forEach(function(dir){
    var files = fs.readdirSync(path.join(themeSourcePath, dir));
    outputData = outputData.concat(files.map(function(file) {
      return {
        path: dir + '/' + filehash(path.join(themeSourcePath, dir, file), hashLength),  // call filehash method we write before.
        data: function() {
          return fs.createReadStream(path.join(themeSourcePath, dir, file));
        }
      };
    }));
  });

  return outputData;
});

hexo.extend.helper.register('usemin', function(input) {
  var filepath = path.join(themeSourcePath, input);
  var dir = input.split('/');
  var ext = path.extname(input);
  var newFilename = filehash(filepath, hashLength);
  var newPath = path.resolve('/', path.join(dir.slice(0, dir.length - 1).join('/'), newFilename));
  return ext === '.js' ? '<script type="text/javascript" src="' + newPath + '"></script>' : '<link rel="stylesheet" href="' + newPath + '">';
});
