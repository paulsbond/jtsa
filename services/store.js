(function() {
  var app = angular.module('app');

  app.factory('store', ['config', function(config) {
    var store = {};

    // localforage will prioritise IndexedDB, WebSQL then localStorage
    localforage.config({
      name: 'jtsa',
      description: 'Data storage for the jTSA app'
    });

    var throwErr = function(err) {
      if (err) throw err;
    };

    // Data Sets

    var readLocalStorage = function() {
      store.dataSets = [];
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (/tfa-dataSet-\d+/.test(key)) {
          var value = localStorage.getItem(key);
          var dataSet = angular.fromJson(value);
          store.dataSets.push(dataSet);
        }
      }
    }

    var readLocalForage = function(callback) {
      localforage.getItem('jtsa-selectDataSetId', function(err, value) {
        throwErr(err);
        var selectedDataSet = value;
        store.dataSets = [];
        localforage.keys(function(err, keys) {
          throwErr(err);
          keysProcessed = 0;
          keys.forEach(function(key) {
            if (/jtsa-dataSet-\d+/.test(key)) {
              localforage.getItem(key, function(err, value) {
                throwErr(err);
                store.dataSets.push(value);
                if (value.id == selectedDataSet) store.selectedDataSet = value;
                keysProcessed++;
                if (keysProcessed == keys.length) callback();
              });
            }
            else {
              keysProcessed++;
              if (keysProcessed == keys.length) callback();
            }
          })
        });
      });
    }

    var getFreeId = function(callback) {
      localforage.keys(function(err, keys) {
        throwErr(err);
        num = 1;
        while (keys.indexOf('jtsa-dataSet-'+num) >= 0) num++;
        callback('jtsa-dataSet-'+num);
      });
    };

    store.addDataSet = function(dataSet) {
      getFreeId(function(id) {
        dataSet.id = id;
        dataSet.dateAdded = Date.now();
        store.saveDataSet(dataSet);
        store.dataSets.push(dataSet);
        store.selectDataSet(dataSet);
      });
    };

    store.removeDataSet = function(dataSet) {
      if (window.confirm("Remove data set?"))
      {
        store.dataSets.splice(store.dataSets.indexOf(dataSet), 1);
        localforage.removeItem(dataSet.id, throwErr);
        if (store.selectedDataSet === dataSet) {
          localforage.removeItem('jtsa-selectDataSetId', throwErr);
          store.selectedDataSet = undefined;
        }
      }
    };

    store.selectDataSet = function(dataSet) {
      localforage.setItem('jtsa-selectDataSetId', dataSet.id, throwErr);
      store.selectedDataSet = dataSet;
    };

    store.saveDataSet = function(dataSet, callback) {
      if (!dataSet) dataSet = store.selectedDataSet; 
      dataSet.dateModified = Date.now();
      localforage.setItem(dataSet.id, dataSet, function(err, value) {
        throwErr(err);
        callback(value)
      });
    };

    // Remove old value from localStorage
    localStorage.removeItem('tfa-selectDataSetId');
    // Get datasets from localStorage (keep for backwards compatibility)
    readLocalStorage()
    // Convert any datasets from localStorage to localforage
    // Remove dataset from localStorage if successful
    // Read from localforage once all datasets are processed
    var alertDone = function() {
      console.log('Done reading datasets');
    }
    if (store.dataSets.length == 0) readLocalForage(alertDone);
    else {
      dataSetsProcessed = 0
      store.dataSets.forEach(function(dataSet) {
        getFreeId(function(id) {
          dataSet.id = id;
          store.saveDataSet(dataSet, function() {
            var oldKey = 'tfa'+id.slice(4);
            localStorage.removeItem(oldKey);
            dataSetsProcessed++;
            if (dataSetsProcessed == store.dataSets.length) readLocalForage(alertDone);
          });
        });
      });
    }

    // Config

    store.saveConfig = function(config) {
      localforage.setItem('jtsa-config', config, throwErr);
    };

    store.getConfig = function(callback) {
      localforage.getItem('jtsa-config', function(err, value) {
        throwErr(err);
        callback(value);
      });
    }

    // Remove old config from localStorage
    localStorage.removeItem('tfa-config');

    // Save default if no value exists in localforage
    localforage.getItem('jtsa-config', function(err, value) {
      throwErr(err);
      if (!value) store.saveConfig(config.default())
    })

    return store;
  }]);
})();
