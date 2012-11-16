define(['backbone', 'jquery-ui', 'd3', 'data_module'], 
    function(Backbone, $, d3, dataModule) {
      
  var parallelCoordWidget = Backbone.View.extend( {

    formId: "checkboxes",

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

      var returnThis = function(d){ return d;};
  
      var checkboxes = form.selectAll("p")
        .data(checkboxFieldNames)
        .enter()
        .append("p")
        .attr("class", "checkboxForm")
        .attr("type", "input")
        .attr("id", returnThis)
        .attr("values", checkboxControlPanel[returnThis]);

      var labels = form.selectAll("p").append("label")
        .text(returnThis)
        .attr("for", returnThis);

      // For each field, adds all of the checkbox values that correspond to the option
      for(var index = 0; index < checkboxFieldNames.length; index++) {
        var field = checkboxFieldNames[index];
        var currentLabel = labels.filter(function(d, i) { return d == field;});
    
        currentLabel.selectAll("input")
          .data(checkboxControlPanel[field])
          .enter()
          .append("input")
          .attr("class", "checkboxForm")
          .attr("type", "checkbox")
          .attr("checked", true)
          .attr("id", checkboxFieldNames[index])
          .attr("name", returnThis)
          .attr("onClick", "UpdateCheckboxes(this)")
          .append("label")
          .text(returnThis)
          .attr("for", returnThis);   
      }
    } 
  });
  return function(parent_) {
    return new parallelCoordWidget({parentElem:parent_});
  }
});