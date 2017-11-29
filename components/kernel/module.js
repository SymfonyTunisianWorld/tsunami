let path = require('path');

/**
 * The application module class.
 *
 * @author Amine Fattouch <amine.fattouch@gmail.com>
 */
class Module {
  /**
   * Setter for container.
   *
   * @param {Object} container
   */
  setContainer (container = null) {
    this._container = container;
  }

  /**
   * Setter for project dir.
   *
   * @param {string} projectDir
   */
  setProjectDir (projectDir) {
    this._projectDir = projectDir;
  }

  /**
   * Registers current module by kernel.
   *
   * @param {array} configs
   */
  register (configs) {
    this.initializeConfiguration();
    this.processConfig(configs);
  }

  /**
   * Initialize configuration class.
   */
  initializeConfiguration () {
    this._configuration = new (require(this._projectDir + 'app/components/config/configuration'))();
  }

  /**
   * Processes schema and maps the configuration into parameters.
   *
   * @param {object} config
   * @param {string} baseNamespace
   */
  processSchemaAndMapToParameters (config, baseNamespace) {
    let parameters = this._container.get('parameters');
    for (let conf in config) {
      if (typeof (config[conf]) === 'object') {
        this.processSchemaAndMapToParameters(config[conf], `${baseNamespace}_${conf}`);
      } else {
        Object.assign(parameters, {[`${baseNamespace}_${conf}`]: config[conf]});
        this._container.bind(`${baseNamespace}_${conf}`).toConstantValue(config[conf]);
      }
    }

    this._container.rebind('parameters').toConstantValue(parameters);
  }

  /**
   * Processes configuration nodes.
   *
   * @param {array} configs
   */
  processConfig (configs = []) {
    throw new Error('must be overwriten by module.');
  }
}

module.exports = Module;