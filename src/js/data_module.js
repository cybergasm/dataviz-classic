// This module is responsible for loading our data in. It works off of a 
// pre-set map of data-name to data-path. Data is loaded by calling the 
// 'loadData' function with a callback. This callback is invoked after all the
// specified data has been loaded. 
define(['backbone', 'd3'], function (Backbone, d3) { 
  
  var PATHS = {
    "polisData" : "../../data/polis_10_12.csv",
  };

  var dataModel = Backbone.Model.extend({
    loadData: function(callback) {
      pathsToLoad = _.size(PATHS);
      
      // Storing pointer to our model so we can set the data after it is loaded
      that = this;

      // This will be called after all data has been loaded to give us a 
      // chance to do any extra processing
      function processData() {
        // TODO: pull of all headers and keep them as state here
        // Generate array of all headers for data
        
        var headers = d3.keys(that.polisData[0]);

        // Generate array of headers that correspond to data in parallel form
        that.parallelFieldNames = headers.filter(function(d) { 
          return that.polisData[0][d] == "parallel";});
        that.binaryFieldNames = headers.filter(function(d) {
          return that.polisData[0][d] == "binary";});
        that.checkboxFieldNames = headers.filter(function(d) {
          return that.polisData[0][d] == "checkbox";});

        // Gets rid of the header rows
        that.polisData.splice(0,2);
      }

      for (var path in PATHS) {
        d3.csv(PATHS[path], function(csv) {
          pathsToLoad--;

          // Set this CSV as member with name equal to the key pointing to the
          // path of this file. Then check if we've loaded everything, if so,
          // call the given callback after pulling out any extreneous data we
          // we need.
          that[path] = csv;
          if (pathsToLoad == 0) {
            processData();
            callback();
          }
        });  
      }
    },

    // Given a map configuration model, sets itself up to listen to changes
    // to this model in order to filter data in response to new state.
    listenToMapConfig: function(mapConfigModel) {

      var that = this;

      // For a given site toCheck that is passed in as a parameter, returns 
      // true if the site should be visible and false if the site should be 
      // invisible. 
      function placeIsVisible(toCheck) {

        //Check parallel coordinate fields
        for(var i = 0; i < that.parallelFieldNames.length; i++) {
          var pField = that.parallelFieldNames[i];
          var curField = mapConfigModel.get("parallelConfig").get(pField);
          fieldMax = curField.max;
          fieldMin = curField.min;
          if(toCheck[pField] < fieldMin || toCheck[pField] > fieldMax) {
            return false;
          }
        }

        //Check binary fields
        for(var i = 0; i < that.binaryFieldNames.length; i++) {
          var bField = that.binaryFieldNames[i];
          var curBinaryField = mapConfigModel.get("binaryConfig").get(bField);
          noFieldSetting = curBinaryField[0];
          yesFieldSetting = curBinaryField[1];
          toCheckValue = toCheck[bField];

          if(yesFieldSetting == true) {
            // 0 is off and 1 is on, return false if toCheckValue == 0
            // otherwise 0 is on and 1 is on, do not need to filter on this 
            // field
            if(noFieldSetting == false) {
              if(toCheckValue == 0) {
                return false;
              } 
            }
          } else {
            // both 0 and 1 are off, return false if toCheckValue == 1
            if(noFieldSetting == false) {
              return false;
            }
            // 0 is on and 1 is off, return false if toCheckValue == 1
            if(toCheckValue == 1) {
              return false;
            } 
          }
        }
        return true;
      }

      // When we've heard a change, go through data and see which cities are
      // visible under current constraints. Then set them to the currently 
      // visible variable.
      function filterData() {
        var visiblePlaces = {};
        for (var i = 0; i < that.polisData.length; i++) {
          if (placeIsVisible (that.polisData[i])) {
            visiblePlaces[that.polisData[i].name] = that.polisData[i];
          }
        }
        that.set("visiblePlaces", visiblePlaces);
      }

      // Register to listen to updates of parallel fields
      for (var i = 0; i < this.parallelFieldNames.length; i++) {
        mapConfigModel.get("parallelConfig").bind(
          "change:" + this.parallelFieldNames[i], filterData);
      }
    }  
  });

  return new dataModel();
});