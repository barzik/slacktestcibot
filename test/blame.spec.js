var expect = require('chai').expect,
  sinon = require('sinon'),
  blame = require('./../lib/blame'),
  git = require('git-last-commit'),
  gitStub,
  mockUserList;

describe('Blame sub module is working', function() {
  beforeEach(function() {
    mockUserList = {members : [
      {
        profile : { real_name: 'abc', email: 'abc@abc.com'}
      },
      {
        profile : { real_name: 'def', email: 'def@def.com'}
      },
      {
        profile : { real_name: 'ghi', email: 'ghi@ghi.com'}
      }
    ]};

    gitStub = sinon.stub(git, 'getLastCommit');

  });

  afterEach(function() {

    gitStub.restore();

  });

  it('should have getLastCommiter and getNameOfLastCommiter methods', function() {

    expect(blame.getLastCommiter).to.be.an('function');
    expect(blame.getNameOfLastCommiter).to.be.an('function');

  });

  it('should getLastCommiter return committer with matched name', function(done) {

    gitStub.yields(null, {author : { email: '', name: 'abc'}});

    blame.getLastCommiter('fakePath', mockUserList).then(function(result) {
      expect(gitStub.args[0][1].dst).to.be.equal('fakePath');
      expect(result.profile.real_name).to.be.equal('abc');
      expect(result.profile.email).to.be.equal('abc@abc.com');
      done();
    })

  });

  it('should getLastCommiter return committer with matched email', function(done) {
    gitStub.yields(null, {author : { email: 'abc@abc.com', name: ''}});

    blame.getLastCommiter('fakePath', mockUserList).then(function(result) {
      expect(gitStub.args[0][1].dst).to.be.equal('fakePath');
      expect(result.profile.real_name).to.be.equal('abc');
      expect(result.profile.email).to.be.equal('abc@abc.com');
      done();
    })

  });

  it('should getLastCommiter return committer with email as name', function(done) {
    gitStub.yields(null, {author : { email: '', name: 'SomeName <abc@abc.com>'}});

    blame.getLastCommiter('fakePath', mockUserList).then(function(result) {
      expect(gitStub.args[0][1].dst).to.be.equal('fakePath');
      expect(result.profile.real_name).to.be.equal('abc');
      expect(result.profile.email).to.be.equal('abc@abc.com');
      done();
    })

  });

  it('should getLastCommiter return commit data if commit is not in users list', function(done) {
    gitStub.yields(null, {author : { email: 'xyz@xyz.com', name: 'xyz'}});

    blame.getLastCommiter('fakePath', mockUserList).then(function(result) {
      expect(gitStub.args[0][1].dst).to.be.equal('fakePath');

      expect(result.profile.real_name).to.be.equal('xyz');
      expect(result.profile.email).to.be.equal('xyz@xyz.com');
      done();
    })

  });

  it('should getNameOfLastCommiter return last committer', function(done) {
    gitStub.yields(null, {author : { email: 'abc@abc.com', name: 'abc'}});

    blame.getNameOfLastCommiter('fakePath').then(function(result) {
      expect(gitStub.args[0][1].dst).to.be.equal('fakePath');
      expect(result).to.be.equal('the name is abc and the mail is abc@abc.com');
      done();
    })

  });




});