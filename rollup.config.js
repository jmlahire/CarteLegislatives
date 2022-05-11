import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import sass from 'rollup-plugin-sass';
import copy from 'rollup-plugin-copy';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

const conf = {
    input: 'src/js/app.js',
    output: [
        {
            file: 'public/js/bundle.esm.min.js',
            format: 'esm',
            sourcemap: true
        },
        {
            file: 'public/js/bundle.iife.min.js',
            format: 'iife',
            sourcemap: true
        },

    ],
    plugins: [
        resolve(), // tells Rollup how to find date-fns in node_modules
        commonjs(), // converts date-fns to ES modules
        production && terser(), // minify, but only in production
        babel({
            babelHelpers: 'bundled',
            plugins: ['@babel/plugin-proposal-class-properties'],
            presets: ['@babel/preset-flow']
        }), // transpilation
        sass({
            include: ["/**/*.css", "/**/*.scss", "/**/*.sass"],
            output: "public/style/screen.css",
            failOnError: true,
        }),
        copy({
            targets: [
                { src: 'src/index.html', dest: 'public' },
                { src: ['src/assets/**/*'], dest: 'public/assets' },
            ]
        })
    ]
};

export default conf;