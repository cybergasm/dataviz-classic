// This is the model for the configuration of a map view. It stores all the 
// parameters a user could wish to change.
define(['backbone', 'data_module'], function(Backbone, dataModule) {
  
  var binaryConfigModel = Backbone.Model.extend({

    initialize: function() {
      
      for (var i = 0; i < dataModule.binaryFieldNames.length; i++) {
        // Each binary configuration variable points to a boolean tuple, the 
        // first element of which says if we display values for which this value
        // is true and the second says if we display values for which this value
        // is false.
        this.set(dataModule.binaryFieldNames[i], [true, true]);
      }
    }
  });

  var parallelConfigModel = Backbone.Model.extend({

    initialize: function() {
      for (var i = 0; i < dataModule.parallelFieldNames.length; i++) {
        // Each parallel field name points to a tuple of values showing the
        // current min and max set for this value.
        // TODO figure out actual min and max
        this.set(dataModule.parallelFieldNames[i], {min:0, max:1000000});
      }
    }
  });

  var mapConfigModel = Backbone.Model.extend({

    initialize: function() {
      this.set("binaryConfig", new binaryConfigModel());
      this.set("parallelConfig", new parallelConfigModel());
    }
  });

  return function() {
    return new mapConfigModel();
  }
});