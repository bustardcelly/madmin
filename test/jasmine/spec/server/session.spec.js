describe('Node Client | Session', function() {
  
  var baseURL = process.cwd() + '/script/com/infrared5/os/madmin',
      specURL = process.cwd() + '/test/jasmine/spec/fixtures',
      session = require(baseURL + '/session'),
      filename = specURL + '/example-api.json',
      jsonAPI = {
        api: [{
          id: "1",
          path: "/routes/:routeId",
          method: "GET",
          summary: "Find destinations along route.",
          parameters: [ {
              name: "routeId",
              summary: "ID of route that is used to find destinations."
            }
          ],
          result: {},
          error: {
            error: "Routes not found"
          },
          response: "error",
          delay: 1000
        }]
      },
      newRoute = {
        id: "0",
        path:"/routes/:id",
        method:"GET",
        summary:"Find route by ID.",
        parameters:[],
        result: {
            test: 123,
            greeting: "hello, world"
        },
        error: {
            error:"Routes not found"
        },
        response: "result",
        delay: 1000
      };

  describe('init()', function() {

    var sess;

    beforeEach( function() {
      sess = session.init(filename, jsonAPI);
    });

    it('should return loaded JSON object', function() {
      expect(sess).toBe(session);
    });

    it('should update exposed \'api\' attribute', function() {
      expect(session.api).not.toBeUndefined();
      expect(session.api).toEqual(jasmine.any(Object));
    });

    it('should update exposed \'filename\' attribute', function() {
      expect(session.filename).toEqual(filename);
    });

    afterEach( function() {
      sess = undefined;
    });

  });

  describe('getRoutes()', function() {

    it('should return listing of route objects', function() {
      session.init(filename, jsonAPI);
      expect(session.getRoutes()).toEqual(jasmine.any(Array));
      expect(session.getRoutes().length).toBe(1);
    });

  });

  describe('getRouteByID()', function() {

    beforeEach( function() {
      session.init(filename, jsonAPI);
      session.addRoute(newRoute);
    });

    it('should return route based on id', function() {
      expect(session.getRouteByID('0')).not.toBeUndefined();
      expect(session.getRouteByID('1')).not.toBeUndefined();
    });

    it('should return undefined if route not found by id', function() {
      expect(session.getRouteByID('1234')).toBeUndefined();
    });

    afterEach( function() {
      session.removeRoute(newRoute.id);
    });    

  });

  describe('addRoute()', function() {

    beforeEach( function() {
      session.init(filename, jsonAPI);
      session.addRoute(newRoute);
    });

    it('should append provide route Object to end of api listing', function() {
      var routes = session.getRoutes();
      expect(routes.length).toEqual(2);
      expect(routes[routes.length-1]).toBe(newRoute);
    });

    afterEach( function() {
      //
    });

  });

  describe('removeRoute()', function() {

    beforeEach( function() {
      session.init(filename, jsonAPI);
      session.addRoute(newRoute);
    });

    it('should return found and removed route object', function() {
      var length = session.getRoutes().length,
          route;
      route = session.removeRoute('1');
      expect(route).not.toBeUndefined();
      expect(session.getRoutes().length).toEqual(length-1);
    });

    it('should return undefined if route not found associated with id', function() {
      var length = session.getRoutes().length,
          route;
      route = session.removeRoute('1234512');
      expect(route).toBeUndefined();
      expect(session.getRoutes().length).toEqual(length);
    });

    afterEach( function() {
      //
    });

  });

});