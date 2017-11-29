/**
 * This is the component router.
 *
 * @author Amine Fattouch <amine.fattouch@lagardere-active.com>
 */
class Router {
  /**
   * Constructor class.
   *
   * @param {object} container
   * @param {String} projectDir
   * @param {string} type
   */
  constructor (container, projectDir, type) {
    this._container = container;
    this._routers = container.getAll('router');
    this._projectDir = projectDir;
    this._type = type;

    this._router = null;
  }

  /**
   * Register all routes.
   */
  registerRoutes (config) {
    config.routes.forEach((routeItem) => {
      let controller = this.resolveController(routeItem);
      let route = this.resolveRoute(routeItem);
      let method = this.resolveMethod(routeItem);
      let action = this.resolveAction(routeItem);

      this.getMatchedRouter().registerRoute(controller, route, method, action);
    });
  }

  /**
   * Registers the matched router.
   */
  register () {
    this._routers.forEach((router) => {
      if (router.match(this._type)) {
        this._matchedRouter = router;
        this._matchedRouter.register();

        return this._matchedRouter;
      }
    });
  }

  /**
   * Returns the matched router for current type.
   *
   * @returns {object}
   */
  getMatchedRouter () {
    if (typeof this._matchedRouter === 'undefined') {
      throw new Error(`there's no matched router for type: "${this._type}"`);
    }

    return this._matchedRouter;
  }

  /**
   *
   * @returns {Object}
   *
   * @throws {Error} If routes is not defined.
   * @throws {Error} If unable to parse router.config.json
   */
  loadRouteConfig () {
    throw new Error('Must be overwriten by children class.');
  }

  /**
   *
   * @param {Object} routeItem
   *
   * @returns {Object}
   *
   * @throws {Error} If the controller is not defined.
   * @throws {Error} If unable to load controller controller.
   */
  resolveController (routeItem) {
    let Controller;

    if (!routeItem || !routeItem.controller) {
      throw new Error(`Undefined "controller" property in "${this._projectDir}app/config/router.config.json"`);
    }

    try {
      Controller = require(this._projectDir + routeItem.controller);
    } catch (e) {
      throw new Error(`Unable to load "${this._projectDir}${routeItem.controller}": ${e}`);
    }

    let controller = new Controller();
    controller.setContainer(this._container);
    return controller;
  }

  /**
   *
   * @param {Object} routeItem
   *
   * @returns {String}
   *
   * @throws {Error} If path is not defined.
   */
  resolveRoute (routeItem) {
    if (!routeItem || !routeItem.path || routeItem.path.length === 0) {
      throw new Error(`Undefined or empty "path" property in "${this._projectDir}app/config/route.config.json"`);
    }

    return routeItem.path;
  }

  /**
   *
   * @param {Object} routeItem
   *
   * @returns {String}
   *
   * @throws {Error} If the type is not REST.
   */
  resolveMethod (routeItem) {
    let method = 'get';
    if (routeItem && routeItem.method && routeItem.method.length === 0) {
      method = routeItem.method.toLowerCase();
    }

    switch (method) {
      case 'get':
      case 'put':
      case 'post':
      case 'delete':
      {
        return method;
      }
      default:
      {
        throw new Error(`Invalid REST "method" property in "app/config/router.config.json": ${method}`);
      }
    }
  }

  /**
   *
   * @param {Object} routeItem
   *
   * @returns {String}
   */
  resolveAction (routeItem) {
    if (!routeItem || !routeItem.action || routeItem.action.length === 0) {
      return this.getMethod(routeItem) + 'Action';
    }
    return routeItem.action + 'Action';
  }

  /**
   * Registers a route.
   *
   * @param {String} controller
   * @param {String} route
   * @param {String} method
   * @param {String} action
   */
  registerRoute (controller, route, method, action) {
    throw new Error('Must be overwriten by children class.');
  }
}

module.exports = Router;
