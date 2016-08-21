'use strict';

var SlackBot = require('slackbots'),
  config = require('./../../testbot-config.json'),
  blame = require('./../blame'),
  chokidar = require('chokidar'),
  humanInteraction = require('./../human-interaction'),
  fileInteraction = require('./../file-interaction'),
  fs = require('fs');

var filePath = config.karmaCoverFileLocation,
  originalContentOfFile = fs.readFileSync(filePath, 'utf8'),
  bot,
  botParams,
  defaultChannelId,
  defaultChannel = config.defaultChannel || 'general',
  introduction = config.introduction || 'I am ready';


function slackBotInteraction() {}

slackBotInteraction.prototype.init = function() {

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
    if (data.type === 'message' && data.channel === defaultChannelId && data.subtype !== 'bot_message') {
      console.log('Bot Got message ' + data.text);
      humanInteraction.createInteraction(data.text).then(function(answer) {
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

    bot.getChannelId(defaultChannel).then(function(id) {
      console.log('Channel id detected: ' + id);
      defaultChannelId = id;
    });

    bot.postMessageToChannel(defaultChannel, introduction, botParams).then(function() {
      console.log('Posted introduction');
    });

    watcher.on('change', function() {
      console.log('Change in coverage file detected');
      var newFileContent = '';

      fileInteraction.getCoverage()
        .then(function(_newFileContent) {
          newFileContent = _newFileContent;
          return bot.getUsers();
        })
        .then(function(usersList) {
          return blame.getLastCommiter(config.repositoryURL, usersList);
        })
        .then(function(lastCommitter) {
          return humanInteraction.doAction('ReportLastCommit', lastCommitter, originalContentOfFile, newFileContent);
        })
        .then(function(message) {
          bot.postMessageToChannel(defaultChannel, message, botParams).then(function() {
            console.log('Posted message after coverage report alert.');
          });
          originalContentOfFile = newFileContent;
        });

    });

  });


};

module.exports = new slackBotInteraction();
