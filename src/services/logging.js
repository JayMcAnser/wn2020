/**
 * Logging information to the console or to the server for debug purpose
 *
 * version 0.0.1 2020-01-21 JvK
 */

class Logger {

  /**
   * change params so we can say:
   *     log('it good', {id: 24, more: test}, 'logger.info');
   * but also
   *     log('it good', 'logger.info');
   *
   * The last param is alway where
   * @param message
   * @param params
   * @param where
   * @return {{where: *, message: *}|{where: *, message: *, params: *}}
   * @private
   */
  _packParams(message, params, where) {
    if (where !== undefined) {
      return {message: message, where: `[${where}] `, params: JSON.stringify(params)}
    } else {
      return {message: message, where: params === undefined ? undefined : `[${where}] `}
    }
  }

  _log(what, packed) {
    if (process.env.DEBUG) {
      console[what](`${packed.where}${packed.message} ${packed.params}`)
    }
  }
  /**
   * log information to the console
   * @param message string message the message to display
   * @param params any params the optional params. If ommited the where
   * @param where string the location of the message (with dots) or empty
   */
  info(message, params, where) {
    this._log('info', this._packParams(message, params, where));
  }
  log(message, params, where) {
    this._log('log', this._packParams(message, params, where));
  }
  warn(message, params, where) {
    this._log('warn', this._packParams(message, params, where));
  }
  error(message, params, where) {
    this._log('error', this._packParams(message, params, where));
  }
  exception(err, where) {
    this._log('exception', this._packParams(err.message, err, where));
  }
}

export default Logger;
