/*global define:false */
define(function() {
  
  return {
    isValidRouteIDValue: function(value) {
      return (typeof value === 'string') && value.length > 0;
    }
  };

});