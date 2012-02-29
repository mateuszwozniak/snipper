define(function (require, exports, module) {

    var Snippet = require('ext/snipper/snippet');

    function splitCode(code) {
        return code.split('\n');
    }

    function joinCode(lines) {
        return lines.join('\n');
    }

    var CodeCleaner = {
        clean: function (code) {
            code = this.stripEmptyLines(code);
            code = this.stripComments(code);
            return code;
        },
        
        stripEmptyLines: function (code) {
            var splitedCode = splitCode(code);                        

            for (var i = splitedCode.length; --i >= 0; ) {
                if (splitedCode[i] === '') {
                    splitedCode.splice(i, 1);
                }
            }
            return joinCode(splitedCode);
        },
        
        stripComments: function (code) {
            var splitedCode = splitCode(code);            
            var newCode = [];
            var currentLine;
            var hashPosition;
            
            for (var i = 0, len = splitedCode.length; i < len; i++ ) {
                currentLine = splitedCode[i];
                hashPosition = currentLine.indexOf('#');
                if (hashPosition !== -1) {
                    currentLine = currentLine.substring(0, hashPosition);                      
                }
                if (currentLine.length) {
                    newCode.push(currentLine);    
                }
            }
            
            return joinCode(newCode); 
        }
    };

    var SnippetParser = {
        
        getRawSnippets: function (code) {
            code = CodeCleaner.clean(code);

            var rawSnippetCodes = this.extractSnippets(code);
            var snippets = {}; 
            var _this = this;
           
            rawSnippetCodes.forEach(function (snippetCode) {
                var snippetConfig = _this.getRawSnippetConfig(snippetCode);
                snippets[snippetConfig.shortcut] = snippetConfig.text;
            });

            return snippets;
        },
        
        getRawSnippetConfig: function (snippetCode) {
            var snippetConfig = {
                shortcut : '',
                text     : ''
            };
            
            var snippetLines = splitCode(snippetCode);
            var snippetShortcut = snippetLines[0].trim();

            snippetLines.splice(0, 1);
            
            snippetConfig.shortcut = snippetShortcut;
            snippetConfig.text = joinCode(snippetLines);

            return snippetConfig;
        },

        extractSnippets: function (code) {
            var splittedByKeyword = code.split('snippet');    
            var rawSnippets = [];
            
            splittedByKeyword.forEach(function (el) {
                el = el.trim();
                if (el !== '') {
                    rawSnippets.push(el); 
                }
            });

            return rawSnippets;
        }
    };
    
    module.exports = SnippetParser;

});
