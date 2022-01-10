const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  webpack: function(config, env) {
    // For worbox service worker 
    config.plugins.push(
      new WorkboxWebpackPlugin.InjectManifest({
        swSrc: './src/serviceWorker.js',
        swDest: 'sw.js',
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      })
    )

    // For PDFkit export: load from URL
    //https://webpack.js.org/configuration/externals/
    config.externals = {
      'pdfkit': 'PDFDocument',
      'pdfjs-dist': 'pdfjsLib',
    }
    config.plugins.push(
      new NodePolyfillPlugin() // https://stackoverflow.com/a/65556946/13255686
    )

    return config;
  }
}