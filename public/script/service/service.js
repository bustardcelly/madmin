/*global define:false */
define(['jquery', 'module'], function($, module) {
  
  var serviceURL = module.config().serviceURL,
      isValidRouteID = function(value) {
        return (typeof value === 'string') && value.length > 0;
      },
      service = {
        /**
         * Request to generate a new model to base route item on.
         * @return {Deferred} jQuery Deferred
         */
        create: function() {
          var deferred = $.Deferred();
          $.ajax({
            url: serviceURL + '/generate',
            type: 'GET'
          }).then( function(response) {
            if(response.hasOwnProperty('error')) {
              deferred.reject(response.error);
            }
            else if(response.hasOwnProperty('route')) {
              deferred.resolve(JSON.parse(response.route));
            }
            else {
              deferred.reject('Could not handle model creation properly.');
              console.log('[madmin-service.js]::create(). Response unhandled: ' + JSON.stringify(response, null, 2));
            }
          });
          return deferred;
        },
        /**
         * Request to save route item to server. If id found on model, runs an update. If no id, saves a new ite,.
         * @param  {Object} json Object to be serialized to JSON string.
         * @return {Deferred}      jQuery Deferred
         */
        save: function(json) {
          var deferred = $.Deferred(),
              jsonData = JSON.stringify(json);
          // If valid id on model, request an update on service.
          if(isValidRouteID(json.id)) {
            $.ajax({
              url: serviceURL + '/admin/' + json.id,
              data: jsonData,
              dataType: 'json',
              contentType: 'application/json',
              type: 'POST'
            }).then( function(response) {
              if(response.hasOwnProperty('error')) {
                deferred.reject(response.error);
              }
              else {
                if(response.hasOwnProperty('message')) {
                  console.log('[madmin-service.js]::save(). Non-fatal message receieved: ' + response.message);
                }
                deferred.resolve(json);
              }
            });
          }
          // else add new item to router.
          else {
            $.ajax({
              url: serviceURL + '/admin',
              data: jsonData,
              dataType: 'json',
              contentType: 'application/json',
              type: 'POST'
            }).then( function(response) {
              if(response.hasOwnProperty('error')) {
                deferred.reject(response.error);
              }
              else if(response.hasOwnProperty('id')) {
                json.id = response.id;
                deferred.resolve(json);
              }
              else {
                deferred.reject('Could not handle saving route properly.');
                console.log('[madmin-service.js]::save(). Response unhandled: ' + JSON.stringify(response, null, 2));
              }
            });
          }
          return deferred;
        },
        /**
         * Request to remove route item from service.
         * @param  {Object} json Object to serialize to JSON string.
         * @return {Deferred}      jQuery Deferred
         */
        remove: function(json) {
          var deferred = $.Deferred();
          console.log('Request to delete: ' + (serviceURL + '/admin/' + json.id));
          $.ajax({
              url: serviceURL + '/admin/' + json.id,
              type: 'DELETE'
            }).then( function(response) {
              if(response.hasOwnProperty('error')) {
                deferred.reject(response.error);
              }
              else {
                if(response.hasOwnProperty('message')) {
                  console.log('[madmin-service.js]::remove(). Non-fatal message receieved: ' + response.message);
                }
                deferred.resolve(true);
              }
            });
          return deferred;
        }
      };

  return service;

});