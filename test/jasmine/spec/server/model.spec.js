describe( 'Node Client | Model', function() {
  
  var baseURL = process.cwd() + '/script/com/infrared5/os/madmin',
      modelFactory = require(baseURL + '/model'),
      routeObj = {
        id: "1",
        path: "/routes/:routeId",
        method: "GET",
        summary: "Find destinations along route.",
        parameters:[ {
          name: "routeId",
          summary: "ID of route that is used to find destinations."
        }],
        result: {
        },
        error: {
          error: "Routes not found"
        },
        response: "error",
        delay: 1000
      };

  describe('createRoute()', function() {

    var route;

    beforeEach( function() {
      route = modelFactory.createRoute(routeObj);
    });

    it('should return a Route model instance', function() {
      // type checking 
      expect(route.id).toEqual(jasmine.any(String));
      expect(route.path).toEqual(jasmine.any(String));
      expect(route.method).toEqual(jasmine.any(String));
      expect(route.summary).toEqual(jasmine.any(String));
      expect(route.parameters).toEqual(jasmine.any(Array));
      expect(route.result).toEqual(jasmine.any(Object));
      expect(route.error).toEqual(jasmine.any(Object));
      expect(route.response).toEqual(jasmine.any(String));
      expect(route.delay).toEqual(jasmine.any(Number));
      // parse checking
      expect(route.id).toEqual('1');
      expect(route.path).toEqual('/routes/:routeId');
      expect(route.summary).toEqual('Find destinations along route.');
      expect(route.method.toUpperCase()).toEqual('GET');
      expect(route.response).toEqual('error');
      expect(route.delay).toEqual(1000);
    });

    it('should parse parameters listing', function() {
        expect(route.parameters).not.toBeUndefined();
        expect(route.parameters instanceof Array).toEqual(true);
        expect(route.parameters.length).toEqual(1);
      });


    it('should return proper list of Parameter model instance(s)', function() {
      var parameter = route.parameters[0];

      expect(parameter).not.toBeUndefined();
      expect(parameter.name).toEqual(jasmine.any(String));
      expect(parameter.summary).toEqual(jasmine.any(String));
      expect(parameter.name).toEqual('routeId');
      expect(parameter.summary).toEqual('ID of route that is used to find destinations.');
    });

    afterEach( function() {
      route = undefined;
    });

  });

});