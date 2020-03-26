
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const _ = require('lodash');

const FieldSchema = {
  def: {  // the name in the FieldMap
    type: String,
//    required: true
  },
  string: String,
  boolean: Boolean,
  number: Number,
  date: Date,
  related: {
    type: Schema.Types.ObjectId,
    // ref: 'Address'
    refPath: '_fields.onModel'
    //ref: 'Art'
  },
  onModel: {
    type: String,
    enum: ['Address', 'Art', 'Carrier', 'Agent', 'Distribution', 'Test']
  },
};


const FlexModel = {
  /**
   * create an basic FlexModel
   * @param typeName String name registered in Mongoose
   * @param data Object The list of {fieldName: value}
   * @return Model unsaved model
   */
  create(typeName, data) {
    let typeClass = Mongoose.Model(typeName);
    let type = new typeClass({ _fields: []});
    type.objectSet(data);
    return type;
  },


  objectSet: function(parent, FieldMap, data) {
    let fieldIndexs = {};
    if (parent._fields !== undefined) {
      for (let l = parent._fields.length - 1; l >= 0;  l--) {
        let name = parent._fields[l].def;
        if (data[name] === undefined) {
          if (data.hasOwnProperty(name) && FieldMap.hasOwnProperty(name)) {
            parent._fields.splice(l, 1);  // remove data not available but prop exist
          }
        } else {
          fieldIndexs[name] = l; // remember index
        }
      }
    } else {
      parent._fields = [];
    }
    for (let key in data) {
      if (!data.hasOwnProperty(key)) { continue }
      if (fieldIndexs[key] === undefined && FieldMap.hasOwnProperty(key)) {
        if (data[key]) {
          let obj = {def: key, [FieldMap[key].type]: data[key]};
          if (FieldMap[key].model) {
            obj.onModel = FieldMap[key].model;
          }
          parent._fields.push(obj);
        }
      } else if(FieldMap.hasOwnProperty(key)) {
        parent._fields[fieldIndexs[key]][FieldMap[key].type] = data[key]; // update the field
        //    parent._fields[fieldIndexs[key]].onModel = FieldMap[key].model;
      } else if (data[key] !== undefined) { // put it on the base record if not an empty value
        parent[key] = data[key];
        if (parent.markModified) {
          parent.markModified(key);
        }
      }
    }
  },

  _calcFields: function(FieldMap, data, calcIndexes = []) {
    for (let key in FieldMap) {
      if (!FieldMap.hasOwnProperty(key)) {
        continue
      }
      if (FieldMap[key].calc) {
        let d = FieldMap[key].calc(data, this);
        if (d !== undefined) {
          data[key] = d
        }
      }
    }
    return data;
  },

  objectGet: function(record, FieldMap, path = '/', options = {}) {
    if (options.rootType === undefined) {
      options.rootType = record.constructor;
    }
    let result = {};
    // fill the fields that are stored in the _fields definition
    if (FieldMap) {
      for (let l = 0; l < record._fields.length; l++) {
        let name = record._fields[l].def;
        if (FieldMap[name].model && record._fields[l][FieldMap[name].type].objectGet !== undefined) {
          // the _field related, so the field will become an object
          // WHY: no record and FieldMap???
          result[name] = record._fields[l][FieldMap[name].type].objectGet();
        } else {
          // the plain value
          result[name] = record._fields[l][FieldMap[name].type];
        }
      }
    }
    let fields = record.toObject ? record.toObject() : record;
    for (let fieldName in fields) {
      if (!fields.hasOwnProperty(fieldName) || fieldName[0] === '_') {
        continue
      }
      if (Array.isArray(fields[fieldName])) {
        // let Model = record.constructor;
        // let subFieldMap = Model.relations ? Model.relations()[fieldName] : undefined;
        let subFieldMap = options.rootType.relations ? options.rootType.relations()[[path, fieldName].join('/')] : undefined;
        if (subFieldMap && fields[fieldName].length) {
          result[fieldName] = [];
          for (let l = 0; l < fields[fieldName].length; l++) {
            let item = fields[fieldName][l];
            let r = this.objectGet(item, subFieldMap, [path, fieldName].join('/'), options);
            result[fieldName].push(r);
          }
        }
      } else if (typeof fields[fieldName] === 'object') {
        let subFieldMap = options.rootType.relations ? options.rootType.relations()[[path, fieldName].join('/')] : undefined;
        let d = this.objectGet(fields[fieldName], subFieldMap,  [path, fieldName].join('/'), options);
        if (Object.keys(d).length > 0) {
          result[fieldName] = d
        }
      } else {
        result[fieldName] = fields[fieldName];
      }
    }
    return result;
   // let paths = record._doc;
//
//     result = this._calcFields(FieldMap, result);
//     for (let key in paths) {
//       if (paths.hasOwnProperty(key) && key[0] !== '_') {
//         if (typeof parent[key] === 'object') {  // it's an array so probably an embedded document
//           // this is at the wrong place. We are looking at the array not at the element!!!!
//           let Model = parent.constructor;
//           let subFieldMap = Model.relations ? Model.relations()[key]  : undefined;
//           if (subFieldMap && parent[key].length) {
//             result[key] = [];
//             for (let l = 0; l < parent[key].length; l++) {
//               let d = this.objectGet( parent[key][l], subFieldMap);
//               result[key].push(d);
// //                 console.log(d)
//             }
//           }
//         } else {
//           result[key] = parent[key];
//         }
//       }
//     }

  },

  objectGetOld: function(parent, FieldMap, fieldNames = []) {
    if (parent._fields === undefined || parent._fields.length === 0) {
      parent._fields = [];
    }
    let result = {};
    let paths = parent._doc;
    if  (fieldNames.length === 0) {
      for (let l = 0; l < parent._fields.length; l++) {
        // result[parent._fields[l].def] = parent._fields[l].text;
        let name = parent._fields[l].def;
        if (FieldMap[name].model && parent._fields[l][FieldMap[name].type].objectGet !== undefined) {
          result[name] = parent._fields[l][FieldMap[name].type].objectGet();
        } else {
          result[name] = parent._fields[l][FieldMap[name].type];
        }
      }
      result = this._calcFields(FieldMap, result);
      for (let key in paths) {
        if (paths.hasOwnProperty(key) && key[0] !== '_') {
          if (typeof parent[key] === 'object') {  // it's an array so probably an embedded document
            // this is at the wrong place. We are looking at the array not at the element!!!!
            let Model = parent.constructor;
            let subFieldMap = Model.relations ? Model.relations()[key]  : undefined;
            if (subFieldMap && parent[key].length) {
              result[key] = [];
              for (let l = 0; l < parent[key].length; l++) {
                let d = this.objectGet( parent[key][l], subFieldMap);
                result[key].push(d);
//                 console.log(d)
              }
            }
          } else {
            result[key] = parent[key];
          }
        }
      }
    } else {
      for (let l = 0; l < parent._fields.length; l++) {
        let name = parent._fields[l].def;
        if (fieldNames.indexOf(name) >= 0) {
          result[name] = parent._fields[l][FieldMap[name].type];//parent._fields[l].text;
        }
      }
      for (let key in paths) {
        if (paths.hasOwnProperty(key) && key[0] !== '_' && (fieldNames.indexOf(key) >= 0)) {
          result[key] = parent[key];
        }
      }
    }
    return result;
  }

};

module.exports = FlexModel;
module.exports.FieldSchema = FieldSchema;
