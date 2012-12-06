define(['backbone', 'jquery-ui', 'd3', 'data_module', 'tipsy'], 
    function(Backbone, $, d3, dataModule) {
  var mapWidget = Backbone.View.extend( {

    mapId: "map",
    svgId: "svg-map",
    mapAndZoomId: "mapAndZoom",
    mapAndZoomClass: "mapAndZoom",
    mapClass: "mapView",
    filteredPlacesDataId: "visiblePlaces",
    filteredPeopleDataId: "visiblePeople",
    togglePeopleId: "togglePeople",
    zoomSliderId: "zoomSlider",
    zoomSliderClass: "zoomSlider",
    zoomContainerClass: "zoomWidget",
    zoomContainerId: "zoomWidget",
    zoomAmtId: "zoomAmt",
    yearSelectorId: "yearSelector",
    yearSelectorClass: "yearSelector",
    yearSelectorDescriptionClass: "yearSelectorDescription",
    yearSelectorDescriptionId: "yearSelectorDescription",
    yearSelectorContainerId: "yearSelectorContainer",
    zoomMin:2000,
    zoomMax:15000,
    initOrigin:[22.8, 38.6],
    initZoom:2500,

    withPeople: false, 

    initialize: function(options) {
      _.bindAll(this, 'render', 'cloneMap', 'clip', 'moveMap', 'getId',
        'renderMap', 'updatePeopleDataOnMap', 'setYearSelectorVisibility');
      
      this.el = $(options.parentElem);

      this.dataModule = dataModule;
      this.model = options.placesModel;
      this.peopleModel = options.peopleModel;  
      
      var that = this;  

      function updateVisiblePlaces() {
        that.sites.style("display", function(d, i) {
          return (dataModule.get(that.filteredPlacesDataId)[d['name']] ? null : 
            "none");
        });
      }

      // We want to specify the map and data specifically for this map view.
      this.filteredPlacesDataId = this.filteredPlacesDataId + 
        this.model.get("modelNum");
      this.filteredPeopleDataId = this.filteredPeopleDataId +
        this.model.get("modelNum");

      this.mapId += this.model.get("modelNum");
      this.svgId += this.model.get("modelNum");
      this.togglePeopleId += this.model.get("modelNum")
      this.zoomSliderId += this.model.get("modelNum");
      this.zoomAmtId += this.model.get("modelNum");
      this.mapAndZoomId += this.model.get("modelNum");
      this.zoomContainerId += this.model.get("modelNum");
      this.yearSelectorId += this.model.get("modelNum");
      this.yearSelectorDescriptionId += this.model.get("modelNum");
      this.yearSelectorContainerId += this.model.get("modelNum");

      // Make ourselvs a listener to when the visible places change.
      dataModule.bind("change:" + this.filteredPlacesDataId, 
        updateVisiblePlaces);
      dataModule.bind("change:" + this.filteredPeopleDataId,
        this.updatePeopleDataOnMap);

      this.model.set("map-scale", this.initZoom);
      this.model.set("map-origin", this.initOrigin);
      
      // Make ourselves listeners of the map position attributes
      this.model.bind("change:map-scale", this.moveMap);
      this.model.bind("change:map-origin", this.moveMap);

      function updateColor() {
        console.log("Color updating...");
        that.sites.selectAll("circle").style("fill", function(d, i) {
          var toColorOn = that.model.get("colorBasedOn");
          if (d[toColorOn] == 1) {
            return that.model.get("binary-yes");
          } else {
            return that.model.get("binary-no");
          }
        });
      }

      this.model.bind("change:colorBasedOn", updateColor);
      this.render();
    },

    cloneMap: function() {
      return $("#" + this.svgId)
        .clone()
        .removeAttr("id");
    },

    getId: function() {
      return this.mapId;
    },

    render: function() {
      var that = this;

      $(this.el).append("<div id=\"" + this.mapId +"\" class=\"" + 
        this.mapClass + "\"></div>");

      // Add a button for toggling people data
      $("#" + this.mapId, this.el)
        .append("<input type=\"checkbox\" id=\"" + 
          this.togglePeopleId + "\" />" + "<label for=\"" + 
          this.togglePeopleId + "\">Include People Data on Map</label>");

      $("#" + this.togglePeopleId, this.el)
        .button()
        .click(function() {
          that.withPeople = !that.withPeople;
          that.updatePeopleDataOnMap();        
          that.setYearSelectorVisibility();
        });

      // Add the map and zooming panel
      $("#" + this.mapId, this.el)
        .append("<div id=\"" + this.mapAndZoomId + "\"" + 
          " class=\"" + this.mapAndZoomClass + "\"></div>");
      $("#" + this.mapAndZoomId, this.el)
        .append("<div id=\"" + this.zoomContainerId + "\" " + 
          "class=\"" + this.zoomContainerClass + "\"><span>Zoom</span></div>");

      // Add a zoom slider
      $("#" + this.zoomContainerId, this.el)
        .append("<div id=\"" + this.zoomSliderId + "\" " + 
          "class=\"" + this.zoomSliderClass + "\"></div>");
      
      $("#" + this.zoomSliderId, this.el)
        .slider({
          orientation: "vertical",
          range: "min",
          min: this.zoomMin,
          max: this.zoomMax,
          value: this.initZoom,
          slide: function(event, ui) {
            that.model.set("map-scale", ui.value);
          }
        });

      // Add a slider for years
      $("#" + this.mapId, this.el)
        .append("<div id=\"" + this.yearSelectorContainerId + "\"></div>");
      $("#" + this.yearSelectorContainerId, this.el)
        .append("<label for=\"" + this.yearSelectorDescriptionId + "\">" + 
          "Era range:</label> <input type=\"text\"" + 
          " id=\"" + this.yearSelectorDescriptionId + "\" " + 
          "class=\"" + this.yearSelectorDescriptionClass + "\"/>");
      $("#" + this.yearSelectorContainerId, this.el)
        .append("<div id=\"" + this.yearSelectorId + "\"" + 
          "class=\"" + this.yearSelectorClass + "\"></div>");
      $("#" + this.yearSelectorId, this.el)
        .slider({
          range:true,
          min:this.dataModule.eraMin,
          max:this.dataModule.eraMax,
          values: [this.dataModule.eraMin, this.dataModule.eraMax],
          slide: function(event, ui) {
            $("#" + that.yearSelectorDescriptionId)
              .val(+ ui.values[0] + "-" + ui.values[1]);
            that.peopleModel.set("currentEraMin", ui.values[0]);
            that.peopleModel.set("currentEraMax", ui.values[1]);
          }
        });
      $("#" + this.yearSelectorDescriptionId)
        .val($("#" + this.yearSelectorId).slider("values", 0) + "-" + 
          $("#" + this.yearSelectorId).slider("values", 1));
      this.setYearSelectorVisibility();
      // Draw map 
      this.renderMap();
    },

    setYearSelectorVisibility: function() {
      if (this.withPeople) {
        $("#" + this.yearSelectorContainerId, this.el).show();
      } else {
        $("#" + this.yearSelectorContainerId, this.el).hide();
      }
    },

    updatePeopleDataOnMap: function() {
      var that = this;
      this.sites.selectAll("circle")
        .attr("r", function(d) {
          // Sees which people residing are visible.
          function countEffectivePeople(people) {
            var visible = that.dataModule.get("visiblePeople" + 
              that.model.get("modelNum"));
            var count = 0;
            for (var i = 0; i < people.length; i++) {
              var person = that.dataModule.peopleData[people[i]]
              if (visible[person["unique_id"]] != undefined) {
                count++;
              }
            }
            return count;
          }

          if (that.withPeople) {
            var residents = that.dataModule.residencyMap[d['polis_id']];
            if (residents == undefined) {
              return 0;
            } else {
              var count = countEffectivePeople(residents);
              if (count == 0) {
                return 0;
              }

              var bucketed = d3.scale.log().domain([1, 453]).range([5, 20]);
              return bucketed(count);
            }
          } else {
            return 7;
          }
        });
    },

    renderMap: function() {
      $("#" + this.svgId)
        .remove();
      
      // Save a reference
      var that = this;

      var width = 1280;
      var height = 800;

      var rankRamp = d3.scale.linear().domain([0,.005]).range([1,10]).clamp(true);

      this.projection = d3.geo.azimuthal()
        .scale(this.initZoom)
        .origin(this.initOrigin)
        .mode("orthographic")
        .translate([640, 400]);

      var mapsvg = d3.select("#" + this.mapAndZoomId).append("svg:svg")
        // The following two attributes allow the map to later be resized.
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid")
        .attr("width", width)
        .attr("height", height)
        .attr("id", this.svgId)
        .on("click", siteClick);

      var map = mapsvg.append("svg:g").attr("class", "map")
        .attr("transform", "translate(2,3)");

      embossed = map.selectAll("path.countries")
        .data(dataModule.mapCountries.features)
        .enter().append("svg:path")
        .attr("d", that.clip)
        .attr("class", "countries")
        .style("fill", "#E8E8E8")
        .style("stroke", "#C4C2C3")
        .style("stroke-width", 4);

      // Save sites so we can chage what is visible later
      this.sites = map.selectAll("g.sites") 
        .data(dataModule.polisData)
        .enter()
        .append("svg:g")
        .attr("class", "foreground")
        .attr("transform", function(d) {
          return "translate(" + that.projection([d.  xcoord,d.ycoord]) + ")";
        })
        .style("cursor", "pointer");

      this.sites.append("svg:circle")      
        .attr('r', 7)
        .attr("class", "sites")
        .style("fill", "grey")
        .style("stroke", "grey")
        .style("opacity", 0)
        .transition()
        .delay(300)
        .duration(1000)
        .style("opacity", .85);

      $('svg circle').tipsy({
        gravity: 'sw',
        html: true,
        title: function() {
          var info = "<span>";
          info += "<p>Name: " + this.__data__["name"];
            
          info += "</span>"
          return info;
        }
      });
   

      function siteClick() {
        // Get the lat/long from the click location
        var inverseClick = that.projection.invert(
          [d3.mouse(this)[0], d3.mouse(this)[1]]);

        that.model.set("map-origin", inverseClick);
       
        that.moveMap();
      }
    },

    clip: function (d) {
      var circle = d3.geo.greatCircle()
        .origin(this.projection.origin());

      var path = d3.geo.path()
        .projection(this.projection);

      return path(circle.clip(d));
    },

    moveMap: function() {
      this.projection.origin(this.model.get("map-origin"));

      this.projection.scale(this.model.get("map-scale"));

      var that = this;

      this.sites
        .transition()
        .delay(100)
        .duration(500)
        .attr("transform", 
          function(d) { 
            return "translate(" + that.projection([d.xcoord, d.ycoord]) + ")"; 
          });
      embossed
        .transition()
        .delay(100)
        .duration(500)
        .attr("d", this.clip);
    }
});
  
  return function(parent_, placesModel_, peopleModel_) {
    return new mapWidget({
      parentElem:parent_,
      placesModel: placesModel_,
      peopleModel: peopleModel_
    });
  }
});