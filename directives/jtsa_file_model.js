(function(){
  var app = angular.module('app');

  app.directive('jtsaFileModel', function() {
    return {
      restrict: 'A',
      scope: {
        jtsaFileModel: '='
      },
      link: function(scope, element, attributes) {
        element.bind('change', function(event) {
          scope.$apply(function() {
            scope.jtsaFileModel = event.target.files[0];
          });
        });
      }
    }
  });
})();
