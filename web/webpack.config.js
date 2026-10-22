const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

/**
 * Webpack configuration for the web version (see docs/web/0001-webpack-with-react-native-web.md).
 * babel.config.js is shared with Metro, the react-native-web plugin is only added here.
 */

const rootDir = path.resolve(__dirname, '..')

// Packages in node_modules that ship untranspiled code (JSX, Flow or TypeScript) and have to go through babel.
const untranspiledModules = ['react-native-progress']

const includedPaths = [
  path.resolve(rootDir, 'index.js'),
  path.resolve(rootDir, 'src'),
  ...untranspiledModules.map(name => path.resolve(rootDir, 'node_modules', name)),
]

module.exports = (_env, argv) => {
  const isDevelopment = argv.mode !== 'production'

  return {
    mode: isDevelopment ? 'development' : 'production',
    entry: path.resolve(rootDir, 'index.js'),
    output: {
      path: path.resolve(rootDir, 'build/web'),
      filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
      publicPath: '/',
      clean: true,
    },
    devtool: isDevelopment ? 'eval-cheap-module-source-map' : 'source-map',
    resolve: {
      extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
      mainFields: ['browser', 'module', 'main'],
      alias: {
        'react-native$': 'react-native-web',
      },
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          resolve: { fullySpecified: false },
        },
        {
          // easy-speech declares "type": "module", but its require entry is CommonJS (module.exports)
          test: /easy-speech[\\/]dist[\\/]EasySpeech\.cjs\.js$/,
          type: 'javascript/auto',
        },
        {
          test: /\.(js|jsx|ts|tsx)$/,
          include: includedPaths,
          use: {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(rootDir, 'babel.config.js'),
              plugins: ['react-native-web'],
              cacheDirectory: true,
            },
          },
        },
        {
          // Same output as react-native-svg-transformer on native: react-native-svg components, recolored via `color`
          test: /\.svg$/,
          use: { loader: '@svgr/webpack', options: { native: true } },
        },
        {
          test: /\.(png|ttf)$/,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'index.html') }),
      new webpack.DefinePlugin({ __DEV__: JSON.stringify(isDevelopment) }),
    ],
    devServer: {
      port: 8080,
      historyApiFallback: true,
      // The CMS sends no CORS headers, so API requests go through the dev server (docs/web/0007-backend-access-and-cors.md)
      proxy: [
        {
          context: ['/api'],
          target: process.env.LUNES_CMS_ORIGIN ?? 'https://lunes-test.tuerantuer.org',
          changeOrigin: true,
        },
      ],
      client: { overlay: { errors: true, warnings: false } },
    },
  }
}
