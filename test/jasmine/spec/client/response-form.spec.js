define(['jquery', 'script/controller/response-form-controller'], function($, responseForm) {

  var json = {
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
      },
      formElement = '<div style="display:none;"><div class="route-item-form-item route-item-response-form">' +
                      '<h4 class="route-item-form-label">Response: <small>select the default JSON response from the request</small></h4>' +
                      '<div class="route-data-input-block">' +
                        '<input id="resultResponse_1" class="route-item-radio" type="radio" name="response_1" value="radiobutton">' +
                        '<label class="route-item-form-label route-item-radio-label" for="resultResponse_1">Success: <small>paste in JSON to return for successful response</small></label>' +
                        '<div class="input-container">' +
                          '<textarea class="route-item-input route-item-result-input" placeholder="Enter JSON..." disabled="">{"test":"123","greeting":"hello,world"}</textarea>' +
                        '</div>' +
                      '</div>' +
                      '<div class="route-data-input-block">' +
                        '<input id="errorResponse_1" class="route-item-radio" type="radio" name="response_1" value="radiobutton">' +
                        '<label class="route-item-form-label route-item-radio-label" for="errorResponse_1">Error: <small>paste in JSON expected for a fault in request</small></label>' +
                        '<div class="input-container">' +
                          '<textarea class="route-item-input route-item-error-input" placeholder="Enter JSON...">{"error": "Routes not found"}</textarea>' +
                        '</div>' +
                      '</div>' +
                    '</div></div>',
      $form = $(formElement);
  
  describe('JS Client | Response Form', function() {

    describe('form-change event', function() {

      beforeEach( function() {
        // need to add to body in order for child selectors in form (ie, nth(0)) to be detected.
        $('body').append($form);
        responseForm.activate($form, json);
      });

      afterEach( function() {
        $form.remove();
        responseForm.deactivate($form);
      });

      it('should notify of form change on focus out of result field', function(done) {
        var resultField = $('.route-item-result-input', $form).first();
        $(responseForm).on('form-change', function(event) {
          // we've been notified...
          expect(true).toEqual(true);
          $(responseForm).off('form-change');
          done();
        });
        resultField.trigger('blur');
      });

      it('should notify of form change on focus out of error field', function(done) {
        var errorField = $('.route-item-error-input', $form).first();
        $(responseForm).on('form-change', function(event) {
          // we've been notified...
          expect(true).toEqual(true);
          $(responseForm).off('form-change');
          done();
        });
        errorField.trigger('blur');
      });

      it('should notify of form change on select of response type', function(done) {
        var resultInput = $('input#resultResponse_1', $form);
        $(responseForm).on('form-change', function(event) {
          // we've been notified...
          expect(true).toEqual(true);
          $(responseForm).off('form-change');
          done();
        });
        resultInput.trigger('click');
      });

    });

    describe('hasChanges()', function() {

      beforeEach( function() {
        // need to add to body in order for child selectors in form (ie, nth(0)) to be detected.
        $('body').append($form);
        responseForm.activate($form, json);
      });

      afterEach( function() {
        $form.remove();
        responseForm.deactivate($form);
      });

      it('should return false on no changes performed', function() {
        expect(responseForm.hasChanges()).toEqual(false);
      });

      it('should return true on update to any field values', function(done) {
        var resultInput = $('input#resultResponse_1', $form);
        $(responseForm).on('form-change', function(event) {
          expect(responseForm.hasChanges()).toEqual(true);
          done();
        });
        // set as default to return the error response in json declared at beginning of this spec.
        resultInput.get(0).checked = true;
      });

    });

    describe('serialize()', function() {

      beforeEach( function() {
        // need to add to body in order for child selectors in form (ie, nth(0)) to be detected.
        $('body').append($form);
        responseForm.activate($form, json);
      });

      afterEach( function() {
        $form.remove();
        responseForm.deactivate($form);
      });

      it('should assign modified fields to provided model', function() {
        var resultInput = $('input#resultResponse_1', $form),
            responseField = $('.route-item-result-input', $form).first(),
            errorField = $('.route-item-error-input', $form).first();

        resultInput.get(0).checked = true;
        responseField.val('{"test":"123","greeting":"foo, bar"}');
        errorField.val('{"error":"Oh, boy!"}');

        responseForm.serialize();
        expect(json.response).toEqual('result');
        expect(json.error).toEqual(JSON.parse($('.route-item-error-input', $form).first().val()));
        expect(json.result).toEqual(JSON.parse($('.route-item-result-input', $form).first().val()));
      });

    });

  });

});