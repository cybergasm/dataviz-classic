// Module which defines a set of checkboxes that users can use to filter 
// government types.
define(['backbone', 'jquery-ui', 'd3', 'data_module'], 
    function(Backbone, $, d3, dataModule) {
  var checkboxesWidget = Backbone.View.extend( {

    formId: "checkboxes",

    events : {}, 

    initialize: function(options) {
      _.bindAll(this, 'render', 'getId');
      
      this.model = options.model;
      this.el = $(options.parent);

      // Save our data module so we can access it within inner functions  
      this.dataModule = dataModule;
      
      this.render()
    },

    getId: function() {
      return this.formId;
    },

    render: function() {
      $(this.el).append("<div id=\"" + this.formId +"\"></div>");

      // Save a reference
      var that = this;

      var clickedVal = function(e) {
        that.model.get("checkboxConfig").set(e.id, e.checked);
      }

      var form = d3.select("#" + this.formId);

      form = form.selectAll("div")
        .data(dataModule.checkboxFieldNames)
        .enter()
        .append("div")
        .attr("id", function(d) { return d});

      // Go through the different checkbox types and append the appropriate 
      // options.
      for (var i = 0; i < dataModule.checkboxFieldNames.length; i++) {
        var curOption = dataModule.checkboxFieldNames[i];
        var curValues = dataModule.checkboxFieldValues[curOption];
        var curDiv = form.filter(function(d, i) { return d == curOption});

        // Append a label for every option of the checkboxes
        curDiv.selectAll("label")
          .data(curValues)
          .enter()
          .append("label")
          .attr("for", function(d) { return curOption + "-" + d; })
          .attr("id", function(d) { return d + "-label"; })
          .text(function(d) { return d; });

        // For every label append a checkbox before the label
        for (var j = 0; j < curValues.length; j++) {
          curDiv.insert("input", "#" + curValues[j] + "-label")
            .attr("type", "checkbox")
            .attr("name", curValues[i])
            .attr("checked", true)
            .attr("id", curOption + "-" + curValues[j])
            .on("click", function() { clickedVal(this); });
        }
      }

      for (var i = 0; i < dataModule.checkboxFieldNames.length; i++) {
        $("#" + dataModule.checkboxFieldNames[i])
          .buttonset();
      }
    }
  });

  return function(parent_, model_) {
    return new checkboxesWidget({model:model_, parent:parent_});
  }
});