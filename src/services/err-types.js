/**
 * different errors
 */

export class ErrorNotImplemented extends Error {
  // https://javascript.info/custom-errors
  constructor(message) {
    super(message);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.name = 'ErrorNotImplemented';
  }
}

export class ErrFieldNotFound extends Error {
  constructor(field = 'no name', message= 'not found') {
    super(message);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.type = 'ErrFieldNotFound';
    this.name = field;
  }
}
export class ErrSnapshotNotFound extends ErrFieldNotFound {
  constructor(field = 'no name', message= 'not found') {
    super(message);
    this.type = 'ErrSnapshotNotFound';
  }
}

export class ErrLayoutNotFound extends Error {
  constructor(message) {
    super(`Layout: ${message}`);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.name = 'ErrLayoutNotFound';
  }
}

export class ErrElementExists extends  Error {
  constructor(message) {
    super(`${message}`);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.name = 'ErrElementExists';
  }
}

export class ErrNotAllowed extends Error {
  constructor(message) {
    super(`${message}`);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.name = 'ErrNotAllowed';
  }
}