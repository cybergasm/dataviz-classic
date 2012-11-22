// This model tracks the saved maps in a Backbone collection.  
define(['backbone'], function (Backbone) {
  // Model to be populated with a reference to an open dialog.
  var mapConfiguration = Backbone.Model.extend({
  });

  var maps = Backbone.Collection.extend({
    model: mapConfiguration,
  });

  // Returns a tuple of a factory for each collection element and the collection
  // itself
  var collectionEditor = {
    config: function (mapDialogRef_) {
      return new mapConfiguration({mapDialogRef: mapDialogRef_});
    },
    collection: new maps(),
  };

  return collectionEditor;
});