(function(){
  var app = angular.module('app');

  app.controller('ConfigController',
  ['$scope', 'config', 'models', 'regression', 'store',
  function($scope, config, models, regression, store) {

    $scope.config = store.selectedDataSet.config;
    $scope.models = models;

    $scope.save = function() {
      store.saveConfig($scope.config, function() {
        $scope.$apply();
      });
    };
    $scope.load = function() {
      store.getConfig(function(defaultConfig) {
        $scope.config.xLabel = defaultConfig.xLabel;
        $scope.config.yLabel = defaultConfig.yLabel;
        $scope.config.modelName = defaultConfig.modelName;
        $scope.config.tmName = defaultConfig.tmName;
        $scope.$apply();
      });
    };
    $scope.reset = function() {
      store.saveConfig(config.default(), function() {
        $scope.$apply();
      });
    };

    var saveDataSet = function() {
      store.saveDataSet(store.selectedDataSet, function() {
        $scope.$apply();
      })
    }

    var onConfigChange = function(newVal, oldVal) {
      if (newVal == oldVal) return;
      saveDataSet();
    };
    $scope.$watch('config', onConfigChange, true);

    var onModelChange = function(newVal, oldVal) {
      $scope.tms = models[newVal].tms;
      if (newVal == oldVal) return;
      if ($scope.tms[$scope.config.tmName] == undefined) {
        $scope.config.tmName = 'Midpoint';
      }
      regression.fitDataSet(store.selectedDataSet);
      saveDataSet();
    };
    $scope.$watch('config.modelName', onModelChange);

  }]);
})();
