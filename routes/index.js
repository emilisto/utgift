var path = require('path'),
    folio = require('folio');

/**
 * Vendor Javascript Package
 *
 * jquery
 * underscore
 * backbone
 * backbone.iosync
 * backbone.iobind
 */

 // FIXME: keep track of these deps
var vendorJs = new folio.Glossary([
  // path.join(__dirname, '..', 'public', 'js', 'jquery.min.js'),
  // path.join(__dirname, '..', 'vendor', 'backbone.iobind', 'dist', 'backbone.iosync.js'),
  // path.join(__dirname, '..', 'vendor', 'Backbone.Subset', 'backbone.subset.js'),
]);

// serve using express
exports.vendorjs = folio.serve(vendorJs);

