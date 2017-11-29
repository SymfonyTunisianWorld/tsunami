/**
 * Kernel class.
 *
 * @author Amine Fattouch <amine.fattouch@lagardere-active.com>
 */
class HttpKernel {

  /**
   * Instantiate the http kernel of application.
   *
   * @param {object} router
   * @param {object} server
   * @param {string} rootDir
   */
  constructor (
    router,
    server,
    rootDir
    ) {
    this._router = router;
    this._server = server;
    this._rootDir = rootDir;
  }

  /**
   * Handles http request.
   */
  initialize () {
    this._router.register();
    this._router.registerRoutes(this.loadRouteConfig());
  }

  /**
   * Loads config of routing.
   *
   * @returns {Object}
   *
   * @throws {Error} If routes is not defined.
   * @throws {Error} If unable to parse router.config.json
   */
  loadRouteConfig () {
    let config;

    try {
      config = require(`${this._rootDir}config/router.json`);

      if (!config.routes || config.routes.length === 0) {
        throw new Error('"routes" not defined');
      }
    } catch (e) {
      throw new Error(`Unable to parse "${this._rootDir}config/router.json": ${e}`);
    }

    return config;
  }

  /**
   * Boots the server.
   *
   * @param {Object} options.
   */
  bootServer (options) {
    let server = this._router.getMatchedRouter().createServer();
    this._server.boot(server, options);
  }
}

module.exports = HttpKernel;