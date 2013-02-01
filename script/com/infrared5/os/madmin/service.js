var app,
    srcDir  = process.cwd() + '/script/com/infrared5/os/madmin',
    parser  = require(srcDir + '/api-parser'),
    session = require(srcDir + '/session'),
    serializer = require(srcDir + '/api-serializer'),
    modelFactory = require(srcDir + '/model'),
    Promise = require('node-promise').Promise,
    winston    = require('winston'),
    logger     = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)({
          prettyPrint: true,
          colorize: true,
          timestamp: true
        })
      ]
    });

/**
 * Attempts to add the route to the application route API based on method.
 * @param {Object} route Route object
 * @returns {Boolean} Flag of whether or not it was able to add the route.
 */
function addPathFromRoute(route) {
  var responseDelay = 0,
      method = route.hasOwnProperty('method') ? route.method.toString().toLowerCase() : undefined;

  // if method is valid, attempt to add to router.
  if( method !== undefined ) {
    logger.info('adding ' + method + ': ' + route.path);
    // add route to application.
    app[method](route.path, function(req, res, next) {
      responseDelay = setTimeout( function() {
        clearTimeout(responseDelay);
        res.send(JSON.stringify( ( route.response === 'result' ) ? route.result : route.error ) );
      }, route.delay);
    });
    return true;
  }
  return false;
}

/**
 * Attempts to remove route path from application router.
 * @param  {Object} route Route object
 * @return {Boolean}       Flag of successfully removing path from router.
 */
function removePathForRoute(route) {
  var appRoutes,
      index,
      method = route.hasOwnProperty('method') ? route.method.toString().toLowerCase() : undefined;

  // if method is valid, attempt to remove from router.
  if( method !== undefined ) {
    logger.info('removing ' + method + ': ' + route.path);
    // remove from application routing.
    appRoutes = app.routes[method];
    index = (appRoutes) ? appRoutes.length : 0;
    while( --index > -1 ) {
      if(appRoutes[index].path === route.path) {
        appRoutes.splice(index, 1);
        return true;
      }
    }
  }
  return false;
}

/**
 * Adds a route to the application RESTful API
 * @param {Object} route POJO Route object that will be used to generate a Route model.
 * @param {Boolean} serializeData Flag to serialize the route data back down to source api json file.
 * @param {Function} callback Generic callback for success/fault
 * @param {Number} atIndex Index to add route into session data.
 */
function addRoute( routeJSON, serializeData, callback, atIndex ) {
  var route = modelFactory.createRoute(routeJSON);
  // if method is valid, attempt to add to session and router.
  if( addPathFromRoute(route) ) {
    // add route to session.
    if((typeof atIndex === 'number') && atIndex > -1 && atIndex <= session.getRoutes().length) {
      session.addRouteAt(route, atIndex);
    }
    else {
      session.addRoute(route);
    }
    // if provided flag to serialize data back to file. default to serialize if not provided.
    if(arguments.length > 1 && serializeData) {
      serializer.serialize(session.api, session.filename);
    }
    // invoke callback.
    if( callback ) {
      callback.call(null);
    }
    logger.info('Route added successfully for ' + route.method.toUpperCase() + ', path: ' + route.path);
  }
  else if( callback ) {
    callback.call(null, 'Could not properly add route. Missing require \'method\' attribute.\n' + routeJSON);
  }
  else {
    logger.error('Could not properly add route. Missing require \'method\' attribute.\n' + routeJSON);
  }
}

/**
 * Updates route if found already on the collection.
 * @param {String} routeID Route id to locate held route on collection.
 * @param {Object} routeJSON     POJO route object that will be used to find associated object from collection.
 * @param {Boolean} serializeData Flag to serialize the route data back down to source api json file.
 * @param {Function} callback Generic callback for success/fault
 */
function updateRoute( routeID, routeJSON, serializeData, callback ) {
  var routeInSession = session.getRouteByID(routeID),
      indexOfRoute = (routeInSession) ? session.getRoutes().indexOf(routeInSession) : undefined,
      removedRoute = (indexOfRoute > -1) ? session.removeRoute(routeID) : undefined,
      route;

  // logger.info('index of route previously: ' + indexOfRoute);
  // logger.info('found route? ' + removedRoute);
  try {
    if(removedRoute !== undefined) {
      // remove from router
      if( removePathForRoute(removedRoute) ) {
        // ensure proper structure of incoming data.
        route = modelFactory.createRoute(routeJSON);
        // ensure ID is preserved.
        route.id = routeID;
        // append to route and session & serialize
        addRoute(route, serializeData, callback, indexOfRoute);
      }
    }
    else if( callback ) {
      callback.call(null, 'Could not update route. Route not found with id: ' + routeID + '.');
    }
    else {
      logger.error('Could not update route. Route not found with id: ' + routeID + '.');
    }
  }
  catch(error) {
    // if all fails, add back...
    if( removedRoute !== undefined ) {
      session.addRouteAt(removedRoute, indexOfRoute);
    }
    // dispatch.
    if(callback) {
      callback.call(null, 'Could not update route. Error in update: ' + error.message);
    }
    else {
      logger.error('Could not update route. Error in update: ' + error.message);
    }
  }
}

/**
 * Removes a route from the application RESTful API.
 * @param  {String}   routeID     The identifier for the object to locate in the route listing.
 * @param  {Boolean}   serializeData Flag to serialize new API down to file.
 * @param  {Function} callback      Generic callback delegate for success/fail
 */
function removeRoute( routeID, serializeData, callback ) {
  var removedRoute = session.removeRoute(routeID),
      appRouteChanged = false;

  if( removedRoute !== undefined ) {
    appRouteChanged = removePathForRoute(removedRoute);
    // serialize data back down.
    if( arguments.length > 1 && serializeData ) {
      serializer.serialize(session.api, session.filename);
    }
    // invoke optional callback.
    if( callback ) {
      if( appRouteChanged ) {
        callback.call(null);
      }
      else {
        callback.call(null, null, 'Could not remove route from application with method: ' + removedRoute.method + '.');
      }
    }
    logger.info('Route removed successfully for ' + removedRoute.method.toUpperCase() + ', path: ' + removedRoute.path);
  }
  // send non-fatal message if not found.
  else if( callback ) {
    callback.call(null, null, 'Could not find route with id: ' + routeID + ', in route listing.');
  }
  else {
    logger.error('Could not find route with id: ' + routeID + ', in route listing.');
  }
}

/**
 * Loads JSON api from provided url location.
 * @param  {String} jsonURL URL of the JSON api file.
 * @return {Promise}         Operation Promise
 */
function loadAPI( jsonURL ) {
  var json,
      i,
      length,
      route,
      addRouteToApplication,
      loadPromise,
      apiPromise = new Promise();
      
  try {
    loadPromise = serializer.read(jsonURL);
    loadPromise.then( function(json) {
      // update Session.
      session.init(jsonURL, json);
      // parse and add routes to router.
      parser.parseAPI(json, function(routeList) {
        i = 0;
        length = routeList.length;
        for( i; i < length; i++ ) {
          route = routeList[i];
          addRouteToApplication = addPathFromRoute(route);
          if( !addRouteToApplication ) {
            logger.error('Could not add route: ' + JSON.stringify(route, null, 2) + '.');
          }
        }
        apiPromise.resolve();
    },
    function(errorMessage) {
      apiPromise.reject('Error in parsing api.json to routes: ' + errorMessage);
    });
    }, function(error) {
      throw new Error(error);
    });
  }
  catch( e ) {
    apiPromise.reject('Error in loading API: ' + e.message);
  }
  return apiPromise;
}


module.exports = {
  loadAPI: loadAPI,
  addRoute: addRoute,
  updateRoute: updateRoute,
  removeRoute: removeRoute,
  /**
   * Provides the express application instance used in defining API based on Route models.
   * @param {Object} application Express application.
   */
  setApplication: function( application ) {
    app = application;
  }
};