define(function(require, exports, module) {

    var ext = require('core/ext');
    var ide = require('core/ide');
    var editors = require('ext/editors/editors');
    var PlaceHolder = require('ace/placeholder').PlaceHolder;
    var Range = require('ace/range').Range;
    var marker = require('ext/language/marker');

    var SnippetParser = require('ext/snipper/parser');
    var SnippetManager = require('ext/snipper/manager');

    var rawSnippets = require('text!ext/snipper/javascript.snippets');

    module.exports = ext.register('ext/snipper/snipper', {
        
        name     : 'snipper',
        dev      : 'Mateusz Wozniak',
        alone    : true,
        type     : ext.GENERAL,
        snippets : {},
        
        nodes    : [],

        currentSnippet: null,

        init : function (amlNode) {
        },
        
        hook : function () {
            var _self = this;
            this.sManager = new SnippetManager(rawSnippets);
            this.initKeyHook();
        },
        
        enable : function () {
            this.nodes.each(function(item){
                item.enable();
            });
        },
        
        disable : function () {
            this.nodes.each(function(item){
                item.disable();
            });
        },
        
        destroy : function () {
            this.nodes.each(function(item){
                item.destroy(true, true);
            });
            this.nodes = [];
        },
        
        initKeyHook: function () {
            // @todo refactor!!!
            var currEditor = editors.currentEditor;

            if (currEditor) {
                var editor = currEditor.ceEditor.$editor;
                // @todo for debug purposes only
                window.e = editor;
                console.log('editor', editor);
                editor.commands.addCommand({
                    name: 'snipperResolve',
                    bindKey: 'Tab',
                    exec: function (editor, args) {
                        if (this.currentSnippet) {
                            this.goToNextMarker(editor);        
                        } else {
                            this.resolveSnippet(editor);
                        }
                    }.bind(this)
                });
                editor.commands.addCommand({
                    name: 'snipperPrevMarker',
                    bindKey: 'Shift-Tab',
                    exec: function (editor, args) {
                        // @todo: handle default action
                        if (this.currentSnippet) {
                            this.goToPrevMarker(editor);        
                        } else {
                            this.outdentRow(editor);
                        }
                    }.bind(this)
                });
            } else {
                // @todo error handling
            }
        },

        resolveSnippet: function (editor) {
            console.log('resolveSnippet', editor);
            var doc = editor.getSession().getDocument();

            var cursorPosition = editor.getCursorPosition();
            var currentLineText = doc.getLine(cursorPosition.row);
            
            // get previous text to space
            var textBeforeCursor = currentLineText.substring(0, cursorPosition.column);
            var wordBeforeCursor = textBeforeCursor.split(/\.| /).pop();

            if (this.sManager.hasSnippetForLabel(wordBeforeCursor)) {
                this.insertSnippetForLabel(wordBeforeCursor, editor);
            } else {
                console.log('snippet not matched');
                // @todo handle default tab method
                editor.insert('\t');
            }
        },
        
        insertSnippetForLabel: function (snippetLabel, editor) {
            editor.removeWordLeft();

            var currentSnippet = this.sManager.getSnippetForLabel(snippetLabel);
            currentSnippet.moveTo(editor.getCursorPosition());
            
            // @todo tests
//            this.placeholders = createPlaceholdersForSnippet(editor.getSession(),
//                currentSnippet);
//            console.log(this.placeholders);

            this.currentSnippet = currentSnippet;
            // insert this snippet 
            editor.insert(currentSnippet.renderTemplate());
            
            var snippetMarker = currentSnippet.getNextMarker();
            console.log('next marker', snippetMarker);
            this.insertPlaceholderForMarker(snippetMarker, editor);
        },

        insertPlaceholderForMarker: function (snippetMarker, editor) {
            var _this = this;
            var session = editor.getSession(); 

            editor.moveCursorTo(snippetMarker.mainPosition.row, snippetMarker.mainPosition.column);
            
            session.selection.clearSelection();
            session.selection.selectTo(snippetMarker.mainPosition.row, snippetMarker.mainPosition.column + snippetMarker.length);

            var placeholder = new PlaceHolder(session, snippetMarker.length, snippetMarker.mainPosition, snippetMarker.positions, 'language_rename_main', 'language_rename_other');
            window.placeholder = placeholder;
//            var placeholder = this.placeholders[snippetMarker.label];

            marker.disableMarkerType('occurrence_main');
            marker.disableMarkerType('occurrence_other');

            placeholder.showOtherMarkers();
            placeholder.on('cursorLeave', function() {
                _this.currentSnippet = null;
                placeholder.detach();
                marker.enableMarkerType('occurrence_main');
                marker.enableMarkerType('occurrence_other');
            });
            this.placeholder = placeholder;
        },

        goToNextMarker: function (editor) {
            var currentMarker = this.currentSnippet.getCurrentMarker();
            var currentMarkerValue = this.getPlaceholderValue();
            // @todo this can be set explicity?
            this.currentSnippet.setMarkerValue(currentMarker.label, currentMarkerValue);
            
            this.currentSnippet.updateMarkers();
            var nextMarker = this.currentSnippet.getNextMarker(); 

            if (nextMarker !== null) {
                this.insertPlaceholderForMarker(nextMarker, editor);
                return;
            }

            this.currentSnippet = null;
            if (this.placeholder) {
                this.placeholder.detach();
                this.placeholder = null;
            }
        },

        goToPrevMarker: function (editor) {
            // @todo DRY with goToNextMarker
            
            var currentMarker = this.currentSnippet.getCurrentMarker();
            var currentMarkerValue = this.getPlaceholderValue();
            // @todo this can be set explicity?
            this.currentSnippet.setMarkerValue(currentMarker.label, currentMarkerValue);
            
            this.currentSnippet.updateMarkers();
            var prevMarker = this.currentSnippet.getPrevMarker(); 

            if (prevMarker !== null) {
                this.insertPlaceholderForMarker(prevMarker, editor);
                return;
            }

            this.currentSnippet = null;
            if (this.placeholder) {
                this.placeholder.detach();
                this.placeholder = null;
            }
        },
        
        outdentRow: function (editor) {
            var session = editor.getSession();
            var pos = editor.getCursorPosition();
            var range = new Range(pos.row, 0, pos.row, 0);
            session.outdentRows(range);
        },

        getPlaceholderValue: function () {
            var pos = this.placeholder.pos;
            var range = new Range(pos.row, pos.column, 
                pos.row, pos.column + this.placeholder.length);
            return this.placeholder.session.getTextRange(range);
        }
    });
});
