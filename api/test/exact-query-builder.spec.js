
const init = require('./init');
const chai = require('chai');
const assert = chai.assert;
const QueryBuilder = require('odata-query').default;

describe('exact-query-builder', ()=> {

  it('create', () => {
    let query = QueryBuilder({});
    assert.isDefined(query);
  });

  it('filter', () => {
    let query = QueryBuilder({filter: {LastName: {eq: 'Doe'}}});
    assert.isDefined(query);
    assert.equal(query, '?$filter=LastName eq \'Doe\'')
  })
})
