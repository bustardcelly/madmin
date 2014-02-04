madmin [![Build Status](https://travis-ci.org/infrared5/madmin.png)](https://travis-ci.org/infrared5/madmin)
=============

> admin console for generating mock services with RESTful URIs.


Getting and deploying madmin
---

1. Clone the <code>madmin</code> repo:

		git clone git://github.com:infrared5/madmin.git

2. Install the node module dependencies deifned in <code>package.json</code>

		npm install
	
3. Run <code>madmin</code>

		node index.js
	
Open your favorite modern web browser and go to [http://localhost:8124/admin](http://localhost:8124/admin).


[Usage](id:usageanchor) 
---

**$> node index.js [port] [json]**

When starting the <code>madmin</code> server, you can provide optional port and json source file. The following example shows it's usage and the default values:

    node index.js --port 8124 --json ./public/resource/api.json

When run, <code>madmin</code> will print out the specified port and json resource file defined:
	
	2013-01-28 16:05:54 - info: JSON api read from /Users/toddanderson/madmin/public/resource/api.json.
	2013-01-28 16:05:54 - info: madmin server running on port 8124 in development mode

The json source file provided will be read from and modified as you work with the <code>madmin</code> console interface.

Requirements
---
##### server-side
<code>madmin</code> server-side application has been tested against [Node.js](http://node.js) version <code>>=0.8.4</code>

##### client-side
<code>madmin</code> client-side application utilizes some ES5 objects and properties - ie, <code>Object.create</code> and <code>Array.prototype.indexOf</code> - and does not load in an additional polyfills to provide support for non-modern browsers. 

The <code>madmin</code> client-side application should work properly in the following:

* 	Chrome 12+
* 	Safari 4+
* 	IE 9+
* 	Opera 12+

---


# Introduction

<code>madmin</code> is a [node](http://node.js) application that provides a means to construct RESTful URIs that are immediately accessible on the server. While URIs can be defined using the command line - using such CLI tools such as [cURL](http://curl.haxx.se/) - <code>madmin</code> also provides an admin console as a GUI to aide in defining the URI and JSON response data structure.


Why?
---

<code>madmin</code> was born out of the intent to minimize time spent by front-end development teams building applications against a living spec for service requirements.

#### The Problem

We found that our front-end developers were curating two service layers implementing a common interface during development of an application: 

*	**[Fake]** One that does not communicate with a remote resource and provides _fake_ data.
	
	_Used during development without worry of remote endpoint being available (either from being undefined or no network) and can be modified to provide different responses in testing application response._

*	**[Live]** One that does communicate with a remote resource, sometimes utilizing libraries that abstract the communication.

	_Used for integration tests and QA on staging before pushing application to production._

This would allow the service layer dependency to easily be switched out during development and deployment while providing a common API for other components of the application to interact with.

Though these service layers are developed against the same interface providing a common API, the curation of both in tandem during development can be exhaustive timewise as specifications and requirements change. When we multiplied that curation time across the numerous applications being developed, it became clearer that the _fake_ service layer needed to be eliminated from development - especially seeing as it is not part of the release or unit tests at all.

#### The Solution

Instead of defining the service layer as a dependency between these two implementations, if we could define the endpoints that the service layer communicates with then we could eliminate the need to have a fake service layer. 

Just as the service references are changed from staging to production, why couldn't we provide a _living_ service endpoint with URIs that are being discussed and hashed out between teams. As well, why can't we deploy that service locally and eliminate the need for a network resource to boot - we could continue our front-end development while relaxing on some remote un-connected island!

That is what <code>madmin</code> sets out to do.


#### The By-Product

Though the initial intent was to eliminate the curation of an unnecessary service layer from front-end development, by defining RESTful URIs using <code>madmin</code> we were actually providing useful documentation of the service layer and opened up comminication between the back-end and front-end teams with regards to requirements and data structure.

Opening channels for communication is always a plus, and the fact that it provided self-documentation just seemed like a winner!

##### What It is not

<code>madmin</code> is not meant to replace writing proper unit tests for client-side applications that communicate with a remote service nor is it mean to stand in for integration testing.


How?
---
The <code>madmin</code> application works by updating a target JSON source file that describes the RESTful URIs. This file is modified using a RESTful API of the <code>madmin</code> server application, itself. You can check out the schema for the source JSON file that defines the API at [https://github.com/infrared5/madmin/blob/master/doc/madmin-api-schema.json](https://github.com/infrared5/madmin/blob/master/doc/madmin-api-schema.json)

While it is possible to interact with the <code>madmin</code> server-side applicaiton using the command line - with such CLI tools such as [cURL](http://curl.haxx.se/) - a client-side applicaiton is available that provides ease of use and self-documentation.

### Access

Once the [server is started](#usageanchor), you can access the GUI console for <code>madmin</code> at either: [http://localhost:&lt;port&gt;/](http://localhost:&lt;port&gt;/) or [http://localhost:&lt;port&gt;/admin](http://localhost:&lt;port&gt;/admin), with the &lt;port&gt; value wither being the default (8124) or the one specified using the <code>--port</code> command line option.

With an empty JSON API resource file, you will be presented with a console that provides an _"add new"_ button only:

![empty madmin console with no defined RESTful URIs](https://raw.github.com/infrared5/madmin/master/doc/images/empty_console.png "Empty Console")

Upon adding a new route, you are presented with an empty editable console with various parameters:

![empty route console with undefined properties](https://raw.github.com/infrared5/madmin/master/doc/images/new_route_empty.png "Empty Route")

The following is a breakdown of each section from this _route console_ UI:

#### Method
The **Method** dropdown allows you to select the desired REST method to associate with the URI defined in the **Path** field:

![route method panel](https://raw.github.com/infrared5/madmin/master/doc/images/route_method.png "Route Method")

#### Path
The **Path** field defines the URI to add to the REST service:

![route path panel field](https://raw.github.com/infrared5/madmin/master/doc/images/route_path.png "Route Path")

The **Summary** field allows for entering a description for the URI. When input focus is lost on the **Path** field, the listing of **Parameters** is updated and allows for providing descriptions for each variable:

![route summary panel](https://raw.github.com/infrared5/madmin/master/doc/images/route_path_multiple.png "Route Summary")

#### Response
The **Response** field allows for defining the JSON returned from the URI. As well, you can choose which response to provide:

![route response panel field](https://raw.github.com/infrared5/madmin/master/doc/images/route_response.png "Route Response")

In reality it will return a 200 status with the selected JSON from either **Success** or **Error**. We often supply errors on a 200 and parse the response. This was an easy way for the team to coordinate the successful and error responses that come in JSON from the request.

### Viewing Route URIs and Responses

When saved, the new route will be added to the supplies source JSON file and the client-side <code>madmin</code> console will change to the listing of URIs defined:

![Save Route](https://raw.github.com/infrared5/madmin/master/doc/images/route_saved.png "Saved Route")

As well, the path and its proper response will be available immediately and available to develop against.

*	With <code>Error</code> selected from the **Response** field:

![error response on URI](https://raw.github.com/infrared5/madmin/master/doc/images/route_response_error.png "Error Response")

*	With <code>Success</code> selected from the **Response** field:

![success response on URI](https://raw.github.com/infrared5/madmin/master/doc/images/route_response_success.png "Success Response")


##### note
The admin console can be found at the <code>http://localhost:&lt;port&gt;/admin</code> location. As such, <code>/admin</code> is a reserved route and can not be defined as a valid URI in <code>madmin</code>. 

It is on the **TODO** list to define a custom URI for the admin portal of <code>madmin</code> in order to allow the currently reserved /admin.


Grunt Integration
---
The <code>madmin</code> repository has build files for [grunt](http://gruntjs.com) with support for _<=0.3.x_ (<code>grunt.js</code>) and _~0.4.0_ (<code>Gruntfile.js</code>) and tasks for linting and testing both the server-side and client-side code.

To run the <code>grunt</code> task simply run:

	grunt
	
Depending on your install version of <code>grunt</code> the proper build file should be run. To learn more about <code>grunt</code> and how to install, please visit [the grunt project page](http://gruntjs.com).


Tools/Libraries
---
<code>madmin</code> could not have been possible without the following libraries:

*NodeJS*

*	[ExpressJS](http://expressjs.com/)
*	[node-promise](https://github.com/kriszyp/node-promise)
*	[winston](https://github.com/flatiron/winston)
*	[hbs](https://github.com/donpark/hbs) - ExpressJS view engine wrapper for Handlebars

*Client*

*	[RequireJS](http://requirejs.org/)
*	[jQuery](http://jquery.org/)
*	[Handlebars](http://handlebarsjs.com/)
*	[Bootstrap](http://twitter.github.com/bootstrap/)

_Testing_

*	[Jasmine](http://pivotal.github.com/jasmine/)
*	[Sinon](http://sinonjs.org/)
*	[jasmine-async](https://github.com/derickbailey/jasmine.async)
*	[require-expose-plugin](https://github.com/bustardcelly/require-expose-plugin)

*Build*

*	[Grunt](http://gruntjs.com/) - 0.3.x & ~0.4.0
*	[grunt-jasmine-node](https://github.com/jasmine-contrib/grunt-jasmine-node) - 0.3.x & ~0.4.0
*	[grunt-jasmine-task](https://github.com/jasmine-contrib/grunt-jasmine-task) - 0.3.x
*	[grunt-contrib-jasmine](https://github.com/gruntjs/grunt-contrib-jasmine) - ~0.4.0
*	[grunt-contrib-jshint](https://github.com/gruntjs/grunt-contrib-jshint) - 0.3.x & ~0.4.0
*	[grunt-contrib-watch](https://github.com/gruntjs/grunt-contrib-watch) - 0.3.x & ~0.4.0

---

Acknowledgements
---
<code>madmin</code> could not have been created without the support from [infrared5.com](http://infrared5.com).
