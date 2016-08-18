var fs = require('fs'),
  Q = require('q');

function mochaHelper() {}

mochaHelper.prototype.createJSONFile = function() {
  var deferred = Q.defer(),
    rd,
    wr;
  if (!fs.existsSync('testbot-config.json')) {

    rd = fs.createReadStream('testbot-config.json.sample');
    rd.on("error", function(err) {
      deferred.reject(err);
    });
    wr = fs.createWriteStream('testbot-config.json');
    wr.on("error", function(err) {
      deferred.reject(err);
    });

    wr.on('close',function(){ //waits for data to be consumed
      deferred.resolve();
    });


    rd.pipe(wr);
  } else {
    deferred.resolve();
  }


  return deferred.promise;
};


module.exports = new mochaHelper();