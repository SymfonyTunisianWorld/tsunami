let Module = require('../../components/kernel/module');

/**
 * The application module class.
 *
 * @author Amine Fattouch <amine.fattouch@gmail.com>
 */
class AppModule extends Module {
  /**
   * Processes configuration nodes.
   *
   * @param {array} configs
   */
  processConfig (configs) {
    if (this._configuration.validate(configs, this.getConfigurationSchema())) {
      if (configs['server']) {
        this.processSchemaAndMapToParameters(configs['server'], 'app_server');
      }

      if (configs['router']) {
        this.processSchemaAndMapToParameters(configs['router'], 'app_router');
      }
    }
  }

  /**
   * Return the schema of configuration of this module.
   *
   * @return {object}
   */
  getConfigurationSchema () {
    return {
      "id": "/app",
      "type": "object",
      "properties": {
        "app": {
          "type": "object",
          "properties": {
            "server": {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string",
                  "pattern": "aws|local"
                },
                "host": {
                  "type": "string"
                },
                "port": {
                  "type": "integer"
                },
                "cluster": {
                  "type": "boolean"
                },
                "use_cli_arguments": {
                  "type": "boolean"
                }
              }
            },
            "router": {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string",
                  "pattern": "aws-express|express"
                }
              }
            }
          }
        }
      }
    };
  }

  /**
   * Returns the root node of configuration.
   *
   * @returns {string}
   */
  getRootNode () {
    return 'framework';
  }
}
;

module.exports = AppModule;