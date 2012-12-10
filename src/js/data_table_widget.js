define(['backbone', 'jquery-ui', 'd3', 'data_module', 'datatable'], 
    function(Backbone, $, d3, dataModule) {
  var dataTableWidget = Backbone.View.extend( {

    tableId: "dataTable",
    tableClass: "dataTable",
    filteredDataId: "visiblePlaces",

    initialize: function(options) {
      _.bindAll(this, 'render', 'getId', 'updateData');
      
      this.el = $(options.parentElem);

      this.model = options.model

      this.filteredDataId = this.filteredDataId + this.model.get("modelNum");
      this.tableId = this.tableId + this.model.get("modelNum");

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
      $(this.el).append("<div id=\"" + this.tableId +"\"></div>")
        .attr("class", this.tableClass);

      // Save a reference
      var that = this;

      // Table code based on sample from: http://jsfiddle.net/7WQjr/
      var table = d3.select("#" + this.tableId)
        .append("table")
        .attr("style", "height:850px")
        .attr("id", this.tableId + "-table");

      var thead = table.append("thead"),
        tbody = table.append("tbody")
          .attr("id", this.tableId + "-tbody");

      // This will list the poeple associated with the clicked place
      $("#" + this.tableId + "-tbody", this.el)
        .click(function (event) {
          // Grab the polis_id of the clicked city. This is a little jank as
          // it depends on the id being in the table. If this becomes a problem
          // can move it to class.
          var target = 
            $(event.target.parentNode)
              .children('td')
              .eq(1)[0]
              .innerText
          target = parseInt(target);
          
          // Get all people known to live here
          var residents = that.dataModule.residencyMap[target];
          var listId = "list-elem" + that.model.get("modelNum") + 
            "-" + target;

          // Make sure previous list does not exist
          if ($("#" + listId).length != 0) {
            $("#" + listId)
              .remove();
            return;
          }

          var list = "<tr id=\"" + listId + "\"><td colspan=\"8\">";
          if (residents == undefined) {
            // If no residents
            $(event.target.parentNode)
              list += "<h1>No residents</h1>";
          } else {
            var residentList = "<ul class=\"personList\">";
            var curVisible = that.dataModule.get("visiblePeople" + 
              that.model.get("modelNum"));

            // This tracks how many of our residents are still visible
            var peopleStillVisible = 0;
            for (var i = 0; i < residents.length; i++) {
              var curResident = that.dataModule.peopleData[residents[i]];
              if (curVisible[curResident['unique_id']] != undefined) {
                residentList += "<li>" + curResident['Primary_Name'] + "</li>";
                peopleStillVisible++;
              }
            }
            residentList += "</ul>"
            if (peopleStillVisible > 0) {
              list += residentList;
            } else {
              list += "<h1>No residents</h1>";
            }
          }
          
          list += "</td></tr>";
          $(event.target.parentNode)
              .after(list);          
        });

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
      this.tableController.fnAddData(dataModule.polisData);
    }
});

  return function(parent_, model_) {
    return new dataTableWidget({parentElem:parent_, model:model_});
  }
});