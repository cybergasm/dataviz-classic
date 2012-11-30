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
    loadId: "load",
    tabsId: "option-tabs",
    stringRepId: "string-rep",
    tabsContentList: "tabs-list",
    configurationCollectionEntry: null,

    events: {},

    initialize: function(options) {
      // This allows the enumerated methods to refer to this object
      _.bindAll(this, 'render', 'openDialog', 'saveMap', 'reloadMapFromString', 
        'renderOptionWidgets', 'getMapPic');
      this.el = $(options.parentElem);

      // Creates a model for this configuration
      this.model = mapConfigModelFactory(
        mapComparisonModelEditor.collection.length);
      
      this.dataModule = dataModule;

      // Makes the data model listen to changes to our configuration
      dataModule.listenToMapConfig(this.model);

      this.render();
    },

    getMapPic: function() {
      return this.mapWidget.cloneMap();
    },

    saveMap: function() {
      if (this.configurationCollectionEntry == null) {
        this.configurationCollectionEntry = 
          mapComparisonModelEditor.config(this);
      } else {
        mapComparisonModelEditor.collection.remove(
          this.configurationCollectionEntry);
      }
      mapComparisonModelEditor.collection.add(
        this.configurationCollectionEntry);
      $("#" + this.elId).dialog("close");
    },

    // Parses the parameters in stateString and sets the data model to the
    // parameters in the string so the map will refresh according to the
    // string
    reloadMapFromString: function(stateString) {
      var myFields = stateString.split(',');
      for (var i = 0; i < myFields.length; i++) {
        var fieldData = myFields[i].split('=');
        var currentFieldName = fieldData[0];
        var currentFieldValues = fieldData[1];

        // Check to see what type the field is, then update the data model
        // to reflect the value of the field
        if(that.parallelFieldNames.indexOf(currentFieldName) != -1) { 
          var minAndMaxValues = currentFieldValues.split('-');
          this.model.get("parallelConfig").set(currentFieldName , {
            min:minAndMaxValues[0],
            max:minAndMaxValues[1]
          })
        } else if(that.binaryFieldNames.indexOf(currentFieldName) != -1) {
          var yesAndNoValues = currentFieldValues.split('-');
          this.model.get("binaryConfig").set(currentFieldName, 
            [yesAndNoValues[0] == "true", yesAndNoValues[1] == "true"]);
        } else if(currentFieldName.indexOf("-") != -1 &&
            that.checkboxFieldNames.indexOf((currentFieldName.split('-'))[0]) 
            != -1) {
          var valueToSet = (currentFieldValues == "true");
          this.model.get("checkboxConfig").set(currentFieldName, valueToSet);
        }
      }
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

      this.dataTableWidget = dataTableWidgetFactory("#" + this.tabsId,
        this.model);
      $("#" + this.tabsContentList, this.el)
        .append("<li><a href=\"#" + this.dataTableWidget.getId() + "\">" +
          "Table of Cities</a></li>");

      this.dataBoxWidget = dataBoxWidgetFactory("#" + this.tabsId,
        this.model);
      $("#" + this.tabsContentList, this.el)
        .append("<li><a href=\"#" + this.dataBoxWidget.getId() + "\">" +
          "Data Box</a></li>");
    },

    // Adds a dialog div and configures it to be hidden.
    render: function() {
      var that = this;

      this.elId = this.elId + mapComparisonModelEditor.collection.length;

      // Check if this dialog is already made.
      if ($("#" + this.elId).length != 0) {
        this.openDialog();
        return;
      }
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

      // Append a text field to store the string representation of the map
      $("#" + this.elId, this.el)
        .append("<textarea rows=\"1\" cols=\"80\" id=\"" + this.stringRepId 
          + "\"></textarea>");

      $("#" + this.stringRepId, this.el)
        .val("hello");

      // Append a button to refresh the map from a URL

      $("#" + this.elId, this.el)
        .append("<button id=\"" + this.loadId + "\">Load</button>");

      $("#" + this.loadId, this.el)
        .button()
        .click(function() {
          that.reloadMapFromString("Constitution-Dem=false,Constitution-Pol=false,Constitution-NR=false,");
        });

      // Draws the map
      this.mapWidget = mapWidgetFactory("#" + this.elId, this.model);
      
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
        width: 1350,
        height: "auto",
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
