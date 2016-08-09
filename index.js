var SlackBot = require('slackbots'),
  config = require('./testbot-config.json'),
  chokidar = require('chokidar'),
  fs = require('fs'),
  filePath = config.karmaCoverFileLocation,
  originalContentOfFile = fs.readFileSync(filePath, "utf8"),
  bot;

// create a bot 
bot = new SlackBot({
  token: config.token, // Add a bot https://my.slack.com/services/new/bot and put the token
  name: config.name
});


bot.on('start', function() {
  // more information about additional params https://api.slack.com/methods/chat.postMessage
  var params = {
      icon_emoji: config.icon_emoji
    },
    watcher = chokidar.watch(filePath, {awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }});


  bot.postMessageToChannel('general', 'I am ready!', params);

  watcher.on('change', function() {

    var message = '';

    fs.readFile(filePath, 'utf8', function(err, newFileContent) {

      if (err) throw err;
      if('' == newFileContent) {
        console.error('file was empty');
        return;
      }

      config.itemReport.forEach(function(value){
        var originalPercentage, newPercentage,  line = '';
        originalPercentage = _extractCoverage(value, originalContentOfFile);
        newPercentage = _extractCoverage(value, newFileContent);

        line = _calculateDiff(value, originalPercentage, newPercentage);
        if(line) {
          message += '\n' + line;
        }
      });

      bot.postMessageToChannel('general', message, params);
      originalContentOfFile = newFileContent;

    });

  });

});


function _calculateDiff(name, oldValue, newValue) {

  var diff = (newValue - oldValue).toFixed(2);

  if(diff > 0) {
    return name + ' coverage was increased by ' + diff + '% to ' + newValue + '% ' + addHumanPraise(true);
  }

  if(diff < 0) {
    return name + ' coverage was decreased by ' + diff + '% to ' + newValue + '% ' + addHumanPraise(false);
  }

  if(config.reportOnZero === true) {
    return name + ' coverage is the same. now it is on ' + newValue + '%';
  }

  return false;
}


function _extractCoverage(type, str) {

  var re = new RegExp('(?:' + type + '\\D*)(\\d*\.\\d*%)','gmi'),
    matches,
    output = [];

  while (matches = re.exec(str)) {
    output.push(matches[1]);
  }

  if(null === output) {
    return false;
  }

  return parseFloat(output);
}

function addHumanPraise(praise) {
  var array = config.insults;
  if(praise === true) {
    array = config.praises;
  }

  if(array.length === 0) {
    return '';
  }

  return array[Math.floor(Math.random()*array.length)];

}