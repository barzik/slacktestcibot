var expect = require('chai').expect,
  sinon = require('sinon'),
  helper = require('./mocha_helper.js'),
  human,
  file,
  fileStub,
  blame,
  blameStub;

require('sinon-as-promised');

describe('human interaction sub module is working', function() {

  before(function(done){
    helper.createJSONFile().then(function(){
      done();
    });

  });

  beforeEach(function() {
    file = require('./../lib/file-interaction');
    human = require('./../lib/human-interaction');
    blame = require('./../lib/blame');

    blameStub = sinon.stub(blame, 'getNameOfLastCommiter');
    fileStub = sinon.stub(file, 'getCoverage');

  });

  afterEach(function() {

    blameStub.restore();
    fileStub.restore();

  });

  it('should have createInteraction and doAction methods', function() {

    expect(human.createInteraction).to.be.an('function');
    expect(human.doAction).to.be.an('function');

  });

  it('createInteraction with correct words will activate howItIsGoing action', function(done) {

    human.createInteraction('bot, how is it going?').then(function(result) {
      expect(result).to.be.equal('Great, thank you! I feel so ALIVE!');
      done();
    })

  });

  it('createInteraction with correct word will activate lastCommitter action', function(done) {

    blameStub.resolves('DUMMY DATA');

    human.createInteraction('who is the last committer').then(function(result) {
      expect(result).to.be.equal('DUMMY DATA');
      done();
    })

  });

  it('createInteraction with correct word will activate returnCurrentCoverage action', function(done) {

    fileStub.resolves('DUMMY DATA');

    human.createInteraction('what is the current coverage').then(function(result) {
      expect(result).to.be.equal('DUMMY DATA');
      done();
    })

  });

  it('doAction with ReportLastCommit, lastCommitter by ID will return message as expected', function(done) {

  var originalContent = 'Statements   : 37.20% ( 2855/7679 )Branches     : 24.63% ( 652/2645 )Functions    : 28.84% ( 652/2261 )Lines        : 40.25% ( 2854/7662 )   ',
    newFileContent = 'Statements   : 38.20% ( 2855/7679 )Branches     : 25.63% ( 652/2645 )Functions    : 29.84% ( 652/2261 )Lines        : 41.25% ( 2854/7662 )   ';

    human.doAction('ReportLastCommit', {id: 'abc', name: 'def'}, originalContent, newFileContent).then(function(result) {
      expect(result).to.be.include('Hey <!channel>, <@abc|def> just pushed a commit to the repository.');
      expect(result).to.be.include('Lines coverage was increased by 1.00% to 41.25%');
      expect(result).to.be.include('Statements coverage was increased by 1.00% to 38.2%');
      expect(result).to.be.include('Branches coverage was increased by 1.00% to 25.63%');
      expect(result).to.be.include('Functions coverage was increased by 1.00% to 29.84%');

      done();
    })

  });

  it('doAction with ReportLastCommit, lastCommitter by mail only will return message as expected', function(done) {

  var originalContent = 'Statements   : 37.20% ( 2855/7679 )Branches     : 24.63% ( 652/2645 )Functions    : 28.84% ( 652/2261 )Lines        : 40.25% ( 2854/7662 )   ',
    newFileContent = 'Statements   : 38.20% ( 2855/7679 )Branches     : 25.63% ( 652/2645 )Functions    : 29.84% ( 652/2261 )Lines        : 41.25% ( 2854/7662 )   ';

    human.doAction('ReportLastCommit', {profile : {real_name: 'ghk'}}, originalContent, newFileContent).then(function(result) {
      expect(result).to.be.include('Hey <!channel>, ghk just pushed a commit to the repository.');
      expect(result).to.be.include('ghk Please update your git mail or name to match your slack profile details.');
      expect(result).to.be.include('Lines coverage was increased by 1.00% to 41.25%');
      expect(result).to.be.include('Statements coverage was increased by 1.00% to 38.2%');
      expect(result).to.be.include('Branches coverage was increased by 1.00% to 25.63%');
      expect(result).to.be.include('Functions coverage was increased by 1.00% to 29.84%');

      done();
    })

  });

  it('doAction with ReportLastCommit will return message with decrease as expected', function(done) {

  var originalContent = 'Statements   : 38.20% ( 2855/7679 )Branches     : 25.63% ( 652/2645 )Functions    : 29.84% ( 652/2261 )Lines        : 41.25% ( 2854/7662 )   '
    newFileContent = 'Statements   : 37.20% ( 2855/7679 )Branches     : 24.63% ( 652/2645 )Functions    : 28.84% ( 652/2261 )Lines        : 40.25% ( 2854/7662 )   ';

    human.doAction('ReportLastCommit', {id: 'abc', name: 'def'},  originalContent, newFileContent).then(function(result) {
      expect(result).to.be.include('Hey <!channel>, <@abc|def> just pushed a commit to the repository.');
      expect(result).to.be.include('Lines coverage was decreased by -1.00% to 40.25%');
      expect(result).to.be.include('Statements coverage was decreased by -1.00% to 37.2%');
      expect(result).to.be.include('Branches coverage was decreased by -1.00% to 24.63%');
      expect(result).to.be.include('Functions coverage was decreased by -1.00% to 28.84%');
      done();
    })

  });

  it('doAction with ReportLastCommit will return message with no change as expected', function(done) {

    var originalContent = 'Statements   : 38.20% ( 2855/7679 )Branches     : 25.63% ( 652/2645 )Functions    : 29.84% ( 652/2261 )Lines        : 41.25% ( 2854/7662 )   ';

    human.doAction('ReportLastCommit', {id: 'abc', name: 'def'},  originalContent, originalContent).then(function(result) {
      expect(result).to.be.include('Hey <!channel>, <@abc|def> just pushed a commit to the repository.');
      expect(result).to.be.include('Lines coverage is the same. now it is on 41.25%');
      expect(result).to.be.include('Statements coverage is the same. now it is on 38.2%');
      expect(result).to.be.include('Branches coverage is the same. now it is on 25.63%');
      expect(result).to.be.include('Functions coverage is the same. now it is on 29.84%');
      done();
    })


  });


});