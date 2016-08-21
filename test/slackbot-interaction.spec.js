var expect = require('chai').expect,
  sinon = require('sinon'),
  helper = require('./mocha_helper.js'),
  human,
  file,
  fileStub,
  blame,
  blameStub,
  slackbots,
  slackbotsStub,
  slackbotInteraction,
  mockBot;

require('sinon-as-promised');

describe('slackbot interaction sub module is working', function() {

  before(function(done){
    helper.createJSONFile().then(function(){
      done();
    });



  });

  beforeEach(function() {
    file = require('./../lib/file-interaction');
    human = require('./../lib/human-interaction');
    slackbotInteraction = require('./../lib/slackbot-interaction');
    blame = require('./../lib/blame');
    slackbots = require('slackbots');
    mockBot = sinon.createStubInstance(slackbots);

    blameStub = sinon.stub(blame, 'getNameOfLastCommiter');
    fileStub = sinon.stub(file, 'getCoverage');
    //slackbotsStub = sinon.stub(mockBot, 'on');
    //sinon.mock(slackbots)
    //  .expects('on')
    //  .resolves({});

  });

  afterEach(function() {

    blameStub.restore();
    fileStub.restore();
    //slackbotsStub.restore();

  });

  it('should have init methods', function() {

    expect(slackbotInteraction.init).to.be.an('function');

  });

  //it('on start is activated ', function() {
  //
  //  slackbotInteraction.init();
  //
  //  mockBot.on('message', function(){});
  //
  //  expect(slackbotInteraction.init).to.be.an('function');
  //
  //});



});