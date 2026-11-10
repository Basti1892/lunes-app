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

// Path under which the web version is hosted, e.g. /lunes, empty for the root of a domain (docs/web/0012).
// App, assets and the /api proxy all live below it.
const basePath = (process.env.LUNES_BASE_PATH ?? '').replace(/\/+$/, '')
if (basePath !== '' && !basePath.startsWith('/')) {
  // Git Bash on Windows turns /lunes into a Windows path, use PowerShell or set MSYS_NO_PATHCONV=1
  throw new Error(`LUNES_BASE_PATH must start with a slash, but is '${basePath}'`)
}

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
      publicPath: `${basePath}/`,
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
              // Keep ES modules for webpack, so that unused code of libraries (e.g. Sentry) can be removed.
              // Babel merges this with the preset of the same name in babel.config.js.
              presets: [['module:@react-native/babel-preset', { disableImportExportTransform: true }]],
              plugins: ['react-native-web'],
              cacheDirectory: true,
            },
          },
        },
        {
          // Same output as react-native-svg-transformer on native: react-native-svg components, recolored via `color`
          test: /\.svg$/,
          use: {
            loader: '@svgr/webpack',
            options: {
              native: true,
              // Same SVGO config as the defaults of react-native-svg-transformer. Above all the viewBox has to be kept,
              // otherwise icons are not scaled to the width and height they are rendered with.
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        inlineStyles: { onlyMatchedOnce: false },
                        removeViewBox: false,
                        removeUnknownsAndDefaults: false,
                        convertColors: false,
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        {
          test: /\.(png|ttf)$/,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'index.html') }),
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(isDevelopment),
        'process.env.LUNES_BASE_PATH': JSON.stringify(basePath),
        // Sentry is only active in production builds with a DSN (docs/web/0011-error-reporting-web.md)
        'process.env.LUNES_SENTRY_DSN': JSON.stringify(process.env.LUNES_SENTRY_DSN ?? ''),
      }),
    ],
    devServer: {
      port: 8080,
      historyApiFallback: { index: `${basePath}/index.html` },
      // The CMS sends no CORS headers, so API requests go through the dev server (docs/web/0007-backend-access-and-cors.md)
      proxy: [
        {
          context: [`${basePath}/api`],
          target: process.env.LUNES_CMS_ORIGIN ?? 'https://lunes-test.tuerantuer.org',
          changeOrigin: true,
          pathRewrite: basePath === '' ? undefined : { [`^${basePath}`]: '' },
        },
        // LTI connector (lunes-lti, docs/web/0013-lti-connector-service.md), same origin as the app like in production
        {
          context: [`${basePath}/lti`],
          target: process.env.LUNES_LTI_ORIGIN ?? 'http://127.0.0.1:5000',
          pathRewrite: basePath === '' ? undefined : { [`^${basePath}`]: '' },
        },
      ],
      // Mock of an LMS course page that embeds the app in an iframe (only served by the dev server, docs/web/0012).
      // Open it on another host than the app, e.g. http://127.0.0.1:8080/iframe-test/index.html, to get a cross-site iframe.
      static: [{ directory: path.resolve(__dirname, 'iframe-test'), publicPath: '/iframe-test' }],
      client: { overlay: { errors: true, warnings: false } },
    },
  }
}
