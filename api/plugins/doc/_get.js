/**
 * Retrieve a public document
 *
 * JvK 26-08-2019
 *
 */
const Joi = require('@hapi/joi');
const ErrorType = require('error-types');
const Path = require('path');
const fs = require('fs');
const Marked = require('marked');
const Config = require('../../lib/default-values');
const Handlebars = require('handlebars');

const HTML_ROOT = Config.value('doc.rootUrl', 'http://localhost:3000/doc/', 'Root url for documentation');

const header = `<!doctype html>
<html>
\t<head>
\t\t<meta charset="utf-8">
\t\t<meta name="viewport" content="width=device-width, initial-scale=1, minimal-ui">
\t\t<base href="${HTML_ROOT}" />
\t\t<title>WatsNext 2020 documentation</title>
\t\t<link rel="stylesheet" href="d/github-markdown.css">
\t\t<style>
\t\t\tbody {
\t\t\t\tbox-sizing: border-box;
\t\t\t\tmin-width: 200px;
\t\t\t\tmax-width: 980px;
\t\t\t\tmargin: 0 auto;
\t\t\t\tpadding: 45px;
\t\t\t}
\t\t</style>
\t</head>
\t<body class="markdown-body">`;

const footer = `\t<div style="position: fixed;bottom: 0;width: 100%; background-color: white; color: lightgray">&copy; 2020 Toxus / Lima</div></body>
</html>`;

const getRoute = {
  method: 'GET',
  options: {
    auth: false
  },
  path: '/{param*}',
  handler: async function(request, h) {
    try {
      let path = Path.join(__dirname, 'documentation', request.params.param ? request.params.param : 'index.md');
      if (fs.existsSync(path)) {
        let source = fs.readFileSync(path, 'utf8');
        Handlebars.registerHelper('config', function (aString, defaultValue) {
          let key = Handlebars.escapeExpression(aString);
          return Config.value(key, Handlebars.escapeExpression(defaultValue))
        })

        let template = Handlebars.compile(source)

        Marked.setOptions({
          renderer: new Marked.Renderer(),
          // highlight: function (code) {
          //   return require('highlight.js').highlightAuto(code).value;
          // },
          pedantic: false,
          gfm: true,
          breaks: false,
          sanitize: false,
          smartLists: true,
          smartypants: false,
          xhtml: false
        });
        let data = {
          htmlRoot: HTML_ROOT
        }
        let s = header + Marked(template(data)) + footer;
        return s;
      }
     throw new ErrorType.ErrorNotFound()
    } catch (err) {
      return {
        errors: [{message: err.message}]
      }
    }
  },
};


module.exports = getRoute;
