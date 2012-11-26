define(['backbone', 'jquery-ui', 'd3', 'data_module'], 
    function(Backbone, $, d3, dataModule) {
  var dataBoxWidget = Backbone.View.extend( {

    boxId: "dataBox",
    filteredDataId: "visiblePlaces",

    initialize: function(options) {
      _.bindAll(this, 'render', 'getId');
      
      this.el = $(options.parentElem);

      this.model = options.model;

      this.filteredDataId = this.filteredDataId + this.model.get("modelNum");

      // Make ourselvs a listener to when the visible places change.
      dataModule.bind("change:" + this.filteredDataId, 
        this.updateViewWithSelected);

      // Save our data module so we can access it within inner functions  
      this.dataModule = dataModule;

      this.render();
    },

    getId: function() {
      return this.boxId;
    },

    render: function() {
      $(this.el).append("<div id=\"" + this.boxId +"\"></div>");

      // Save a reference
      var that = this;

      // Table code based on sample from: http://jsfiddle.net/7WQjr/
      var fieldNames = dataModule.allFieldNames;
      var samplePolis = dataModule.polisData[0];

      var table = d3.select("#" + this.boxId).append("table");

      var fieldLabels = table.append("td")
        .selectAll("tr")
        .data(fieldNames)
        .enter()
        .append("tr")
        .text(function(d) { return d; });

      var fieldValues = table.append("td")
        .selectAll("tr")
        .data(fieldNames)
        .enter()
        .append("tr")
        .text(function(d) { return d; });
    }
});

  return function(parent_, model_) {
    return new dataBoxWidget({parentElem:parent_, model:model_});
  }
});