// This module creates a widget that creates a parallel coordinate selector over
// the polis data. 
define(['backbone', 'jquery-ui', 'd3', 'data_module'], 
    function(Backbone, $, d3, dataModule) {
  var parallelCoordWidget = Backbone.View.extend( {

    svgId: "parallel",
    filteredDataId: "visiblePlaces",

    // Used in calculating dimensions
    m: [30, 10, 10, 10],

    // How to discretize ranges
    rangeIncrements: 5,

    // Taken from the colorbrewer project
    // https://github.com/mbostock/d3/blob/master/lib/colorbrewer/colorbrewer.js
  //  RdBu:{3:["rgb(239,138,98)","rgb(247,247,247)","rgb(103,169,207)"],4:["rgb(202,0,32)","rgb(244,165,130)","rgb(146,197,222)","rgb(5,113,176)"],5:["rgb(202,0,32)","rgb(244,165,130)","rgb(247,247,247)","rgb(146,197,222)","rgb(5,113,176)"]},
  //  RdBu:{3:["rgb(67, 162, 202)","rgb(168, 221, 181)","rgb(224, 243, 219)"],4:["rgb(43, 140, 190)","rgb(123, 204, 196)","rgb(186, 228, 188)","rgb(240, 249, 232)"],5:["rgb(8, 104, 172)","rgb(67, 162, 202)","rgb(123, 204, 196)","rgb(186, 228, 188)","rgb(240, 249, 232)"]},
    RdBu:{3:["rgb(254, 232, 200)","rgb(253, 187, 132)","rgb(227, 74, 51)"],4:["rgb(254, 240, 217)","rgb(253, 204, 138)","rgb(252, 141, 89)","rgb(215, 48, 31)"],5:["rgb(254, 240, 217)","rgb(253, 204, 138)","rgb(252, 141, 89)","rgb(227, 74, 51)","rgb(179, 0, 0)"]},

    //,6:["rgb(178,24,43)","rgb(239,138,98)","rgb(253,219,199)","rgb(209,229,240)","rgb(103,169,207)","rgb(33,102,172)"],7:["rgb(178,24,43)","rgb(239,138,98)","rgb(253,219,199)","rgb(247,247,247)","rgb(209,229,240)","rgb(103,169,207)","rgb(33,102,172)"],8:["rgb(178,24,43)","rgb(214,96,77)","rgb(244,165,130)","rgb(253,219,199)","rgb(209,229,240)","rgb(146,197,222)","rgb(67,147,195)","rgb(33,102,172)"],9:["rgb(178,24,43)","rgb(214,96,77)","rgb(244,165,130)","rgb(253,219,199)","rgb(247,247,247)","rgb(209,229,240)","rgb(146,197,222)","rgb(67,147,195)","rgb(33,102,172)"],10:["rgb(103,0,31)","rgb(178,24,43)","rgb(214,96,77)","rgb(244,165,130)","rgb(253,219,199)","rgb(209,229,240)","rgb(146,197,222)","rgb(67,147,195)","rgb(33,102,172)","rgb(5,48,97)"],11:["rgb(103,0,31)","rgb(178,24,43)","rgb(214,96,77)","rgb(244,165,130)","rgb(253,219,199)","rgb(247,247,247)","rgb(209,229,240)","rgb(146,197,222)","rgb(67,147,195)","rgb(33,102,172)","rgb(5,48,97)"]},

    y: {},
    dragging: {},

    line: d3.svg.line(),

    initialize: function(options) {
      _.bindAll(this, 'render', 'getId');
      
      this.el = $(options.parentElem);
      
      this.model = options.model;

      // Save our data module so we can access it within inner functions  
      this.dataModule = dataModule;
      
      var that = this;
      
      function updateViewWithSelected() {
        that.foreground.style("display", function(d, i) {
          // Check if the currently visible places have an entry for this data
          // point
          return (dataModule.get(that.filteredDataId)[d['name']] ? null : 
            "none");
        });
      }
      
      this.filteredDataId = this.filteredDataId + this.model.get("modelNum");
      this.svgId = this.svgId + this.model.get("modelNum");

      // Make ourselvs a listener to when the visible places change.
      dataModule.bind("change:" + this.filteredDataId, updateViewWithSelected);

      function resetColors() {
        var typeOfColor = that.model.get("colorBasedOn").split("-")[0];
        if (typeOfColor == "parallel") {
          return;
        }

        // Set color of paths
        that.foreground.selectAll("path")
          .forEach(function(d,i) {
            // This is a little jank, but the alternative of .style("stroke")
            // would not work
            d.parentNode.style.stroke = "#e04242";
          });
      }

      this.model.bind("change:colorBasedOn", resetColors);

      function updateColorRange() {
        // Update the range colors given new selected range.
        var curColoring = that.model.get("colorBasedOn");
        var type = curColoring.split("-")[0];
        var name = curColoring.split("-")[1];

        if (type == "parallel") {
          var curRange = that.model.get("parallelConfig").get(name);
          // We have a selection in this range.
          if (curRange.max < 1000000) {
            var newRange = [];
            var delta = (curRange.max - curRange.min) / that.rangeIncrements;

            for (var i = 0; i <= that.rangeIncrements; i++) {
              newRange.push(curRange.min + delta*i);
            }
            
            var color = d3.scale.linear()
              .domain(newRange)
              .range(that.RdBu[that.rangeIncrements]);
            
            that.model.set("parallelColorRange", color);
            that.model.trigger("change:colorBasedOn");

            // Set color of paths
            that.foreground.selectAll("path")
              .forEach(function(d,i) {
                // This is a little jank, but the alternative of .style("stroke")
                // would not work
                d.parentNode.style.stroke = color(
                  d.parentNode.__data__[name]);
              });
          }
        }
      }

      this.model.listenToMapParallelConfigChanges(updateColorRange);

      this.w = 1080 - this.m[1] - this.m[3];
      this.h = 300 - this.m[0] - this.m[2];

      this.x = d3.scale.ordinal().rangePoints([0,this.w], 1);

      axis = d3.svg.axis().orient("left");
    },

    getId: function() {
      return this.svgId;
    },

    // Draws the parallel coordinates on screen
    // Basic parallel coordiante code from example by Mike Bostock
    render: function() {
      $(this.el).append("<div id=\"" + this.svgId +"\">" + 
        "You can click on a heading to color points based on that parameter." + 
        "</div>");

      var svg = d3.select("#" + this.svgId).append("svg:svg")
        .attr("width", this.w + this.m[1] + this.m[3])
        .attr("height", this.h + this.m[0] + this.m[2])
        .attr("id", "svg" + this.model.get("modelNum"))
        .append("svg:g")
        .attr("id", "svgg" + this.model.get("modelNum"))
        .attr("transform", "translate(" + this.m[3] + "," + this.m[0] + ")");

      // Save a reference
      var that = this;

      this.dimensions = dataModule.parallelFieldNames.filter(function(d) {
        that.y[d] = d3.scale.linear().domain(d3.extent(dataModule.polisData, 
          function(p) {
            return +p[d]; 
          }))
          .range([that.h, 0]);
        return that.y[d];
      });

      // Generate the list of dimensions and create a scale for each.
      this.x.domain(this.dimensions);

      function position(d) {
        var v = that.dragging[d];
        return v == null ? that.x(d) : v;
      }

      /* Returns the path for a given data point. */
      function path(d) {
        return that.line(that.dimensions.map(function(p) { 
          return [position(p), that.y[p](d[p])]; 
        }));
      }

      /* Handles a brush event by calculating the max/min parallel parameters 
        that need to change, updating the control panel for the parallel 
        coordinates accordingly, and updating the display. */
      function brush() {
        var actives = that.dimensions.filter(function(p) { 
          return !that.brushes[p].empty(); 
        });
        var extents = actives.map(function(p) { 
          return that.brushes[p].extent(); 
        });
        for(var i = 0; i < actives.length; i++) {
          var currentField = actives[i];
          that.model.get("parallelConfig").set(currentField , {
            min:extents[i][0],
            max:extents[i][1]
          })
        }
      }

      // Add grey background lines for context.
      this.background = svg.append("svg:g")
        .attr("class", "background")
        .attr("id", "background" + this.model.get("modelNum"))
        .selectAll("path")
        .data(dataModule.polisData)
        .enter().append("svg:path")
        .attr("d", path);

      // Add blue foreground lines for focus.
      this.foreground = svg.append("svg:g")
        .attr("class", "foreground")
        .attr("id", "foreground" + this.model.get("modelNum"))
        .selectAll("path")
        .data(dataModule.polisData)
        .enter().append("svg:path")
        .attr("d", path)
        .style("stroke", "#e04242");

      // Add a group element for each dimension.
      this.g = svg.selectAll(".dimension" + this.model.get("modelNum"))
        .data(this.dimensions)
        .enter().append("svg:g")
        .attr("class", "dimension" + this.model.get("modelNum"))
        .attr("transform", function(d) { 
          return "translate(" + that.x(d) + ")"; 
        });

      // Add an axis and title.
      this.g.append("svg:g")
        .attr("class", "axis")
        .attr("id", "axis" + this.model.get("modelNum"))
        .each(function(d) { d3.select(this).call(axis.scale(that.y[d])); })
        .append("svg:text")
        .attr("text-anchor", "middle")
        .attr("y", -9)
        .text(String)
        .on("click", function(clickedElement) {
          // Check if we are resetting
          if (("parallel-" + clickedElement) == 
              that.model.get("colorBasedOn")) {
            // Set color of paths
            that.foreground.selectAll("path")
              .forEach(function(d,i) {
                // This is a little jank, but the alternative of .style("stroke")
                // would not work
                d.parentNode.style.stroke = "#e04242";
            });
            that.model.set("colorBasedOn", "");
            return;
          }

          // Discretize our continuous range so we can get color
          var range = that.y[clickedElement].domain();

          var curRange = that.model.get("parallelConfig").get(clickedElement);
          // We have a selection in this range.
          if (curRange.max < 1000000) {
            range[0] = curRange.min;
            range[1] = curRange.max;
          }

          // Go along the range and create new range at each discretization
          // point
          var delta = (range[1] - range[0]) / that.rangeIncrements;
          var newRange = [];
          for (var i = 0; i <= that.rangeIncrements; i++) {
            newRange.push(range[0] + delta * i);
          }
          var color = d3.scale.linear()
            .domain(newRange)
            .range(that.RdBu[that.rangeIncrements]);
          
          // Set color of paths
          that.foreground.selectAll("path")
            .forEach(function(d,i) {
              // This is a little jank, but the alternative of .style("stroke")
              // would not work
              d.parentNode.style.stroke = color(
                d.parentNode.__data__[clickedElement]);
            });
          that.model.set("parallelColorRange", color);
          that.model.set("colorBasedOn", "parallel-" + clickedElement);  
        });
      this.brushes = {};

      // Add and store a brush for each axis.
      this.g.append("svg:g")
        .attr("class", "brush")
        .attr("id", "brush" + this.model.get("modelNum"))
        .each(function(d) { 
          that.brushes[d] = d3.svg.brush().y(
              that.y[d]).on("brush", brush)
          d3.select(this).call(that.brushes[d])
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("id", "rect" + this.model.get("modelNum"))
        .attr("width", 16);
    }

  });

  return function(parent_, model_) {
    return new parallelCoordWidget({parentElem:parent_, model:model_});
  }
});