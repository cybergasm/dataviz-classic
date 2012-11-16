// This module is the view of multiple maps side-by-side. It also holds the
// button for defining a new map.
define(['jquery-ui', 'backbone', 'data_module', 'map_config_dialog'], 
    function($, Backbone, dataModule, mapConfigDialogFactory) {
  var mapComparisonView = Backbone.View.extend( {
    
    buttonId: "defineViewButton",
    
    events : {},

    initialize: function(options) {
      _.bindAll(this, 'render', 'newMap');
      this.render();
    },

    // Adds the button to open dialog for defining a new map
    render: function() {
      $(this.el).append("<button id=\"" + this.buttonId + "\">" + 
        "New Map</button>");
      $(this.el).find("#" + this.buttonId).button();
      this.events['click button#' + this.buttonId] = 'newMap';
    },

    newMap: function() {
      // Creates a new dialog with an associated model
      this.mapConfigDialog = mapConfigDialogFactory(this.el);

      this.mapConfigDialog.openDialog();
    }    
  }); 

  return function() {
    return new mapComparisonView();
  }
});