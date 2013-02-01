/**
 * require-expose-plugin 0.1.1 Copyright (c) 2013 Todd Anderson http://www.custardbelly.com/blog
 * 
 * The require-expose-plugin is a plugin for RequireJS that exposes dependencies 
 * loaded into a module through a property on the target module - require_exposed_dependencies - 
 * with the intent of properly stubbing, mocking and generally spying on dependencies for unit tests.
 * @author toddanderson
 *
 * <pre>
 * Usage:
 *
 * -----------------
 * /src/my-dependency.js
 * -----------------
 * define(function() {
 *   return {
 *     bar: function(greeting) {
 *       console.log(greeting);
 *     }
 *   };
 * });
 *
 * -----------------
 * /src/my-module.js
 * -----------------
 * define(['src/my-dependency'], function(dependency) {
 *   return {
 *     foo: function(salutation, name) {
 *       dependency.bar(salutation + ', ' + name);
 *     }
 *   };
 * });
 *
 * -----------------
 * /spec/my-module.spec
 * -----------------
 * define(['expose!src/my-module'], function(myModule)) {
 * 
 *   describe('My Module', function() {
 *     var dependency = myModule.require_exposed_dependencies['src/my-dependency'];
 *     spyOn(dependency, 'bar');
 *     myModule.foo('hello', 'world');
 *     expect(dependency).toHaveBeenCalledWith('hello, world');
 *   });
 * 
 * });
 * </pre>
 * 
 * @_toddanderson_
 * http://custardbelly.com/blog
 */
define(function() {

  // Match anything between [] - presumably and hopefully the dependency listing of a module.
  var dependencyArrayRegex = /\[([^\]]+)\]/;

  /**
   * Attempts to resolve path based on configuration path map and resource value.
   * @param  {String} resource Resource name of target module.
   * @param  {Object} pathMap  Map of paths provided in RequireJS config.
   * @return {String}          Resolved path.
   */
  function resolvePath(resource, pathMap) {
    var rootDirIndex = resource.indexOf('/'),
        baseLocation = (rootDirIndex > -1) ? resource.substr(0, rootDirIndex) : undefined,
        configurationPath, 
        resolvedPath;

    if(baseLocation && pathMap.hasOwnProperty(baseLocation)) {
      configurationPath = pathMap[baseLocation];
      resolvedPath = configurationPath + (resource.substr(rootDirIndex, resource.length) + '.js');
    }
    return resolvedPath;
  }
  
  /**
   * Attempts to request the target module as a text file for parsing.
   * @param  {String} path            Target module path.
   * @param  {Function} successDelegate Delegate to invoke upon success.
   * @param  {Function} errorDelegate   Delegate to invoke upon failure.
   */
  function loadAsText(path, successDelegate, errorDelegate) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.onreadystatechange = function(event) {
      if(xhr.readyState === 4) {
        if(xhr.status >= 399) {
          errorDelegate.call('Could not load ' + path + '. HTTP Status: ' + xhr.status + '.');
        }
        else {
          var text = xhr.responseText,
              dependencyMatch = dependencyArrayRegex.exec(text),
              dependencyList;

          if(dependencyMatch && dependencyMatch.length > 0) {
            // i know eval() is evil, 
            // but the regex to determine developers' style of dependency declaration - including breaks - is too crazy.
            dependencyList = eval(dependencyMatch[0]);
            require(dependencyList, function() {
              var map = {},
                  i, 
                  length = arguments.length;
              for( i = 0; i < length; i++ ) {
                map[dependencyList[i]] = arguments[i];
              }
              successDelegate.call(null, map);
            });
          }
          else {
            successDelegate.call(null, undefined, 'Could not properly parse dependencies for require-expose-plugin.');
          }
        }
      }
    };
    xhr.send();
  }

  return {
    load: function(resourceName, req, loadDelegate, configuration) {
      var resolvedResourcePath = resolvePath(resourceName, configuration.paths);
      if(resolvedResourcePath) {
        // attempt to load and parse as text to declare dependencies for target module.
        loadAsText(resolvedResourcePath, 
                    // success.
                    function(dependencies, message) {
                      req([resourceName], function(module) {
                        if(message) {
                          console.log('[require-expose-plugin.js] - No dependencies found for ' + resourceName + '.');
                        }
                        if(dependencies) {
                          module.require_exposed_dependencies = dependencies;
                        }
                        loadDelegate(module);
                      });
                    }, 
                    // failure.
                    function(errorMessage) {
                      console.log('error: ' + errorMessage);
                      req([resourceName], function(module) {
                        loadDelegate(module);
                    });
                  });
      }
      else {
        loadDelegate.error('[require-expose-plugin.js] - Could not resolve path for ' + resourceName + '.');
      }
    }
  };

});