var modelFactory = require(__dirname + '/model'),
    winston = require('winston'),
    logger  = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)({
          prettyPrint: true,
          colorize: true,
          timestamp: true
        })
      ]
    });

module.exports = {
  /**
   * Parse the api.json file to routes to be injected into express middleware.
   * @param {Object} json Loaded JSON object.
   * @param  {Function} callback Delegate callback to invoke on completion.
   * @param  {Function} errorDelegate Delegate method to invoke on error.
   */
  parseAPI: function(json, callback, errorDelegate) {
    var routes,
        index = 0,
        length,
        payload = [];

    try {
      routes = json.api;
      length = routes.length;
      for( index; index < length; index++ ) {
        payload[payload.length] = modelFactory.createRoute(routes[index]);
      }
      callback.call(null, payload);
    }
    catch(error) {
      errorDelegate.call(null, error.message);
    }
  }
};