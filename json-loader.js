let inversify = require("inversify");
require('reflect-metadata');

/**
 * Loader of json config.
 *
 * @author Amine Fattouch <amine.fattouch@lagardere-active.com>
 */
class JsonLoader {
  /**
   * Constructor class.
   *
   * @param {Object} container
   * @param {string} projectDir
   */
  constructor (container, projectDir) {
    this._container = container;
    this._projectDir = projectDir;
  }

  /**
   * Loads configuration for services.
   *
   * @param {object} containerConfiguration
   */
  load (containerConfiguration) {
    let {services = {}, parameters = {}} = containerConfiguration;

    this.loadParameters(parameters);

    this.loadServices(services);
  }

  /**
   * Loads parameters into container.
   *
   * @param {object} parameters
   */
  loadParameters (parameters) {
    if (!Object.keys(parameters).length === 0) {
      // test if there's a parameters array in the container to add parameter
      // (must add parameter to parameters service to differenciate from service)
      if (this._container.isBound('parameters')) {
        // add current parameter to list of parameters
        this._container.rebind('parameters').toConstantValue(Object.assign(parameters, this._container.get('parameters')));
      }

      for (let id in parameters) {
        if (!this._container.isBound('parameters')) {
          this._container.bind(id).toConstantValue(parameters[id]);
        }
      }
    }
  }

  /**
   * Load services into container from configration file.
   *
   * @param {object} services
   */
  loadServices (services) {
    if (typeof (services) !== 'undefined') {
      this.makeInjectableServices(services);

      for (let id in services) {
        let service = require(this._projectDir + id);
        if (services[id].arguments && Array.isArray(services[id].arguments)) {
          this.injectArguments(service, services[id]);
        }

        if (services[id].alias && Array.isArray(services[id].alias)) {
          services[id].alias.forEach((tag) => {
            this._container.bind(tag).to(service);
          });
        }

        this._container.bind(id).to(service);
      }
    }
  }

  /**
   * Makes all declared services as injectable.
   *
   * @param {object} services
   */
  makeInjectableServices (services) {
    for (let id in services) {
      inversify.decorate(inversify.injectable(), require(this._projectDir + id));
    }

    inversify.decorate(inversify.injectable(), inversify.Container);
  }

  /**
   * Inject arguments into each service.
   *
   * @param {object} service the loaded service by require.
   * @param {object} serviceConfiguration The service object in conf file
   */
  injectArguments (service, serviceConfiguration) {
    serviceConfiguration.arguments.forEach((argumentId, index) => {
      let splittedArgumentId;
      if (typeof argumentId === 'string' && (splittedArgumentId = argumentId.match(/^@([a-zA-Z\/_-]+)/))) {
        // case where the argument is another service in src (it must begin with @)
        this.injectArgument(splittedArgumentId[1], service, index);
      } else if (typeof argumentId === 'string' && (splittedArgumentId = argumentId.match(/^%([a-zA-Z_.-]+)%$/))) {
        // case where the argument is a parameter (it must be encapsulated with %)
        let parameters = this._container.get('parameters');
        if (parameters[splittedArgumentId[1]] !== 'undefined') {
          this.injectArgument(splittedArgumentId[1], service, index);
        } else {
          throw new Error(`Injected argument ${splittedArgumentId[1]} is not declared as parameter.`);
        }
      } else if (typeof argumentId === 'string' && (splittedArgumentId = argumentId.match(/^!([a-zA-Z_/.-]+)/))) {
        // case where the argument is from node module (it must begin with !)
        let loadedArgument;
        try {
          loadedArgument = require(splittedArgumentId[1]);
        } catch (err) {
          console.error(`${splittedArgumentId[1]} is not a valid node module.`);
          throw err;
        }
        this.injectArgument(splittedArgumentId[1], service, index);

        this.addArgumentToContainer(splittedArgumentId[1], loadedArgument);
      } else {
        // case where the argument is a simple type
        this.injectArgument(argumentId, service, index);

        // case where the injected argument is a json
        if (typeof (argumentId) === 'string') {
          if (typeof JSON.parse(argumentId) === 'object') {
            this.addArgumentToContainer(argumentId, JSON.parse(argumentId));
          }
        }
      }
    });
  }

  /**
   * Inject a single argument into a given service at position index.
   *
   * @param {string} argumentId
   * @param {object} service
   * @param {integer} index
   */
  injectArgument (argumentId, service, index) {
    inversify.decorate(inversify.inject(argumentId), service, index);
  }

  /**
   * Adds a given argument id (node function or object) into container.
   *
   * @param {string} argumentId
   * @param {type} loadedArgument
   */
  addArgumentToContainer (argumentId, loadedArgument) {
    if (!this._container.isBound(argumentId)) {
      if (typeof (loadedArgument) === 'function') {
        this._container.bind(argumentId).toFunction(loadedArgument);
      } else if (typeof (loadedArgument) === 'object') {
        this._container.bind(argumentId).toConstantValue(loadedArgument);
      }
    }
  }
}

module.exports = JsonLoader;
