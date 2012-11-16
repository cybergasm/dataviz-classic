define(['backbone', 'jquery-ui', 'd3', 'data_module'], 
    function(Backbone, $, d3, dataModule) {
  var parallelCoordWidget = Backbone.View.extend( {

    formId: "binary",

    initialize: function(options) {
      _.bindAll(this, 'render');
      
      this.el = $(options.parentElem);
    },

    render: function() {
      $(this.el).append("<div id=\"" + this.formId +"\"></div>");

      var form = d3.select("#" + this.formId).append("form")
        .attr("width", 100)
        .attr("height", 200)
        .append("form");

      // Save a reference
      var that = this;

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
        .attr("id", fieldName)
        .attr("name", "no");
      binaryBoxes.append("input")
        .attr("class", "binaryBox")
        .attr("type", "checkbox")
        .attr("checked", "true")
        .attr("id", fieldName)
        .attr("name", "yes");
    }
});

  return function(parent_) {
    return new parallelCoordWidget({parentElem:parent_});
  }
});