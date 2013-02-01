/*global requirejs:false define:false Handlebars:false */
(function(window, require) {

  "use strict";

  define.amd.jQuery = true;

  require.config({
    baseUrl: ".",
    paths: {
        "script": "./script",
        "lib": "./lib",
        "template": "./template",
        "jquery": "lib/jquery-1.8.2.min",
        "text": "lib/require-text-plugin"
    },
    // allows for jquery to load before bootstrap as it has a dependency on $
    shim: {
      'lib/bootstrap.min': {
        deps: ['jquery'],
        exports: 'bootstrap'
      },
      'lib/handlebars-1.0.rc.1.min.js': {
        exports: 'handlebars'
      }
    },
    config: {
      "script/service/service": {
        serviceURL: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port
      }
    }
  });

  // require in templates and establish helpers.
  require( ['lib/handlebars-1.0.rc.1.min.js', 'script/util/index-input-util.js',
            'text!template/route-console.hbs', 'text!template/uneditable-console.hbs',
            'text!template/editable-console.hbs', 'text!template/parameter-form.hbs',
            'text!template/parameter-item.hbs'],
            function(handlebars, indexInputUtil,
                      routeConsoleTemplate, uneditableConsoleTemplate,
                      editableConsoleTemplate, parameterFormTemplate,
                      parameterItemTemplate) {

    var generatePartialTemplate = function(template) {
          return function(options) {
            return template(this);
          };
        };

    Handlebars.registerHelper('stringify', function(value) {
      return JSON.stringify(value);
    });
    Handlebars.registerHelper('index-input', function(value) {
      return indexInputUtil.call(null, value);
    });
    Handlebars.registerHelper('route_console', generatePartialTemplate(Handlebars.compile(routeConsoleTemplate)));
    Handlebars.registerHelper('uneditable_console', generatePartialTemplate(Handlebars.compile(uneditableConsoleTemplate)));
    Handlebars.registerHelper('editable_console', generatePartialTemplate(Handlebars.compile(editableConsoleTemplate)));
    Handlebars.registerHelper('parameter_form', generatePartialTemplate(Handlebars.compile(parameterFormTemplate)));
    Handlebars.registerHelper('parameter_item', generatePartialTemplate(Handlebars.compile(parameterItemTemplate)));

    // load app.
    require(['jquery', 'lib/bootstrap.min', 'script/madmin-console','script/service/service'],
            function( $, bootstrap, madminConsole, madminService ) {
      // assign add handler.
      $('#add-route-button').on('click', function(event) {
        madminService.create()
          .done( function(routeJSON) {
            madminConsole.addNewRoute(routeJSON);
          })
          .fail( function(error) {
            console.log('Fault in generating new route model: ' + error);
          });
      });
      // start
      madminConsole.init();
    });

  });

}(window, requirejs));