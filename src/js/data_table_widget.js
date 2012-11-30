define(['backbone', 'jquery-ui', 'd3', 'data_module', 'datatable'], 
    function(Backbone, $, d3, dataModule) {
  var dataTableWidget = Backbone.View.extend( {

    tableId: "dataTable",
    filteredDataId: "visiblePlaces",
    scrollId: "tableScroll",

    initialize: function(options) {
      _.bindAll(this, 'render', 'getId', 'updateData');
      
      this.el = $(options.parentElem);

      this.model = options.model

      this.filteredDataId = this.filteredDataId + this.model.get("modelNum");

      // Make ourselvs a listener to when the visible places change.
      dataModule.bind("change:" + this.filteredDataId, this.updateData);

      // Save our data module so we can access it within inner functions  
      this.dataModule = dataModule

      var that = this;

      this.columns = [];

      var data = dataModule.get(this.filteredDataId);

      for (var key in data[0]) {
        if (data[0].hasOwnProperty(key)) {
          this.columns.push({"mData" : key});
        }
      }

      this.render();
    },

    getId: function() {
      return this.tableId;
    },

    updateData: function() {
      this.tableController.fnClearTable();
      var data = dataModule.get(this.filteredDataId);
      if (_.size(data) != 0) {
        // We get the data back through data module's visible places as a
        // map of city->values. Here we extract the values into an array as 
        // that is what DataTable expects.
        var dataForTable = [];
        for (var city in data) {
          dataForTable.push(data[city])
        }
        this.tableController.fnAddData(dataForTable)
      }
    },

    render: function() {
      $(this.el).append("<div id=\"" + this.tableId +"\"></div>");

      // Save a reference
      var that = this;

      // Table code based on sample from: http://jsfiddle.net/7WQjr/
      var columns = dataModule.allFieldNames;

      var table = d3.select("#" + this.tableId)
        .append("table")
        .attr("id", this.tableId + "-table");

      var thead = table.append("thead"),
        tbody = table.append("tbody");

      thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function(column) { return column; });
        
      this.tableController = $("#" + this.tableId + "-table")
        .dataTable({
          "aoColumns" : this.columns,
        });

      // Initially we want all the data
      this.tableController.fnAddData(dataModule.polisData);
    }
});

  return function(parent_, model_) {
    return new dataTableWidget({parentElem:parent_, model:model_});
  }
});