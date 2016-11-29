'use strict';
(function (
    eslint,
    gulp
) {
    const pathTo = {
        self: [
            'gulpfile.js'
        ],
        client: {
            html: [
                'client/**/*.html',
                '!client/3rd-party{,/**}'
            ],
            css: [
                'client/**/*.css',
                '!client/3rd-party{,/**}'
            ],
            js: [
                'client/**/*.js',
                '!client/3rd-party{,/**}'
            ]
        },
        server: {
            js: [
                'server/main.js',
                'server/modules/**/*.js'
            ]
        }
    };
    gulp.task(
        'self',
        function () {
            return gulp
                .src(pathTo.self)
                .pipe(eslint())
                .pipe(eslint.format())
                .pipe(eslint.failOnError());
        }
    );
    gulp.task(
        'eslint-client',
        function () {
            return gulp
                .src(pathTo.client.js)
                .pipe(eslint())
                .pipe(eslint.format())
                .pipe(eslint.failOnError());
        }
    );
    gulp.task(
        'eslint-server',
        function () {
            return gulp
                .src(pathTo.server.js)
                .pipe(eslint())
                .pipe(eslint.format())
                .pipe(eslint.failOnError());
        }
    );
    gulp.task(
        'default',
        [
            'self',
            'eslint-server',
            'eslint-client'
        ],
        function () {
        }
    );
}(
    require('gulp-eslint'),
    require('gulp')
));
