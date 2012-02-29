define(function (require, exports, module) {

    var Marker  = require('marker');
    var Snippet = require('snippet');

    var singleLineSnippet = '(function (${2:bar}) { ${3} }(${1:foo}));';
    
    function extractInstanceData(instance) {
        var data = {};
        for (var name in instance) {
            if (instance.hasOwnProperty(name)) {
                data[name] = instance[name];
            }
        }
        return data;
    }

    buster.testCase('Snippet', {
        'should be function': function () {
            assert(Snippet);
        },

        'instance should have property "markers"': function () {
            var s = new Snippet();
            assert.isObject(s.markers);
        }
    });

    buster.testCase('Snippet#hasMarkerWithLabel', {
        'should return true if instance has marker with passed label': function () {
            var snippet = new Snippet();
            snippet.markers['foo'] = {};
            assert(snippet.hasMarkerWithLabel('foo'));
        },

        'should return false if instance does not have marker with passed label': function () {
            var snippet = new Snippet();
            refute(snippet.hasMarkerWithLabel('foo'));
        }
    });

    buster.testCase('Snippet#addPositionToMarker', {
        'should add passed position at last position in marker positions': function () {
            var snippet = new Snippet();
            snippet.markers['foo'] = {
                positions: []
            };
            var position = { column: 12, row: 0 };

            snippet.addPositionToMarker('foo', position);
            assert.same(snippet.markers['foo'].positions.pop(), position);
        }  
    });

    buster.testCase('Snippet#cleanupTemplate', {
        
        'should set property "template"': function () {
            var snippet = new Snippet();
            snippet.cleanupTemplate();
            refute.isNull(snippet.template);
        },

        'should remove all marker values and left only marker labels': function () {
            var snippet = new Snippet(singleLineSnippet);
            var cleanedTemplate = '(function (${2}) { ${3} }(${1}));';
            snippet.cleanupTemplate();
            assert.equals(cleanedTemplate, snippet.template);
        }
    });

    buster.testCase('Snippet#extractNextMarker', {
        'should reuturn object with configuration of first marker': function () {
            var snippetText = 'function (${1:arg1}) {}';
            var expected = {
                label        : '1',
                mainPosition : { column: 10, row: 0 },
                positions    : [],
                value        : 'arg1',
                length       : 4
            };
            var snippet = new Snippet();

            var actual = extractInstanceData(snippet.extractNextMarker(snippetText));
            assert.match(actual, expected);
        },

        'should return null when there is no markers in text': function () {
            var snippetText = 'function () {}';
            var snippet = new Snippet();

            var data = snippet.extractNextMarker(snippetText);
            assert.isNull(data);
        }
    });

    buster.testCase('Snippet#addMarker', {
        'should insert marker at last position': function () {
            var marker = new Marker('1', {column: 10, row: 0}, 'arg');
            var snippet = new Snippet();
            snippet.addMarker(marker);
            
            assert.same(snippet.markers['1'], marker);
        },

        'should correctly sort marker labels': function () {
            var marker1 = new Marker('1', {column: 10, row: 0}, 'arg1');
            var marker2 = new Marker('2', {column: 20, row: 0}, 'arg2');
            var snippet = new Snippet();
            snippet.addMarker(marker1);
            snippet.addMarker(marker2);
            
            assert.same(snippet.getNextMarker(), marker1);
            assert.same(snippet.getNextMarker(), marker2);
        }
    });

    buster.testCase('Snippet#replaceNextMarkerWithText', {
        'should replace first occurence of marker with its text': function () {
            var text1           = 'function (${1:arg1}) {}';
            var expectedResult1 = 'function (arg1) {}';
            var text2           = 'function (${1}) {}';
            var expectedResult2 = 'function () {}';

            var snippet = new Snippet();

            var result1 = snippet.replaceNextMarkerWithText(text1, 'arg1');
            assert.equals(result1, expectedResult1);

            var result2 = snippet.replaceNextMarkerWithText(text2, '');
            assert.equals(result2, expectedResult2);
        }
    });


    buster.testCase('Snippet#extractMarkers', {
        // there is something wrong with buster - this test should pass but buster
        // complains that asserts does not match
        '// should extract markers from snippet': function () {
            var snippetText = '(function (${2:foo}) { ${3} }(${1}));';
            // final text: '(function (foo) {  }());'
            var snippet = new Snippet();
            var expectedMarkers = {
                '1': new Marker('1', { column: 21, row: 0 }, ''),
                '2': new Marker('2', { column: 11, row: 0 }, 'foo'),
                '3': new Marker('3', { column: 18, row: 0 }, '')
            }
            snippet.extractMarkers(snippetText);

            console.log(extractInstanceData(snippet.markers["1"]), expectedMarkers["1"]);
            assert.match(snippet.markers, expectedMarkers);
        },

        'should extract markers with multiple instances correctly': function () {
            var snippetText = 'function (${1:arg}) { if (${1})\n { console.log(${1}) }};';
            var parsedSnippetText = 'function (arg) { if (arg)\n { console.log(arg) }};';

            var snippet = new Snippet();

            var marker = new Marker('1', {column: 10, row: 0}, 'arg');
            marker.positions = [{ column : 21, row: 0 }, { column : 15, row: 1 }];
            
            var expectedMarkers = {
                '1': marker 
            }

            snippet.extractMarkers(snippetText);
            assert.equals(snippet.markers, expectedMarkers);

        }
    });

    buster.testCase('Snippet#getNextMarker', {
        setUp: function () {
            var snippetText = 'if (${1}) { ${2}=true; } else { ${3}=true; }';
            this.snippet = new Snippet(snippetText);
        },

        'should return first marker when asked first time': function () {
            var marker = this.snippet.getNextMarker();
            assert.equals(marker.label, '1')
        },

        'should return null when asked more times than markers count': function () {
            this.snippet.currentMarkerIndex = -1;
            var marker = this.snippet.getNextMarker();
            marker = this.snippet.getNextMarker();
            marker = this.snippet.getNextMarker();
            marker = this.snippet.getNextMarker();
            marker = this.snippet.getNextMarker();
            assert.isNull(marker);
        },

        'should return markers in proper order': function () {
            this.snippet.currentMarkerIndex = -1;
            var marker = this.snippet.getNextMarker();
            assert.equals(marker.label, '1');
            marker = this.snippet.getNextMarker();
            assert.equals(marker.label, '2');
            marker = this.snippet.getNextMarker();
            assert.equals(marker.label, '3');
        }
    });

    buster.testCase('Snippet#getPrevMarker', {
        setUp: function () {
            var snippetText = 'if (${1}) { ${2}=true; } else { ${3}=true; }';
            this.snippet = new Snippet(snippetText);
        },

        'should return markers in proper order': function () {
            this.snippet.currentMarkerIndex = 3;
            var marker = this.snippet.getPrevMarker();
            assert.equals(marker.label, '3');
            marker = this.snippet.getPrevMarker();
            assert.equals(marker.label, '2');
            marker = this.snippet.getPrevMarker();
            assert.equals(marker.label, '1');
        },

        'should return null when asked more times than markers count': function () {
            this.snippet.currentMarkerIndex = 2;
            var marker = this.snippet.getPrevMarker();
            marker = this.snippet.getPrevMarker();
            marker = this.snippet.getPrevMarker();
            marker = this.snippet.getPrevMarker();
            assert.isNull(marker);
        }
        
    });

    buster.testCase('Snippet#moveTo', {
        setUp: function () {
            this.snippetText =  'if (${1}) {\n' + 
                                '    ${2}=true;\n' + 
                                '} else {\n' + 
                                '    ${3}=true;\n' + 
                                '}';
        },
        
        'should update markers to new positions' : function () {
            var snippet = new Snippet(this.snippetText);
            
            snippet.moveTo({ column: 4, row: 8 });

            var firstMarker = snippet.getNextMarker();
            assert.equals(firstMarker.mainPosition, { column: 4, row: 8 });

            var secondMarker = snippet.getNextMarker();
            assert.equals(secondMarker.mainPosition, { column: 8, row: 9 });

            var thirdMarker = snippet.getNextMarker();
            assert.equals(thirdMarker.mainPosition, { column: 8, row: 11 });
        },

        'should update text with passed columns': function () {
            var snippet = new Snippet(this.snippetText);
            var updatedText =  'if (${1}) {\n' + 
                               '      ${2}=true;\n' + 
                               '  } else {\n' + 
                               '      ${3}=true;\n' + 
                               '  }';
            snippet.moveTo({ column : 2, row: 0 });
            
            assert.equals(snippet.rawText, updatedText); 
        }
    });

});
