define(function (require, exports, module) {

    var SnippetManager = require('manager');
    var rawSnippets = require('text!ext/snipper/test/data/javascript.snippets');

    var firstRawSnippet =   'function first(${1:arg1}) {\n' +
                            '    console.log(\'I am first:\', ${1});\n' +
                            '}';

    var secondRawSnippet =  'function second(${1:arg1}, ${2:arg2}) {\n'+
                            '    console.log(\'I am second:\', ${1}, ${2});\n' +
                            '}';

    buster.testCase('SnippetManager', {

        'should extract snippets from snippet string': function () {
            var sm = new SnippetManager(rawSnippets);
            assert.equals(sm.snippets['first'], firstRawSnippet);
            assert.equals(sm.snippets['second'], secondRawSnippet);
        }
    });

    buster.testCase('SnippetManager#hasSnippetForLabel', {
        setUp: function () {
            this.sm = new SnippetManager(rawSnippets);
        },

        'should return true if has snippet with passed label': function () {
            assert(this.sm.hasSnippetForLabel('first')); 
        },

        'should return false if has snippet with passed label': function () {
            refute(this.sm.hasSnippetForLabel('third')); 
        }
    });

    buster.testCase('SnippetManager#getSnippetForLabel', {
        setUp: function () {
            this.sm = new SnippetManager(rawSnippets);
        },

        'should return snippet for passed label if exist': function () {
            var snippet = this.sm.getSnippetForLabel('first');
            assert.isObject(snippet);
        },

        'should return null if snippet for passed label does not exist': function () {
            var snippet = this.sm.getSnippetForLabel('third');
            assert.isNull(snippet);
        }
    });

});
