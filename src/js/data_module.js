// This module is responsible for loading our data in. It works off of a 
// pre-set map of data-name to data-path. Data is loaded by calling the 
// 'loadData' function with a callback. This callback is invoked after all the
// specified data has been loaded. 
define(['backbone', 'd3'], function (Backbone, d3) { 
  
  var PATHS = {
    "polisData" : "../../data/polis_10_12.csv",
    "peopleData" : "../../data/people_full_1.csv",
    "endeavorData" : "../../data/endeavor_categories.csv",
  };

  var dataModel = Backbone.Model.extend({
    loadData: function(callback) {
      pathsToLoad = _.size(PATHS);
      
      // Storing pointer to our model so we can set the data after it is loaded
      that = this;

      // This will be called after all data has been loaded to give us a 
      // chance to do any extra processing
      function processData() {
        // POLIS DATA

        var headers = d3.keys(that.polisData[0]);

        // Generate array of headers that correspond to data in parallel form
        that.parallelFieldNames = headers.filter(function(d) { 
          return that.polisData[0][d] == "parallel";});
        that.binaryFieldNames = headers.filter(function(d) {
          return that.polisData[0][d] == "binary";});
        that.checkboxFieldNames = headers.filter(function(d) {
          return that.polisData[0][d] == "checkbox";});

        // Get set of possible values for every checkbox field name
        that.checkboxFieldValues  = {};

        for (var i = 0; i < that.checkboxFieldNames.length; i++) {
          var curName = that.checkboxFieldNames[i];
          that.checkboxFieldValues[curName] = 
            that.polisData[1][curName].split(',');
        }

        that.allFieldNames = headers;

        // Gets rid of the header rows
        that.polisData.splice(0,2);

        // ENDEAVOR DATA

        // Generates a mapping from endeavor code to endeavor name and endeavor
        // category
        var endeavorInformation = {};
        for(var i = 0; i < that.endeavorData.length; i++) {
          var info = new Array();
          info['name'] = that.endeavorData[i]['name'];
          info['category'] = that.endeavorData[i]['category'];
          endeavorInformation[that.endeavorData[i]['id']] = info;
        }
        // PEOPLE DATA
        var peopleHeaders = d3.keys(that.peopleData[0]);

        // Generate arrays of headers that correspond to data in each form
        that.textFieldNames = peopleHeaders.filter(function(d) { 
          return that.peopleData[0][d] == "textbox";});
        that.peopleCheckboxFieldNames = peopleHeaders.filter(function(d) { 
          return that.peopleData[0][d] == "optionbox";});
        that.peopleParallelFieldNames = peopleHeaders.filter(function(d) { 
          return that.peopleData[0][d] == "parallel";});
        that.peopleBinaryFieldNames = peopleHeaders.filter(function(d) { 
          return that.peopleData[0][d] == "binary";});

        // Get set of possible values for every checkbox field name
        that.peopleCheckboxFieldValues  = {};

        for (var i = 0; i < that.peopleCheckboxFieldNames.length; i++) {
          var curName = that.peopleCheckboxFieldNames[i];
          that.peopleCheckboxFieldValues[curName] = 
            that.peopleData[1][curName].split(',');
        }

        // Gets rid of the header rows
        that.peopleData.splice(0,2);

        that.allPeopleFieldNames = peopleHeaders;

        // Add the "endeavors" as text values to the people data
        for(var i = 0; i < that.peopleData.length; i++) {
          var endeavorCodes = that.peopleData[i]['Endeavor_codes'];
          var endeavorCodesArr = (endeavorCodes).split(",");        
          var endeavorNames = [];
          for(var j = 0; j < endeavorCodesArr.length; j++) {
            var currentCode = endeavorCodesArr[j];
            if(currentCode in endeavorInformation) {
              endeavorNames.push(endeavorInformation[currentCode]['name']);  
            }
          }
          that.peopleData[i]['Endeavors'] = endeavorNames;
        }


      } 

      for (var path in PATHS) {
        // Javascript wizardy incoming. Since we are in a loop the path in the
        // inner function will always be the last iteration due to the closure
        // variable being overwritten by the loop. SO we execute a function 
        // takes the current path and returns a function which takes a csv to
        // save the path at time of iteration in a new closure.
        d3.csv(PATHS[path], (function(loadedPath) {
          return function(csv) {
            pathsToLoad--;
            // Set this CSV as member with name equal to the key pointing to the
            // path of this file. Then check if we've loaded everything, if so,
            // call the given callback after pulling out any extreneous data we
            // we need.
            that[loadedPath] = csv;
            if (pathsToLoad == 0) {
              processData();
              callback();
            }
          }
        }) (path));  
      }
    }, 

    // Given a people configuration model, sets itself up to listen to changes
    // to this model in order to filter data in response to new state.    
    listenToPeopleConfig: function(peopleConfigModel) {

      var that = this;

      // For a given site toCheck that is passed in as a parameter, returns 
      // true if the site should be visible and false if the site should be 
      // invisible. 
      function personIsVisible(toCheck) {

        //Check parallel coordinate fields
        for(var i = 0; i < that.peopleParallelFieldNames.length; i++) {
          var pField = that.peopleParallelFieldNames[i];
          var curField = peopleConfigModel.get("peopleParallelConfig")
            .get(pField);
          fieldMax = curField.max;
          fieldMin = curField.min;
          if(toCheck[pField] < fieldMin || toCheck[pField] > fieldMax) {
            return false;
          }
        }

        //Check binary fields
        for(var i = 0; i < that.peopleBinaryFieldNames.length; i++) {
          var bField = that.peopleBinaryFieldNames[i];
          var curBinaryField = peopleConfigModel.get("peopleBinaryConfig")
            .get(bField);
          var noFieldSetting = curBinaryField[0];
          var yesFieldSetting = curBinaryField[1];
          var toCheckValue = toCheck[bField];

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

        // Check the checkbox values by going through every name and category
        // and checking if it is checked by user and if it is in the data for
        // this city. If any of the associated values with the city are checked
        // we return true.        
        for (var i = 0; i < that.peopleCheckboxFieldNames.length; i++) {
          var name = that.peopleCheckboxFieldNames[i];
          var valuesInData = toCheck[name];
        
          var values = that.peopleCheckboxFieldValues[name];
          var containsCheckBox = false;

          // Go through all the possible values, query the model, and check if
          // (1) the value is checked and (2) if the values string contains it 
          // in the data.
          for (var j = 0; j < values.length; j++) {
            var selected = peopleConfigModel.get("peopleCheckboxConfig").get(
              name + "-" + values[j]);
            var setInData = valuesInData.indexOf(values[j]) > -1;
            
            if (setInData && selected) {
              // One of the checked values is in the data
              containsCheckBox = true;
            }
          }
          if (!containsCheckBox) {
            return false;
          }
        }

        return true;
      }

      // When we've heard a change, go through data and see which people are
      // visible under current constraints. Then set them to the currently 
      // visible variable.
      function filterPeopleData() {
        var visiblePeople = {};
        for (var i = 0; i < that.peopleData.length; i++) {
          if (personIsVisible (that.peopleData[i])) {
            visiblePeople[that.peopleData[i].unique_id] = that.peopleData[i];
          }
        }
        that.set("visiblePeople" + peopleConfigModel.get("modelNum"), 
          visiblePeople);
        console.log(visiblePeople);
      }

      // Register to listen to changes in person configuration
      peopleConfigModel.listenToPeopleConfigChanges(filterPeopleData);

      // Set the visible places to the whole data set.
      this.set("visiblePeople" + peopleConfigModel.get("modelNum"), 
        this.peopleData);

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
          var noFieldSetting = curBinaryField[0];
          var yesFieldSetting = curBinaryField[1];
          var toCheckValue = toCheck[bField];

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

        // Check the checkbox values by going through every name and category
        // and checking if it is checked by user and if it is in the data for
        // this city. If any of the associated values with the city are checked
        // we return true.        
        for (var i = 0; i < that.checkboxFieldNames.length; i++) {
          var name = that.checkboxFieldNames[i];
          var valuesInData = toCheck[name];
        
          var values = that.checkboxFieldValues[name];
          var containsCheckBox = false;

          // Go through all the possible values, query the model, and check if
          // (1) the value is checked and (2) if the values string contains it 
          // in the data.
          for (var j = 0; j < values.length; j++) {
            var selected = mapConfigModel.get("checkboxConfig").get(
              name + "-" + values[j]);
            var setInData = valuesInData.indexOf(values[j]) > -1;
            
            if (setInData && selected) {
              // One of the checked values is in the data
              containsCheckBox = true;
            }
          }
          if (!containsCheckBox) {
            return false;
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
        that.set("visiblePlaces" + mapConfigModel.get("modelNum"), 
          visiblePlaces);
      }

      // Register to listen to changes in place configuration
      mapConfigModel.listenToMapConfigChanges(filterData);
      mapConfigModel.listenToMapConfigChanges(updateStateString);
      mapConfigModel.bind("change:map-origin", updateStateString);
      mapConfigModel.bind("change:map-scale", updateStateString);

      // Set the visible places to the whole data set.
      this.set("visiblePlaces" + mapConfigModel.get("modelNum"), 
        this.polisData);
   
      // When a change occurs, generates a new string representation of the
      // current state of the program.
      function updateStateString() {
        var myStateString = "";

        // Check binary fields
        for(var i = 0; i < that.binaryFieldNames.length; i++) {
          var bFieldName = that.binaryFieldNames[i];
          var curBinaryField = 
            mapConfigModel.get("binaryConfig").get(bFieldName);
          if(curBinaryField[0] != true || curBinaryField[1] != true) {
            myStateString = myStateString + bFieldName + "=" + 
              curBinaryField[0] + "-" + curBinaryField[1] + ",";
          }
        }

        // Check checkbox fields
        for(var i = 0; i < that.checkboxFieldNames.length; i++) {
          var cFieldName = that.checkboxFieldNames[i];
          var values = that.checkboxFieldValues[cFieldName];
          for (var j = 0; j < values.length; j++) {
            if(mapConfigModel.get("checkboxConfig").get(cFieldName 
              + "-" + values[j]) 
              == false) {
              myStateString = myStateString + cFieldName + "-" + 
                values[j] + "=false,";
            }
          }
        }

        // Check parallel fields
        for(var i = 0; i < that.parallelFieldNames.length; i++) {
          var pFieldName = that.parallelFieldNames[i];
          var pField = mapConfigModel.get("parallelConfig").get(pFieldName);
          var fieldMin = Math.round(pField.min * 100) / 100; // 2 decimal places
          var fieldMax = Math.round(pField.max * 100) / 100; // 2 decimal places
          myStateString = myStateString + pFieldName + "=" + fieldMin + 
            "-" + fieldMax + ",";
        }

        var mapOrigin = mapConfigModel.get("map-origin");
        if (mapOrigin != undefined) {
          myStateString += "map-origin=" + mapOrigin[0] + "-" + mapOrigin[1] 
            + ",";
        }

        var mapScale = mapConfigModel.get("map-scale");
        if (mapScale != undefined) {
          myStateString += "map-scale=" + mapScale + ",";
        }

        mapConfigModel.set("stateString", myStateString);
      } 
    }  
  });
  
  return new dataModel();
});