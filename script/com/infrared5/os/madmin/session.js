module.exports = {
  api: undefined,
  filename: undefined,
  /**
   * Requires in api file.
   * @param  {String} apiFilename Location of api JSON file
   * @param  {Object} jsonAPI The Object representing the JSON api and routes.
   * @return {Object}             The session object exports.
   */
  init: function(apiFilename, jsonAPI) {
    this.filename = apiFilename;
    this.api = jsonAPI;
    return this;
  },
  /**
   * Returns list of routes defined on the API.
   * @return {Array} Array of plain objects representing Routes.
   */
  getRoutes: function() {
    return this.api.api;
  },
  /**
   * Returns associated route with id if found, undefined if not.
   * @param  {String} id
   * @return {Object}    The route object.
   */
  getRouteByID: function(id) {
    var routes = this.getRoutes(),
        i = routes.length,
        route;

    while( --i > -1 ) {
      route = routes[i];
      if(route.id === id) {
        return route;
      }
    }
    return undefined;
  },
  /**
   * Appends the route Object to the held JSON object.
   * @param {Object} routeJSON JSON object
   */
  addRoute: function(routeJSON) {
    var routes = this.getRoutes();
    if(this.getRouteByID(routeJSON.id) === undefined) {
      routes[routes.length] = routeJSON;
    }
  },
  /**
   * Adds route object at defined index.
   * @param {Object} routeJSON JSON object
   * @param {Number} index     Index to add in list.
   */
  addRouteAt: function(routeJSON, index) {
    this.getRoutes().splice(index, 0, routeJSON);
  },
  /**
   * Attempts to remove route from API listing based on ID.
   * @param  {String} routeID The ID to find on associated route in API listing.
   * @return {Object}         The route object removed, undefined if not found.
   */
  removeRoute: function(routeID) {
    var route = this.getRouteByID(routeID),
        routeList = this.getRoutes();
    if(route !== undefined) {
      routeList.splice(routeList.indexOf(route), 1);
      return route;
    }
    return undefined;
  }
};