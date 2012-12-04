define(['backbone', 'jquery-ui', 'd3', 'data_module', 'datatable'], 
    function(Backbone, $, d3, dataModule) {
  var peopleTableWidget = Backbone.View.extend({
    
    tableId: "peopleTable",
    tableClass: "peopleTable",
    filteredDataId: "visiblePeople",

    initialize: function(options) {
      _.bindAll(this, 'render', 'getId');
      
      this.el = $(options.parentElem);

      this.model = options.model;

      this.dataModule = dataModule;

      this.filteredDataId = this.filteredDataId + this.model.get("modelNum");
      this.tableId = this.tableId + this.model.get("modelNum");

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