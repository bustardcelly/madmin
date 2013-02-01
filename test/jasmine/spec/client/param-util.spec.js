define(['script/util/param-util'], function(param_util) {
  
  describe('JS Client | Param Util', function() {
    
    describe('getVariableList()', function() {

      var single = '/route/:id',
          intermitent = '/route/:id/user/:name/:first';

      it('should split on /: and return an array', function() {
        var variables = param_util.getVariableList(single);
        expect(variables instanceof Array).toEqual(true);
        expect(variables.length).toEqual(1);
      });

      it('should return single item from ' + single, function() {
        var variables = param_util.getVariableList(single);
        expect(variables.length).toEqual(1);
        expect(variables[0]).toEqual('id');
      });

      it('should return list of only variables defined with prefix of :/ from ' + intermitent, function() {
        var variables = param_util.getVariableList(intermitent);
        expect(variables.length).toEqual(3);
        expect(variables[0]).toEqual('id');
        expect(variables[1]).toEqual('name');
        expect(variables[2]).toEqual('first');
      });

      it('should return properly with variable declared as first item', function() {
        var variables = param_util.getVariableList('/:routeId');
        expect(variables.length).toEqual(1);
        expect(variables[0]).toEqual('routeId');
      });

    });

    describe('composeTemporaryParameterList()', function() {
      var variables;

      beforeEach(function() {
        variables = param_util.getVariableList('/route/:id/user/:name/:first');
      });

      it('should return a list of variables with name and summary properties', function() {
        var parameters = param_util.composeTemporaryParameterList(variables,[]);
        expect(parameters instanceof Array).toEqual(true);
        expect(parameters.length).toEqual(3);
        expect(parameters[0].hasOwnProperty('name')).toEqual(true);
        expect(parameters[1].hasOwnProperty('summary')).toEqual(true);
      });

      it('should fold in existing items into new variable list', function() {
        var parameters = param_util.composeTemporaryParameterList(variables,[{name:'id', summary:'hello, world'}]);
        expect(parameters.length).toEqual(3);
      });

      it('should copy over previously defined summary properties if found', function() {
        var defined_summary = 'hello, world',
            parameters = param_util.composeTemporaryParameterList(variables,[{name:'id', summary:defined_summary}]);
        expect(parameters[0].summary).toBe(defined_summary);
      });

      it('should not extend variable list with existing items', function() {
         var parameters = param_util.composeTemporaryParameterList(variables,[{name:'foo', summary:'bar'}, {name:'hello', summary:'world'}]);
        expect(parameters.length).not.toEqual(5);
      });

      afterEach(function() {
        variables = undefined;
      });

    });
    
  });

});