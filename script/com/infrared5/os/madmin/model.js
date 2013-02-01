var winston = require('winston'),
    logger  = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)({
          prettyPrint: true,
          colorize: true,
          timestamp: true
        })
      ]
    }),
    defineRoute = function( route ) {
      Object.defineProperties(route, {
        "id": {
          value: '',
          writable: true,
          enumerable: true
        },
        "path": {
          value: '/',
          writable: true,
          enumerable: true
        },
        "method": {
          value: 'GET',
          writable: true,
          enumerable: true
        },
        "summary": {
          value: '',
          writable: true,
          enumerable: true
        },
        "parameters": {
          value: [],
          writable: true,
          enumerable: true
        },
        "result": {
          value: {},
          writable: true,
          enumerable: true
        },
        "error": {
          value: {},
          writable: true,
          enumerable: true
        },
        "response": {
          value: 'result',
          writable: true,
          enumerable: true
        },
        "delay": {
          value: 1000,
          writable: true,
          enumerable: true
        }
      });
    },
    defineParameter = function( parameter ) {
      Object.defineProperties( parameter, {
        "name": {
          value: '',
          writable: true,
          enumerable: true
        },
        "summary": {
          value: '',
          writable: true,
          enumerable: true
        }
      });
    },
    shallowCopy = function( fromValue, toValue, exclusions ) {
      var property,
        excl = exclusions || [];
      for( property in fromValue ) {
        if( property in toValue &&
            excl.indexOf(property) === -1 ) {
          toValue[property] = fromValue[property];
        }
      }
    },
    /**
     * Route model representing a single entry in api.json.
     *
     * Not type-enforced, really just a copy over of values from a generic object.
     * However, it does serve a purpose in copying over only properties that are considered part of the API as of current.
     * So if requirements change, specs must be updated and these must pass :)
     * @type {Route}
     */
    Route = {
      inflate: function( value ) {
        var route = Object.create(this),
            index,
            parameter,
            params = value.hasOwnProperty('parameters') ? value.parameters : undefined;

        defineRoute( route );
        shallowCopy( value, route, 'parameters' );
        if( typeof params !== 'undefined' && params instanceof Array ) {
          for( index = 0; index < params.length; index++ ) {
            parameter = Parameter.inflate(params[index]);
            route.parameters[route.parameters.length] = parameter;
          }
        }
        return route;
      }
    },
    /**
     * Parameter model representing a single entry in parameters for Route of api.json.
     *
     * Not type-enforced, really just a copy over of values from a generic object.
     * However, it does serve a purpose in copying over only properties that are considered part of the API as of current.
     * So if requirements change, specs must be updated and these must pass :)
     * @type {Parameter}
     */
    Parameter = {
      inflate: function( value ) {
        var param = Object.create(this);
        defineParameter( param );
        shallowCopy( value, param );
        return param;
      }
    };

/**
 * Factory method to generate a Route model item.
 * @param  {Object} value Generic object parsed from JSON (api.json).
 * @return {Route}       Route model object.
 */
module.exports.createRoute = function( value ) {
  var route = Route.inflate(value||{});
  return route;
};