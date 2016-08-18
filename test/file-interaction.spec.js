var expect = require('chai').expect,
  sinon = require('sinon'),
  helper = require('./mocha_helper.js'),
  file,

  fs = require('fs'),
  fsStub;

describe('Blame sub module is working', function() {

  before(function(done){
    helper.createJSONFile().then(function(){
      done();
    });

  });

  beforeEach(function() {
    file = require('./../lib/file-interaction');

    fsStub = sinon.stub(fs, 'readFile');

  });

  afterEach(function() {

    fsStub.restore();

  });

  it('should have getCoverage methods', function() {

    expect(file.getCoverage).to.be.an('function');

  });

  it('should getCoverage return data', function(done) {

    fsStub.yields(null, 'dataOfMfile');

    file.getCoverage().then(function(result) {
      expect(result).to.be.equal('dataOfMfile');
      done();
    })

  });




});