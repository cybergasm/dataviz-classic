define(['backbone', 'jquery-ui', 'd3', 'data_module'], 
    function(Backbone, $, d3, dataModule) {
  var mapWidget = Backbone.View.extend( {

    mapId: "map",
    mapClass: "mapView",
    filteredDataId: "visiblePlaces",
    zoomAmount: 500,

    initialize: function(options) {
      _.bindAll(this, 'render', 'cloneMap');
      
      this.el = $(options.parentElem);

      this.dataModule = dataModule;

      var that = this;  

      function updateVisiblePlaces() {
        that.sites.style("display", function(d, i) {
          return (dataModule.get(that.filteredDataId)[d['name']] ? null : 
            "none");
        });
      }

      // We want to specify the map and data specifically for this map view.
      this.filteredDataId = this.filteredDataId + this.model.get("modelNum");
      this.mapId = this.mapId + this.model.get("modelNum");

      // Make ourselvs a listener to when the visible places change.
      dataModule.bind("change:" + this.filteredDataId, updateVisiblePlaces);

      this.render();
    },

    cloneMap: function() {
      return $("#" + this.mapId)
        .clone()
        .removeAttr("id");
    },

    render: function() {
      $(this.el).append("<div id=\"" + this.mapId +"\" class=\"" + 
        this.mapClass + "\"></div>");

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
        // The following two attributes allow the map to later be resized.
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid")
        .attr("width", width)
        .attr("height", height)
        .on("click", siteClick);

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
          .style("cursor", "pointer");

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

      function siteClick() {
        // Get the lat/long from the click location
        var inverseClick = projection.invert(
          [d3.mouse(this)[0], d3.mouse(this)[1]]);
        
        projection.origin(inverseClick);

        var modifier = (d3.event.shiftKey ? -1 : 1);

        projection.scale(projection.scale() + modifier*that.zoomAmount);
        that.sites
          .transition()
          .delay(100)
          .duration(500)
          .attr("transform", 
            function(d) { 
              return "translate(" + projection([d.xcoord, d.ycoord]) + ")"; 
            });
        embossed
          .transition()
          .delay(100)
          .duration(500)
          .attr("d", clip);
      }
    }
});
  
  return function(parent_, model_) {
    return new mapWidget({parentElem:parent_, model: model_});
  }
});