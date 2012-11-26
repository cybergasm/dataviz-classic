define(['backbone', 'jquery-ui', 'd3', 'data_module'], 
    function(Backbone, $, d3, dataModule) {
  var mapWidget = Backbone.View.extend( {

    mapId: "map",

    initialize: function(options) {
      _.bindAll(this, 'render', 'cloneMap');
      
      this.el = $(options.parentElem);

      this.dataModule = dataModule;

      var that = this;  

      function updateVisiblePlaces() {
        that.sites.style("display", function(d, i) {
          return (dataModule.get("visiblePlaces")[d['name']] ? null : "none");
        });
      }

      // Make ourselvs a listener to when the visible places change.
      dataModule.bind("change:visiblePlaces", updateVisiblePlaces);

      this.render();
    },

    cloneMap: function() {
      return $("#" + this.mapId)
        .clone()
        .removeAttr("id");
    },

    render: function() {
      $(this.el).append("<div id=\"" + this.mapId +"\"></div>");

      // Save a reference
      var that = this;

      var width = 1280;
      var height = 800;

      var rankRamp = d3.scale.linear().domain([0,.005]).range([1,10]).clamp(true);

      var projection = d3.geo.azimuthal()
        .scale(2500)
        .origin([22.8,38.6])
        .mode("orthographic")
        .translate([640, 400]);

      var circle = d3.geo.greatCircle()
        .origin(projection.origin());

      var path = d3.geo.path()
        .projection(projection);

      var mapsvg = d3.select("#" + this.mapId).append("svg:svg")
        .attr("width", width)
        .attr("height", height);

      var map = mapsvg.append("svg:g").attr("class", "map")
        .attr("transform", "translate(2,3)");

      var JSON_PATH = "../../data/romeland.json";

      d3.json(JSON_PATH, function(collection) {
        embossed = map.selectAll("path.countries")
          .data(collection.features)
          .enter().append("svg:path")
          .attr("d", clip)
          .attr("class", "countries")
          .style("fill", "black")
          .style("stroke", "#638a8a")
          .style("stroke-width", 4);

        // Save sites so we can chage what is visible later
        that.sites = map.selectAll("g.sites") 
          .data(dataModule.polisData)
          .enter()
          .append("svg:g")
          .attr("class", "foreground")
          .attr("transform", function(d) {
            return "translate(" + projection([d.  xcoord,d.ycoord]) + ")";
          })
          .style("cursor", "pointer")
          .on("click", siteClick);

        that.sites.append("svg:circle")      
          .attr('r', 5)
          .attr("class", "sites")
          .style("fill", "red")
          .style("stroke", "grey")
          .style("opacity", 0)
          .transition()
          .delay(300)
          .duration(1000)
          .style("opacity", .85);

        });

      function clip(d) {
        return path(circle.clip(d));
      }

      function siteClick(clickedPoint) {
        //var headers = d3.keys(sitesdata[0]);
        //var returnThis = function(d, i){ return clickedPoint[headers[i]];};
        //placeBoxDataFields.text(returnThis);

        projection.origin([clickedPoint.xcoord, clickedPoint.ycoord]);
        projection.scale(4500);
        that.sites.transition().delay(100).duration(500).attr("transform", 
          function(d) { 
            return "translate(" + projection([d.xcoord, d.ycoord]) + ")"; 
          });
        embossed.transition().delay(100).duration(500).attr("d", clip);
      }
    }
});
  
  return function(parent_) {
    return new mapWidget({parentElem:parent_});
  }
});