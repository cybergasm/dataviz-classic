define(['backbone', 'jquery-ui', 'd3', 'data_module'], 
    function(Backbone, $, d3, dataModule) {
  var binaryBoxesWidget = Backbone.View.extend( {

    formId: "binary",

    events : {"click input[type=checkbox]" : 'clickBox'},

    clickBox: function(e) {
      var checkbox = e.target;
      var fieldNameAndValue = checkbox['id'].split("_");
      var currentField = fieldNameAndValue[0];
      var fieldValue = fieldNameAndValue[1];
      var pastBinarySetting = that.model.get("binaryConfig");

      if (fieldValue == "yes") {
        that.model.get("binaryConfig").set(currentField, 
          [pastBinarySetting[0],checkbox['checked']])
      } else if (fieldValue == "no") {
        that.model.get("binaryConfig").set(currentField, 
          [checkbox['checked'],pastBinarySetting[1]])
      }
    },

    initialize: function(options) {
      _.bindAll(this, 'render');
      
      this.model = options.model;

      this.el = $(options.parent);

      // Make ourselves a listener to when the visible places change.
      dataModule.bind("change:visiblePlaces", this.updateViewWithSelected);

      // Save our data module so we can access it within inner functions  
      this.dataModule = dataModule;

      this.render();
    },

    render: function() {

      $(this.el).append("<div id=\"" + this.formId +"\"></div>");

      // Save a reference
      var that = this;

      var form = d3.select("#" + this.formId).append("form")
        .attr("width", 100)
        .attr("height", 200)
        .append("form");

      var fieldName = function(d){ return d;}; // returns name of column in CSV

      var binaryBoxes = form.selectAll("p")
        .data(dataModule.binaryFieldNames)
        .enter()
        .append("p")
        .attr("class", "binaryForm")
        .attr("id", fieldName);

      binaryBoxes.append("label")
        .text(fieldName)
        .attr("for", fieldName);
      
      binaryBoxes.append("input")
        .attr("class", "binaryBox")
        .attr("type", "checkbox")
        .attr("checked", "true")
        .attr("id", fieldName + "_no")
        .attr("name", fieldName)
        .on("click", function (){console.log("Hello");});
//        .attr("onClick", clickBox(this));
      binaryBoxes.append("input")
        .attr("class", "binaryBox")
        .attr("type", "checkbox")
        .attr("checked", "true")
        .attr("id", fieldName + "_yes")
        .attr("name", fieldName);
        //.attr("onClick", clickBox(this));
    }
});

  return function(parent_, model_) {
    return new binaryBoxesWidget({parent:parent_, model:model_});
  }
});