var git = require('./src/git-last-commit.temp.js'), //@TODO: remove it after git-last-commit will be updated in npm
  Q = require('q')
  deferred = Q.defer();

function blame() {}

blame.prototype.getLastCommiter = function(repositoryURL, userslist) {

  git.getLastCommit(function(err, commit) {
    var authorMail = commit.author.email,
      authorName = commit.author.name,
      members = userslist.members,
      guiltyMember;

    members.forEach(function(member) { //Find user with mail match
      if(!!member.profile.email && member.profile.email === authorMail) {
        guiltyMember = member;
      }
    });

    if(!guiltyMember) { //If there is no mail match, I will try by real name
      members.forEach(function(member) {
        if(!!member.profile.real_name && member.profile.real_name === authorName) {
          guiltyMember = member;
        }
      });
    }

    if(!!guiltyMember) {
      deferred.resolve(guiltyMember);
    } else {
      //I will return the committer known attribute
      deferred.resolve({
        profile: {
          real_name: authorName,
          email: authorMail
        }
      });
    }

  }, {dst: repositoryURL });

  return deferred.promise;
};

module.exports = new blame();

