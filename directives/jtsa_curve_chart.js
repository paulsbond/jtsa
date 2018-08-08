(function(){
  var app = angular.module('app');

  app.directive('jtsaCurveChart',
  ['analysis', 'regression', 'store',
  function(analysis, regression, store) {

    var model = analysis.model;
    var normalisedModel = analysis.normalisedModel;
    var normalisedRaw = analysis.normalisedRaw;

    var colours = [
      {hex:'#1f77b4', ids:[]},
      {hex:'#ff7f0e', ids:[]},
      {hex:'#2ca02c', ids:[]},
      {hex:'#d62728', ids:[]},
      {hex:'#9467bd', ids:[]},
      {hex:'#8c564b', ids:[]},
      {hex:'#e377c2', ids:[]},
      {hex:'#7f7f7f', ids:[]},
      {hex:'#bcbd22', ids:[]},
      {hex:'#17becf', ids:[]}
    ];

    var getColour = function(well) {
      var next = colours[0];
      for (var i = 0; i < colours.length; i++) {
        if (colours[i].ids.indexOf(well.id) != -1) return colours[i].hex;
        if (colours[i].ids.length < next.ids.length) next = colours[i];
      }
      next.ids.push(well.id);
      return next.hex;
    };

    var changeColour = function() {
      var field = d3.select(this.parentNode);
      var wellId = field.data()[0].id;
      for (var i = 0; i < colours.length; i++) {
        var index = colours[i].ids.indexOf(wellId);
        if (index != -1) {
          colours[i].ids.splice(index, 1);
          i++;
          if (i === colours.length) i = 0;
          colours[i].ids.push(wellId);
          field.style("stroke", colours[i].hex);
          field.style("fill", colours[i].hex);
          return;
        }
      }
    };

    var removeColour = function(well) {
      for (var i = 0; i < colours.length; i++) {
        var index = colours[i].ids.indexOf(well.id);
        if (index != -1) {
          colours[i].ids.splice(index, 1);
          return;
        }
      }
    };

    var link = function(scope, element, attributes) {

      var chartOptions = scope.chartOptions;
      var config = store.selectedDataSet.config;

      var fullW = element[0].clientWidth;
      var fullH = fullW / 2;

      var margin = {};
      margin.left = config.yLabel ? 90 : 70;
      margin.right = margin.left;
      margin.top = 10;
      margin.bottom = config.xLabel ? 45 : 25;
      
      var plotW = fullW - margin.left - margin.right;
      var plotH = fullH - margin.top - margin.bottom;

      var x = d3.scale.linear().range([0, plotW]);
      var y = d3.scale.linear().range([plotH, 0]);

      var xAxis = d3.svg.axis().scale(x).tickSize(5,0).orient("bottom");
      var yAxis = d3.svg.axis().scale(y).tickSize(5,0).orient("left");

      var line = d3.svg.line()
          .x(function(d) { return x(d[0]); })
          .y(function(d) { return y(d[1]); });

      var rawPoints = function(well) {
        if (chartOptions.normalise) return normalisedRaw(well);
        return well.raw;
      }

      var modelLine = function(well) {
        var points = chartOptions.normalise ? normalisedModel(well) : model(well);
        return line(points);
      }

      var highlight = function() {
        var field = d3.select(this.parentNode);
        scope.$parent.highlight(field);
      };
      var unhighlight = function() {
        var field = d3.select(this.parentNode);
        scope.$parent.unhighlight(field);
      };

      scope.$parent.highlight = function(field) {
        field.style("stroke-opacity", chartOptions.showModel ? 1 : 0);
        field.style("fill-opacity", chartOptions.showPoints ? 1 : 0);
        field.select(".line").style("stroke-width", "3");
        field.selectAll(".dot").attr("r", "3");
        field.select(".tooltip").style("display", "block");
      };
      scope.$parent.unhighlight = function(field) {
        field.style("stroke-opacity", chartOptions.showModel ? 0.8 : 0);
        field.style("fill-opacity", chartOptions.showPoints ? 0.8 : 0);
        field.select(".line").style("stroke-width", "1.5");
        field.selectAll(".dot").attr("r", "2");
        field.select(".tooltip").style("display", "none");
      };

      var svg = d3.select(element[0]).append("svg")
          .attr("xmlns", "http://www.w3.org/2000/svg")
          .attr("width", fullW)
          .attr("height", fullH)
          .style("font-family", "'Arial'")
        .append("g")
          .attr("transform", "translate("+margin.left+","+margin.top+")");

      svg.append("rect")
          .attr("width", plotW)
          .attr("height", plotH)
          .style("fill", "#fff")
          .style("stroke", "#666")
          .style("shape-rendering", "crispEdges");

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + plotH + ")")
      svg.append("g")
          .attr("class", "y axis")

      if (config.xLabel) {
        svg.append("text")
            .attr("transform", "translate("+plotW/2+","+(plotH+40)+")")
            .style("text-anchor", "middle")
            .text(config.xLabel);
      }

      if (config.yLabel) {
        svg.append("text")
            .attr("transform", "translate(-75,"+plotH/2+") rotate(-90)")
            .style("text-anchor", "middle")
            .text(config.yLabel);
      }

      svg.append("clipPath")
          .attr("id", "clip_path")
        .append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", plotW)
          .attr("height", plotH);

      var redrawChart = function() {

        if (chartOptions.zoom == "full") {
          var xmin = scope.minT;
          var xmax = scope.maxT;
          var ymin = scope.minF;
          var ymax = scope.maxF;
        } else if (chartOptions.zoom == "fitted") {
          var xmin = scope.fittedMinT;
          var xmax = scope.fittedMaxT;
          var ymin = scope.fittedMinF;
          var ymax = scope.fittedMaxF;
        }

        ypad = (ymax - ymin) * 0.05;
        ymin -= ypad;
        ymax += ypad;
        if (chartOptions.normalise) {
          ymin = 0;
          ymax = 1;
        }

        x.domain([xmin, xmax]);
        y.domain([ymin, ymax]);
        d3.select(".x.axis").transition().call(xAxis);
        d3.select(".y.axis").transition().call(yAxis);

        d3.selectAll(".axis").selectAll("line,path")
          .style("stroke", "#666")
          .style("shape-rendering", "crispEdges");

        var field = svg.selectAll("g.field")
            .data(scope.selectedWells, function(well) { return well.id });

        field.exit().transition()
            .style("stroke-opacity", 0)
            .style("fill-opacity", 0)
            .each(removeColour)
            .remove();

        var fieldEnter = field.enter().append("g")
            .attr("class", function(well) { return "field well-"+well.id })
            .attr("clip-path", "url(#clip_path)")
            .style("stroke", getColour)
            .style("fill", getColour)
            .style("stroke-opacity", 0)
            .style("fill-opacity", 0);

        fieldEnter.append("text")
          .text(function(well) { return well.name; })
          .attr("class", "tooltip")
          .attr("transform", "translate(20,20)")
          .style("alignment-baseline", "hanging")
          .style("font-size", "20px")
          .style("stroke-width", "0")
          .style("display", "none");

        fieldEnter.append("path")
            .attr("class", "line")
            .style("stroke-width", "1.5")
            .style("fill", "none")
            .on("click", changeColour)
            .on("mouseover", highlight)
            .on("mouseout", unhighlight);

        field.transition()
            .style("stroke-opacity", chartOptions.showModel ? 0.8 : 0)
            .style("fill-opacity", chartOptions.showPoints ? 0.8 : 0)
          .select(".line")
            .attr("d", modelLine);

        var dot = field.selectAll(".dot")
            .data(rawPoints);

        dot.enter().append("circle")
            .attr("class", "dot")
            .attr("r", 2)
            .style("stroke-width", "0")
            .on("click", changeColour)
            .on("mouseover", highlight)
            .on("mouseout", unhighlight);

        dot.transition()
            .attr("cx", function(point) { return x(point[0]); })
            .attr("cy", function(point) { return y(point[1]); });

      }

      // TODO: Stop requiring a complete redraw for everything
      scope.$watch('selectedIds', redrawChart, true);
      scope.$watch('chartOptions', redrawChart, true);
      scope.$on('fittingChanged', redrawChart);

    };

    return {
      restrict: 'E',
      scope: true,
      link: link
    }
  }]);
})();
