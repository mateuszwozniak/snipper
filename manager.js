define(function (require, exports, module) {

    var SnippetParser = require('ext/snipper/parser');
    var Snippet       = require('ext/snipper/snippet');

    function SnippetManager(rawSnippets) {
        this.rawSnippets = rawSnippets;
        this.snippets = {};

        this.createSnippetsFromRawString();
    }

    SnippetManager.prototype = {

        createSnippetsFromRawString: function () {
            this.snippets = SnippetParser.getRawSnippets(this.rawSnippets);
        },

        hasSnippetForLabel: function (label) {
            return typeof this.snippets[label] !== 'undefined';
        },

        getSnippetForLabel: function (label) {
            if (this.snippets[label]) {
                return new Snippet(this.snippets[label]);
            }
            return null;
        }
    };

    SnippetManager.prototype.constructor = SnippetManager;

    module.exports = SnippetManager;
    
});
