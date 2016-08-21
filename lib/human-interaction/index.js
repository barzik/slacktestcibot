'use strict';

var Q = require('q'),
  fileInteraction = require('./../file-interaction'),
  blame = require('./../blame'),
  config = require('./../../testbot-config.json');

function humanInteraction() {

}

humanInteraction.prototype.createInteraction = function(text) {
  var TempArray = text.split(' '),
    objectMap = objectMapping(),
    humanTextArray = [],
    deferred = Q.defer();

  TempArray.forEach(function(word) {
    var sanitizedWord = word.replace(/[^a-z]/gi, '');
    humanTextArray.push(sanitizedWord);
  });

  for (var property in objectMap) {
    if (objectMap.hasOwnProperty(property) && isAllTextIn(objectMap[property], humanTextArray) === true) {
      this.doAction(property).then(function(answer) {
        deferred.resolve(answer);
      });

    }
  }

  return deferred.promise;
};

//Find if array has all the elements in another array

function isAllTextIn(arr, humanTextArray) {
  return arr.every(function(val) { return humanTextArray.indexOf(val) >= 0; });
}

//Sort the response by the action type
humanInteraction.prototype.doAction = function(action) {

  var deferred = Q.defer();
  console.log('Action decided: ' + action);
  switch (action) {
    case 'returnCurrentCoverage':
      fileInteraction.getCoverage().then(function(newFileContent) {
        deferred.resolve(newFileContent);
      });
      break;
    case 'lastCommitter':
      blame.getNameOfLastCommiter(config.repositoryURL).then(function(lastCommitter) {
        deferred.resolve(lastCommitter);
      });
      break;
    case 'howItIsGoing':
      deferred.resolve('Great, thank you! I feel so ALIVE!');
      break;
    case 'ReportLastCommit':
      var lastCommitter = arguments[1],
        originalContentOfFile = arguments[2],
        newFileContent = arguments[3],
        message = '';

      if (!!lastCommitter.name) { //If I have the lastcommitter slack profile
        message += 'Hey <!channel>, <@' + lastCommitter.id + '|' + lastCommitter.name + '> just pushed a commit to the repository.\n';
      } else { //I have just the lastcommitter mail and name
        message += 'Hey <!channel>, ' + lastCommitter.profile.real_name + ' just pushed a commit to the repository.\n';
        message += lastCommitter.profile.real_name + ' Please update your git mail or name to match your slack profile details.\n';
      }

      config.itemReport.forEach(function(value) {
        var originalPercentage, newPercentage, line = '';
        originalPercentage = _extractCoverage(value, originalContentOfFile);
        newPercentage = _extractCoverage(value, newFileContent);

        line = _calculateDiff(value, originalPercentage, newPercentage);
        if (line) {
          message += '\n' + line;
        }
      });


      deferred.resolve(message);
      break;
  }

  return deferred.promise;

};

//action and text mapping

function objectMapping() {
  var obj = {};

  obj.returnCurrentCoverage = ['current', 'coverage'];
  obj.howItIsGoing = ['bot', 'how', 'going'];
  obj.lastCommitter = ['last', 'committer'];

  return obj;

}


function _calculateDiff(name, oldValue, newValue) {

  var diff = (newValue - oldValue).toFixed(2);

  if (diff > 0) {
    return name + ' coverage was increased by ' + diff + '% to ' + newValue + '% ' + addHumanPraise(true);
  }

  if (diff < 0) {
    return name + ' coverage was decreased by ' + diff + '% to ' + newValue + '% ' + addHumanPraise(false);
  }

  if (config.reportOnZero === true) {
    return name + ' coverage is the same. now it is on ' + newValue + '%';
  }

  return false;
}


function _extractCoverage(type, str) {

  var re = new RegExp('(?:' + type + '\\D*)(\\d*\.\\d*%)', 'gmi'),
    matches,
    output = [];

  while (matches = re.exec(str)) {
    output.push(matches[1]);
  }

  if (null === output) {
    return false;
  }

  return parseFloat(output);
}

function addHumanPraise(praise) {
  var array = config.insults;
  if (praise === true) {
    array = config.praises;
  }

  if (array.length === 0) {
    return '';
  }

  return array[Math.floor(Math.random() * array.length)];

}

module.exports = new humanInteraction();
