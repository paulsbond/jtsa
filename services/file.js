(function() {
  var app = angular.module('app');

  app.factory('file', function() {
    var file = {};

    file.save = function(name, type, content) {
      var blob = new Blob([content], { type: type });
      var link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', name);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    file.read = function(file, callback) {
      var reader = new FileReader();
      reader.onload = function(event) {
        callback(event.target.result);
      };
      reader.readAsText(file);
    };

    return file;
  });
})();
