define(['script/util/index-input-util'], function(indexInputUtil) {
  
  describe('index-input-util', function() {

    it('should return the model id value', function() {
      var id = '12344',
          model = {id:id};

      expect(indexInputUtil.call(null, model)).toEqual(id);
    });

    it('should return timestamp if model does not provide an id', function() {
      var model = {id: ''};
      expect(indexInputUtil.call(null, model).length).toBeLessThan(14);
    });

    it('should return timestamp if model provided has invalid id (empty)', function() {
      var timestamp = (new Date()).getTime().toString(),
          model = {id: ''};

      expect(indexInputUtil.call(null, model)).toEqual(timestamp);
    });

  });

});