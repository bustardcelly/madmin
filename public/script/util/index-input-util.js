/*global define:false */
define(function() {
  
  function hasValidID(value) {
    return ( value.hasOwnProperty('id') ) &&
           ( typeof value.id === 'string' ) &&
           ( value.id.length > 0 );
  }

  /**
   * Returns identifier based on existance of id.
   * @param  {Object} model Route model object
   * @return {String}       identifier
   */
  return function(model) {
    return hasValidID(model) ? model.id : (new Date()).getTime().toString();
  };

});