(function() {
  var app = angular.module('app');

  app.factory('modelnorm',
  ['models', 'regression', 'store',
  function(models, regression, store) {
    var modelnorm = {};

    var normalise = function(well, points) {
      var minF = well.fit ? well.fit.minF : well.minF;
      var maxF = well.fit ? well.fit.maxF : well.maxF;
      return points.map(function(point) {
        var norm = (point[1] - minF) / (maxF - minF);
        return [point[0], norm];
      });
    };

    modelnorm.model = function(well) {
      if (!well.fit) return [];
      points = [];
      var model = models[store.selectedDataSet.config.modelName];
      for (var xi = well.minT; xi < well.maxT; xi++) {
        var yi = model.func(xi, well.fit.B, well.fit.C);
        points.push([xi, yi]);
      }
      var ymax = model.func(well.maxT, well.fit.B, well.fit.C);
      points.push([well.maxT, ymax]);
      return points;
    };

    modelnorm.normalisedModel = function(well) {
      return normalise(well, modelnorm.model(well));
    };

    modelnorm.normalisedRaw = function(well) {
      return normalise(well, well.raw);
    }

    return modelnorm;
  }]);
})();
