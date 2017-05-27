(function(){
  var app = angular.module('app');

  app.directive('jtsaSubHeading', ['store', function(store) {
    return {
      restrict: 'E',
      templateUrl: 'templates/jtsa_sub_heading.html',
      link: function(scope, element, attributes) {
        scope.text = function() {
          if (store.selectedDataSet) return store.selectedDataSet.name;
          return 'No data set selected';
        };
      }
    }
  }]);
})();
