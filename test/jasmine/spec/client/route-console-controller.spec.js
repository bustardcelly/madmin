define(['jquery', 'expose!script/controller/route-console-controller', 'text!template/route-console.hbs'], 
        function($, routeControllerFactory, routeElementFragment) {

  describe('Route Console Controller', function() {

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
          delay: 1000,
          status: 200
        },
        newID = '2345',
        controller;

    describe('create()', function() {

      var async = new AsyncSpec(this);

      beforeEach( function() {
        controller = routeControllerFactory.create(routeObj);
      });

      afterEach( function() {
        controller.dispose();
        controller = undefined;
      });

      it('should assign newly created json data to data-route', function() {
        expect(controller.$element.data('route')).toEqual(routeObj);
      });

      async.it('should serialize json data to element data-route', function(done) {
        var savedRoute = $.extend(true, {}, routeObj);
        savedRoute.id = newID;

        spyOn($, 'ajax').andReturn({
          then: function(delegate) {
            var timeout = setTimeout(function() {
              clearTimeout(timeout);
              delegate.call(null, {id:newID});
            });
          }
        });
        
        // required for [input] query reference :/
        controller.$element.appendTo($('body')).css('visibility', 'hidden');
        controller.activate();

        controller.save().then( function(response) {
          expect(JSON.parse(controller.$element.data('route'))).toEqual(savedRoute);
          controller.$element.remove();
          done();  
        });
      });

    });

    describe('mediate()', function() {

      var async = new AsyncSpec(this),
          routeElementTemplate = Handlebars.compile(routeElementFragment);

      it('should generate a route console controller for established route element', function() {
        controller = routeControllerFactory.mediate(routeElementTemplate(routeObj));
        expect(controller).not.toBeUndefined();
      });

      it('should not generate route console controller for non-recognized route element (no [data-route])', function() {
        controller = routeControllerFactory.mediate($('<div><p>not a route element</p></div>'));
        expect(controller).toBeUndefined();
      });

    });

    describe('save()', function() {

      var serviceStub,
          controller,
          async = new AsyncSpec(this),
          routeElementTemplate = Handlebars.compile(routeElementFragment);

      beforeEach( function() {
        serviceStub = routeControllerFactory.require_exposed_dependencies['script/service/service'];
        controller = routeControllerFactory.mediate(routeElementTemplate(routeObj));
        // required for [input] query reference :/
        controller.$element.appendTo($('body')).css('visibility', 'hidden');
        controller.activate();
      });

      afterEach( function() {
        serviceStub = undefined;
        controller.dispose();
        controller.$element.remove();
        controller = undefined;
      });

      async.it('should update .data on controller on success of save()', function(done) {
        var deferred;

        spyOn(serviceStub, 'save').andReturn( {
          then: function(delegate) {
            var timeout = setTimeout(function() {
              clearTimeout(timeout);
              delegate.call(null);
            });
          }
        });

        deferred = controller.save();
        deferred.then(function() {
          expect(controller.data).toEqual(routeObj);
          expect(controller.$element.data('route')).toEqual(JSON.stringify(routeObj));
          done();
        });

      });

    });

    describe('remove()', function() {

      var serviceStub,
          controller,
          async = new AsyncSpec(this),
          routeElementTemplate = Handlebars.compile(routeElementFragment);

      beforeEach( function() {
        routeObj.id = '121334';
        serviceStub = routeControllerFactory.require_exposed_dependencies['script/service/service'];
        controller = routeControllerFactory.mediate(routeElementTemplate(routeObj));
      });

      afterEach( function() {
        routeObj.id = '';
        serviceStub = undefined;
        controller.dispose();
        controller = undefined;
      });

      async.it('should update .data on controller on success of save()', function(done) {
        var deferred;

        spyOn(serviceStub, 'remove').andReturn( {
          then: function(delegate) {
            var timeout = setTimeout(function() {
              clearTimeout(timeout);
              delegate.call(null);
            });
          }
        });
        spyOn(controller, 'dispose');

        deferred = controller.remove();
        deferred.then(function() {
          expect(controller.dispose).toHaveBeenCalled();
          done();
        });

      });

    });

  });

});