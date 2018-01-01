/*
 * nunjucks compiler extension for Koala
 * 
 * Copyright 2016 Jaydeep Kher
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fs = require('fs'),
    path = require('path'),
    pretty = require('pretty'),
	htmlmin = require('htmlmin'),
    FileManager = global.getFileManager(),
    Compiler = require(FileManager.appScriptsDir + '/Compiler.js');

function nunjucksCompiler(config) {
    Compiler.call(this, config);
}
require('util').inherits(nunjucksCompiler, Compiler);
module.exports = nunjucksCompiler;

/**
 * compile file
 * @param  {Object} file    compile file object
 * @param  {Object} emitter  compile event emitter
 */
nunjucksCompiler.prototype.compile = function(file, emitter) {
	var nunjucks = require('nunjucks'),
		self = this,
		filePath = file.src,
		output = file.output,
		settings = file.settings || {};

	var triggerError = function (message) {
		emitter.emit('fail');
		emitter.emit('always');
		self.throwError(message, filePath);
	};

	nunjucks.configure(path.dirname(file.src), { autoescape: true });

	fs.readFile(filePath, 'utf8', function (readError, code) {
        if (readError) {
        	triggerError(readError.message);
			return false;
        }

		var html;
		try {
			html = nunjucks.renderString(code);
			
			if(!settings.prettyHtml) {
				html = htmlmin(html);
			}else{
				html = pretty(html,{ocd:true});
			}

    	} catch (e) {
			triggerError(e.message);
			return false;
		}

		fs.writeFile(output, html, 'utf8', function (writeError) {
			if (writeError) {
				triggerError(writeError.message);
			} else {
				emitter.emit('done');
				emitter.emit('always');
			}
		});
	});
}