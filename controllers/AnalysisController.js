(function(){
  var app = angular.module('app');

  app.controller('AnalysisController',
  ['$scope', 'file', 'store',
  function($scope, file, store) {

    var firstId = store.selectedDataSet.wells[0].id
    $scope.selectedIds = [firstId];

    $scope.chartOptions = {
      zoom: "full",
      showPoints: true,
      showModel: true,
      normalise: false
    };

    $scope.isSelected = function(well) {
      return $scope.selectedIds.indexOf(well.id) != -1;
    }

    $scope.allSelected = function(ids) {
      for (var i = 0; i < ids.length; i++) {
        if ($scope.selectedIds.indexOf(ids[i]) == -1) return false;
      }
      return true;
    }

    $scope.selectDeselect = function(ids) {
      if ($scope.allSelected(ids)) {
        $scope.deselectAll(ids);
      } else {
        $scope.selectAll(ids);
      }
    };

    $scope.selectAll = function(ids) {
      ids.forEach(function(id) {
        var index = $scope.selectedIds.indexOf(id);
        if (index == -1) $scope.selectedIds.push(id);
      });
    }

    $scope.deselectAll = function(ids) {
      ids.forEach(function(id) {
        var index = $scope.selectedIds.indexOf(id);
        if (index != -1) $scope.selectedIds.splice(index, 1);
      });
    }

    $scope.hasFit = function(well) {
      return well.fit;
    }

    $scope.downloadChart = function() {
      var content = d3.select("jtsa-curve-chart").html();
      var filename = store.selectedDataSet.name + '.svg'
      file.save(filename, 'image/svg+xml', content);
    };

    var getSelectedWells = function() {
      $scope.selectedWells = store.selectedDataSet.wells.filter($scope.isSelected);
    }

    var getDataRange = function() {
      $scope.minT = d3.min($scope.selectedWells, function(well) { return well.minT });
      $scope.maxT = d3.max($scope.selectedWells, function(well) { return well.maxT });
      $scope.minF = d3.min($scope.selectedWells, function(well) { return well.minF });
      $scope.maxF = d3.max($scope.selectedWells, function(well) { return well.maxF });
      if ($scope.selectedWells.some($scope.hasFit)) {
        $scope.fittedMinT = d3.min($scope.selectedWells, function(well) {
          return $scope.hasFit(well) ? well.fit.minT : null;
        });
        $scope.fittedMaxT = d3.max($scope.selectedWells, function(well) {
          return $scope.hasFit(well) ? well.fit.maxT : null;
        });
        $scope.fittedMinF = d3.min($scope.selectedWells, function(well) {
          return $scope.hasFit(well) ? well.fit.minF : null;
        });
        $scope.fittedMaxF = d3.max($scope.selectedWells, function(well) {
          return $scope.hasFit(well) ? well.fit.maxF : null;
        });
      } else {
        $scope.fittedMinT = $scope.minT;
        $scope.fittedMaxT = $scope.maxT;
        $scope.fittedMinF = $scope.minF;
        $scope.fittedMaxF = $scope.maxF;
      }
    }

    $scope.nextWell = function() {
      for (var i = 0; i < store.selectedDataSet.wells.length; i++) {
        if (store.selectedDataSet.wells[i].id == $scope.selectedIds[0]) break;
      }
      var next = i + 1;
      if (next >= store.selectedDataSet.wells.length) next = 0;
      $scope.selectedIds = [store.selectedDataSet.wells[next].id];
    };

    $scope.prevWell = function() {
      for (var i = 0; i < store.selectedDataSet.wells.length; i++) {
        if (store.selectedDataSet.wells[i].id == $scope.selectedIds[0]) break;
      }
      var prev = i - 1;
      if (prev <= -1) prev = store.selectedDataSet.wells.length - 1;
      $scope.selectedIds = [store.selectedDataSet.wells[prev].id];
    };

    var onSelectionChange = function() {
      getSelectedWells();
      getDataRange();
    };

    $scope.$watch('selectedIds', onSelectionChange, true);
    $scope.$on('fittingChanged', getDataRange);

  }]);
})();
