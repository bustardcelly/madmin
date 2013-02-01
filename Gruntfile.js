/*global module:false*/
/**
 * For grunt ~0.4.0 only.
 * https://github.com/gruntjs/grunt/wiki/Upgrading-from-0.3-to-0.4
 */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint'
    },
    jshint: {
      files: ['grunt.js', 'public/script/**/*.js', 'script/**/*.js', 'test/jasmine/spec/**/*.spec.js'],
      options: {
        strict: false,
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: false,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        // trailing: true,
        browser: true,
        node: true,
        globals: {
          jQuery: true,
          require: true,
          requirejs: true,
          define: true,
          Handlebars: true,
          jasmine: true,
          describe: true,
          it: true,
          beforeEach: true,
          afterEach: true,
          expect: true,
          AsyncSpec: true,
          spyOn: true,
          sinon: true
        }
      }
    },
    jasmine_node: {
      projectRoot: './test/jasmine/spec/server',
      matchall: true,
      extensions: 'spec.js',
      requirejs: false,
      forceExit: true
    },
    jasmine: {
      madmin: {
        src: 'public/script/**/*.js',
        options: {
          specs: 'test/jasmine/spec/client/*.spec.js',
          helpers: 'test/jasmine/spec/client/*-helper.js',
          template: require('./test/jasmine/spec/client/grunt/template-jasmine'),
          templateOptions: {
            requireConfig: {
              baseUrl: ".",
              paths: {
                "spec": ".",
                "script": "public/script",
                "template": "public/template",
                "jquery": "public/lib/jquery-1.8.2.min",
                "text": "public/lib/require-text-plugin",
                "expose": "test/jasmine/spec/client/lib/require-expose-plugin"
              },
              config: {
                "script/service/service": {
                  serviceURL: 'http://localhost:8124'
                }
              }
            }
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-jasmine-node');

  // Default task.
  grunt.registerTask('default', ['jshint', 'jasmine_node', 'jasmine:madmin']);

};
