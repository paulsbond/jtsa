(function() {
  var app = angular.module('app');

  app.factory('store', ['config', function(config) {
    var store = {};

    // Data Sets

    var selectedSetId = localStorage.getItem('tfa-selectDataSetId');
    store.dataSets = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (/tfa-dataSet-\d+/.test(key)) {
        var value = localStorage.getItem(key);
        var dataSet = angular.fromJson(value);
        store.dataSets.push(dataSet);
        if (dataSet.id == selectedSetId) store.selectedDataSet = dataSet;
      }
    }

    var getFreeId = function() {
      var num = 1;
      while (localStorage.getItem('tfa-dataSet-'+num) !== null) num++;
      return 'tfa-dataSet-'+num;
    };

    store.addDataSet = function(dataSet) {
      var id = getFreeId();
      dataSet.id = id;
      dataSet.dateAdded = Date.now();
      store.saveDataSet(dataSet);
      store.dataSets.push(dataSet);
      store.selectDataSet(dataSet);
    };

    store.removeDataSet = function(dataSet) {
      if (window.confirm("Remove data set?"))
      {
        store.dataSets.splice(store.dataSets.indexOf(dataSet), 1);
        localStorage.removeItem(dataSet.id);
        if (store.selectedDataSet === dataSet) {
          localStorage.removeItem('tfa-selectDataSetId');
          store.selectedDataSet = undefined;
        }
      }
    };

    store.selectDataSet = function(dataSet) {
      localStorage.setItem('tfa-selectDataSetId', dataSet.id);
      store.selectedDataSet = dataSet;
    };

    store.saveDataSet = function(dataSet) {
      if (!dataSet) dataSet = store.selectedDataSet; 
      dataSet.dateModified = Date.now();
      var key = dataSet.id;
      var value = angular.toJson(dataSet);
      localStorage.setItem(key, value);
    };

    // Config

    store.saveConfig = function(config) {
      localStorage.setItem('tfa-config', angular.toJson(config));
    };

    store.getConfig = function() {
      return angular.fromJson(localStorage.getItem('tfa-config'));
    }

    if (!localStorage.getItem('tfa-config')) store.saveConfig(config.default());

    return store;
  }]);
})();
