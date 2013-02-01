describe('Node Client | API Parser', function() {

  var baseURL = process.cwd() + '/script/com/infrared5/os/madmin',
      specURL = process.cwd() + '/test/jasmine/spec/fixtures',
      json  = require(specURL + '/example-api.json'),
      parser = require(baseURL + '/api-parser');

  describe( 'parseAPI()', function() {

    it('should notify callback on success', function(done) {
      parser.parseAPI( json, function(routes) {
        // we got here on success.
        done();
      });
    });

    it('should parse to proper length of defined api', function(done) {
      parser.parseAPI( json, function(routes) {
        expect(routes).not.toBeUndefined();
        expect(routes instanceof Array).toEqual(true);
        expect(routes.length).toEqual(2);
        done();
      });
    });

    it('should notify callback on fault with message String', function(done) {
      parser.parseAPI( null, null, function(error) {
        expect(error).toEqual(jasmine.any(String));
        done();
      });
    });

  });

});