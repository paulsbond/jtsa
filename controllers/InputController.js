(function(){
  var app = angular.module('app');

  app.controller('InputController',
  ['$scope', 'file', 'parser', 'regression', 'store',
  function($scope, file, parser, regression, store) {

    $scope.store = store;

    var isUniqueName = function(name) {
      for (var i = 0; i < store.dataSets.length; i++) {
        if (name == store.dataSets[i].name) return false;
      }
      return true;
    }

    var resetInputForm = function() {
      $scope.inputForm = {};
      document.getElementById('input_form').reset();
    };

    var checkInputForm = function() {
      if (!$scope.inputForm.name) $scope.inputForm.todo = 'Enter a name';
      else if (!isUniqueName($scope.inputForm.name)) $scope.inputForm.todo = 'Enter a unique name';
      else if (!$scope.inputForm.file) $scope.inputForm.todo = 'Select a file';
      else $scope.inputForm.todo = '';
    };
    $scope.$watch('inputForm.name', checkInputForm);
    $scope.$watch('inputForm.file', checkInputForm);

    $scope.submitInputForm = function() {
      var dataSet = {};
      dataSet.name = $scope.inputForm.name;
      store.getConfig(function(config) {
        dataSet.config = config;
        file.read($scope.inputForm.file, function(contents) {
          dataSet.wells = parser.parseContents(contents);
          regression.fitDataSet(dataSet);
          store.addDataSet(dataSet);
          $scope.$apply(function() { resetInputForm(); });
        });
      });
    };

    var resetImportForm = function() {
      $scope.importForm = {};
      document.getElementById('import_form').reset();
    };

    var checkImportForm = function() {
      if (!$scope.importForm.name) $scope.importForm.todo = 'Enter a name';
      else if (!isUniqueName($scope.importForm.name)) $scope.importForm.todo = 'Enter a unique name';
      else if (!$scope.importForm.file) $scope.importForm.todo = 'Select a file';
      else $scope.importForm.todo = '';
    };
    $scope.$watch('importForm.name', checkImportForm);
    $scope.$watch('importForm.file', checkImportForm);

    $scope.submitImportForm = function() {
      file.read($scope.importForm.file, function(contents) {
        var dataSet = angular.fromJson(contents);
        dataSet.name = $scope.importForm.name;
        store.addDataSet(dataSet);
        $scope.$apply(function() { resetImportForm(); });
      });
    };

    $scope.exportDataSet = function(event, dataSet) {
      file.save('dataset.json', 'application/json', angular.toJson(dataSet));
      event.stopPropagation();
    };

    $scope.removeDataSet = function(event, dataSet) {
      store.removeDataSet(dataSet);
      event.stopPropagation();
    }

    resetInputForm();
    resetImportForm();

  }]);
})();
