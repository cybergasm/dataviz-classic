define(['backbone', 'jquery-ui', 'd3', 'data_module'], 
    function(Backbone, $, d3, dataModule) {
  var dataTableWidget = Backbone.View.extend( {

    tableId: "dataTable",

    initialize: function(options) {
      _.bindAll(this, 'render');
      
      this.el = $(options.parentElem);

      this.model = options.model

      // Make ourselvs a listener to when the visible places change.
      dataModule.bind("change:visiblePlaces", this.updateViewWithSelected);

      // Save our data module so we can access it within inner functions  
      this.dataModule = dataModule
    },

    render: function() {
      $(this.el).append("<div id=\"" + this.tableId +"\"></div>");

      // Save a reference
      var that = this;

      // Table code based on sample from: http://jsfiddle.net/7WQjr/
      var columns = dataModule.allFieldNames;

      var table = d3.select("#" + this.tableId).append("table"),
        thead = table.append("thead"),
        tbody = table.append("tbody");

      thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function(column) { return column; });

      //creates a row for each object in data
      rows = tbody.selectAll("tr")
        .data(dataModule.polisData)
        .enter()
        .append("tr")
        .style("display", null);

      //creates a cell for each column in each row
      cells = rows.selectAll("td")
        .data(function(row) {
          return columns.map(function(column) {
            return {column: column, value: row[column]};
          });
        })
        .enter()
        .append("td")
          .text(function(d) { return d.value; });
    }
});

  return function(parent_) {
    return new dataTableWidget({parentElem:parent_});
  }
});