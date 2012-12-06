// This is the model for the configuration of a map view. It stores all the 
// parameters a user could wish to change.
define(['backbone', 'data_module'], function(Backbone, dataModule) {

  var binaryConfigModel = Backbone.Model.extend({

    initialize: function() {
      
      for (var i = 0; i < dataModule.binaryFieldNames.length; i++) {
        // Each binary configuration variable points to a boolean tuple, the 
        // first element of which says if we display values for which this value
        // is 0 and the second says if we display values for which this value
        // is 1.
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

  var checkboxConfigModel = Backbone.Model.extend({

    initialize: function() {
      for (var i = 0; i < dataModule.checkboxFieldNames.length; i++) {
        // We create a map of option_category-option_name to true/false value
        // of that selection
        var name = dataModule.checkboxFieldNames[i];
        var values = dataModule.checkboxFieldValues[name];
        for (var j = 0; j < values.length; j++) {
          this.set(name + "-" + values[j], true);  
       }
      }
    }
  });

  var mapConfigModel = Backbone.Model.extend({

    initialize: function() {
      this.set("binaryConfig", new binaryConfigModel());
      this.set("parallelConfig", new parallelConfigModel());
      this.set("checkboxConfig", new checkboxConfigModel());
      this.set("mapStateString", "");
      this.set("binary-yes", "#76BBFC");
      this.set("binary-no", "#88CCA0");
      this.set("colorBasedOn", "");
    },

    // The following allow a callback to be registered in response to the
    // individual attributes of a map configuration or for all.
    listenToMapConfigChanges: function(callback) {
      this.listenToMapParallelConfigChanges(callback);
      this.listenToMapBinaryChanges(callback);
      this.listenToMapCheckboxChanges(callback);
    },

    listenToMapParallelConfigChanges: function(callback) {
      for (var i = 0; i < dataModule.parallelFieldNames.length; i++) {
        this.get("parallelConfig").bind(
          "change:" + dataModule.parallelFieldNames[i], callback);
      }
    },

    listenToMapBinaryChanges: function(callback) {
      for (var i = 0; i < dataModule.binaryFieldNames.length; i++) {
        this.get("binaryConfig").bind(
          "change:" + dataModule.binaryFieldNames[i], callback);
      }
    },

    listenToMapCheckboxChanges: function(callback) {
      for (var i = 0; i < dataModule.checkboxFieldNames.length; i++) {
        var name = dataModule.checkboxFieldNames[i];
        var values = dataModule.checkboxFieldValues[name];
        for (var j = 0; j < values.length; j++) {
          var changeHandler = "change:" + name + "-" + values[j];
          this.get("checkboxConfig").bind(changeHandler, callback);
        }
      }
    }
  });

  return function(modelNum_) {
    return new mapConfigModel({modelNum: modelNum_});
  }
});