/*global define:false Handlebars:false */
define( ['../../../../public/script/util/index-input-util.js',
          'text!template/route-console.hbs', 'text!template/uneditable-console.hbs', 
          'text!template/editable-console.hbs', 'text!template/parameter-form.hbs'], 
          function(indexInputUtil,
                    routeConsoleTemplate, uneditableConsoleTemplate, 
                    editableConsoleTemplate, parameterFormTemplate) {

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

    return {
      howareyou: function() {
        console.log('i\'m very well, thank you');
      }
    };

});