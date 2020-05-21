/**
 * helper function for import data
 *
 */
const Logging = require('../lib/logging');
/**
 * import a value or a function result
 *
 * @param rec
 * @param part
 * @return {Promise<string|undefined>}
 */
const recordValue = async (rec, part, mongoRec = false) => {
  let result;
  if (typeof part === 'string') {
    result = rec[part]
  } else if (typeof part === 'function') {
    result = await part(rec, mongoRec);
  } else {
    Logging.warn(`unknown part type: ${typeof part}`);
    return undefined;
  }
  if (typeof result === 'string') {
    result = result.trim();
  }
  if (result === undefined || result === null || result.length === 0) {
    return undefined;
  }
  return result;
};



function makeNumber(str) {
  if (str && typeof str === 'string') {
    if (str.indexOf('.') >= 0) {
      return parseFloat(str) * 100
    }
    if (str.indexOf(',') >= 0) {
      return parseFloat(str.replace(',', '.')) * 100
    }
    return parseInt(str) * 100;
  }
  if (typeof str === 'number') {
    return Math.ceil(str * 100);
  }
  return undefined
}

function makeLength(str) {
  return str;
}


function insertField(text, label, group, mongoRec, fieldName) {
  if (text !== undefined) {
    let rec = {
      label: label,
      group: group
    };
    if (typeof text === 'string') {
      text = text.trim();
      if (text.length === 0) {
        return undefined
      }
      rec.text = text;
    } else if (typeof text === 'boolean') {
      if (!text) { // false is not stored!!!!
        return undefined;
      }
      rec.bool = !! text;
    } else if (typeof text === 'number') {
      rec.number = text;
    }
    if (mongoRec[fieldName] === undefined) {
      mongoRec[fieldName] = []
    }
    mongoRec[fieldName].push(rec);
  }
  return undefined;
}

function stepStart(type) {

}
function step(count) {
  let rotate = ['|','/','-','\\'];
  process.stdout.write(`${rotate[count % 4]} ${count}\r`);
}

function stepEnd(type) {
  process.stdout.write('\r');
}

module.exports.recordValue = recordValue;
module.exports.makeNumber = makeNumber;
module.exports.makeLength = makeLength;
module.exports.insertField = insertField;
module.exports.step = step;
module.exports.stepEnd = stepEnd;
module.exports.stepStart = stepStart;
