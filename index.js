var config = require('./testbot-config.json'),
  botInteraction;

//TODO: In the future there will be more services, remove the true flag then.
if(!!config.bot === 'slack' || true) {
  botInteraction = require('./lib/slackbot-interaction');
}


botInteraction.init();

