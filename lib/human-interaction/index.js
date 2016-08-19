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
    var sanitizedWord = word.replace(/[^a-z]/gi,'');
    humanTextArray.push(sanitizedWord);
  });

  for (var property in objectMap){
    if (objectMap.hasOwnProperty(property) && isAllTextIn(objectMap[property], humanTextArray) === true) {
      this.doAction(property).then(function(answer){
        deferred.resolve(answer);
      });

    }
  }

  return deferred.promise;
};

//Find if array has all the elements in another array

function isAllTextIn(arr, humanTextArray) {
  return arr.every(function (val) { return humanTextArray.indexOf(val) >= 0; });
}

//Sort the response by the action type
humanInteraction.prototype.doAction = function (action) {

  var deferred = Q.defer();
  console.log('Action decided: '+ action);
  switch (action) {
    case 'returnCurrentCoverage':
      fileInteraction.getCoverage().then(function(newFileContent){
        deferred.resolve(newFileContent);
      });
      break;
    case 'lastCommitter':
      blame.getNameOfLastCommiter(config.repositoryURL).then(function(lastCommitter){
        deferred.resolve(lastCommitter);
      });
      break;
    case 'howItIsGoing':
      deferred.resolve('Great, thank you! I feel so ALIVE!');
      break;
  }

  return deferred.promise;

}

//action and text mapping

function objectMapping() {
  var obj = {};

  obj.returnCurrentCoverage = ['current', 'coverage'];
  obj.howItIsGoing = ['bot', 'how', 'going'];
  obj.lastCommitter = ['last', 'committer'];

  return obj;

}

module.exports = new humanInteraction();