/*global module:false*/
/**
 * For grunt ~0.3.0 only.
 * https://github.com/gruntjs/grunt/wiki/Upgrading-from-0.3-to-0.4
 */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    lint: {
      files: ['grunt.js', 'public/script/**/*.js', 'script/**/*.js', 'test/jasmine/spec/**/*.spec.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint'
    },
    jshint: {
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
        node: true
      },
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
        src: ['test/jasmine/spec/client/specrunner.html'],
        errorReporting: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jasmine-task');
  grunt.loadNpmTasks('grunt-jasmine-node');

  // Default task.
  grunt.registerTask('default', ['lint', 'jasmine_node', 'jasmine']);

};