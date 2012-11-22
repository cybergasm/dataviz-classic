// This module sets up a dialog view with the different configuration options 
// associated to creating a map-view over our data.
define(['backbone', 'jquery-ui', 'parallel_coord_widget', 'binary_boxes_widget', 
  'checkboxes_widget', 'map_widget', 'data_module', 'map_config_model', 
  'data_box_widget', 'data_table_widget', 'map_comparison_model'], 
    function(Backbone, $, parallelCoordWidgetFactory, binaryBoxesWidgetFactory, 
      checkboxesWidgetFactory, mapWidgetFactory, dataModule, 
      mapConfigModelFactory, dataBoxWidgetFactory, dataTableWidgetFactory,
      mapComparisonModelEditor) {
  
    var dialogView = Backbone.View.extend( {
    
    elId: "map-config-dialog",
    saveId: "save",

    events: {},

    initialize: function(options) {
      // This allows the enumerated methods to refer to this object
      _.bindAll(this, 'render', 'openDialog', 'saveMap');
      this.el = $(options.parentElem);

      // Creates a model for this configuration
      this.model = mapConfigModelFactory();
      
      // Makes the data model listen to changes to our configuration
      dataModule.listenToMapConfig(this.model);

      this.render();
    },

    saveMap: function() {
      console.log("Saving map")
      mapComparisonModelEditor.collection.add(
        mapComparisonModelEditor.config(this));
    },

    // Adds a dialog div and configures it to be hidden.
    render: function() {
      var that = this;
      $(this.el)
        .append("<div id=\"" + this.elId + "\"></div>");

      $("#" + this.elId, this.el)
        .append("<button id=\"" + this.saveId + "\">Save</button>");

      $("#" + this.saveId, this.el)
        .button()
        .click(function() {
          that.saveMap();
        });

      $("#" + this.elId, this.el).dialog({
        autoOpen: false,
        show: "blind",
        hide: "blind",
        width: 1280,
        height: "auto",
        close: function() {
          $("#" + that.elId).remove();
        }
      });

      mapWidget = mapWidgetFactory("#" + this.elId);
      mapWidget.render();

      parallelCoordWidget = parallelCoordWidgetFactory(
        "#" + this.elId, this.model);
      parallelCoordWidget.render();

      binaryBoxesWidget = binaryBoxesWidgetFactory("#" + this.elId, this.model);

      checkboxesWidget = checkboxesWidgetFactory("#" + this.elId, this.model);

      dataTableWidget = dataTableWidgetFactory("#" + this.elId);
      dataTableWidget.render();

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
