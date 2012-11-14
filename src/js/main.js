// This is the configuration for the require.js module
require.config({
  // This creates 'paths' which are aliases we can use to refer to the 
  // scripts that they refer to
  paths: {
    "jquery": "external/jquery-1.8.2",
    "jquery-ui": "external/jquery-ui-1.9.1.custom",
    "underscore": "external/underscore",
    "backbone": "external/backbone",
    "d3": "external/d3.v2",
    "dc": "external/dc"
  },
  // This allows us to order the loading order of our scripts since a lot of
  // our utilities have dependendencies that need to be loaded before they are.
  //
  // Each entry in the shim corresponds to a resource and defines, first, what
  // resources need to be loaded first and, second, what the object that the
  // resource returns should be called (e.g. we say that jquery-ui should be
  // refered to as $)
  shim: {
    "jquery-ui": {
        exports: "$",
        deps: ['jquery']
    },
    "underscore": {
        exports: "_"
    },
    "backbone": {
        exports: "Backbone",
        deps: ["underscore", "jquery"]
    },
    "d3": {
      exports: "d3"
    },
    "dc": {
      deps: ["d3"],
      exports: "dc"
    }
  }

});

require(['data_module', 'jquery-ui'], function(dataModule, $) {
  dataModule.loadData(function() {
    $("body").append("<h1>" + dataModule.polisData[0] + "</h1>");
  });
});