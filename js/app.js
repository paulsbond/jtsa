(function(){
  var app = angular.module('app', ['ngRoute']);

  app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/input', {
        controller: 'InputController',
        templateUrl: 'templates/input.html'
      })
      .when('/analysis', {
        controller: 'AnalysisController',
        templateUrl: 'templates/analysis.html'
      })
      .when('/config', {
        controller: 'ConfigController',
        templateUrl: 'templates/config.html'
      })
      .when('/help', {
        templateUrl: 'templates/help.html'
      })
      .when('/about', {
        templateUrl: 'templates/about.html'
      })
      .otherwise({redirectTo: '/input'});
  }]);

  app.run(
  ['$rootScope', '$location', 'store',
  function($rootScope, $location, store) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
      if (!store.selectedDataSet &&
         (next.originalPath == '/analysis' || next.originalPath == '/config')) {
        if (!current) $location.path('/input');
        else event.preventDefault();
      }
    })
  }]);

})();
