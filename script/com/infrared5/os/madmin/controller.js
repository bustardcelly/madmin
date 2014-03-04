var srcDir  = __dirname,
    service = require(srcDir + '/service'),
    session = require(srcDir + '/session'),
    serializer = require(srcDir + '/api-serializer'),
    modelFactory = require(srcDir + '/model'),
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
   * Default landing admin view. Shows the console loaded with the parsed JSON API.
   * @param  {Request}   req
   * @param  {Response}  res
   * @param  {Function}  next
   */
  admin: function(req, res, next) {
    res.render('console', session.api);
  },
  /**
   * Request to generate a new model. Client should request this from server so as to manage JSON structure in one place.
   * @param  {Request}   req
   * @param  {Response}  res
   * @param  {Function}  next
   */
  generate: function(req, res, next) {
    var route = modelFactory.createRoute();
    try {
      res.send({route:JSON.stringify(route)});
    }
    catch(error) {
      res.send({error:error.message});
      logger.error('Could not generate new model: ' + error.message);
    }
  },
  /**
   * Request to add a route to the API
   * @param  {Request}   req
   * @param  {Response}  res
   * @param  {Function}  next
   */
  create: function(req, res, next) {
    var route,
        routeID = (new Date().getTime()).toString();
    logger.info('create request for new route with id: ' + routeID);
    
    try {
      route = (typeof req.body === 'string') ? JSON.parse(req.body) : req.body;
      logger.info('new route based on : ' + route + '.');
      route.id = routeID;
      service.addRoute(route, true, function(error) {
        if(error) {
          res.send({error:error});
        }
        else {
          res.send({id:routeID});
        }
      });
    }
    catch(error) {
      res.send({error:error.message});
      logger.error('failure on create of new route. [REASON]: ' + error.message);
    }
  },
  /**
   * Finds route based on id and returns JSON string representation
   * @param  {Request}   req
   * @param  {Response}   res
   * @param  {Function} next
   */
  read: function(req, res, next) {
    var routeID = req.param('entryId'),
        route = session.getRouteByID(routeID);

    if(route) {
      res.send({route:JSON.stringify(route,null, 2)});
    }
    else {
      res.send({error:'Could not find route with id: ' + routeID});
    }
  },
  /**
   * Request to update an existing route on the API.
   * @param  {Request}   req
   * @param  {Response}  res
   * @param  {Function}  next
   */
  update: function(req, res, next) {
    var routeID = req.param('entryId'),
        route = (req.body instanceof String) ? JSON.parse(req.body) : req.body;
    logger.info('update request for: ' + routeID);

    try {
      service.updateRoute(routeID, route, true, function(error, nonFatalError) {
        if(error) {
          res.send({error:error});
        }
        else {
          if(nonFatalError) {
            res.send({ok: true, message: nonFatalError});
          }
          else {
            res.send({ok:true});
          }
        }
      });
    }
    catch(error) {
      res.send({error:error.message});
      logger.error('failure on updating route based on id:' + routeID + '. [REASON]: ' + error.message);
    }
  },
  /**
   * Request to delete an existing route from the API.
   * @param  {Request}   req
   * @param  {Response}  res
   * @param  {Function}  next
   */
  remove: function(req, res, next) {
    var routeID = req.param('entryId');
    logger.info('delete request for: ' + req.param('entryId'));

    try {
      service.removeRoute(routeID, true, function(error, nonFatalError) {
        if(error) {
          res.send({error:error});
        }
        else {
          if(nonFatalError) {
            res.send({ok: true, message: nonFatalError});
          }
          else {
            res.send({ok:true});
          }
        }
      });
    }
    catch(error) {
      res.send({error:error.message});
      logger.error('failure on removing route using id: ' + routeID + '. [REASON]: ' + error.message);
    }
  }
};