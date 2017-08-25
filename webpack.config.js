const path = require("path");
const webpack = require("webpack");

const libraryName = "CropGrowthApp";

const config = {
  context: path.join(__dirname, "src"),
  entry: [
    "react-hot-loader/patch",
    "webpack-hot-middleware/client",
    __dirname + "/src/index.js"
  ],
  devtool: "inline-source-map",
  output: {
    path: __dirname + "/dist/scripts",
    filename: libraryName + ".js",
    publicPath: "/scripts/",
    library: libraryName,
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  resolve: {
    extensions: [".js", ".jsx", ".css"]
  },
  devServer: {
    hot: true,
    compress: false,
    inline: false,
    contentBase: path.join(__dirname, "dist"),
    publicPath: "/",
    headers: {
      "Access-Control-Allow-Origin": "http://0.0.0.0:8080",
      "Access-Control-Allow-Credentials": "true"
    }
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

    new webpack.HotModuleReplacementPlugin(),
    // enable HMR globally

    new webpack.NamedModulesPlugin()
    // prints more readable module names in the browser console on HMR updates
  ]
};

module.exports = config;
