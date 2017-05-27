(function(){
  var app = angular.module('app');

  app.directive('jtsaNav', ['$location', 'store', function($location, store) {
    return {
      restrict: 'E',
      templateUrl: 'templates/jtsa_nav.html',
      link: function(scope, element, attributes) {

        scope.store = store;

        scope.class = function(name) {
          if ('/'+name === $location.path()) return 'active';
        };

      }
    }
  }]);
})();
