// This module sets up a dialog view with the different configuration options 
// associated to creating a map-view over our data.
define(['backbone', 'jquery-ui', 'parallel_coord_widget', 'binary_boxes_widget', 
  'checkboxes_widget', 'map_widget', 'data_module', 'map_config_model', 
  'data_table_widget', 'export_widget', 'map_comparison_model', 
  'people_binary_boxes_widget', 'people_list', 'people_config_model',
  'people_checkboxes_widget', 'people_parallel_coord_widget'], 
    function(Backbone, $, parallelCoordWidgetFactory, binaryBoxesWidgetFactory, 
      checkboxesWidgetFactory, mapWidgetFactory, dataModule, 
      mapConfigModelFactory, dataTableWidgetFactory, exportWidgetFactory,
      mapComparisonModelEditor, peopleBinaryBoxesWidgetFactory, 
      peopleListFactory, peopleConfigModelFactory, 
      peopleCheckboxesWidgetFactory, peopleParallelCoordWidgetFactory) {
  
    var dialogView = Backbone.View.extend( {
    
    elId: "map-config-dialog",
    saveId: "save",
    loadId: "load",
    tabsId: "option-tabs",
    stringRepId: "string-rep",
    tabsContentList: "tabs-list",
    controlId: "controlbox",
    viewsId: "dataViews",
    viewsContentList: "dataViewsList",
    configurationCollectionEntry: null,
    peopleTabId: "peopleTab",

    events: {},

    initialize: function(options) {
      // This allows the enumerated methods to refer to this object
      _.bindAll(this, 'render', 'openDialog', 'saveMap', 'reloadMapFromString', 
        'renderOptionWidgets', 'renderDataViews', 'getMapPic');
      this.el = $(options.parentElem);

      // Creates a model for this configuration
      this.model = mapConfigModelFactory(
        mapComparisonModelEditor.collection.length);
      this.peopleModel = peopleConfigModelFactory(
        mapComparisonModelEditor.collection.length);
      
      this.dataModule = dataModule;

      // Makes the data model listen to changes to our configuration
      dataModule.listenToMapConfig(this.model);
      dataModule.listenToPeopleConfig(this.peopleModel);

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
      console.log("RELOADING")
      for (var i = 0; i < myFields.length; i++) {
        var fieldData = myFields[i].split('=');
        var currentFieldName = fieldData[0];
        var currentFieldValues = fieldData[1];

        // Check to see what type the field is, then update the data model
        // to reflect the value of the field
        if(this.dataModule.parallelFieldNames.indexOf(currentFieldName) 
            != -1) { 
          var minAndMaxValues = currentFieldValues.split('-');
          this.model.get("parallelConfig").set(currentFieldName , {
            min:parseFloat(minAndMaxValues[0]),
            max:parseFloat(minAndMaxValues[1])
          })
        } else if(this.dataModule.binaryFieldNames.indexOf(currentFieldName) 
            != -1) {
          var yesAndNoValues = currentFieldValues.split('-');
          this.model.get("binaryConfig").set(currentFieldName, 
            [yesAndNoValues[0] == "true", yesAndNoValues[1] == "true"]);
        } else if(currentFieldName.indexOf("-") != -1 &&
            this.dataModule.checkboxFieldNames.indexOf(
              (currentFieldName.split('-'))[0]) 
            != -1) {
          var valueToSet = (currentFieldValues == "true");
          this.model.get("checkboxConfig").set(currentFieldName, valueToSet);
        } else if(currentFieldName == "map-scale") {
          this.model.set("map-scale", parseFloat(currentFieldValues));
        } else if(currentFieldName == "map-origin") {
          var origin = currentFieldValues.split('-');
          this.model.set("map-origin", 
            [parseFloat(origin[0]), parseFloat(origin[1])]);
        } else if(this.dataModule.peopleBinaryFieldNames.indexOf(
            currentFieldName) != -1) {
          var yesAndNoValues = currentFieldValues.split('-');
          this.peopleModel.get("peopleBinaryConfig").set(currentFieldName,
            [yesAndNoValues[0] == "true", yesAndNoValues[1] == "true"]);
        } else if(currentFieldName == "eraMin") {
          var val = parseInt(currentFieldValues);
          this.peopleModel.set("currentEraMin", val);
        } else if(currentFieldName == "eraMax") {
          var val = parseInt(currentFieldValues);
          this.peopleModel.set("currentEraMax", val);
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
          "Place Measures</a></li>");

      this.binaryBoxesWidget = binaryBoxesWidgetFactory("#" + this.tabsId, 
        this.model);
      $("#" + this.tabsContentList, this.el)
        .append("<li><a href=\"#" + this.binaryBoxesWidget.getId() + "\">" +
          "Place Options</a></li>");
      
      this.checkboxesWidget = checkboxesWidgetFactory("#" + this.tabsId, 
        this.model);
      $("#" + this.tabsContentList, this.el)
        .append("<li><a href=\"#" + this.checkboxesWidget.getId() + "\">" +
          "Place Toggles</a></li>");

      this.peopleParallelCoordWidget = peopleParallelCoordWidgetFactory("#" + 
        this.tabsId, this.peopleModel);
      this.peopleParallelCoordWidget.render();
      $("#" + this.tabsContentList, this.el)
        .append("<li><a href=\"#" + this.peopleParallelCoordWidget.getId() + 
          "\">" + "People Measures</a></li>");
      
      this.peopleBinaryBoxesWidget = peopleBinaryBoxesWidgetFactory("#" + 
        this.tabsId, this.peopleModel);
      $("#" + this.tabsContentList, this.el)
        .append("<li><a href=\"#" + this.peopleBinaryBoxesWidget.getId() + 
          "\">" + "People Toggles</a></li>");

      this.peopleCheckboxesWidget = peopleCheckboxesWidgetFactory("#" + 
        this.tabsId, this.peopleModel);
      $("#" + this.tabsContentList, this.el)
        .append("<li><a href=\"#" + this.peopleCheckboxesWidget.getId() + "\">" 
          + "People Options</a></li>"); 

      this.exportWidget = exportWidgetFactory("#" + this.tabsId, this.model,
        this.peopleModel);
      $("#" + this.tabsContentList, this.el)
        .append("<li><a href=\"#" + this.exportWidget.getId() + "\">" +
          "Export</a></li>");
    },

    // Renders the different data displays into a tab view on top of the 
    // dialog.
    renderDataViews: function() {
      this.mapWidget = mapWidgetFactory("#" + this.viewsId, this.model, 
        this.peopleModel);
      $("#" + this.dataViewsList, this.el)
        .append("<li><a href=\"#" + this.mapWidget.getId() + "\">" +
          "Map View</a></li>");

      this.dataTableWidget = dataTableWidgetFactory("#" + this.viewsId,
        this.model);
      $("#" + this.dataViewsList, this.el)
        .append("<li><a href=\"#" + this.dataTableWidget.getId() + "\">" +
          "Table of Cities</a></li>");

      this.peopleList = peopleListFactory("#" + this.viewsId, this.peopleModel);
      $("#" + this.dataViewsList, this.el) 
        .append("<li><a href=\"#" + this.peopleList.getId() + "\">" +
          "Table of People</a></li>");
    },

    // Adds a dialog div and configures it to be hidden.
    render: function() {
      var that = this;

      this.elId = this.elId + mapComparisonModelEditor.collection.length;
      this.saveId = this.saveId + mapComparisonModelEditor.collection.length;

      // Check if this dialog is already made.
      if ($("#" + this.elId).length != 0) {
        this.openDialog();
        return;
      }
      // Append the div that holds the elements for the dialog
      $(this.el)
        .append("<div id=\"" + this.elId + "\"></div>");
      $("#" + this.elId, this.el)
        .append("<div id=\"" + this.controlId + "\"></div>");

      // Append a button for saving and register functionality
      $("#" + this.controlId, this.el)
        .append("<button id=\"" + this.saveId + "\">Save</button>");

      $("#" + this.saveId, this.el)
        .button()
        .click(function() {
          that.saveMap();
        });

      // Append a text field to store the string representation of the map
      $("#" + this.controlId, this.el)
        .append("<textarea rows=\"2\" cols=\"80\" id=\"" + this.stringRepId 
          + "\"></textarea>");
      $("#" + this.stringRepId, this.el)
        .attr("class", "loadBox ui-widget ui-state-default ui-corner-all");
      $("#" + this.stringRepId, this.el)
        .val("Paste a provided configuration string here.");

      // Append a button to refresh the map from a URL
      $("#" + this.controlId, this.el)
        .append("<button id=\"" + this.loadId + "\">Load</button>");

      $("#" + this.loadId, this.el)
        .button()
        .click(function() {
          var string = $("#" + that.stringRepId).val();
          that.reloadMapFromString(string);
        });

      // Create the tabs for the different views.
      $("#" + this.elId, this.el) 
        .append("<div id=\"" + this.viewsId + "\"></div>");

       $("#" + this.viewsId, this.el)
        .append("<ul id=\""+ this.dataViewsList +"\"></ul>");

      this.renderDataViews();
      
      $("#" + this.viewsId, this.el)
        .tabs();

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
        width: 1450,
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
