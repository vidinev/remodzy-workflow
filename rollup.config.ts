// @ts-ignore
import resolve from 'rollup-plugin-node-resolve';
// @ts-ignore
import commonjs from 'rollup-plugin-commonjs';
// @ts-ignore
import sourceMaps from 'rollup-plugin-sourcemaps';
// @ts-ignore
import camelCase from 'lodash.camelcase';
// @ts-ignore
import typescript from 'rollup-plugin-typescript2';
// @ts-ignore
import json from 'rollup-plugin-json';

const pkg = require('./package.json')

const libraryName = 'asl-workflow-builder'

export default {
  input: `src/${libraryName}.ts`,
  output: [
    {
      file: pkg.main,
      name: camelCase(libraryName),
      format: 'umd',
      sourcemap: true,
      globals: {
        fabric: 'fabric'
      }
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      globals: {
        fabric: 'fabric'
      }
    },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [
    'fabric'
  ],
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    // Resolve source maps to the original source
    sourceMaps(),
  ],
}
