// This is the model for the configuration of a people view. It stores all the 
// parameters a user could wish to change.
define(['backbone', 'data_module'], function(Backbone, dataModule) {

  var peopleBinaryConfigModel = Backbone.Model.extend({

    initialize: function() {
      
      for (var i = 0; i < dataModule.peopleBinaryFieldNames.length; i++) {
        // Each binary configuration variable points to a boolean tuple, the 
        // first element of which says if we display values for which this value
        // is 0 and the second says if we display values for which this value
        // is 1.
        this.set(dataModule.peopleBinaryFieldNames[i], [true, true]);
      }
    }
  });

  var peopleParallelConfigModel = Backbone.Model.extend({

    initialize: function() {
      for (var i = 0; i < dataModule.peopleParallelFieldNames.length; i++) {
        // Each parallel field name points to a tuple of values showing the
        // current min and max set for this value.
        // TODO figure out actual min and max
        this.set(dataModule.peopleParallelFieldNames[i], 
          {min:-10000000, max:1000000});
      }
    }
  });

  var peopleCheckboxConfigModel = Backbone.Model.extend({

    initialize: function() {
      for (var i = 0; i < dataModule.peopleCheckboxFieldNames.length; i++) {
        // We create a map of option_category-option_name to true/false value
        // of that selection
        var name = dataModule.peopleCheckboxFieldNames[i];
        var values = dataModule.peopleCheckboxFieldValues[name];
        for (var j = 0; j < values.length; j++) {
          this.set(name + "-" + values[j], true);  
       }
      }
    }
  });

  var peopleConfigModel = Backbone.Model.extend({

    initialize: function() {
      this.set("peopleBinaryConfig", new peopleBinaryConfigModel());
      this.set("peopleParallelConfig", new peopleParallelConfigModel());
      this.set("peopleCheckboxConfig", new peopleCheckboxConfigModel());
      this.set("currentEraMin", dataModule.eraMin);
      this.set("currentEraMax", dataModule.eraMax);
    },

    // The following allow a callback to be registered in response to the
    // individual attributes of a people configuration or for all.
    listenToPeopleConfigChanges: function(callback) {
      this.listenToPeopleParallelConfigChanges(callback);
      this.listenToPeopleBinaryChanges(callback);
      this.listenToPeopleCheckboxChanges(callback);
    },

    listenToPeopleParallelConfigChanges: function(callback) {
      for (var i = 0; i < dataModule.peopleParallelFieldNames.length; i++) {
        this.get("peopleParallelConfig").bind(
          "change:" + dataModule.peopleParallelFieldNames[i], callback);
      }
    },

    listenToPeopleBinaryChanges: function(callback) {
      for (var i = 0; i < dataModule.peopleBinaryFieldNames.length; i++) {
        this.get("peopleBinaryConfig").bind(
          "change:" + dataModule.peopleBinaryFieldNames[i], callback);
      }
    },

    listenToPeopleCheckboxChanges: function(callback) {
      for (var i = 0; i < dataModule.peopleCheckboxFieldNames.length; i++) {
        var name = dataModule.peopleCheckboxFieldNames[i];
        var values = dataModule.peopleCheckboxFieldValues[name];
        for (var j = 0; j < values.length; j++) {
          var changeHandler = "change:" + name + "-" + values[j];
          this.get("peopleCheckboxConfig").bind(changeHandler, callback);
        }
      }
    }
  });

  return function(modelNum_) {
    return new peopleConfigModel({modelNum: modelNum_});
  }


});