(function() {
  var app = angular.module('app');

  app.factory('parser', ['plate', function(plate) {
    var parser = {};

    parser.parseContents = function(contents) {
      if (contents == '') throw new Error('Empty file')
      if (contents.length > 5000000) throw new Error('File too large');
      var format = getFormat(contents);
      var points = [];
      if (format == 'DSV') points = parseDSV(contents);
      if (format == 'Custom') points = parseCustom(contents);
      validatePoints(points);
      return getWells(points);
    };

    var getFormat = function(contents) {
      var lines = contents.match(/[^\r\n]+/g);
      for (var i = 0; i < lines.length; i++) {
        if (isDSVHeader(lines[i])) return 'DSV';
      }
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf('(Reading 1...N)') != -1) return 'Custom';
      }
      throw new Error('File format not recognised');
    };

    var isDSVHeader = function(line) {
      return /well/i.test(line) &&
        /temperature/i.test(line) &&
        /fluorescence/i.test(line)
    };

    var parseDSV = function(contents) {
      var lines = contents.match(/[^\r\n]+/g);
      // Remove lines before header
      while(lines.length > 0 && !isDSVHeader(lines[0])) {
        lines.splice(0, 1);
      }
      // Standardise header case
      lines[0] = lines[0].replace(/well/i, 'Well');
      lines[0] = lines[0].replace(/temperature/i, 'Temperature');
      lines[0] = lines[0].replace(/fluorescence/i, 'Fluorescence');
      // Get delimiter
      var delim1 = lines[0].match(/(.?)Well/)[1];
      var delim2 = lines[0].match(/(.?)Temperature/)[1];
      var delimiter = delim1 || delim2;
      // Parse DSV
      var dsv = d3.dsv(delimiter);
      return dsv.parse(lines.join('\n'), function(row) {
        return {w: row.Well, t: row.Temperature, f: row.Fluorescence};
      });
    }

    // Custom parsing for Cyril's files
    var parseCustom = function(contents) {
      var lines = contents.match(/[^\r\n]+/g);
      var t_index = 0;
      var f_index = 0;
      var points = [];
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf('Temperatures (Reading') != -1) t_index = i;
        if (lines[i].indexOf('Raw Data (Reading') != -1) f_index = i;
      }
      for (var i = 1; /^\d+/.test(lines[t_index + i]); i++) {
        var ts = lines[t_index + i].split('\t');
        var fs = lines[f_index + i].split('\t');
        for (var j = 1; j < ts.length; j++) {
          points.push({w: ts[0], t: ts[j], f: fs[j]});
        }
      }
      return points;
    }

    var validatePoints = function(points) {
      // Remove points with empty values
      for (var i = points.length - 1; i >= 0; i--) {
        if (points[i].w == '' || points[i].t == '' || points[i].f == '') {
          points.splice(i, 1);
        }
      }
      if (points.length == 0) throw new Error('No data points found');
      // Convert values to numbers and check they are valid
      points.forEach(function(point) {
        var well = +point.w;
        var temp = +point.t;
        var flur = +point.f;
        if (!Number.isInteger(well) || well < 1 || well > 96) throw new Error("Invalid well value: '" + point.w + "'");
        if (isNaN(temp)) throw new Error("Invalid temperature value: '" + row.t + "'");
        if (isNaN(flur)) throw new Error("Invalid fluorescence value:'" + row.f + "'");
        point.w = well;
        point.t = temp;
        point.f = flur;
      });
    };

    var getWells = function(points) {
      var wells = {};
      points.forEach(function(point) {
        if (wells[point.w] === undefined) wells[point.w] = [];
        wells[point.w].push([point.t, point.f]);
      });
      return Object.keys(wells).map(function(key) {
        var id = +key;
        var raw = wells[key].sort(comparePoints);
        return {
          id: id,
          name: plate.getWellName(id),
          type: 'Assay',
          raw: raw,
          minT: d3.min(raw, function(d) { return d[0]; }),
          maxT: d3.max(raw, function(d) { return d[0]; }),
          minF: d3.min(raw, function(d) { return d[1]; }),
          maxF: d3.max(raw, function(d) { return d[1]; }),
        };
      });
    };

    var comparePoints = function(point1, point2) {
      if (point1[0] < point2[0]) return -1; // point1 comes first
      if (point2[0] < point1[0]) return +1; // point2 comes first
      if (point1[1] < point2[1]) return -1; // point1 comes first
      if (point2[1] < point1[1]) return +1; // point2 comes first
      return 0;
    };

    return parser;
  }]);
})();
