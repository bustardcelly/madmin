var srcDir = process.cwd() + '/script/com/infrared5/os/madmin/',
    session = require(srcDir + '/session'),
    Promise = require('node-promise').Promise,
    fs = require('fs'),
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
   * Request to load JSON API from provided file location.
   * @param  {String} filename Location of json file describing the route API.
   * @return {Promise}          Promise for I/O
   */
  read: function(filename) {
    var promise = new Promise();
    fs.readFile(filename, function(error, data) {
      var errorMessage;
      if( error ) {
        errorMessage = 'Error in reading of api file at ' + filename + '. ' + error;
        promise.reject(errorMessage);
        logger.error(errorMessage);
      }
      else {
        promise.resolve(JSON.parse(data.toString()));
        logger.info('JSON api read from ' + filename + '.');
      }
    });
    return promise;
  },
  /**
   * Request to serialize the API model held on the session down to JSON on the target api file.
   * @param {String|Object} json JSON string or object.
   * @param {String} filename Filename to serialize the JSON string down to.
   * @return {Promise} Promise for I/O
   */
  serialize: function(json, filename) {
    var promise = new Promise();
    // ensure that provided data is JSON string.
    json = (json instanceof String) ? json : JSON.stringify(json, null, 2);
    // serialize to file.
    fs.writeFile(filename, json, function(error) {
      var errorMessage;
      if( error ) {
        errorMessage = 'Error in serializing JSON to ' + filename + '. ' + error;
        promise.reject(errorMessage);
        logger.error(errorMessage);
      }
      else {
        promise.resolve();
        logger.info('JSON written to ' + filename + ' successfully.');
      }
    });
    return promise;
  }
};