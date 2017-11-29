/**
 * @author Amine Fattouch <amine.fattouch@gmail.com>
 */
class AppController {
  /**
   * Returns a service by its id.
   *
   * @param {String} id
   */
  get (id) {
    return this._container.get(id);
  }

  /**
   * Returns true if the service id is defined.
   *
   * @param {String} id
   *
   * @return bool true if the service id is defined, false otherwise
   */
  has (id) {
    return this._container.isBound(id);
  }

  /**
   * Gets a container configuration parameter by its name.
   *
   * @param {String} name The parameter name
   *
   * @returns {String} | {Null}
   */
  getParameter (name) {
    if (this._container.get('parameters')[name]) {
      return this._container.get(name);
    }

    return null;
  }

  /**
   * Setter for container.
   *
   * @param {Object} container
   */
  setContainer (container) {
    this._container = container;
  }
}

module.exports = AppController;
