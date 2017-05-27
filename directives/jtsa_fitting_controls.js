(function(){
  var app = angular.module('app');

  app.directive('jtsaFittingControls',
  ['models', 'regression', 'store',
  function(models, regression, store) {

    var link = function(scope, element, attributes) {

      scope.removeFit = function() {
        if (!scope.selectedWells) return;
        scope.selectedWells.forEach(function(well) {
          delete well.fit;
        });
        scope.$parent.$broadcast("fittingChanged");
      };

      scope.refit = function() {
        if (!scope.selectedWells) return;
        var model = models[store.selectedDataSet.config.modelName];
        scope.selectedWells.forEach(function(well) {
          well.fit = regression.fitWell(well, model, scope.minT, scope.maxT);
        });
        scope.$parent.$broadcast("fittingChanged");
      };

      var onFittingChanged = function() {
        store.saveDataSet();
        resetForm();
      };

      var resetForm = function() {
        scope.minT = scope.fittedMinT;
        scope.maxT = scope.fittedMaxT;
      };

      scope.validRange = function() {
        return (typeof scope.minT == 'number' &&
                typeof scope.maxT == 'number' &&
                scope.minT < scope.maxT);
      };

      scope.$watch('selectedIds', resetForm, true);
      scope.$on('fittingChanged', onFittingChanged);
    };

    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'templates/jtsa_fitting_controls.html',
      link: link
    }
  }]);
})();
