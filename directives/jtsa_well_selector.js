(function(){
  var app = angular.module('app');

  app.directive('jtsaWellSelector', ['plate', 'store', function(plate, store) {

    var link = function(scope, element, attributes) {

      scope.plate = plate;
      var dataSet = store.selectedDataSet;

      var wellIds = dataSet.wells.map(function(well) { return well.id; });
      var isMissing = function(id) {
        return wellIds.indexOf(id) == -1;
      };

      var mapTypes = function() {
        var types = {};
        dataSet.wells.forEach(function(well) {
          types[well.id] = well.type;
        });
        return types;
      }

      var types = mapTypes();
      scope.$on('layoutChanged', function() { types = mapTypes(); });

      scope.typeSymbol = function(row, col) {
        var id = plate.getWellId(row, col);
        if (types[id] == 'Reference') return 'R';
        if (types[id] == 'Blank') return 'B';
        if (types[id] == 'Control') return 'C';
      };

      scope.selectPlate = function() {
        scope.selectDeselect(wellIds);
      };

      scope.selectRow = function(row) {
        var ids = [];
        plate.wells.forEach(function(well) {
          if (well.row == row && !isMissing(well.id)) ids.push(well.id);
        });
        scope.selectDeselect(ids);
      };

      scope.selectCol = function(col) {
        var ids = [];
        plate.wells.forEach(function(well) {
          if (well.col == col && !isMissing(well.id)) ids.push(well.id);
        });
        scope.selectDeselect(ids);
      };

      scope.selectWell = function(row, col) {
        var id = plate.getWellId(row, col);
        if (!isMissing(id)) scope.selectDeselect([id]);
      };

      scope.wellClass = function(row, col) {
        var id = plate.getWellId(row, col);
        if (isMissing(id)) return 'missing';
        if (scope.selectedIds.indexOf(id) != -1) return 'selected';
      };

      scope.highlight = function(event, row, col) {
        var id = plate.getWellId(row, col);
        if (scope.selectedIds.indexOf(id) == -1) return;
        angular.element(event.target).addClass('highlighted');
        var field = d3.select('g.field.well-'+id);
        scope.$parent.highlight(field);
      }

      scope.unhighlight = function(event, row, col) {
        var id = plate.getWellId(row, col);
        angular.element(event.target).removeClass('highlighted');
        var field = d3.select('g.field.well-'+id);
        scope.$parent.unhighlight(field);
      }

    }

    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'templates/jtsa_well_selector.html',
      link: link
    }
  }]);
})();
