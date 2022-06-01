import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import scss from 'rollup-plugin-scss'
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import simpleVars from "postcss-simple-vars";



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
            presets: ['@babel/preset-flow'],
            exclude: 'node_modules/**',     //Ajouté
        }), // transpilation
        scss({
            output: 'public/style/screen.css',
            include: ["/**/*.css", "/**/*.scss", "/**/*.sass"],
            processor: () => postcss([simpleVars,autoprefixer])
        }),
        copy({
            targets: [
                { src: 'src/index.html', dest: 'public' },
                { src: ['src/assets/**/*'], dest: 'public/assets' },
                { src: ['style/img/**/*'], dest: 'public/style/img' },
            ]
        })
    ]
};

export default conf;