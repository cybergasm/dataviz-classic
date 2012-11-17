// This module sets up a dialog view with the different configuration options 
// associated to creating a map-view over our data.

define(['backbone', 'jquery-ui', 'parallel_coord_widget', 'binary_boxes_widget', 
  'checkboxes_widget', 'map_widget', 'data_module', 'map_config_model'], 
    function(Backbone, $, parallelCoordWidgetFactory, binaryBoxesWidgetFactory, 
      checkboxesWidgetFactory, mapWidgetFactory, dataModule, 
      mapConfigModelFactory) {
  
    var dialogView = Backbone.View.extend( {
    
    elId: "map-config-dialog",

    initialize: function(options) {
      // This allows the enumerated methods to refer to this object
      _.bindAll(this, 'render', 'openDialog');
      this.el = $(options.parentElem);

      // Creates a model for this configuration
      this.model = mapConfigModelFactory();
      
      // Makes the data model listen to changes to our configuration
      dataModule.listenToMapConfig(this.model);

      this.render();
    },

    // Adds a dialog div and configures it to be hidden.
    render: function() {
      $(this.el).append("<div id=\"" + this.elId + "\"></div>");
      $("#" + this.elId, this.el).dialog({
        autoOpen: false,
        show: "blind",
        hide: "blind",
        width: 1280,
        height: "auto",
      });

      parallelCoordWidget = parallelCoordWidgetFactory(
        "#" + this.elId, this.model);
      parallelCoordWidget.render();

      mapWidget = mapWidgetFactory("#" + this.elId);
      mapWidget.render();

      binaryBoxesWidget = binaryBoxesWidgetFactory("#" + this.elId);
      binaryBoxesWidget.render();

      checkboxesWidget = checkboxesWidgetFactory("#" + this.elId);
      checkboxesWidget.render();

      //dataTableWidget = dataTableWidgetFactory("#" + this.elId);
      //dataTableWidget.render();

      dataBoxWidget = dataBoxWidgetFactory("#" + this.elId);
      dataBoxWidget.render();
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
