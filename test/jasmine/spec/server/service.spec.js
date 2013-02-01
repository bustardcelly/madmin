describe( 'Node Client | Service', function() {

  var baseURL = process.cwd() + '/script/com/infrared5/os/madmin',
      specURL = process.cwd() + '/test/jasmine/spec/fixtures',
      request = require('supertest'),
      express = require('express'),
      app,
      service = require(baseURL + '/service'),
      session = require(baseURL + '/session'),
      modelFactory = require(baseURL + '/model'),
      route = {
        id: "0",
        path:"/routes",
        method:"GET",
        summary:"Find all routes available.",
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
      },
      routeUpdate = {
        id: "0",
        path:"/routeListing",
        method:"GET",
        summary:"Find all routes available.",
        parameters:[],
        result: {
            test: 123,
            greeting: "hello, world"
        },
        error: {
            error:"Routes not found"
        },
        response: "error",
        delay: 1000
      };

  describe('loadAPI()', function() {

    var promise;

    beforeEach( function() {
      app = express();
      service.setApplication(app);
      spyOn(app, 'get').andCallThrough();
      promise = service.loadAPI(specURL + '/example-api.json');
    });

    it('should return promise on request', function() {
      expect(promise).not.toBeUndefined();
    });

    it('should add api json data to session', function(done) {
      promise.then( function() {
        expect(session.api).not.toBeUndefined();
        expect(session.api).toEqual(jasmine.any(Object));
        done();
      });
    });

    it('should add routes defined to router', function(done) {
      promise.then( function() {
        expect(app.get).toHaveBeenCalled();
        expect(app.get).toHaveBeenCalledWith('/routes', jasmine.any(Function)); 
        done();
      });
    });

    afterEach( function() {
      promise = undefined;
    });
  });

  describe('addRoute()', function() {

    beforeEach( function() {
      app = express();
      service.setApplication( app );
    });

    it('should invoke defined method with proper route', function() {
      spyOn(app, 'get').andCallThrough();
      service.addRoute(route);

      expect(app.get).toHaveBeenCalled();
      expect(app.get).toHaveBeenCalledWith('/routes', jasmine.any(Function)); 
    });

    it('should respond to method with defined response from Route model', function(done) {
      service.addRoute(route);

      request(app)
          .get('/routes')
          .set('Accept', 'application/json')
          .end(function(error, response) {
            if( error ) {
              return done(error);
            }
            expect(JSON.parse(response.res.text)).toEqual(route.result);
            done();
          });
    });

    it('should respond to method after defined delay from Route model', function(done) {
      var timestamp = new Date().getTime(), now;
      
      service.addRoute(route);
      request(app)
          .get('/routes')
          .set('Accept', 'application/json')
          .end(function(error, response) {
            if( error ) {
              return done(error);
            }
            now = new Date().getTime();
            expect(now - timestamp).toBeLessThan(route.delay + 100);
            done();
          });
    });

    afterEach( function() {
      service.removeRoute('0');
    });

  });

  describe('updateRoute()', function() {

    var promise;

    beforeEach( function() {
      app = express();
      service.setApplication(app);
      promise = service.loadAPI(specURL + '/example-api.json');
    });

    it('should update the route held on the session', function(done) {
      var savedRoute,
          previousRoute;

      promise.then( function() {
        previousRoute = session.getRouteByID("0");
        service.updateRoute( "0", routeUpdate, false, function(error) {
          if( error ) {
            // fail if error.
            expect(false).toEqual(true);
          }
          else {
            savedRoute = session.getRouteByID("0");
            expect(savedRoute.path).toEqual(routeUpdate.path);
            expect(savedRoute.response).toEqual(routeUpdate.response);
            expect(savedRoute.method).toEqual(previousRoute.method);
            expect(savedRoute.id).toEqual(previousRoute.id);
            expect(savedRoute.summary).toEqual(previousRoute.summary);
            expect(savedRoute.delay).toEqual(previousRoute.delay);
            expect(savedRoute.parameters).toEqual(previousRoute.parameters);
            expect(savedRoute.result).toEqual(previousRoute.result);
            expect(savedRoute.error).toEqual(previousRoute.error);
          }
          done();
        });
      });
      
    });

    it('should update at index by default', function(done) {
      var route,
          previousIndex;

      promise.then( function() {
        route = session.getRouteByID('0');
        previousIndex = session.getRoutes().indexOf(route);
        service.updateRoute('0', routeUpdate, false, function(error) {
          if(error) {
            expect(false).toEqual(true);
          }
          else {
            expect(session.getRoutes().indexOf(session.getRouteByID('0'))).toEqual(previousIndex);
          }
          done();
        });
      });
    });

    it('should update the path held on the application router', function(done) {
      promise.then( function() {
        spyOn(app, 'get').andCallThrough();
        service.updateRoute('0', routeUpdate, false, function(error) {
          if( error ) {
            // fail if error.
            expect(false).toEqual(true);
          }
          else {
            expect(app.get).toHaveBeenCalled();
            expect(app.get).toHaveBeenCalledWith(routeUpdate.path, jasmine.any(Function));
            done();
          }
        });
      });
    });

    it('should not add route on session if not already existant on session', function(done) {
      var previousRouteLength;

      promise.then( function() {
        previousRouteLength = session.getRoutes().length;
        service.updateRoute('1234556', routeUpdate, false, function(error) {
          expect(previousRouteLength).toBe(session.getRoutes().length);
          expect(session.getRouteByID('0')).not.toEqual(routeUpdate);
          done();
        });
      });
    });

    it('should not add route to application router if not already existant on session', function(done) {
      promise.then( function() {
        spyOn(app, 'get').andCallThrough();
        service.updateRoute( '1234557', routeUpdate, false, function(error) {
          expect(app.get).not.toHaveBeenCalled();
          done();
        });
      });
    });

    afterEach( function() {
      promise = undefined;
    });

  });

  describe('removeRoute()', function() {
    
    var id = (new Date()).getTime().toString();

    beforeEach( function() {
      route.id = id;
      app = express();
      service.setApplication( app );
    });

    it('should remove route from router when available', function(done) {
      service.addRoute(route);
      service.removeRoute(route.id, false, function(error) {
        var methodListing = app.routes[route.method.toLowerCase()],
            index = (methodListing) ? methodListing.length : 0;

        // if we got an error, we failed already :(
        if( error ) {
          expect(false).toEqual(true);
        }
        else {
          while( --index > -1 ) {
            if(methodListing[index].path === route.path) {
              // fail tests as it is still available on application.
              expect(false).toEqual(true);
              break;
            }
          }
        }
        done();
      });
    });

    it('should return non-fatal failure if route not found in application router', function(done) {
      service.addRoute(route);
      service.removeRoute('1234', false, function(error, nonFatalError) {
        // expecting nonFatalError on route not found.
        if(nonFatalError) {
          expect(nonFatalError).toEqual(jasmine.any(String));
        }
        else {
          // expected nonFatalError from id not found in routing.
          expect(false).toEqual(true);
        }
      });
      done();
    });

    afterEach( function() {
      service.removeRoute(id);
    });

  });

});