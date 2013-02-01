define(['jquery', 'script/service/service'], function($, service) {

  var routeObj = {
        id: "",
        path: "/savetest",
        method: "GET",
        summary: "Testing save on client",
        parameters:[],
        result: {
          ok: true
        },
        error: {
        },
        response: "result",
        delay: 1000
      };
  
  describe('JS Client | Service', function() {

    describe('create()', function() {

      var async = new AsyncSpec(this);

      beforeEach( function() {
        spyOn($, 'ajax').andReturn({
          then: function(delegate) {
            var timeout = setTimeout(function() {
              clearTimeout(timeout);
              delegate.call(null, {id:'2345'});
            });
          }
        });
      });

      async.it('should invoke generate on RESTful api', function(done) {
        var request = {
              url: 'http://localhost:8124/generate',
              type: 'GET'
            };

        service
          .create()
          .always( function() {
            expect($.ajax).toHaveBeenCalledWith(request);
            done();
          });
      });

    });

    describe('save()', function() {

      var async = new AsyncSpec(this);

      beforeEach( function() {
        spyOn($, 'ajax').andReturn({
          then: function(delegate) {
            var timeout = setTimeout(function() {
              clearTimeout(timeout);
              delegate.call(null, {ok:true});
            });
          }
        });
      });

      afterEach( function() {
        routeObj.id = "";
      });

      async.it('should call to save new entry on no id provided', function(done) {
        var request = {
              url: 'http://localhost:8124/admin',
              data: JSON.stringify(routeObj),
              dataType: 'json',
              contentType: 'application/json',
              type: 'POST'
            };

        service
          .save(routeObj)
          .always( function() {
            expect($.ajax).toHaveBeenCalledWith(request);
            done();
          });
      });

      async.it('should call to update stored entry if id provided', function(done) {
        var id = routeObj.id = '12345',
            request = {
              url: 'http://localhost:8124/admin/' + id,
              data: JSON.stringify(routeObj),
              dataType: 'json',
              contentType: 'application/json',
              type: 'POST'
            };

        service
          .save(routeObj)
          .always( function() {
            expect($.ajax).toHaveBeenCalledWith(request);
            done();
          });
      });

    });

    describe('remove()', function() {

      var async = new AsyncSpec(this);

      beforeEach( function() {
        spyOn($, 'ajax').andReturn({
          then: function(delegate) {
            var timeout = setTimeout(function() {
              clearTimeout(timeout);
              delegate.call(null, {ok:true});
            });
          }
        });
      });

      afterEach( function() {
        routeObj.id = "";
      });

      async.it('should call API with route id and DELETE request type', function(done) {

        var id = routeObj.id = '12345',
            request = {
              url: 'http://localhost:8124/admin/' + id,
              type: 'DELETE'
            };

        service
          .remove(routeObj)
          .always( function() {
            expect($.ajax).toHaveBeenCalledWith(request);
            done();
          });
      });

    });

  });

/* -- Integration Tests. Don't turn on unless you know of server being available. -->

  describe('JS Client | Service Integration', function() {
    
    describe('create()', function() {

      var async = new AsyncSpec(this);

      async.it('should return JSON on promise', function(done) {
        service.create()
          .done( function(json) {
            expect(json).toEqual(jasmine.any(Object));
            expect(json.id).toEqual('');
            expect(json.method).toEqual('GET');
          }).
          fail( function(errorMessage) {
            expect('json').toEqual(errorMessage);
          }).
          always( function() {
            done();
          });
      });

    });

  });
*/

});