(function() {
  var app = angular.module('app');

  app.factory('plate', [function() {
    var plate = {};

    plate.rows = ['A','B','C','D','E','F','G','H'];
    plate.cols = [1,2,3,4,5,6,7,8,9,10,11,12];

    var getName = function(row, col) {
      return row + ('0'+col).slice(-2);
    };

    var id = 1;
    plate.wells = [];
    plate.rows.forEach(function(row) {
      plate.cols.forEach(function(col) {
        plate.wells.push({
          id: id++,
          name: getName(row, col),
          row: row,
          col: col
        });
      });
    });

    plate.getWellId = function(row, col) {
      for (var i = 0; i < plate.wells.length; i++) {
        var well = plate.wells[i];
        if (well.row == row && well.col == col) return well.id;
      }
    };

    plate.getWellName = function(id) {
      return plate.wells[id - 1].name;
    };

    plate.getWellIdFromName = function(name) {
      if (name.length == 2) name = name[0] + '0' + name[1];
      for (var i = 0; i < plate.wells.length; i++) {
        var well = plate.wells[i];
        if (well.name == name) return well.id;
      }
      return -1;
    };

    return plate;
  }]);
})();
