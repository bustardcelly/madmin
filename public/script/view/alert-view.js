/*global define:false Handlebars:false */
define(['jquery',
        'text!template/alert-basic.hbs', 'text!template/alert-confirm.hbs', 'text!template/alert-message.hbs'],
        function($, alertBasicFragment, alertConfirmFragment, alertMessageFragment) {

  var basicAlertTemplate = Handlebars.compile(alertBasicFragment),
      confirmationAlertTemplate = Handlebars.compile(alertConfirmFragment),
      messageAlertTemplate = Handlebars.compile(alertMessageFragment);

  return {
    alert: function(config) {
      var $alert = $(basicAlertTemplate(config));
      $('.alert-confirm-btn', $alert).on('click', function() {
        $alert.remove();
        $(this).off('click');
        if(config.confirm) {
          config.confirm.call(null, config);
        }
      });
      $alert.appendTo($('body'));
      return $alert;
    },
    confirm: function(config) {
      var $alert = $(confirmationAlertTemplate(config));
      $('.alert-confirm-btn', $alert).on('click', function() {
        $alert.remove();
        $(this).off('click');
        if(config.confirm) {
          config.confirm.call(null, config);
        }
      });
      $('.alert-deny-btn', $alert).on('click', function() {
        $alert.remove();
        $(this).off('click');
        if(config.deny) {
          config.deny.call(null, config);
        }
      });
      $alert.appendTo($('body'));
      return $alert;
    },
    message: function(config) {
      var $alert = $(messageAlertTemplate(config));
      $alert.appendTo($('body'));
      return {
        view: $alert,
        close: function() {
          $alert.remove();
        }
      };
    }
  };

});