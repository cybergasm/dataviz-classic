// This module is responsible for loading our data in. It works off of a 
// pre-set map of data-name to data-path. Data is loaded by calling the 
// 'loadData' function with a callback. This callback is invoked after all the
// specified data has been loaded. 
define(['underscore', 'd3'], 
    function (_, d3) { 
  
  var PATHS = {
    "polisData" : "../../data/polis_10_12.csv",
  };

  return {
    loadData: function(callback) {
      pathsToLoad = _.size(PATHS);
      
      // Storing pointer to our model so we can set the data after it is loaded
      that = this;

      for (var path in PATHS) {
        d3.csv(PATHS[path], function(csv) {
          pathsToLoad--;
          // Set this CSV as member with name equal to the key pointing to the
          // path of this file. Then check if we've loaded everything, if so,
          // call the given callback.
          that[path] = csv;
          if (pathsToLoad == 0) callback();
        });  
      }
    },  
  }
});