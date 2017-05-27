(function(){
  var app = angular.module('app');

  app.directive('jtsaDisabled', function() {
    return {
      restrict: 'A',
      link: function (scope, element, attributes) {

        // Disable ngClick
        attributes.ngClick = '('+attributes.jtsaDisabled+') || ('+attributes.ngClick+')';

        // Toggle "disabled" to class when jtsaDisabled becomes true
        scope.$watch(attributes.jtsaDisabled, function(val) {
          if (val !== undefined) {
            element.toggleClass("disabled", val);
          }
        });

        // Disable href on click
        element.on("click", function(e) {
          if (scope.$eval(attributes.jtsaDisabled)) {
            e.preventDefault();
          }
        });

      }
    };
  });
})();
