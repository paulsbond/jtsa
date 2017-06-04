(function(){
  var app = angular.module('app');

  app.directive('jtsaLayoutControls', ['store', function(store) {

    var link = function(scope, element, attributes) {

      // TODO: Can we use scope.selectedWells?
      scope.setType = function(type) {
        store.selectedDataSet.wells.forEach(function(well) {
          if (scope.isSelected(well)) well.type = type;
        });
        scope.$parent.$broadcast("layoutChanged");
      }

      var saveDataSet = function() {
        store.saveDataSet(store.selectedDataSet, function() {
          scope.$apply();
        })
      }

      scope.$on('layoutChanged', saveDataSet);
    };

    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'templates/jtsa_layout_controls.html',
      link: link
    }
  }]);
})();
