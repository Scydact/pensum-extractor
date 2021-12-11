const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

module.exports = {
  webpack: function(config, env) {
    config.plugins.push(
      new WorkboxWebpackPlugin.InjectManifest({
        swSrc: './src/serviceWorker.js',
        swDest: 'sw.js',
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      })
    )

    return config;
  }
}