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

  it('should have createInteraction methods', function() {

    expect(human.createInteraction).to.be.an('function');

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


});