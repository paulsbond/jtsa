(function() {
  var app = angular.module('app');

  app.factory('store', ['config', function(config) {
    var store = {};

    // localforage

    localforage.config({
      name: 'jtsa',
      description: 'Data storage for the jTSA app'
    });

    var throwErr = function(err) {
      if (err) throw err;
    };

    var localforageGetItem = function(key, callback) {
      localforage.getItem(key, function(err, value) {
        throwErr(err);
        if (callback) callback(value);
      });
    };

    var localforageSetItem = function(key, value, callback) {
      localforage.setItem(key, value, function(err) {
        throwErr(err);
        if (callback) callback();
      });
    };

    var localforageRemoveItem = function(key, callback) {
      localforage.removeItem(key, function(err) {
        throwErr(err);
        if (callback) callback();
      });
    };

    var localforageKeys = function(callback) {
      localforage.keys(function(err, keys) {
        throwErr(err);
        if (callback) callback(keys);
      });
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
    };

    var readLocalforage = function(callback) {
      store.dataSets = [];
      localforageGetItem('jtsa-selectDataSetId', function(selectDataSetId) {
        localforageKeys(function(keys) {
          if (callback && keys.length == 0) callback();
          keysProcessed = 0;
          keys.forEach(function(key) {
            if (/jtsa-dataSet-\d+/.test(key)) {
              localforageGetItem(key, function(dataSet) {
                store.dataSets.push(dataSet);
                if (dataSet.id == selectDataSetId) store.selectedDataSet = dataSet;
                keysProcessed++;
                if (callback && keysProcessed == keys.length) callback();
              });
            }
            else {
              keysProcessed++;
              if (callback && keysProcessed == keys.length) callback();
            }
          });
        });
      });
    };

    var getFreeId = function(callback) {
      localforageKeys(function(keys) {
        num = 1;
        while (keys.indexOf('jtsa-dataSet-'+num) >= 0) num++;
        callback('jtsa-dataSet-'+num);
      });
    };

    var storageToForage = function(callback) {
      if (callback && store.dataSets.length == 0) callback();
      function processDataSet(i) {
        if (i == store.dataSets.length()) {
          if (callback) callback;
        }
        else {
          getFreeId(function(id) {
            store.dataSets[i].id = id;
            store.saveDataSet(store.dataSets[i], function() {
              var oldKey = 'tfa'+id.slice(4);
              localStorage.removeItem(oldKey);
              processDataSet(i + 1);
            });
          });
        }
      }
    };

    store.addDataSet = function(dataSet, callback) {
      getFreeId(function(id) {
        dataSet.id = id;
        dataSet.dateAdded = Date.now();
        store.saveDataSet(dataSet, function() {
          store.dataSets.push(dataSet);
          store.selectDataSet(dataSet, function() {
            if (callback) callback();
          });
        });
      });
    };

    store.removeDataSet = function(dataSet, callback) {
      if (window.confirm("Remove data set?"))
      {
        store.dataSets.splice(store.dataSets.indexOf(dataSet), 1);
        localforageRemoveItem(dataSet.id, function() {
          if (store.selectedDataSet === dataSet) {
            localforageRemoveItem('jtsa-selectDataSetId', function() {
              store.selectedDataSet = undefined;
              if (callback) callback();
            });
          }
          else if (callback) callback();
        });
      }
    };

    store.selectDataSet = function(dataSet, callback) {
      localforageSetItem('jtsa-selectDataSetId', dataSet.id, function() {
        store.selectedDataSet = dataSet;
        if (callback) callback();
      });
    };

    store.saveDataSet = function(dataSet, callback) {
      if (!dataSet) dataSet = store.selectedDataSet;
      dataSet.dateModified = Date.now();
      localforageSetItem(dataSet.id, dataSet, function() {
        if (callback) callback();
      });
    };

    // Config

    store.saveConfig = function(config, callback) {
      localforageSetItem('jtsa-config', config, function() {
        if (callback) callback();
      });
    };

    store.getConfig = function(callback) {
      localforageGetItem('jtsa-config', function(config) {
        callback(config);
      });
    };

    // Initialisation

    store.init = function(callback) {
      // Remove old values
      localStorage.removeItem('tfa-selectDataSetId');
      localStorage.removeItem('tfa-config');
      // Convert old localStorage to localforage
      readLocalStorage();
      storageToForage(function() {
        // Read localforage
        readLocalforage(function() {
          // Save default config if none is stored
          store.getConfig(function(value) {
            if (!value) {
              store.saveConfig(config.default(), function() {
                if (callback) callback();
              });
            }
            else if (callback) callback();
          });
        })
      });
    };

    return store;
  }]);
})();
