define(['backbone', 'jquery-ui', 'd3', 'data_module'], 
    function(Backbone, $, d3, dataModule) {
  var dataBoxWidget = Backbone.View.extend( {

    boxId: "dataBox",

    initialize: function(options) {
      _.bindAll(this, 'render');
      
      this.el = $(options.parentElem);

      this.model = options.model

      // Make ourselvs a listener to when the visible places change.
      dataModule.bind("change:visiblePlaces", this.updateViewWithSelected);

      // Save our data module so we can access it within inner functions  
      this.dataModule = dataModule
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

  return function(parent_) {
    return new dataBoxWidget({parentElem:parent_});
  }
});