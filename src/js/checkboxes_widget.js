define(['backbone', 'jquery-ui', 'd3', 'data_module'], 
    function(Backbone, $, d3, dataModule) {
  var checkboxesWidget = Backbone.View.extend( {

    formId: "checkboxes",

    events : {}, 

    initialize: function(options) {
      _.bindAll(this, 'render', 'clickedVal');
      
      this.model = options.model;

      // Make ourselvs a listener to when the visible places change.
      //dataModule.bind("change:visiblePlaces", this.updateViewWithSelected);

      // Save our data module so we can access it within inner functions  
      this.dataModule = dataModule;
      this.events["click input[type=checkbox]"] = 'clickedVal';

      this.render()
    },

    render: function() {
      $(this.el).append("<div id=\"" + this.formId +"\"></div>");

      // Save a reference
      var that = this;

      // For each field, adds all of the checkbox values that correspond to the
      // option
      for(var i = 0; i < dataModule.checkboxFieldNames.length; i++) {
        var curField = dataModule.checkboxFieldNames[i];
        var formId = curField+"-form";
        $("#" + this.formId, this.el).append("<div id=\"" + formId + 
          "\"</div>");

        var fieldValues = dataModule.checkboxFieldValues[curField];
        for (var j = 0; j < fieldValues.length; 
          j++) {
          var curVal = fieldValues[j];
          $("#" + formId, this.el).append("<input type=\"checkbox\" id=\"" + 
            curVal + "\" name=\"" + curVal + "\" checked=\"true\" />");
          $("#" + formId, this.el).append("<label for=\"" + curVal + "\">" + 
            curVal + "</label>");
        }
      }
    },

    clickedVal: function(e) {
      console.log("CLICKED " + $("#" + e.target['id']).is(":checked"))
    }
});

  return function(parent_) {
    return new checkboxesWidget({parentElem:parent_});
  }
});