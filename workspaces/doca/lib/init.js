var glob = require('glob');
var path = require('path');
var fs = require('fs');
var chalk = require('chalk');
var mkdirp = require('mkdirp');
var ncp = require('ncp').ncp;
var replace = require('replace');
var setTheme = require('./theme').setTheme;

function replaceSchemasAndTheme(theme, input, output, dev, schemas) {
  var subFolders = output.split('/').length;
  var prefix = path.normalize('../'.repeat(subFolders) + (input || ''));
  console.log(chalk.green('Customizing doca project files:'));
  replace({
    regex: '// *###schemas###',
    replacement:
      '  ,\n' +
      schemas
        .map(function(schema) {
          return `  require('${path.join(prefix, schema)}')`;
        })
        .join(',\n'),
    paths: [path.join(output, 'schemas.js')]
  });
  setTheme(theme, output, dev);
}

function copyFiles(theme, input, output, dev, schemas) {
  var source = path.join(__dirname, '../app');
  ncp(source, output, function(err) {
    if (err) {
      console.error(err);
    } else {
      console.log(chalk.green('Doca project files has been copied!'));
      replaceSchemasAndTheme(theme, input, output, dev, schemas);
    }
  });
}

function findSchemas(theme, input, output, dev) {
  var options = null;
  if (input) {
    options = { cwd: path.normalize(input) };
  }
  glob('**/*.json', options, function(err, schemas) {
    if (err) {
      console.error(err);
    } else {
      console.log(
        `Importing these schemas from ${chalk.green(input || './')}:`
      );
      schemas.forEach(function(schema) {
        console.log(chalk.blue(`- ${schema}`));
      });
      copyFiles(theme, input, output, dev, schemas);
    }
  });
}

function init(theme, input, output, dev) {
  var themeName = theme || '@cloudflare/doca-default-theme';
  var outputFolder = output ? path.normalize(output) : 'documentation';

  fs.access(outputFolder, fs.F_OK, function(err) {
    if (!err) {
      console.error(
        `Folder (output) ${chalk.red(outputFolder)} already exists!`
      );
    } else {
      mkdirp(outputFolder);
      console.log(`Folder ${chalk.red(outputFolder)} has been created.`);
      findSchemas(themeName, input, outputFolder, dev);
    }
  });
}

module.exports = init;
