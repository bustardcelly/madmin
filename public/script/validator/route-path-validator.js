/*global define:false Handlebars:false */
define(['jquery', 'text!template/alert-validator.hbs'], function($, validatorFragment) {

  var invalidValues = ['', '/', '/admin'],
      invalidPathMessage = 'Route path is not supported.',
      validatorTemplate = Handlebars.compile(validatorFragment);
  
  return {
    validateInput: function($input, callback) {
      var value = $input.val(),
          $alert;
      if(invalidValues.indexOf(value) === -1) {
        callback.call(null);
      }
      else {
        $alert = $(validatorTemplate({message:invalidPathMessage}));
        $alert.insertBefore($input)
          .css('margin-bottom', '4px');

        callback.call(null, $alert);
      }
    }
  };

});