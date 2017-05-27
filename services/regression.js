(function() {
  var app = angular.module('app');

  app.factory('regression', ['models', 'store', function(models, store) {
    var regression = {};

    var pointSubset = function(points, minT, maxT) {
      var subset = points.slice();

      if (minT) subset = subset.filter(function(p) { return p[0] >= minT; });
      if (maxT) subset = subset.filter(function(p) { return p[0] <= maxT; });

      var maxF = d3.max(subset, function(p) { return p[1]; });
      for (var i = subset.length - 1; i >= 0; i--) {
        if (subset[i][1] < maxF) subset.splice(i, 1);
        else break;
      }

      var minF = d3.min(subset, function(p) { return p[1]; });
      var reachedMinimum = false;
      for (var i = subset.length - 1; i >= 0; i--) {
        if (reachedMinimum) subset.splice(i, 1);
        else if (subset[i][1] == minF) reachedMinimum = true;
      }

      return subset;
    };

    regression.fitWell = function(well, model, minT, maxT) {
      var subset = pointSubset(well.raw, minT, maxT);
      try {
        var fit = nls(subset, model.func, model.derivatives, model.B0(subset), model.C(subset));
        fit.maxT = d3.max(subset, function(p) { return p[0]; });
        fit.minT = d3.min(subset, function(p) { return p[0]; });
        fit.maxF = d3.max(subset, function(p) { return p[1]; });
        fit.minF = d3.min(subset, function(p) { return p[1]; });
        return fit;
      } catch(err) {
        // TODO: Handle errors better
      }
    };

    regression.fitDataSet = function(dataSet) {
      var model = models[dataSet.config.modelName];
      dataSet.wells.forEach(function(well) {
        var minT = well.fit ? well.fit.minT : undefined;
        var maxT = well.fit ? well.fit.maxT : undefined;
        well.fit = regression.fitWell(well, model, minT, maxT);
      });
    };

    return regression;
  }]);
})();
