(function(){
  var app = angular.module('app');

  app.directive('jtsaModal', ['$rootScope', function($rootScope) {
    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'templates/jtsa_modal.html',
      link: function(scope, element, attributes) {

        window.onerror = function(message, source, line, col, error) {
          scope.$apply(function() {
            scope.title = 'Error';
            scope.message = error.message;
            scope.show = true;
          });
        }

        scope.close = function() {
          scope.show = false;
        }

      }
    }
  }]);
})();
