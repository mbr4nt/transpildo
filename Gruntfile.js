var transpildo = require("./index.js");
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      files: ['**/*.cmx'],
      tasks: ['transpildo']
    }
  });
  
  grunt.registerTask('transpildo', 'CM transpiler', function() {
      console.dir(arguments);
      var done = this.async();
      transpildo.run(done);
    });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['watch']);

};