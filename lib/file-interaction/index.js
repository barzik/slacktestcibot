'use strict';

var Q = require('q'),
  fs = require('fs'),
  config = require('./../../testbot-config.json');

var filePath = config.karmaCoverFileLocation;


function fileInteraction() {}

fileInteraction.prototype.getCoverage = function() {
  var deferred = Q.defer();
  fs.readFile(filePath, 'utf8', function(err, newFileContent) {
    deferred.resolve(newFileContent);
  });

  return deferred.promise;

};

module.exports = new fileInteraction();
