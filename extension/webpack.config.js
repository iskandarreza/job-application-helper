require('dotenv').config({ path: './.env' })
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { DefinePlugin } = require('webpack')

module.exports = {
  mode: 'production',
  entry: {
    content: './src/content.js',
    popup: './src/popup.js',
  },
  output: { 
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: path.resolve(__dirname, 'dist'),
          transform(content) {
            const manifest = JSON.parse(content.toString())
            manifest.host_permissions = [`${process.env.SERVER_URI}/*`]
            return JSON.stringify(manifest, null, 2)
          },
        },
        {
          from: 'src/popup.html',
          to: path.resolve(__dirname, 'dist'),
        },
      ],
    }),
    new DefinePlugin({
      'process.env.SERVER_URI': JSON.stringify(process.env.SERVER_URI),
    }),
  ],
}
