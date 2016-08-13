
var expect = require('chai').expect;
var process = require('child_process');
var sinon = require('sinon');
var bot = require('../index.js');
var SlackBot = require('slackbots');
var slackbot

describe('bot on is sending the correct paramters', function() {
  beforeEach(function() {
    //var token =   sinon.stub('config', 'token');
    //var name =   sinon.stub('config', 'name');
    slackbot =   sinon.createStubInstance(SlackBot);

  });

  afterEach(function() {

  });

  it('should send config parameters', function(done) {
    sinon.assert.called(slackbot)
    expect( sinon.assert.called(slackbot)).to.be.equal(1)
  });




});