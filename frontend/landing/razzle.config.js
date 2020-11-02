// razzle.config.js

module.exports = {
  module: {
    rules: [
      {
        test: /\.(eot|svg|ttf|woff|woff2|otf)$/,
        loader: 'file-loader',
      }
    ]
  },
  modify: (config, { target }) => {
    if (target === 'node') {
      config.output.publicPath = `${process.env.PUBLIC_PATH}`
    }
    return config;
  }
}
