/**
 * Test the group model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const User = require('../model/user');
const Group = require('../model/group');

const Config = require('config');

describe('model.group', () => {

  let user;
  let grpId;

  before( () => {
    return User.deleteMany({}).then(() => {
      return Group.deleteMany({}).then( () => {
        return User.create(testUser).then((u) => {
          user = u
        });
      });
    });
  });

  let testUser = {
    username: 'test of user',
    email: 'grouptest@test.com',
    password: '123456',
    inviteKey: false
  };
  let testGroup = {
    name: 'test group'
  };

  describe('crud', () => {
    it('create', () => {
      return Group.create(testGroup).then( (group) => {
        assert.isDefined(group.id);
        assert.equal(group.name, testGroup.name);
        grpId = group.id;
      });
    });
  });

  describe('users', () => {
    it('add', () => {
      return Group.get(grpId).then((grp) => {
        assert.equal(grp.name, testGroup.name);
        grp.userAdd(user);
        assert.equal(grp.users.length, 1);
        return grp.save();
      });
    });
    it('list', () => {
      return Group.findOne({_id: grpId})
        .populate('users')
        .then( (r) => {
          assert.equal(r.users.length, 1);
          assert.equal(r.users[0].username, testUser.username);
        })
    })
  });

  describe('rights', () => {
    it('set rights', () => {
      return Group.get(grpId).then((grp) => {
        assert.equal(grp.name, testGroup.name);
        grp.rightsAdd('group-test.view', {canView: true});
        return grp.saveRights().then( () => {
          return User.get(user.id).then((usr) => {
            assert.isTrue(usr.canView('group-test.view', 'rights have updated in the user record'))
          })
        });
      });
    });
    it('change rights', () => {
      return Group.get(grpId).then((grp) => {
        assert.equal(grp.name, testGroup.name);
        grp.rightsAdd('group-test.view', {canDelete: true});
        return grp.saveRights().then( () => {
          return User.get(user.id).then((usr) => {
            assert.isTrue(usr.canDelete('group-test.view', 'rights have updated in the user record'))
          })
        });
      });
    });
    it('remove rights', () => {
      return Group.get(grpId).then((grp) => {
        assert.equal(grp.name, testGroup.name);
        grp.rightsAdd('group-test.view', {});
        return grp.saveRights().then( () => {
          return User.get(user.id).then((usr) => {
            assert.isFalse(usr.canDelete('group-test.view', 'rights have updated in the user record'))
          })
        });
      });
    });
  });



});
