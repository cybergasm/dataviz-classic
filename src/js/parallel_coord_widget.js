// This module creates a widget that creates a parallel coordinate selector over
// the polis data. 
define(['backbone', 'jquery-ui', 'd3', 'data_module'], 
    function(Backbone, $, d3, dataModule) {
  var parallelCoordWidget = Backbone.View.extend( {

    svgId: "parallel",

    // Used in calculating dimensions
    m: [30, 10, 10, 10],

    y: {},
    dragging: {},

    line: d3.svg.line(),

    initialize: function(options) {
      _.bindAll(this, 'render', 'updateViewWithSelected');
      
      this.el = $(options.parentElem);
      
      this.model = options.model

      // Save our data module so we can access it within inner functions  
      this.dataModule = dataModule

      // Make ourselvs a listener to when the visible places change.
      dataModule.bind("change:visiblePlaces", this.updateViewWithSelected);

      this.w = 1280 - this.m[1] - this.m[3];
      this.h = 300 - this.m[0] - this.m[2];

      this.x = d3.scale.ordinal().rangePoints([0,this.w], 1);

      axis = d3.svg.axis().orient("left");
    },

    // Changes the lines to display the selected ones
    updateViewWithSelected: function() {
      var that = this;
      this.foreground.style("display", function(d, i) { 
        // Check if the currently visible places have an entry for this data
        // point
        return (dataModule.get("visiblePlaces")[d['name']] ? null : "none");
      });
    },

    // Draws the parallel coordinates on screen
    render: function() {
      $(this.el).append("<div id=\"" + this.svgId +"\"></div>");

      var svg = d3.select("#" + this.svgId).append("svg:svg")
        .attr("width", this.w + this.m[1] + this.m[3])
        .attr("height", this.h + this.m[0] + this.m[2])
        .append("svg:g")
        .attr("transform", "translate(" + this.m[3] + "," + this.m[0] + ")");

      // Save a reference
      var that = this;

      dimensions = dataModule.parallelFieldNames.filter(function(d) {
        that.y[d] = d3.scale.linear().domain(d3.extent(dataModule.polisData, 
          function(p) {
            return +p[d]; 
          }))
          .range([that.h, 0]);
        return that.y[d];
      });

      // Generate the list of dimensions and create a scale for each.
      this.x.domain(dimensions);

      function position(d) {
        var v = that.dragging[d];
        return v == null ? that.x(d) : v;
      }

      /* Returns the path for a given data point. */
      function path(d) {
        return that.line(dimensions.map(function(p) { 
          return [position(p), that.y[p](d[p])]; 
        }));
      }

      /* Handles a brush event by calculating the max/min parallel parameters 
        that need to change, updating the control panel for the parallel 
        coordinates accordingly, and updating the display. */
      function brush() {
        var actives = dimensions.filter(function(p) { 
          return !that.y[p].brush.empty(); 
        });
        extents = actives.map(function(p) { 
          return that.y[p].brush.extent(); 
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
      background = svg.append("svg:g")
        .attr("class", "background")
        .selectAll("path")
        .data(dataModule.polisData)
        .enter().append("svg:path")
        .attr("d", path);

      // Add blue foreground lines for focus.
      this.foreground = svg.append("svg:g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(dataModule.polisData)
        .enter().append("svg:path")
        .attr("d", path);

      // Add a group element for each dimension.
      var g = svg.selectAll(".dimension")
        .data(dimensions)
        .enter().append("svg:g")
        .attr("class", "dimension")
        .attr("transform", function(d) { 
          return "translate(" + that.x(d) + ")"; 
        });

      // Add an axis and title.
      g.append("svg:g")
        .attr("class", "axis")
        .each(function(d) { d3.select(this).call(axis.scale(that.y[d])); })
        .append("svg:text")
        .attr("text-anchor", "middle")
        .attr("y", -9)
        .text(String);

      // Add and store a brush for each axis.
      g.append("svg:g")
        .attr("class", "brush")
        .each(function(d) { 
          d3.select(this).call(
            that.y[d].brush = d3.svg.brush().y(
              that.y[d]).on("brush", brush)) 
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);
    }

  });

  return function(parent_, model_) {
    return new parallelCoordWidget({parentElem:parent_, model:model_});
  }
});