(function() {
  var app = angular.module('app');

  app.factory('config', ['models', function(models) {
    var config = {};

    config.default = function() {
      return {
        xLabel: 'Temperature / °C',
        yLabel: 'Fluorescence',
        modelName: 'Sigmoid-5',
        tmName: 'Midpoint'
      };
    };

    return config;
  }]);
})();
