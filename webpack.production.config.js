const path = require("path");
const webpack = require("webpack");
const OfflinePlugin = require("offline-plugin");
const libraryName = "G4AWLizardClient";

const definePlugin = new webpack.DefinePlugin({
  "process.env": {
    NODE_ENV: '"production"'
  }
});

const config = {
  context: path.join(__dirname, "src"),
  entry: [__dirname + "/src/index.js"],
  devtool: false,
  output: {
    path: __dirname + "/dist/scripts",
    filename: libraryName + ".js",
    publicPath: "/scripts/",
    library: libraryName,
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader?modules", "postcss-loader"]
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: "babel-loader",
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /\.(png|jpg|svg|woff|eot|ttf|otf)$/,
        loader: "url-loader?limit=100000"
      }
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      compress: {
        warnings: false,
        screw_ie8: true
      },
      beautify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      comments: false
    }),

    new OfflinePlugin({
      events: true,
      externals: [
        "/",
        "../leaflet/leaflet.css",
        "../iconfont/material-icons.css",
        "../iconfont/MaterialIcons-Regular.eot",
        "../iconfont/MaterialIcons-Regular.ijmap",
        "../iconfont/MaterialIcons-Regular.svg",
        "../iconfont/MaterialIcons-Regular.ttf",
        "../iconfont/MaterialIcons-Regular.woff",
        "../iconfont/MaterialIcons-Regular.woff2",
        "../iconfont/codepoints",
        "../iconfont/material-icons.css"
      ],
      ServiceWorker: {
        navigateFallbackURL: "/"
      }
    }),

    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: '"production"'
      }
    })
  ]
};

module.exports = config;
