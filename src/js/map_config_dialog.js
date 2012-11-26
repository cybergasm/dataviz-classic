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
    tabsId: "option-tabs",
    tabsContentList: "tabs-list",

    events: {},

    initialize: function(options) {
      // This allows the enumerated methods to refer to this object
      _.bindAll(this, 'render', 'openDialog', 'saveMap', 'renderOptionWidgets',
        'getMapPic');
      this.el = $(options.parentElem);

      // Creates a model for this configuration
      this.model = mapConfigModelFactory();
      
      // Makes the data model listen to changes to our configuration
      dataModule.listenToMapConfig(this.model);

      this.render();
    },

    getMapPic: function() {
      return this.mapWidget.cloneMap();
    },

    saveMap: function() {
      console.log("Saving map")
      mapComparisonModelEditor.collection.add(
        mapComparisonModelEditor.config(this));
      $("#" + this.elId).dialog("close");
    },

    // This function adds specified widgets to the view and adds an entry for
    // each one with the tab object
    renderOptionWidgets: function() {

      this.parallelCoordWidget = parallelCoordWidgetFactory("#" + this.tabsId, 
        this.model);
      this.parallelCoordWidget.render();
      $("#" + this.tabsContentList, this.el)
        .append("<li><a href=\"#" + this.parallelCoordWidget.getId() + "\">" +
          "Real-valued parameters</a></li>");

      this.binaryBoxesWidget = binaryBoxesWidgetFactory("#" + this.tabsId, 
        this.model);
      $("#" + this.tabsContentList, this.el)
        .append("<li><a href=\"#" + this.binaryBoxesWidget.getId() + "\">" +
          "Binary Options Toggle</a></li>");
      
      this.checkboxesWidget = checkboxesWidgetFactory("#" + this.tabsId, 
        this.model);
      $("#" + this.tabsContentList, this.el)
        .append("<li><a href=\"#" + this.checkboxesWidget.getId() + "\">" +
          "Toggle Paramters</a></li>");

      this.dataTableWidget = dataTableWidgetFactory("#" + this.tabsId);
      $("#" + this.tabsContentList, this.el)
        .append("<li><a href=\"#" + this.dataTableWidget.getId() + "\">" +
          "Table of Cities</a></li>");

      this.dataBoxWidget = dataBoxWidgetFactory("#" + this.tabsId);
      $("#" + this.tabsContentList, this.el)
        .append("<li><a href=\"#" + this.dataBoxWidget.getId() + "\">" +
          "Data Box</a></li>");
    },

    // Adds a dialog div and configures it to be hidden.
    render: function() {
      var that = this;

      // Append the div that holds the elements for the dialog
      $(this.el)
        .append("<div id=\"" + this.elId + "\"></div>");
      
      // Append a button for saving and register functionality
      $("#" + this.elId, this.el)
        .append("<button id=\"" + this.saveId + "\">Save</button>");

      $("#" + this.saveId, this.el)
        .button()
        .click(function() {
          that.saveMap();
        });

      // Draws the map
      this.mapWidget = mapWidgetFactory("#" + this.elId);
      
      // Create a tabs container
      $("#" + this.elId, this.el)
        .append("<div id=\"" + this.tabsId +"\"></div>");

      $("#" + this.tabsId, this.el)
        .append("<ul id=\""+ this.tabsContentList +"\"></ul>");

      // Render the widgets and add each to the list that creates tabs
      this.renderOptionWidgets();
      
      // Tell JQuery to create the tab view
      $("#" + this.tabsId, this.el)
        .tabs();

      // Tell JQuery to treat this as a modal dialog box    
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
