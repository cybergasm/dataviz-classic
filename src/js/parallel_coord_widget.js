// This module creates a widget that creates a parallel coordinate selector over
// the polis data. 
define(['backbone', 'jquery-ui', 'd3', 'data_module'], 
    function(Backbone, $, d3, dataModule) {
  var parallelCoordWidget = Backbone.View.extend( {

    svgId: "parallel",
    filteredDataId: "visiblePlaces",

    // Used in calculating dimensions
    m: [30, 10, 10, 10],

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

      this.w = 1080 - this.m[1] - this.m[3];
      this.h = 300 - this.m[0] - this.m[2];

      this.x = d3.scale.ordinal().rangePoints([0,this.w], 1);

      axis = d3.svg.axis().orient("left");
    },

    getId: function() {
      return this.svgId;
    },

    // Draws the parallel coordinates on screen
    render: function() {
      $(this.el).append("<div id=\"" + this.svgId +"\"></div>");

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
        .attr("d", path);

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
        .text(String);

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