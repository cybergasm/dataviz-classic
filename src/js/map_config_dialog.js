// This module sets up a dialog view with the different configuration options 
// associated to creating a map-view over our data.
define(['backbone', 'jquery-ui', 'parallel_coord_widget'], 
    function(Backbone, $, parallelCoordWidgetFactory) {
  var dialogView = Backbone.View.extend( {
    
    elId: "map-config-dialog",

    initialize: function(options) {
      // This allows the enumerated methods to refer to this object
      _.bindAll(this, 'render', 'openDialog');
      this.el = $(options.parentElem);
      this.render();
    },

    // Adds a dialog div and configures it to be hidden.
    render: function() {
      $(this.el).append("<div id=\"" + this.elId + "\"></div>");
      $("#" + this.elId, this.el).dialog({
        autoOpen: false,
        modal: true,
        show: "blind",
        hide: "blind",
        width: 1280,
        height: "auto",
      });
      parallelCoordWidget = parallelCoordWidgetFactory("#" + this.elId);
      parallelCoordWidget.render();
    },

    // We allow an external user to open the dialog.
    openDialog: function() {
      $("#" + this.elId).dialog("open");
    } 
  });

  return function (parent_) {
    return new dialogView({parentElem:parent_});
  }
});