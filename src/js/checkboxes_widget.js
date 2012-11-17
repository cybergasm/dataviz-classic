define(['backbone', 'jquery-ui', 'd3', 'data_module'], 
    function(Backbone, $, d3, dataModule) {
  var checkboxesWidget = Backbone.View.extend( {

    formId: "checkboxes",

    initialize: function(options) {
      _.bindAll(this, 'render');
      
      this.el = $(options.parentElem);
    },

    render: function() {
      $(this.el).append("<div id=\"" + this.formId +"\"></div>");

      // Save a reference
      var that = this;

      var form = d3.select("#" + this.formId).append("form")
        .attr("width", 600)
        .attr("height", 200)
        .append("form");

      var fieldName = function(d){ return d;}; // returns name of column in CSV

      var checkboxes = form.selectAll("p")
        .data(dataModule.checkboxFieldNames)
        .enter()
        .append("p")
        .attr("class", "checkboxForm")
        .attr("type", "input")
        .attr("id", fieldName)
        .attr("values", "string");

      var labels = form.selectAll("p").append("label")
        .text(fieldName)
        .attr("for", fieldName);
    }
});

  return function(parent_) {
    return new checkboxesWidget({parentElem:parent_});
  }
});