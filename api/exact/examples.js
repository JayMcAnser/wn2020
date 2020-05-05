
/**
 * examples of using exact
 */

/**
 * create an account, adds a contact and returns the promise to save
 * @return {*}
 */
createNewAccount  = () => {

  let account = new Account({name: 'Test one'});
  account.contacts.add({firstName: 'John', name: 'Doe'});
  return account.save();
};

findAccount = function() {
  let account = Account.findOne({name: 'Test one'});
  if (account) {
    let guid = false;
    for (let l = 0; l < account.contacts.length; l++) {
      guid = account.contact[l].id;
      console.log(`id: ${account.contact[l].id}, name: ${account.contact[l].name}`);
    }
    account.contact[l].firstName = 'Jane';
    account.contact[guid].name = 'Strofe';
    return account.save();
  } else {
    return Promise.reject('account not found')
  }
};


testObj = function() {
  let account = {
    contact: [
      {id: 'asa3', name: 'Doe'}
    ]
  };
  account.contact.add = function (name) {
    this.push({name: name})
    // console.log(name, this)
  };
  return account;
};

testDirty = function() {
  let makeDirty = {
    set: function(obj, prop, value) {
      if (obj[prop] !== value) {
        obj.dirty = true;
      }
      obj[prop] = value;
      return true;
    }
  };

  let account = {
    contact: [],
    get isDirty() {
      return this.contact.dirty();
    }
  };

  account.contact.add = function (data) {
    let contact = new Proxy({}, makeDirty);
    this.push(contact);
    Object.assign(contact, data);
  };

  account.contact.deleteByIndex = function(index) {
    if (this._deleted === undefined) {
      this._deleted = [this[index].id]
    } else {
      this._deleted.push(this[index].id)
    }
    this.splice(index, 1)
  };

  account.contact.dirty = function() {
    for (let l = 0; l < this.length; l++) {
      if (this[l].dirty) {
        return true;
      }
    }
    return false;
  };
  // account.contact.isDirty  = {
  //   get: function() {
  //     return this.dirty();
  //   }
  // }

  account.dirtyClear = function() {
    for (let l = 0; l < this.contact.length; l++) {
      this.contact[l].dirty = false;
    }
  };
  return account;
};

module.exports.testObj = testObj;
module.exports.testDirty = testDirty;
