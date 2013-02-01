/*global define:false Handlebars:false */
define(['jquery', 'text!template/alert-validator.hbs'], function($, validatorFragment) {
  
  var invalidJSONMessage = 'Invalid JSON format.',
      validatorTemplate = Handlebars.compile(validatorFragment);

  return {
    validateTextArea: function($textArea, callback) {
      var $alert;
      
      try {
        var jsonObject = JSON.parse($textArea.val());
        if(jsonObject !== undefined) {
          callback.call(null);
        }
        else {
          throw new Error('JSON not valid.');
        }
      }
      catch(e) {
        $alert = $(validatorTemplate({message:invalidJSONMessage}));
        $alert.insertBefore($textArea)
          .css('margin-bottom', '4px');

        callback.call(null, $alert);
      }
    }
  };

});