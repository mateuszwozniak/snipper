define(function (require, exports, module) {
    
    var Marker = require('ext/snipper/marker');

    var markerRegexp      = /\$\{(.*?)\}/;
    var markerValueRegexp = /\${(.*?)(:.*?)?\}/g;
    
    function computeLineNumber(text) {
        return text.split('\n').length - 1;
    }

    function Snippet(text) {
        this.currentMarkerIndex = -1;
        this.init(text);
    }

    Snippet.prototype = {

        init: function (text) {
            this.rawText            = text || '';
            this.template           = null;
            this.markers            = {};
            this.labels             = [];
            this.cleanupTemplate();
            this.extractMarkers(this.rawText);
        },
        
        cleanupTemplate: function () {
            this.template = this.rawText.replace(markerValueRegexp, '${$1}');
        },

        extractMarkers: function (snippetText) {
            this.markers = {};
            this.labels = [];
            var workingTemplate = snippetText;
            var marker;

            while (marker = this.extractNextMarker(workingTemplate)) {
                if (this.hasMarkerWithLabel(marker.label)) {
                    this.addPositionToMarker(marker.label, marker.mainPosition); 
                } else {
                    this.addMarker(marker);
                }        
                // remove marker from current text - prepare to next marker
                // extraction
                workingTemplate = this.replaceNextMarkerWithText(workingTemplate,
                    this.markers[marker.label].value);
            }
        },
        
        renderTemplate: function () {
            var _this = this;

            function replaceMarkerWithItsValue(markerMatch, markerLabel, markerValue) {
                var marker = _this.markers[markerLabel];
                return marker ? marker.value : markerMatch; 
            }

            return this.template.replace(markerValueRegexp, replaceMarkerWithItsValue);
        },

        hasMarkerWithLabel: function (label) {
            return typeof this.markers[label] !== 'undefined';
        },

        addPositionToMarker: function (label, position) {
            var marker = this.markers[label];
            marker.positions.push(position);
        },

        addMarker: function (marker) {
            this.markers[marker.label] = marker;
            this.labels.push(marker.label);
            this.sortMarkers();
        },

        extractNextMarker: function (snippetText) {
            var markerData = null; 
            
            function parseMarkerString(matchedMarker, markerContent, position, str) {
                
                var markerText    = '';
                var splitedMarker = markerContent.split(':');
                var markerLabel   = splitedMarker[0];
                var textBefore    = str.substr(0, position);
                var markerRow     = computeLineNumber(textBefore, position);
                var markerLine    = textBefore.split('\n').pop();
                var column        = markerLine.length;
                

                if (splitedMarker.length > 1) {
                    markerText = splitedMarker[1];
                }

                markerData = new Marker(markerLabel, 
                    { column: column, row: markerRow }, markerText);

                return matchedMarker;
            }
            
            snippetText.replace(markerRegexp, parseMarkerString);

            return markerData; 
        },

        replaceNextMarkerWithText: function (template, textToInsert) {
            return template.replace(markerRegexp, textToInsert);
        },

        sortMarkers: function () {
            this.labels = this.labels.sort();
        },

        getNextMarker: function () {
            var maxMarkerIndex = this.labels.length - 1;

            if (this.currentMarkerIndex >= maxMarkerIndex) {
                this.currentMarkerIndex = maxMarkerIndex;
                return null;
            }

            this.currentMarkerIndex++;
            return this.getMarkerAtPosition(this.currentMarkerIndex);
        },

        getPrevMarker: function () {
            if (this.currentMarkerIndex <= 0) {
                this.currentMarkerIndex = 0;
                return null;
            }

            this.currentMarkerIndex--;
            return this.getMarkerAtPosition(this.currentMarkerIndex);
        },
        
        getMarkerAtPosition: function (position) {
            return this.markers[this.labels[position]];
        },

        setMarkerValue: function (markerLabel, value) {
            var marker = this.markers[markerLabel];        
            marker && marker.setValue(value);
        },

        getCurrentMarker: function () {
            return this.getMarkerAtPosition(this.currentMarkerIndex);
        },

        updateMarkers: function () {
            var renderedTemplate = this.renderSnippetCode();
            this.extractMarkers(renderedTemplate);
            // @todo better naming of movedTo
            if (this.movedTo) {
                this.moveTo(this.movedTo);
            }
        },

        renderSnippetCode: function () {
            var _this = this;
            function fillMarker(markerMatch, markerLabel) {
                var marker = _this.markers[markerLabel];
                if (marker) {
                    return '${'+ markerLabel + ':' + marker.value + '}';
                } else {
                    return markerMatch;
                }
            }
            return this.template.replace(markerValueRegexp, fillMarker);
        },

        moveTo: function (position) {
            this.movedTo = position;
            var text = this.rawText;
            var indent = (new Array(position.column + 1)).join(' ');
            text = text.replace(/\n^/gm, '\n' + indent);
            this.init(text); 
            this.moveMarkersByRowCount(position.row);
        },

        moveMarkersByRowCount: function (row) {
            var marker;
            var backIndex = this.currentMarkerIndex;
            this.currentMarkerIndex = -1;
            
            while (marker = this.getNextMarker()) {
                marker.moveByRowCount(row); 
            }

            this.currentMarkerIndex = backIndex;
        }
        
    };

    Snippet.prototype.constructor = Snippet;

    module.exports = Snippet;

});
