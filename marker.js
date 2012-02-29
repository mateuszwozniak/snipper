define(function (require, exports, module) {

    function Marker(label, mainPosition, value) {
        this.label        = label || '';
        this.value        = value || '';
        this.length       = this.value.length;
        this.mainPosition = mainPosition;
        this.positions    = [];
    }

    Marker.prototype = {
        addPosition: function (position) {
            this.positions.push(position);
        },

        setValue: function (value) {
            this.value = value;
            this.length = this.value.length;
        },

        moveByRowCount: function (rowCount) {
            this.mainPosition.row += rowCount;
            this.positions = this.positions.map(function (position) {
                position.row += rowCount;
                return position;
            });
        }
    };

    Marker.prototype.constructor = Marker;
    
    module.exports = Marker;

});
