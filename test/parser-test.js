define(function (require, exports, module) {
    
    var SnippetParser = require('parser');

    var rawSnippets = require('text!ext/snipper/test/data/javascript.snippets');

    var firstSnippetText = 'function first(${1:arg1}) {\n' +
                           '    console.log(\'I am first:\', ${1});\n' +
                           '}';
    var secondSnippetText = 'function second(${1:arg1}, ${2:arg2}) {\n'+
                            '    console.log(\'I am second:\', ${1}, ${2});\n' + 
                            '}';

    buster.testCase('SnippetParser#getRawSnippetConfig', {
        'should return object with correct snippet shortcut and snippet text': function () {
            var rawSnippet = ' first \n' + firstSnippetText;
            var expectedSnippetConfig = {
                shortcut: 'first',
                text: firstSnippetText
            };
            var snippetConfig = SnippetParser.getRawSnippetConfig(rawSnippet);
            assert.equals(snippetConfig, expectedSnippetConfig);
        }
    });

    buster.testCase('SnippetParser#getRawSnippets', {
        
        'should return object with snippet shortcuts as key and snippet text as value': function () {
            var expectedSnippets = {
                'first': firstSnippetText,
                'second': secondSnippetText
            };
            var snippets = SnippetParser.getRawSnippets(rawSnippets);

            assert.equals(snippets, expectedSnippets);
        }
    });

});
