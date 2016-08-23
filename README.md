# Slack CI Test bot

[![Build Status](https://travis-ci.org/barzik/slacktestcibot.svg?branch=master)](https://travis-ci.org/barzik/slacktestcibot)     [![Dependency Status](https://gemnasium.com/badges/github.com/barzik/slacktestcibot.svg)](https://gemnasium.com/github.com/barzik/slacktestcibot)


Slack CI Test bot is a bot for sending karma coverage report format data to team's slack account.
The bot will monitor the changes in the karma coverage report file and will notify on the general channel about
the changes with additional.

## Setup

* Copy testbot-config.json.sample to testbot-config.json
* Insert the slack API token in the proper place in the testbot-config.json.
You can get the API from https://YOUR-TEAM.slack.com/services/new/bot
* Insert the location of your karma cover report to karmaCoverFileLocation. 
The karma cover report must be made by karma runner preprocessor and made in text-summary format.
For more information, see [Karma Coverage](https://github.com/karma-runner/karma-coverage) documentation.
* Insert the location of your git repository to repositoryURL. Slackbot will use it to determine who
* Change the options if you need any further customization.
    * name - the name of the bot
    * icon_emoji - The emoji of the bot.
    * itemReport - The information to report about (for example, only Line coverage, etc.).
    * reportOnZero  - Do not report on items that thier coverage did not changed.
    * insults - Array of insults to say when coverage is down. 
    * praises - Array of praises to say when coverage is up.
    * defaultChannel - where to post (default - general).
    * introduction - The intro line that the bot say when he is initiated.
* run by `node index.js`.

## Test

Use Mocha for unit tests. Run `npm test` to run the test.
 
### Coverage

 Coverage done by Istanbul. Run `npm run coverage` to get coverage report.

### Static code analysis

Done with ESLint. Run `npm run eslint` to do static code analysis check.
 

 
## Version
 
 Version 0.01
