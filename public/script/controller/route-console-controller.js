/*global define:false Handlebars:false */
define(['jquery',
        'script/service/service',
        'script/controller/editable-console-controller', 'script/controller/uneditable-console-controller',
        'script/view/alert-view', 'script/util/validation-util',
        'text!template/route-console.hbs'],
        function($, service,
                  editableConsoleFactory, uneditableConsoleFactory,
                  alertView, validation,
                  routeConsoleFragment) {

  var consoleTemplate = Handlebars.compile(routeConsoleFragment),
      validateConsoleDataOnCancel = function(routeConsoleController, originalEvent) {
        var editableConsole = routeConsoleController.editableConsole;
        if(editableConsole.isDirty) {
          alertView.confirm({
            title:'Warning!',
            message:'You have unsaved data. What would you like to do?',
            denyLabel: 'Close anyway',
            confirmLabel: 'Oops... take me back',
            confirm: function() {
              // fall through. will keep it open.
            },
            deny: function() {
              editableConsole.reset();
              $(routeConsoleController).trigger(originalEvent);
            }
          });
        }
        else {
          $(routeConsoleController).trigger(originalEvent);
        }
      },
      validateConsoleDataOnSave = function(routeConsoleController, originalEvent) {
        var editableConsole = routeConsoleController.editableConsole,
            alertController;

        if(editableConsole.isDirty) {
          if(!editableConsole.validate()) {
            alertView.alert({
              title: 'Warning!',
              message: 'There are additional edits required.',
              confirmLabel: 'OK'
            });
          }
          else {
            alertController = alertView.message({message:'Saving Route...'});
            routeConsoleController.save()
              .then(function(response) {
                      alertController.close();
                      $(routeConsoleController).trigger($.Event('close'));
                    },
                    function(errorMessage) {
                      alertController.close();
                      alertView.alert({
                        title: 'Error!',
                        message: 'An error occured in trying to save route: ' + errorMessage,
                        confirmLabel: 'OK'
                      });
                    });
          }
        }
        else {
          $(routeConsoleController).trigger($.Event('close'));
        }
      },
      validateConsoleOnDelete = function(routeConsoleController, originalEvent) {
        var warningAlert,
            warningConfig = {
              title: 'Warning!',
              message: 'Are you sure you want to delete?',
              confirmLabel: 'Yes',
              denyLabel: 'Oops... No!',
              confirm: function() {
                routeConsoleController.remove()
                  .then(function(response) {
                    $(routeConsoleController).trigger(originalEvent);
                  },
                  function(errorMessage) {
                    alertView.alert({
                      title: 'Error!',
                      message: 'An error occured in trying to delete route: ' + errorMessage,
                      confirmLabel: 'OK'
                    });
                  });
              }
            };
        warningAlert = alertView.confirm(warningConfig);
      },
      assignHandlers = function(rConsole) {
        var editableConsole = rConsole.editableConsole.dispatcher,
            uneditableConsole = rConsole.uneditableConsole.dispatcher;
        uneditableConsole.on('edit', function(event) {
          // bubble out.
          $(rConsole).trigger(event);
        });
        uneditableConsole.on('delete', function(event) {
          validateConsoleOnDelete(rConsole, event);
        });
        editableConsole.on('close', function(event) {
          validateConsoleDataOnCancel(rConsole, event);
        });
        editableConsole.on('save', function(event) {
          validateConsoleDataOnSave(rConsole, event);
        });
      },
      removeHandlers = function(rConsole) {
        var editableConsole = rConsole.editableConsole.dispatcher,
            uneditableConsole = rConsole.uneditableConsole.dispatcher;
        uneditableConsole.off('delete');
        uneditableConsole.off('edit');
        editableConsole.off('close');
        editableConsole.off('save');
      },
      routeConsole = {
        init: function(routeData) {
          assignHandlers(this);
          return this;
        },
        activate: function() {
          var updatedRoute = this.$element.data('route');
          this.editableConsole.data = updatedRoute;
          this.uneditableConsole.deactivate();
          this.editableConsole.activate();
          this.$element.toggleClass('route-item-active');
        },
        deactivate: function() {
          var updatedRoute = this.$element.data('route');
          this.uneditableConsole.data = updatedRoute;
          this.editableConsole.deactivate();
          this.uneditableConsole.activate();
          this.$element.toggleClass('route-item-active');
        },
        save: function() {
          var deferred = $.Deferred(),
              update = this.editableConsole.serialize();

          (function(controller) {
            service
              .save(update)
              .then(function(response) {
                controller.data = update;
                controller.$element.data('route', JSON.stringify(update));
                deferred.resolve(true);
              }, function(errorMessage) {
                deferred.reject(errorMessage);
              });
          }(this));

          return deferred;
        },
        remove: function() {
          var deferred = $.Deferred();
          // if we have an id for the route, attempt to DELETE.
          if(validation.isValidRouteIDValue(this.data.id)) {
            (function(controller) {
              service
                .remove(controller.data)
                .then(function(response) {
                  controller.dispose();
                  deferred.resolve(true);
                }, function(errorMessage) {
                  deferred.reject(errorMessage);
                });
            }(this));
          }
          // else, User could have closed mid-edit new route item with no id.
          else {
            deferred.resolve(true);
          }
          return deferred;
        },
        dispose: function() {
          this.uneditableConsole.dispose();
          this.editableConsole.dispose();
        }
      };
  
  return {
    decorate: function(newConsole, $element, data) {
      (function(newConsole, $element, routeJSON) {
        var _data,
            editableConsole = editableConsoleFactory.mediate( $('.route-item-editable', $element), routeJSON ),
            uneditableConsole = uneditableConsoleFactory.mediate( $('.route-item-uneditable', $element), routeJSON );

        Object.defineProperties(newConsole, {
          "$element": {
            value: $element,
            writable: false
          },
          "editableConsole": {
            value: editableConsole,
            writable: false
          },
          "uneditableConsole": {
            value: uneditableConsole,
            writable: false
          },
          "data": {
            set: function(value) {
              _data = value;
            },
            get: function() {
              return _data;
            }
          }
        });
      }(newConsole, $element, data));
      newConsole.data = (typeof data === 'string') ? JSON.parse(data) : data;
    },
    create: function(routeJSON) {
      var $routeElement = $(consoleTemplate(routeJSON)),
          newConsole = Object.create(routeConsole);

      this.decorate(newConsole, $routeElement, routeJSON);
      newConsole.editableConsole.isDirty = true;
      return newConsole.init();
    },
    mediate: function(consoleElement) {
      var newConsole,
          $consoleElement = (consoleElement instanceof $) ? consoleElement : $(consoleElement),
          routeJSON = $consoleElement.data('route');
      if(routeJSON === undefined) {
        return undefined;
      }
      else {
        newConsole = Object.create(routeConsole);
        this.decorate(newConsole, $consoleElement, routeJSON);
        return newConsole.init();
      }
    }
  };

});