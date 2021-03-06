// Module defines a widget that holds a simple text area
// with the string for current map
define(['backbone', 'jquery-ui', 'data_module'], 
    function (Backbone, $, dataModel) {
  var exportWidget = Backbone.View.extend( {
    textAreaId: "saveStringTextArea",
    containerId: "saveString", 

    initialize: function(options) {
      _.bindAll(this, 'render', 'getId');

      this.el = $(options.parent);
      this.placesModel = options.placesModel;
      this.peopleModel = options.peopleModel;

      this.textAreaId = this.textAreaId + this.placesModel.get("modelNum");

      var that = this;

      function updateExportString() {
        $("#" + that.textAreaId)
          .val(that.placesModel.get("mapStateString") + 
            that.peopleModel.get("peopleStateString"));
      }
      
      this.placesModel.bind("change:mapStateString", updateExportString);
      this.peopleModel.bind("change:peopleStateString", updateExportString);
      
      this.render();
    },

    getId: function() {
      return this.containerId;
    },

    render: function() {
      $(this.el).append("<div id=\"" + this.containerId +"\">" + 
        "<p>You can share the string below to allow others to use your map" + 
        "</div>");

      $("#" + this.containerId, this.el)
        .append("<textarea id=\"" + this.textAreaId + "\" rows=\"5\"" +
          "cols=\"125\" disabled=\"true\"></textarea>");
      $("#" + this.textAreaId, this.el)
        .attr("class", "ui-widget ui-state-default ui-corner-all");
    }

  });

  return function(parent_, placesModel_, peopleModel_) {
    return new exportWidget({
      parent: parent_,
      placesModel: placesModel_,
      peopleModel: peopleModel_});
  }
});