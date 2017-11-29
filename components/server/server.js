/**
 * This is the component server.
 *
 * @author Amine Fattouch <amine.fattouch@lagardere-active.com>
 */
class Server {
  /**
   * Constructor class.
   *
   * @param {object}
   */
  constructor (container, type) {
    this._servers = container.getAll('server');
    this._type = type;
  }

  /**
   * Boots the supported server.
   *
   * @param {object} nodeServer
   * @param {object} options
   *
   * @returns {object}
   */
  boot(nodeServer, options = {}) {
    this._servers.forEach((server) => {
      if (server.supports(this._type)) {
        server.boot(nodeServer);

        return server;
      }
    });
  }
}

module.exports =  Server;

