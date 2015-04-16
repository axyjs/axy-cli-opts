"use strict";

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        typescript: {
            source: {
                options: {
                    removeComments: false,
                    target: "ES5",
                    module: "commonjs"
                },
                src: [
                    "src/opts.ts"
                ]
            }
        },
        nodeunit: {
            all: ["test/*_test.js"]
        },
        tslint: {
            options: {
                configuration: grunt.file.readJSON("tslint.json")
            },
            files: ["ts/*.ts"]
        },
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            test: "test/**/*.js",
            gruntfile: "Gruntfile.js"
        },
        jsonlint: {
            pkg: ["package.json", "tslint.json"],
            hint: [".jshintrc"]
        }
    });

    grunt.loadNpmTasks("grunt-typescript");
    grunt.loadNpmTasks("grunt-contrib-nodeunit");
    grunt.loadNpmTasks("grunt-tslint");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jsonlint");

    grunt.registerTask("build", ["typescript"]);
    grunt.registerTask("test", ["nodeunit"]);
    grunt.registerTask("test-build", ["build", "test"]);
    grunt.registerTask("hint", ["tslint", "jshint", "jsonlint"]);
    grunt.registerTask("default", ["hint", "build", "test"]);
};
