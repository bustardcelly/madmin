/*global define:false Handlebars:false */
define(['jquery', 'script/controller/response-form-controller', 'script/util/param-util',
        'script/validator/json-value-validator', 'script/validator/route-path-validator',
        'text!template/parameter-form.hbs'],
        function($, responseForm, paramUtil,
                  jsonValidator, routePathValidator,
                  paramFormTemplate) {
  
  var $noParametersFragment = $('<p class="no-parameters-label">no parameters specified.</p>'),
      compiledParameterTemplate = Handlebars.compile(paramFormTemplate),
      createCloseEvent = function(controller) {
        var event = $.Event('close');
        event.controller = controller;
        return event;
      },
      createSaveEvent = function(controller) {
        var event = $.Event('save');
        event.controller = controller;
        return event;
      },
      dropdownItemSelectionHandler = function(controller) {
        return function(event) {
          var $item = $(this);
          event.preventDefault();
          $('.route-item-method-button', controller.$element).first().text($item.text());
          controller.isDirty = (controller.data.method !== $item.text());
        };
      },
      showParameterElements = function(variables, $paramContainer) {
        var index,
            length,
            variable;

          $paramContainer.empty();
          length = variables.length;
          if( length > 0 ) {
            for( index = 0; index < length; index++ ) {
              variable = variables[index];
              $paramContainer.append(compiledParameterTemplate(variable));
            }
          }
          else {
            if($noParametersFragment.parent().length === 0) {
              $noParametersFragment.appendTo($paramContainer);
            }
          }
      },
      getParameterElements = function($paramContainer) {
        var dataParameters = [],
            parameters = $('div.parameter-form-field', $paramContainer),
            $parameter,
            parameterData,
            i,
            length = parameters.length;

        for( i = 0; i < length; i++ ) {
          parameterData = {name:'', summary:''};
          $parameter = $(parameters.get(i));
          parameterData.name = $parameter.data('paramname');
          parameterData.summary = $('.parameter-input', $parameter).val();
          dataParameters.push(parameterData);
        }
        return dataParameters;
      },
      assignCloseButtonHandlers = function(controller) {
        var $element = controller.$element,
            closeButton = $('.route-close-btn', $element).first();
        closeButton.on('click', function(event) {
          event.preventDefault();
          controller.dispatcher.trigger(createCloseEvent(controller));
        });
      },
      removeCloseButtonHandlers = function(controller) {
        var $element = controller.$element,
            closeButton = $('.route-close-btn', $element).first();
        closeButton.off('click');
      },
      assignConfirmationHandlers = function(controller) {
        var $element = controller.$element,
            $commitButton = $('.route-item-commit-btn', $element).first(),
            $cancelButton = $('.route-item-cancel-btn', $element).first();
        $commitButton.on('click', function(event) {
          controller.dispatcher.trigger(createSaveEvent(controller));
        });
        $cancelButton.on('click', function(event) {
          controller.dispatcher.trigger(createCloseEvent(controller));
        });
      },
      removeConfirmationHandlers = function(controller) {
        var $element = controller.$element,
            $commitButton = $('.route-item-commit-btn', $element).first(),
            $cancelButton = $('.route-item-cancel-btn', $element).first();
        $commitButton.off('click');
        $cancelButton.off('click');
      },
      assignRouteInputHandlers = function(controller) {
        var $element = controller.$element,
            $input = $('.route-item-path', $element),
            $paramElem = $('.route-item-parameters', $element);
        
        $input.on('blur', function(event) {
          var variables, parameters;
          if( $(this).val() !== controller.data.path ) {
            variables = paramUtil.getVariableList(this.value);
            parameters = paramUtil.composeTemporaryParameterList(variables, controller.data.parameters);
            showParameterElements(parameters, $paramElem);
            controller.isDirty = true;
          }
        });
      },
      removeRouteInputHandlers = function(controller) {
        var $element = controller.$element,
            $input = $('.route-item-path', $element);
        $input.off('blur');
      },
      assignSummaryInputHandlers = function(controller) {
        var $element = controller.$element,
            $summaryInput = $('.route-item-summary', $element);
        $summaryInput.on('blur', function(event) {
          controller.isDirty = (controller.isDirty) ? true : (controller.data.summary !== $(this).val());
        });
      },
      removeSummaryInputHandlers = function(controller) {
        var $element = controller.$element,
            $summaryInput = $('.route-item-summary', $element);
        $summaryInput.off('unblur');
      },
      assignFormChangeHandlers = function(controller) {
        var $element = controller.$element;
        $element.on('form-change', function(event) {
          controller.isDirty = true;
        });
      },
      removeFormChangeHandlers = function(controller) {
        var $element = controller.$element;
        $element.off('form-change');
      },
      consoleControllers = [],
      consoleController = {
        init: function(json) {
          (function(controller) {
            $('.dropdown-menu a', controller.$element).each(function(index, item) {
              $(item).on('click', dropdownItemSelectionHandler(controller));
            });
          }(this));
          // parse data and trigger a populate operation.
          this.data = json;
        },
        activate: function() {
          this.$element.toggleClass('route-item-hidden');
          assignRouteInputHandlers(this);
          assignCloseButtonHandlers(this);
          assignConfirmationHandlers(this);
          assignSummaryInputHandlers(this);
          assignFormChangeHandlers(this);
          responseForm.activate(this.$element, this.data);
        },
        populate: function(routeData) {
          var $routeMethodButton = $('.route-item-method-button', this.$element),
              $routePathField = $('.route-item-path', this.$element),
              $routeSummaryField = $('.route-item-summary', this.$element),
              $paramContainer = $('.route-item-parameters', this.$element);

          // fill text and value fields.
          $routeMethodButton.text( routeData.method );
          $routePathField.val( routeData.path );
          $routeSummaryField.val( routeData.summary );
          // fill parameters.
          showParameterElements( routeData.parameters, $paramContainer );
        },
        validate: function() {
          var $pathField = $('.route-item-path', this.$element),
              $resultField = $('.route-item-result-input', this.$element),
              $errorField  = $('.route-item-error-input', this.$element),
              pathValidation,
              resultValidation,
              errorValidation,
              validated = true,
              validationHandler = (function(validationViews) {
                return function(alertView) {
                  if(alertView) {
                    validated = false;
                    validationViews.push(alertView);
                  }
                };
              }(this._validationViews));

          this._clearValidationViews();
          pathValidation = routePathValidator.validateInput($pathField, validationHandler);
          resultValidation = jsonValidator.validateTextArea($resultField, validationHandler);
          errorValidation = jsonValidator.validateTextArea($errorField, validationHandler);
          return validated;
        },
        serialize: function() {
          var $form = $('.route-item-response-form', this.$element).first(),
              $routeMethodButton = $('.route-item-method-button', this.$element),
              $routePathField = $('.route-item-path', this.$element),
              $routeSummaryField = $('.route-item-summary', this.$element),
              $paramContainer = $('.route-item-parameters', this.$element);

          this.isDirty = false;
          this.data.method = $routeMethodButton.text();
          this.data.path = $routePathField.val();
          this.data.parameters = getParameterElements($paramContainer);
          this.data.summary = $routeSummaryField.val();
          responseForm.serialize();
          return this.data;
        },
        reset: function() {
          this.isDirty = false;
          this.populate(this.data);
        },
        deactivate: function() {
          this.$element.addClass('route-item-hidden');
          removeRouteInputHandlers(this);
          removeCloseButtonHandlers(this);
          removeConfirmationHandlers(this);
          removeSummaryInputHandlers(this);
          removeFormChangeHandlers(this);
          responseForm.deactivate(this.$element, this.data);
        },
        dispose: function() {
          this._validationViews.length = 0;
          this.deactivate();
          $('.dropdown-menu a', this.$element).each(function(index, item) {
            $(item).off('click');
          });
          this.$element = null;
          this.dispatcher = null;
        },
        _validationViews: [],
        _clearValidationViews: function() {
          var $view;
          while(this._validationViews.length > 0) {
            $view = this._validationViews.shift();
            $view.remove();
          }
        }
      },
      findControllerFromElement = function($element) {
        var i = consoleControllers.length,
          controller;
        while( --i > -1 ) {
          controller = consoleControllers[i];
          if( controller.$element === $element ) {
            return controller;
          }
        }
        return undefined;
      };

  return {
    mediate: function( $element, routeJSON ) {
      var controller = Object.create(consoleController);

      (function(controller, $el) {
        var jsonData;
        Object.defineProperties(controller, {
          "$element": {
            value: $el,
            writable: true,
            enumerable: true
          },
          "isDirty": {
            value: false,
            writable: true,
            enumerable: true
          },
          "dispatcher": {
            value: $(controller),
            writable: false
          },
          "data": {
            enumerable: true,
            set: function(value) {
              if(jsonData !== value) {
                jsonData = (typeof value === 'string') ? JSON.parse(value) : value;
                controller.populate(jsonData);
              }
            },
            get: function() {
              return jsonData;
            }
          }
        });
      }(controller, $element));

      consoleControllers.push(controller);
      controller.init(routeJSON);
      return controller;
    },
    unmediate: function( $element ) {
      var controller = findControllerFromElement($element),
          index;

      if( controller ) {
        index = consoleControllers.indexOf(controller);
        if( index > -1 ) {
          consoleControllers.splice(index, 1);
        }
        controller.dispose();
        return controller;
      }
      return undefined;
    },
    serialize: function(controllerOrElement) {
      var controller = controllerOrElement;
      // if coming in as a jQuery object, find controller...
      if( controllerOrElement instanceof $ ) {
        controller = findControllerFromElement(controllerOrElement);
      }
      // if controller found, serialize.
      if( controller ) {
        return controller.serialize();
      }
      return undefined;
    }
  };

});