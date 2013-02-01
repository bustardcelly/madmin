/*global define:false Handlebars:false */
define(['jquery', 'text!template/uneditable-console.hbs', 'text!template/parameter-item.hbs'],
        function($, consoleFragment, parameterFragment) {
  
  var consoleTemplate = Handlebars.compile(consoleFragment),
      parameterTemplate = Handlebars.compile(parameterFragment),
      createEditEvent = function(controller) {
        var event = $.Event('edit');
        event.controller = controller;
        return event;
      },
      createDeleteEvent = function(controller) {
        var event = $.Event('delete');
        event.controller = controller;
        return event;
      },
      editButtonClickHandler = function(controller) {
        return function(event) {
          event.preventDefault();
          controller.dispatcher.trigger(createEditEvent(controller));
        };
      },
      deleteButtonClickHandler = function(controller) {
        return function(event) {
          event.preventDefault();
          controller.dispatcher.trigger(createDeleteEvent(controller));
        };
      },
      consoleControllers = [],
      consoleController = {
        _$editButton: undefined,
        _$deleteButton: undefined,
        init: function(json) {
          this._$editButton = $('.route-edit-btn', this.$element).first();
          this._$deleteButton = $('.route-delete-btn', this.$element).first();
          this._$editButton.on('click', editButtonClickHandler(this));
          this._$deleteButton.on('click', deleteButtonClickHandler(this));
          // parse data and trigger a populate operation.
          this.data = json;
        },
        activate: function() {
          this.$element.toggleClass('route-item-hidden');
        },
        populate: function(routeData) {
          var $header = $('.route-header', this.$element),
              $summary = $('.route-item-summary', this.$element),
              $parameterContainer = $('.parameters-list', this.$element),
              i, length = routeData.parameters.length;

          $header.html(routeData.method + ' <small>' + routeData.path + '</small>');
          $summary.text(routeData.summary);
          $parameterContainer.empty();
          for( i = 0; i < length; i++ ) {
            $(parameterTemplate(routeData.parameters[i])).appendTo($parameterContainer);
          }
        },
        deactivate: function() {
          this.$element.toggleClass('route-item-hidden');
        },
        dispose: function() {
          this._$editButton.off('click');
          this._$deleteButton.off('click');
          this._$editButton = undefined;
          this._$deleteButton = undefined;
          this.$element = null;
          this.dispatcher = null;
        }
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
            enumarable: true
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
      var i = consoleControllers.length,
          controller;

      while( --i > -1 ) {
        controller = consoleControllers[i];
        if(controller.$element === $element ) {
          consoleControllers.splice(i, 1);
          return controller;
        }
      }
      return undefined;
    }
  };

});