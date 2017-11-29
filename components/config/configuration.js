/**
 * Config component.
 *
 * @author Amine Fattouch <amine.fattouch@gmail.com>
 */
class Configuration {
  /**
   * Constructor class.
   */
  constructor() {
    let Validator = require('jsonschema').Validator;
    this._jsonValidator = new Validator();
  }

  /**
   * Validate configuration by a given schema.
   *
   * @param {object} configs
   * @param {object} schema
   *
   * @return {boolean}
   */
  validate(configs, schema) {
    return this._jsonValidator.validate(configs, schema);
  }
}

module.exports = Configuration;
