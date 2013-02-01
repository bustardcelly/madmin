/*global define:false */
define(['jquery', 'script/controller/route-console-controller'],
        function($, routeConsoleControllerFactory) {

  var routeConsoleControllers = [],
      activeConsoleController;

  function activateConsole(consoleController) {
    if(typeof activeConsoleController !== 'undefined' ) {
      deactivateConsole(activeConsoleController);
    }
    consoleController.activate();
    activeConsoleController = consoleController;
  }
  
  function deactivateConsole(consoleController) {
    consoleController.deactivate();
    if( activeConsoleController === consoleController ) {
      activeConsoleController = undefined;
    }
  }

  function generateEditHandler(consoleController) {
    return function(event) {
      activateConsole(consoleController);
    };
  }

  function generateCloseHandler(consoleController) {
    return function(event) {
      deactivateConsole(consoleController);
    };
  }

  function generateDeleteHandler(consoleController) {
    return function(event) {
      var $routeElement = consoleController.$element;
      undecorate($routeElement);
      $routeElement.remove();
    };
  }

  function assignHandlers(consoleController) {
    $(consoleController).on('edit', generateEditHandler(consoleController));
    $(consoleController).on('close', generateCloseHandler(consoleController));
    $(consoleController).on('delete', generateDeleteHandler(consoleController));
  }

  function removeHandlers(consoleController) {
    $(consoleController).off('edit');
    $(consoleController).off('close');
    $(consoleController).off('delete');
  }

  function getControllerFromElement($element) {
    var index = routeConsoleControllers.length,
        consoleController;
    while( --index > -1 ) {
      consoleController = routeConsoleControllers[index];
      if(consoleController.$element === $element) {
        return consoleController;
      }
    }
    return undefined;
  }

  function decorate($routeElement) {
    var controller = routeConsoleControllerFactory.mediate($routeElement);
    assignHandlers(controller);
    routeConsoleControllers.push(controller);
  }

  function undecorate($routeElement) {
    var controller = getControllerFromElement($routeElement),
        index = (controller) ? routeConsoleControllers.indexOf(controller) : -1;

    removeHandlers(controller);
    if( index > -1 ) {
      routeConsoleControllers.splice(index, 1);
    }
  }

  function decorateAll(selector) {
    $(selector).each(function(index, el) {
      decorate($(el));
    });
  }

  function undecorateAll(selector) {
    $(selector).each(function(index, el) {
      undecorate($(el));
    });
  }

  return {
    init: function() {
      decorateAll('div.route-item');
    },
    addNewRoute: function(routeJSON) {
      var routeConsoleController = routeConsoleControllerFactory.create(routeJSON),
          $fragment = routeConsoleController.$element;

      routeConsoleControllers.push(routeConsoleController);
      assignHandlers(routeConsoleController);
      $fragment.insertBefore($('#add-route-button'));
      // activate.
      activateConsole(routeConsoleController);
    },
    close: function() {
      undecorateAll('div.route-item');
    }
  };

});