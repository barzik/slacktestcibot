var SlackBot = require('slackbots'),
  config = require('./testbot-config.json'),
  blame = require('./lib/blame'),
  chokidar = require('chokidar'),
  humanInteraction = require('./lib/human-interaction'),
  fileInteraction = require('./lib/file-interaction'),
  fs = require('fs'),
  filePath = config.karmaCoverFileLocation,
  originalContentOfFile = fs.readFileSync(filePath, "utf8"),
  bot,
  botParams,
  defaultChannelId,
  defaultChannel = config.defaultChannel || 'general',
  introduction = config.introduction || 'I am ready';

// create a bot 
bot = new SlackBot({
  token: config.token, // Add a bot https://my.slack.com/services/new/bot and put the token
  name: config.name
});

botParams = {
  icon_emoji: config.icon_emoji
};

bot.on('message', function(data) {
  // all ingoing events https://api.slack.com/rtm
  if(data.type === 'message' && data.channel === defaultChannelId && data.subtype !== 'bot_message') {
    console.log('Bot Got message ' + data.text);
    humanInteraction.createInteraction(data.text).then(function(answer){
      bot.postMessageToChannel(defaultChannel, answer, botParams);
    });
  }

});

bot.on('start', function() {

  console.log('Bot Started');
  // more information about additional params https://api.slack.com/methods/chat.postMessage
  var watcher = chokidar.watch(filePath, {awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }});

  bot.getChannelId(defaultChannel).then(function(id){
    console.log('Channel id detected: '+ id);
    defaultChannelId = id;
  });

  bot.postMessageToChannel(defaultChannel, introduction, botParams).then(function() {
    console.log('Posted introduction');
  });

  watcher.on('change', function() {
    console.log('Change in coverage file detected');
    var message = '';

    fileInteraction.getCoverage().then(function(newFileContent){

      bot.getUsers()
        .then(function(usersList) {
          return blame.getLastCommiter(config.repositoryURL, usersList)
        })
        .then(function(lastCommitter) {
          if(!!lastCommitter.name) { //If I have the lastcommitter slack profile
            message += 'Hey <!channel>, <@'+ lastCommitter.id+ '|' + lastCommitter.name + '> just pushed a commit to the repository.\n';
          } else { //I have just the lastcommitter mail and name
            message += 'Hey <!channel>, ' + lastCommitter.profile.real_name + ' just pushed a commit to the repository.\n';
            message += lastCommitter.profile.real_name + ' Please update your git mail or name to match your slack profile details.\n';
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

          bot.postMessageToChannel(defaultChannel, message, botParams).then(function() {
            console.log('Posted message after coverage report alert.');
          });
          originalContentOfFile = newFileContent;
        })


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