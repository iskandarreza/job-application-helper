import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import dotenv from 'dotenv'

dotenv.config()

export default {
  input: 'src/worker.js',
  output: {
    file: 'public/service-worker.js',
    format: 'iife'
  },
  plugins: [
    replace({
      'process.env.REACT_APP_WEBSOCKET_URI': JSON.stringify(process.env.REACT_APP_WEBSOCKET_URI),
    }),
    commonjs(),
  ],
};
