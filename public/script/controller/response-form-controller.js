/*global define:false */
define(['jquery'], function($) {

  var $routeItem,
      routeData,
      elementContext,
      isDirty = false,
      createChangeEvent = function() {
        return $.Event('form-change');
      },
      createContext = function($form) {
        var inputGroup  = $('input[type=radio]', $form).first().attr('name'),
            resultInput = $('input[name=' + inputGroup + ']:nth(0)'),
            errorInput  = $('input[name=' + inputGroup + ']:nth(1)'),
            resultField = $('.route-item-result-input', $form),
            errorField  = $('.route-item-error-input', $form);
        return {
          resultInput: resultInput,
          resultField: resultField,
          errorInput: errorInput,
          errorField: errorField
        };
      };

  function fill( context, routeData ) {
    isDirty = false;
    enableSection(context, routeData.response === 'result');
    context.resultField.val(JSON.stringify(routeData.result, null, 4));
    context.errorField.val(JSON.stringify(routeData.error, null, 4));
  }

  function enableSection( context, useResultResponse ) {
    if( useResultResponse ) {
      context.resultInput.get(0).checked = true;
      context.errorInput.get(0).checked = false;
      context.resultField.removeAttr('disabled');
      context.errorField.attr('disabled', true);
    }
    else {
      context.resultInput.get(0).checked = false;
      context.errorInput.get(0).checked = true;
      context.resultField.attr('disabled', true);
      context.errorField.removeAttr('disabled');
    }
  }

  function addSelectionHandlers( context ) {
    $(context.resultInput).bind('click', function(event) {
      enableSection(context, true);
      isDirty = true;
      $routeItem.trigger(createChangeEvent());
    });
    $(context.errorInput).bind('click', function(event) {
      enableSection(context, false);
      isDirty = true;
      $routeItem.trigger(createChangeEvent());
    });
  }

  function removeSelectionHandlers( context ) {
    $(context.resultInput).unbind('click');
    $(context.errorInput).unbind('click');
  }

  function addInputHandlers(context) {
    $(context.resultField).bind('blur', function(event) {
      isDirty = true;
      $routeItem.trigger(createChangeEvent());
    });
    
    $(context.errorField).bind('blur', function(event) {
      isDirty = true;
      $routeItem.trigger(createChangeEvent());
    });
  }

  function removeInputHandlers(context) {
    $(context.resultField).unbind('blur');
    $(context.errorField).unbind('blur');
  }

  function _activate( $routeItem, data ) {
    var $form = $('.route-item-response-form', $routeItem).first(),
        useResultResponse = (data.response === 'result'),
        context = createContext($form);

    elementContext = context;
    enableSection(elementContext, useResultResponse);
    addSelectionHandlers(elementContext);
    addInputHandlers(elementContext);
    fill( elementContext, data );
  }

  function _deactivate( $routeItem ) {
    var $form = $('.route-item-response-form', $routeItem).first();
    removeSelectionHandlers(elementContext);
    removeInputHandlers(elementContext);
  }

  return {
    activate: function($item, data) {
      if( typeof $routeItem !== 'undefined' ) {
        this.deactivate($routeItem);
      }
      $routeItem = $item;
      routeData = data;
      _activate($routeItem, routeData);
    },
    deactivate: function($item) {
      if( $routeItem === $item ) {
        _deactivate($routeItem);
        $routeItem = undefined;
        routeData = undefined;
        elementContext = undefined;
      }
    },
    serialize: function() {
      isDirty = false;
      routeData.response = elementContext.resultInput.get(0).checked ? 'result' : 'error';
      routeData.result = JSON.parse(elementContext.resultField.val());
      routeData.error = JSON.parse(elementContext.errorField.val());
    },
    hasChanges: function() {
      return isDirty;
    }
  };
});