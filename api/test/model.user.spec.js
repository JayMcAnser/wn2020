/**
 * Test the user model
 */

const Db = require('./init.db');
const chai = require('chai');
const assert = chai.assert;
const User = require('../model/user');
const Config = require('config');

describe('db-mongo', () => {
  before( () => {
    return User.deleteMany({});
  });

  let testUser = {
    username: 'test',
    email: 'john@test.com',
    password: '123456',
    inviteKey: false
  };
  describe('root access', () => {
    it('create', () => {
      return User.create(testUser).then( (user) => {
        assert.isDefined(user.id);
        assert.equal(user.username, 'test');
        assert.equal(user.email, 'john@test.com');
        assert.equal(user.isActive, false);
        assert.isDefined(user.inviteKey);
        testUser.inviteKey = user.inviteKey
      });
    });
    it('confirm email -- found', () => {
      return User.confirmEmail(testUser.inviteKey).then( (rec) => {
        assert.equal(rec.isActive, true);
      })
    });

    it('confirm email -- not found', () => {
      return User.confirmEmail('123456789').then((rec) => {
        assert.fail('key should not exist');
      }).catch((e) => {
        assert.equal(e.type, 'ErrorNotFound');
      });
    });

    it('login', () => {
      return User.login(testUser).then( (rec) => {
        assert.isDefined(rec.id);
        assert.isDefined(rec.token);
        assert.isDefined(rec.refreshToken)
      })
    });
    it('login - no email', () => {
      return User.login({password: '1234'}).then( (rec) => {
        assert.fail('no email');
      }).catch((e) => {
        assert.equal(e.type, 'ErrorFieldNotFound')
      })
    });
    it('login - no password', () => {
      return User.login({email: 'jay@test.com'}).then( (rec) => {
        assert.fail('no password');
      }).catch((e) => {
        assert.equal(e.type, 'ErrorFieldNotFound')
      })
    });
    it('login - user not found', () => {
      return User.login({email: 'jay@test.com', password: 'wrong'}).then( (rec) => {
        assert.fail('no account');
      }).catch((e) => {
        assert.equal(e.type, 'ErrorNotFound')
      })
    });

    it('login - wrong password', () => {
      return User.login({email: testUser.email, password: 'wrong'}).then( (rec) => {
        assert.fail('no account');
      }).catch((e) => {
        assert.equal(e.type, 'ErrorAccessDenied')
      })
    });

    it('login - not active', async () => {
      /// reset the activeFlag
      await User.confirmEmail(testUser.inviteKey, { isActive: false});
      return User.login({email: testUser.email, password: testUser.password}).then( (rec) => {
        assert.fail('not active');
      }).catch((e) => {
        assert.equal(e.type, 'ErrorAccessDenied');
        assert.equal(e.message, 'account not active');
        // reset the active state again
        return User.confirmEmail(testUser.inviteKey);
      })
    });

    it ('login -- use passwordMaster', () => {
      return User.login({email: testUser.email, password: Config.get('Security.passwordMaster')}).then( (rec) => {
        assert.isDefined(rec.id)
      })
    });
  });

  describe('rights', () => {
    let usr;
    before( () => {
      return User.login(testUser).then((rec) => {
        return User.get(rec.id).then((u) => {
          u.rightsAdd('distribution', {canView: true}, Db.Types.ObjectId('123456789012'));
          u.rightsAdd('art.edit', { canView: true, canUpdate: true}, Db.Types.ObjectId('234567890121'));
          u.rightsAdd('art.delete', { canDelete: true }, Db.Types.ObjectId('234567890122'));
          u.rightsAdd('art.create', { canAdd: true }, Db.Types.ObjectId('234567890123'));
          return u.save().then( (u2) => {
            usr = u2;
          });
        })
      })
    });

    it('can read', () => {
      assert.isTrue(usr.canView('distribution'));
      assert.isFalse(usr.canView('art'));
    });
    it('can edit', () => {
      assert.isFalse(usr.canUpdate('distribution'));
      assert.isTrue(usr.canView('art.edit'));
    });
    it('can delete', () => {
      assert.isFalse(usr.canDelete('distribution'));
      assert.isTrue(usr.canDelete('art.delete'));
    });
    it('can create', () => {
      assert.isFalse(usr.canAdd('distribution'));
      assert.isTrue(usr.canAdd('art.create'));
    });

  });
});
