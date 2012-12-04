define(['backbone', 'jquery-ui', 'd3', 'data_module', 'datatable'], 
    function(Backbone, $, d3, dataModule) {
  var peopleTableWidget = Backbone.View.extend({
    
    tableId: "peopleTable",
    tableClass: "peopleTable",
    filteredDataId: "visiblePeople",

    initialize: function(options) {
      _.bindAll(this, 'render', 'getId', 'updateData');
      
      this.el = $(options.parentElem);

      this.model = options.model;

      this.dataModule = dataModule;

      this.filteredDataId = this.filteredDataId + this.model.get("modelNum");
      this.tableId = this.tableId + this.model.get("modelNum");

      // Make ourselvs a listener to when the visible people change.
      dataModule.bind("change:" + this.filteredDataId, this.updateData);

      this.columns = [];

      var data = dataModule.peopleData;

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
        // We get the data back through data module's visible people as a
        // map of name->values. Here we extract the values into an array as 
        // that is what DataTable expects.
        var dataForTable = [];
        for (var city in data) {
          dataForTable.push(data[city])
        }
        this.tableController.fnAddData(dataForTable)
      }
    },

    render: function() {
      $(this.el).append("<div id=\"" + this.tableId +"\"></div>")
        .attr("class", this.tableClass);

      // Save a reference
      var that = this;

      // Table code based on sample from: http://jsfiddle.net/7WQjr/
      var table = d3.select("#" + this.tableId)
        .append("table")
        .attr("id", this.tableId + "-table");

      var thead = table.append("thead"),
        tbody = table.append("tbody");

      thead.append("tr")
        .selectAll("th")
        .data(this.columns)
        .enter()
        .append("th")
        .text(function(column) { return column["mData"]; });
        
      this.tableController = $("#" + this.tableId + "-table")
        .dataTable({
          "aoColumns" : this.columns,
        });

      // Initially we want all the data
      this.tableController.fnAddData(dataModule.peopleData);
    }
  })

  return function(parent_, model_) {
    return new peopleTableWidget({parentElem:parent_, model:model_}); 
  }
});