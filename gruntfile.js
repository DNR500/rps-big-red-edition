module.exports = function (grunt)
{
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        files:{
            css:{
                main: 'build/public/css/main.css'
            },
            js:{
                main: 'build/public/js/main.js'
            }
        },
        jsonlint: {
            project: {
                src: [ 'package.json', '.eslintrc.json', 'src/**/*.json', 'test/**/*.json' ]
            }
        },
        eslint: {
            src_node:{
                src: ['gruntfile.js', 'src/**/*.js', 'test/node/**/*.js'],
                options: {
                    configFile: '.eslintrc.json'
                }
            },
            test_browser:{
                src: ['test/public/**/*.js'],
                options: {
                    configFile: '.eslintrc.test.browser.json'
                }
            }

        },
        node_mocha: {
            node : {
                src : ['test/node/**/*.js'],
                options : {
                    mochaOptions : {
                        globals : ['expect'],
                        require: ['babel-core/register'],
                        timeout : 3000,
                        ignoreLeaks : false,
                        ui : 'bdd',
                        reporter : 'landing'
                    }
                }
            }
        },
        karma: {
            browser: {
                configFile: 'karma.conf.js'
            }
        },
        babel: {
            options: {
                presets: ['es2015-node']
            },
            node:{
                files: [
                    {
                        expand: true, cwd: 'src/node/', src: ['**/*.js'], dest: 'build/node/', ext: '.js'
                    },
                    {
                        expand: true, cwd: 'src/', src: ['server.js', 'config.js'], dest: 'build/'
                    }
                ]
            },
            'node-debug':{
                options: {
                    sourceMap: true
                },
                files:'<%= babel.node.files %>'
            }
        },
        browserify: {
            build: {
                files: {
                    '<%= files.js.main %>': ['src/public/js/main.js']
                }
            },
            debug: {
                files: '<%= browserify.build.files %>',
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                }
            }
        },
        copy: {
            build: {
                files: [
                    {expand: true, cwd: 'src/', src: ['**', '!**/scss/**'], dest: 'build/'},
                    {expand: true, cwd: 'node_modules/bootstrap-sass/assets/fonts', src: ['**'], dest: 'build/public/fonts/'},
                    {expand: true, cwd: 'node_modules/es6-shim/', src: ['es6-shim.min.js'], dest: 'build/public/js/lib/', flatten: true, filter: 'isFile'},
                    {expand: true, cwd: 'node_modules/html5shiv/dist', src: ['html5shiv.min.js'], dest: 'build/public/js/lib/', flatten: true, filter: 'isFile'},
                    {expand: true, cwd: 'libs/', src: ['modernizr-custom.js'], dest: 'build/public/js/lib/', flatten: true, filter: 'isFile'}
                ]
            }
        },
        clean: {
            'build-prep': ['build/*.js','build/node/**/*.js', 'build/public/js/app/', 'build/public/js/*.js'],
            slate: ['build']
        },
        nodemon: {
            build: {
                script: 'build/server.js'
            },
            debug: {
                script: '<%= nodemon.build.script %>',
                options: {
                    args: ['debug']
                }
            }
        },
        open:{
            browser : {
                path: 'http://127.0.0.1:3000/',
                app: 'Google Chrome'
            }
        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            build: {
                tasks: ['nodemon:build', 'open:browser', 'open:browser']
            },
            debug: {
                tasks: ['nodemon:debug', 'open:browser', 'open:browser']
            }
        },
        cssmin: {
            options: {
                shorthandCompacting: true,
                keepSpecialComments: 0
            },
            build: {
                files: {
                    '<%= files.css.main %>': '<%= files.css.main %>'
                }
            }
        },
        sass: {
            build: {
                files: {
                    '<%= files.css.main %>': 'src/public/scss/main.scss'
                }
            },
            debug: {
                options: {
                    sourceMap: true
                },
                files: '<%= sass.build.files %>'
            }
        },
        uglify: {
            options: {
                preserveComments: false
            },
            build: {
                files: {
                    '<%= files.js.main %>': '<%= files.js.main %>'
                }
            }
        },
        postcss: {
            options: {
                processors: [
                    require('autoprefixer')({browsers: 'last 2 versions'})
                ]
            },
            build: {
                src: 'build/public/css/*.css'
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsonlint');
    grunt.loadNpmTasks('gruntify-eslint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-node-mocha');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('default', ['test']);
    grunt.registerTask('test', ['jsonlint', 'eslint', 'node_mocha', 'karma']);
    grunt.registerTask('build', ['clean:slate', 'copy:build', 'clean:build-prep','babel:node', 'browserify:build', 'uglify:build', 'sass:build', 'postcss:build', 'cssmin:build']);
    grunt.registerTask('build-debug', ['clean:slate', 'copy:build', 'clean:build-prep','babel:node-debug', 'browserify:debug','sass:debug', 'postcss:build']);
    grunt.registerTask('launch-build', ['build', 'concurrent:build']);
    grunt.registerTask('launch-debug', ['build-debug', 'concurrent:debug']);
};