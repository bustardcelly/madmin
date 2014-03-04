console.log('dir: ' + __dirname);
var http       = require('http'),
    fs         = require('fs'),
    path       = require('path'),
    express    = require('express'),
    app        = express(),
    hbs        = require('hbs'),
    srcDir     = path.join(__dirname, 'script/com/infrared5/os/madmin'),
    controller = require(path.join(srcDir, 'controller')),
    service    = require(path.join(srcDir, '/service')),
    winston    = require('winston'),
    templates  = path.join(__dirname, 'public/template'),
    logger     = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)({
          prettyPrint: true,
          colorize: true,
          timestamp: true
        })
      ]
    });

// body parser.
app.use( express.bodyParser() );

// ## CORS middleware
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);

// Default
app.get( '/', controller.admin);

// Define public files for urls in templates.
app.use( express.static(__dirname + '/public') );
app.use( express.errorHandler({ dumpExceptions: true, showStack: true }) );

// Handlebars Templating.
var cachedPartials = {};
var generatePartialTemplate = function(filename) {
  return function(options) {
    var html, template;

    if(cachedPartials.hasOwnProperty(filename)) {
      template = cachedPartials[filename];
    }
    else {
      try {
        html = fs.readFileSync(filename, 'UTF8');
        template = cachedPartials[filename] = hbs.compile(html);
      }
      catch(error) {
        logger.error('Could not load partial from ' + filename + '. ' + error.message);
        html = fs.readFileSync(templates + '/unknown-error.ejs');
        template = hbs.compile(html);
      }
    }
    // template = hbs.compile(html);
    return template(this);
  };
};

app.set('views', __dirname + '/public/template');
app.set('view engine', 'hbs');
hbs.registerHelper('route_console', generatePartialTemplate(templates + '/route-console.hbs'));
hbs.registerHelper('uneditable_console', generatePartialTemplate(templates + '/uneditable-console.hbs'));
hbs.registerHelper('editable_console', generatePartialTemplate(templates + '/editable-console.hbs'));
hbs.registerHelper('parameter_form', generatePartialTemplate(templates + '/parameter-form.hbs'));
hbs.registerHelper('parameter_item', generatePartialTemplate(templates + '/parameter-item.hbs'));
/**
 * Helper to stringify object
 * @param  {Object} value Route model object
 * @return {String}        
 */
hbs.registerHelper('stringify', function(value) {
  return JSON.stringify(value);
});
/**
 * Helper to define a unique identifier either based on model or time of request.
 * @param  {Object} value Route model object.
 * @return {String}        Unique string identifier.
 */
hbs.registerHelper('index-input', function(value) {
  var id;
  if(value.hasOwnProperty('id') &&
     typeof value.id === 'string' &&
     value.id.length > 0) {
    id = value.id;
  }
  else {
    id = (new Date()).getTime().toString();
  }
  return id;
});
/**
 * Helper to return length of provided value assumed as an Array. Returns 0 is value is not an Array.
 * @param  {Array} value
 * @return {Number}
 */
hbs.registerHelper('iflength', function(value) {
  return Array.isArray(value) && value.length > 0;
});

// RESTful paths
app.get( '/generate', controller.generate );
app.get( '/admin', controller.admin );
app.post( '/admin', controller.create );
app.get( '/admin/:entryId', controller.read );
app.post( '/admin/:entryId', controller.update );
app.delete( '/admin/:entryId', controller.remove );

// Fault >
app.use( function(err, req, res, next){
  logger.error(err.stack);
  res.statusCode = 500;
  res.render('500');
});

app.use( function(req, res, next){
  res.statusCode = 404;
  res.render('404');
});

var madmin = module.exports;
madmin.init = function(port, json) {
  service.setApplication(app);
  service.loadAPI(json).then( function() {
    app.listen(port);
    logger.info("madmin server running on port " + port + " in " + app.settings.env + " mode");
  },
  function(error) {
    logger.error(error.toString());
  });
};