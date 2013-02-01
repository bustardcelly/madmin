describe('Node Client | API Serializer', function() {
  
  var baseURL = process.cwd() + '/script/com/infrared5/os/madmin',
      specURL = process.cwd() + '/test/jasmine/spec/fixtures',
      serializer = require(baseURL + '/api-serializer'),
      filename = specURL + '/example-api.json';

  describe('read()', function() {

    it('should return Object representing routing API', function(done) {
      serializer.read(filename).then( function(data) {
        expect(data).not.toBeUndefined();
        expect(data).toEqual(jasmine.any(Object));
        expect(data.api).not.toBeUndefined();
        done();
      });
    });

  });
});