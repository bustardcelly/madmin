describe( 'Node Client | Controller', function() {
  
  var srcDir = process.cwd() + '/script/com/infrared5/os/madmin',
      jsonURL = process.cwd() + '/test/jasmine/spec/fixtures/example-api.json',
      json = require(process.cwd() + '/test/jasmine/spec/fixtures/curl-test.json'),
      express = require('express'),
      sinon = require('sinon'),
      service = require(srcDir + '/service'),
      controller = require(srcDir + '/controller'),
      modelFactory = require(srcDir + '/model'),
      nonFatalMessage = 'Problem occured, but not fatal.',
      errorMessage = 'Fatal problem occured.';

  describe('generate()', function() {
    var app, request, response;

    beforeEach( function() {
      app = express();
      request = app.request;
      response = app.response;
      spyOn(response, 'send');
    });

    it('should return empty route model', function() {
      var defaultModel = modelFactory.createRoute();
      controller.generate(request, response);

      expect(response.send).toHaveBeenCalledWith({route: JSON.stringify(defaultModel)});
    });
    
  });

  describe('create()', function() {

    var app, request, response;

    beforeEach( function() {
      app = express();
      request = {body: json};
      response = app.response;
      spyOn(response, 'send');
    });

    it('should return the generated ID for the route upon success', function(done) {
      var returnValue;
      spyOn(service, 'addRoute').andCallFake( function(route, serialize, callback) {
        callback.call(null);
      });
      returnValue = {id: (new Date().getTime()).toString()};
      controller.create(request, response);

      expect(service.addRoute).toHaveBeenCalled();
      expect(response.send).toHaveBeenCalled();
      expect(response.send).toHaveBeenCalledWith(returnValue);
      done();
    });

    it('should return error on fault', function() {
      var errorMessage = 'it\'s busted!',
          errorObject = {error:errorMessage};

      spyOn(service, 'addRoute').andCallFake( function(route, serialize, callback) {
        callback.call(null, errorMessage);
      });
      controller.create(request, response);

      expect(response.send).toHaveBeenCalled();
      expect(response.send).toHaveBeenCalledWith(errorObject);
    });

    afterEach( function() {
      //
    });

  });

  describe('read()', function() {

    var app, request, response;

    beforeEach( function() {
      app = express();
      service.setApplication(app);

      request = app.request;
      response = app.response;
    });

    it('should return JSON string of associated route', function(done) {
      var json;

      sinon.stub(request, 'param', function(name) {
        return "0";
      });

      sinon.stub(response, 'send', function(payload) {
        json = JSON.parse(payload.route);
        expect(payload.hasOwnProperty('route')).toEqual(true);
        expect(payload.route).toEqual(jasmine.any(String));
        expect(json.id).toEqual('0');
        response.send.restore();
        done();
      });

      service.loadAPI(jsonURL).then( function() {
        controller.read(request, response);
      });
    });

    it('should return error if route not found associated with id', function(done) {
      sinon.stub(request, 'param', function(name) {
        return "12235454";
      });

      sinon.stub(response, 'send', function(payload) {
        expect(payload.hasOwnProperty('error')).toEqual(true);
        expect(payload.error).toEqual(jasmine.any(String));
        response.send.restore();
        done();
      });

      service.loadAPI(jsonURL).then( function() {
        controller.read(request, response);
      });
    });

    afterEach( function() {
      request.param.restore();
    });

  });

  describe('update()', function() {

    var app, request, response;

    beforeEach( function() {
      app = express();
      service.setApplication(app);

      request = app.request;
      response = app.response;

      spyOn(response, 'send');
      sinon.stub(request, 'param', function(name) {
        return "0";
      });
      request.body = json;
    });

    it('should return ok on success', function(done) {
      spyOn(service, 'updateRoute').andCallFake( function( id, json, serialize, callback ) {  
        callback.call(null);
        expect(response.send).toHaveBeenCalledWith({ok: true});
        done();
      });
      controller.update(request, response);
    });

    it('should return ok with non-fatal message on non-fatal fault', function(done) {
      spyOn(service, 'updateRoute').andCallFake( function( id, json, serialize, callback ) {
        callback.call(null, null, nonFatalMessage);
        expect(response.send).toHaveBeenCalledWith({ok: true, message:nonFatalMessage});
        done();
      });
      controller.update(request, response);
    });

    it('should return error on fatal fault', function(done) {
      spyOn(service, 'updateRoute').andCallFake( function( id, json, serialize, callback ) {
        callback.call(null, errorMessage);
        expect(response.send).toHaveBeenCalledWith({error: errorMessage});
        done();
      });
      controller.update(request, response);
    });

    afterEach( function() {
      request.param.restore();
    });

  });

  describe('remove()', function() {

    var app, request, response;

    beforeEach( function() {
      app = express();
      service.setApplication(app);

      request = app.request;
      response = app.response;

      spyOn(response, 'send');
      sinon.stub(request, 'param', function(name) {
        return "0";
      });
    });

    it('should return ok on success', function(done) {
      spyOn(service, 'removeRoute').andCallFake( function( id, serialize, callback ) {
        callback.call(null);
        expect(response.send).toHaveBeenCalledWith({ok: true});
        done();
      });
      controller.remove(request, response);
    });

    it('should return ok with non-fatal message on non-fatal fault', function(done) {
      spyOn(service, 'removeRoute').andCallFake( function( id, serialize, callback ) {
        callback.call(null, null, nonFatalMessage);
        expect(response.send).toHaveBeenCalledWith({ok: true, message:nonFatalMessage});
        done();
      });
      controller.remove(request, response);
    });

    it('should return error on fatal fault', function(done) {
      spyOn(service, 'removeRoute').andCallFake( function( id, serialize, callback ) {
        callback.call(null, errorMessage);
        expect(response.send).toHaveBeenCalledWith({error:errorMessage});
        done();
      });
      controller.remove(request, response);
    });

    afterEach( function() {
      request.param.restore();
    });

  });

});