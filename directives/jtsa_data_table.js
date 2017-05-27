(function(){
  var app = angular.module('app');

  app.directive('jtsaDataTable',
  ['file', 'models', 'store',
  function(file, models, store) {

    var link = function(scope, element, attributes) {

      var model = models[store.selectedDataSet.config.modelName];
      var tm = model.tms[store.selectedDataSet.config.tmName];

      var mappedWells = function() {
        var wells = store.selectedDataSet.wells.map(mapWell);
        addMeanAndDeviation(wells);
        return wells;
      };

      var mapWell = function(well) {
        var mapped = {};
        mapped.id = well.id;
        mapped.name = well.name;
        mapped.type = well.type;
        if (scope.hasFit(well)) {
          mapped.tm = tm(well.fit.B);
          mapped.r2 = well.fit.R2;
          mapped.minT = well.fit.minT;
          mapped.maxT = well.fit.maxT;
          mapped.minF = well.fit.minF;
          mapped.maxF = well.fit.maxF;
          mapped.t = well.fit.B[0];
          mapped.a = well.fit.B[1];
          mapped.c = well.fit.B[2];
        } else {
          mapped.comment = "No fit";
        }
        return mapped;
      };

      var addMeanAndDeviation = function(wells) {
        var refs = wells.filter(function(well) { return well.type == 'Reference'; });
        if (refs) {
          var refTm = d3.mean(refs, function(ref) { return ref.tm; });
          var refTmDev = d3.deviation(refs, function(ref) { return ref.tm; });
          wells.forEach(function(well) {
            well.dTm = well.tm ? well.tm - refTm : undefined;
            well.dTmDev = (refTmDev && well.dTm) ? well.dTm / refTmDev : undefined;
          });
        }
      };

      var wells = mappedWells();
      scope.$on('fittingChanged', function() { wells = mappedWells(); });
      scope.$on('layoutChanged', function() { wells = mappedWells(); });

      scope.sortProp = 'name';
      scope.sortReverse = false;

      scope.sortBy = function(prop) {
        if (scope.sortProp == prop) {
          scope.sortReverse = !scope.sortReverse;
        } else {
          scope.sortProp = prop;
          scope.sortReverse = false;
        }
      };

      scope.classFor = function(prop) {
        if (scope.sortProp == prop) {
          if (scope.sortReverse) return 'sortable descending';
          return 'sortable ascending';
        }
        return 'sortable';
      };

      scope.filteredWells = function() {
        return wells.filter(function(well) {
          return textCompare(well.name, scope.nameFilter) &&
                 textCompare(well.type, scope.typeFilter) &&
                 numberCompare(well.tm, scope.tmFilter) &&
                 numberCompare(well.dTm, scope.dTmFilter) &&
                 numberCompare(well.dTmDev, scope.dTmDevFilter) &&
                 numberCompare(well.r2, scope.r2Filter) &&
                 numberCompare(well.minT, scope.minTFilter) &&
                 numberCompare(well.maxT, scope.maxTFilter) &&
                 numberCompare(well.minF, scope.minFFilter) &&
                 numberCompare(well.maxF, scope.maxFFilter) &&
                 numberCompare(well.maxF, scope.maxFFilter) &&
                 numberCompare(well.t, scope.tFilter) &&
                 numberCompare(well.a, scope.aFilter) &&
                 numberCompare(well.c, scope.cFilter) &&
                 textCompare(well.comment, scope.commentFilter);
        });
      };

      scope.filteredIds = function() {
        return scope.filteredWells().map(function(well) { return well.id; });
      };

      var textCompare = function(actual, filter) {
        if (!filter) return true;
        if (!actual) return false;
        return actual.toUpperCase().indexOf(filter.toUpperCase()) != -1;
      };

      var numberCompare = function(actual, filter) {
        if (!filter) return true;

        var matches = filter.match(/^-?\d+\.?(\d*)$/);
        if (matches) {
          if (actual === undefined) return false;
          var dp = matches[1].length;
          var num = Number(filter);
          return math.round(actual, dp) == num;
        }

        if (filter.match(/^[<>] ?-?\d+\.?\d*$/)) {
          if (actual === undefined) return false;
          return eval(actual + filter);
        }

        return true;
      };

      scope.openCsv = function() {
        var content = 'name,Type,Tm,dTm,dTm dev,R2,Min T,Max T,Min F,Max F,t,a,c,Comment\n';
        wells.forEach(function(well) {
          content += well.name   + ',' + well.type    + ',' +
                     well.tm     + ',' + well.dTm     + ',' +
                     well.dTmDev + ',' + well.r2      + ',' +
                     well.minT   + ',' + well.maxT    + ',' +
                     well.minF   + ',' + well.maxF    + ',' +
                     well.t      + ',' + well.a       + ',' +
                     well.c      + ',' + well.comment + '\n';
        });
        file.save('data.csv', 'text/csv', content);
      };

    };

    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'templates/jtsa_data_table.html',
      link: link
    };
  }]);
})();
