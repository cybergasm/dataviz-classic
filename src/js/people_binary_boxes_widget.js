// Module defines a widget which allows a user to filter data by toggling binary
// data.
define(['backbone', 'jquery-ui', 'd3', 'data_module'], 
    function(Backbone, $, d3, dataModule) {
  var peopleBinaryBoxesWidget = Backbone.View.extend( {

    formId: "peopleBinary",
    
    initialize: function(options) {
      _.bindAll(this, 'render', 'getId');

      this.model = options.model;

      this.el = $(options.parent);

      // Save our data module so we can access it within inner functions  
      this.dataModule = dataModule;

      var that = this;

      function updateConfigUI() {
        var binaryOptions = that.dataModule.peopleBinaryFieldNames;
        for (var i = 0; i < binaryOptions.length; i++) {
          var value = that.model.get("peopleBinaryConfig").get(binaryOptions[i]);
          var yesId = "#" + binaryOptions[i] + "-yes-" + 
            that.model.get("modelNum");
          var noId = "#" + binaryOptions[i] + "-no-" + 
            that.model.get("modelNum");
          // Update the 'yes' option of this field to the second parameter and
          // the 'no' option to the first. The refresh code forces the UI to 
          // update.
          $(yesId)
            .prop({checked: value[1]});
          $(yesId)
            .button("enable")
            .button("refresh");
          $(noId)
            .prop({checked: value[0]});
          $(noId)
            .button("enable")
            .button("refresh");
        }
      }

      this.model.listenToPeopleBinaryChanges(updateConfigUI);

      this.render();
    },

    getId: function() {
      return this.formId;
    },

    render: function() {

      $(this.el).append("<div id=\"" + this.formId +"\"></div>");

      // Save a reference
      var that = this;
      var form = d3.select("#" + this.formId).append("form")
        .append("form");

      var fieldName = function(d){ return d;}; // returns name of column in CSV
      var testClick = function(d){ console.log(this);};
      
      var clickBox = function(checkbox) {
        var fieldName = checkbox.name; // eg. "Demos"
        var fieldId = checkbox.id; // eg. "Demos_no"
        var fieldValue = (fieldId.split("-"))[1]; // "yes" or "no"
        var pastBinarySetting = that.model.get("peopleBinaryConfig")
          .get(fieldName);
        if (fieldValue == "yes") {
        that.model.get("peopleBinaryConfig").set(fieldName, 
          [pastBinarySetting[0],checkbox['checked']]);
        } else if (fieldValue == "no") {
        that.model.get("peopleBinaryConfig").set(fieldName, 
          [checkbox['checked'],pastBinarySetting[1]]);
        }
      }

      var binaryBoxes = form.selectAll("p")
        .data(dataModule.peopleBinaryFieldNames)
        .enter()
        .append("p")
        .attr("class", "binaryForm")
        .attr("id", fieldName);

      binaryBoxes.append("label")
        .text(fieldName)
        .attr("for", function(d) {
          return d + "-yes-" + that.model.get("modelNum");
        });
      binaryBoxes.append("input")
        .attr("class", "binaryBox")
        .attr("type", "checkbox")
        .attr("checked", "true")
        .attr("id", function(d){ return d + "-yes-" + 
          that.model.get("modelNum");})
        .attr("name", function(d){ return d;})
        .on("click", function(d) { clickBox(this);});

      binaryBoxes.append("label")
        .text(function(d) {
          return "No " + d;
        })
        .attr("for", function(d) {
          return d + "-no-" + that.model.get("modelNum");
        });
      binaryBoxes.append("input")
        .attr("class", "binaryBox")
        .attr("type", "checkbox")
        .attr("checked", "true")
        .attr("id", function(d){ return d + "-no-" + 
          that.model.get("modelNum");})
        .attr("name", function(d){ return d;})
        .on("click", function(d) { clickBox(this);});
      
      // Make each set of options a jquery buttonset
      for (var i = 0; i < dataModule.peopleBinaryFieldNames.length; i++) {
        $("#" + dataModule.peopleBinaryFieldNames[i])
          .buttonset();
      }

      // This goes through each of the labels and figures out which is the 
      // longest and then sets this width on all of them for uniformity
      //
      // From http://stackoverflow.com/questions/9589230/jquery-buttonset-dimension-issues
      var longest = 0;
      $(".binaryForm .ui-button").each(function(){
          if ($(this).width() > longest)
              longest = $(this).width();
      }).each(function(){
          $(this).width(longest);
      });
    }

});

  return function(parent_, model_) {
    return new peopleBinaryBoxesWidget({parent:parent_, model:model_});
  }
});