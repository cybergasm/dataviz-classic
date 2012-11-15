// This module is responsible for loading our data in. It works off of a 
// pre-set map of data-name to data-path. Data is loaded by calling the 
// 'loadData' function with a callback. This callback is invoked after all the
// specified data has been loaded. 
define(['underscore', 'd3'], function (_, d3) { 
  
  var PATHS = {
    "polisData" : "../../data/polis_10_12.csv",
  };

  return {
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
       
        that.polisData.splice(0,2)  
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
  }
});