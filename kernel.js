const inversify = require("inversify");
const path = require('path');
const fs = require('fs');
require('reflect-metadata');

/**
 * Kernel class.
 *
 * @author Amine Fattouch <amine.fattouch@lagardere-active.com>
 */
class Kernel {

  /**
   * Instantiate the kernel of application.
   *
   * @param {string} environment
   */
  constructor (environment = null) {
    this._environment = process.env.NODE_ENV || environment;
    this._rootDir = this.rootDir;
    this._projectDir = this.projectDir;

    this._modules = [];
    this._initialized = false;
  }

  /**
   * Initializes application.
   */
  initialize () {
    if (this._initialized === true) {
      return;
    }

    this.initializeModules();

    if (typeof (this._container) === 'undefined') {
      this.initializeContainer();
    }

    this._initialized = true;
  }

  /**
   * Initializes container.
   */
  initializeContainer () {
    this._container = new inversify.Container({defaultScope: "Singleton"});

    let kernelParameters = this.getKernelParameters();
    this._container.bind('parameters').toConstantValue(kernelParameters);
    for (let id in kernelParameters) {
      this._container.bind(id).toConstantValue(kernelParameters[id]);
    }

    let configuration = this.loadEnvironmentConfigFile();
    this._modules.forEach((module) => {
      module.setContainer(this._container);
      module.setProjectDir(this._projectDir);
      if (typeof(configuration[module.getRootNode()]) !== 'undefined') {
        module.register(configuration[module.getRootNode()]);
      }
    });

    this.registerContainerConfiguration(new (require(this._rootDir + 'components/config/json-loader'))(this._container, this._projectDir));

    this._container.bind('container').toConstantValue(this._container);
    inversify.decorate(inversify.injectable(), Kernel);
    this._container.bind('kernel').to(Kernel);
  }

  /**
   * Boots the kernel.
   *
   * @param {object} options
   */
  boot (options) {
    let httpKernel = this._container.get('app/components/kernel/http-kernel');
    httpKernel.initialize();
    httpKernel.bootServer(options);
  }

  /**
   * Initializes modules.
   */
  initializeModules () {
    this.getModules().forEach((module) => {
      if (typeof (module) !== 'undefined') {
        this._modules.push(module);
      }
    });
  }

  /**
   * Loads all configuration for services.
   *
   * @returns {Array}
   */
  loadServices () {
    throw new Error('Must be overwriten by children class.');
  }

  /**
   * Loads all modules.
   *
   * @returns {Array}
   */
  getModules () {
    throw new Error('Must be overwriten by children class.');
  }

  /**
   * Gets the application root dir (path of the project's packages file).
   *
   * @returns {string}
   */
  get projectDir () {
    if (typeof (this._projectDir) === 'undefined') {
      let dir = path.dirname(__dirname);
      while (!fs.existsSync(dir + '/package.json')) {
        dir = path.dirname(dir);
      }
      this._projectDir = dir + '/';
    }

    return this._projectDir;
  }

  /**
   *
   * @returns {object}
   */
  getKernelParameters () {
    return {
      kernel_root_dir: this._rootDir || this.rootDir,
      kernel_project_dir: this._projectDir || this.projectDir,
      kernel_environment: this._environment
    };
  }
}

module.exports = Kernel;