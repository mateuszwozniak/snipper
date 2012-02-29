define(function (require, exports, module) {
    
    var Marker = require('marker');

    buster.testCase("Marker", {
        'should set passed properties in instance': function () {
            var label    = '1';
            var position = { column: 10 };
            var value     = 'foo';

            var marker   = new Marker(label, position, value);
            assert.equals(marker.label, label);
            assert.equals(marker.mainPosition, position);
            assert.equals(marker.value, value);
        },

        'should correctly comput length': function () {
            var label    = '1';
            var position = { column: 10 };
            var value     = 'foo';

            var marker   = new Marker(label, position, value);
            assert.equals(marker.length, 3);
            
        }
    });

    buster.testCase('Marker#addPosition', {
        'should add position to positions array': function () {
            var marker = new Marker();
            var pos = { column: 10 };
            marker.addPosition(pos);
            assert.same(marker.positions[marker.positions.length - 1], pos);
        }
    });

    buster.testCase('Snippet#setValue', {
        'should set passed value': function () {
            var marker = new Marker()
            marker.setValue('123');
            assert.equals('123', marker.value);
        },

        'should update marker length': function () {
            var marker = new Marker()
            marker.setValue('123');
            assert.equals(3, marker.length);
        }
    });
});
