/*global define:false */
define(['jquery'], function($) {

  var VARIABLE_DELIMETER = '/:',
      END_DELIMETER = '/';

  /**
   * Converts a list of parameter Objects to a map keyed at attribute
   * @param  {Array} list      List of parameters objects.
   * @param  {String} attribute Property name to use as key.
   * @return {Object}           Map of parameters using attribute key.
   */
  function _toMap( list, attribute ) {
    var i,
        length = list.length,
        element,
        map = {};
    
    for( i = 0; i < length; i++ ) {
      element = list[i];
      map[element[attribute]] = {name:element.name, summary:element.summary};
    }
    return map;
  }

  /**
   * Splits a string into an array of variables base on a predefined variable.
   * @param  {String} value The string to split on the delimeter.
   * @return {Array}       The split list.
   */
  function _getVariableList( value ) {
    // TODO: Regex this up!
    var splitURI = value.split( VARIABLE_DELIMETER ),
        i, length,
        variable, list = [],
        closeIndex;

    splitURI.shift();
    length = splitURI.length;
    for( i = 0; i < length; i++ ) {
      variable = splitURI[i];
      closeIndex = variable.indexOf(END_DELIMETER);
      closeIndex = (closeIndex < 0)? variable.length : closeIndex;
      variable = variable.substring(0, closeIndex);
      list[list.length] = variable;
    }
    return list;
  }

  /**
   * Returns modified variableList based on provided list of string values and predefined parameter objects (usually from dataset).
   * @param  {Array} variableList    List of strings that represent variables defined using the syntax /:<variable>.
   * @param  {Array} existingParams   Mapping of predefined variables. The structure of which is used to provide the modified listing of variables.
   * @return {Array}                 Modified variable list with a mix of predefined parameters and those object generated from temporary variables declared in variableList.
   */
  function _composeTempParamList( variableList, existingParams ) {
    var i,
        length,
        variable,
        definedParam,
        parameterList = [],
        parameterMap = _toMap(existingParams, 'name');

    length = variableList.length;
    for( i = 0; i < length; i++ ) {
      definedParam = parameterMap.hasOwnProperty(variableList[i]) ? parameterMap[variableList[i]] : undefined;
      if( definedParam ) {
        parameterList[parameterList.length] = definedParam;
      }
      else {
        variable = variableList[i];
        parameterList[parameterList.length] = {name:variable, summary:''};
      }
    }
    return parameterList;
  }

  return {
    getVariableList: _getVariableList,
    composeTemporaryParameterList: _composeTempParamList
  };

});