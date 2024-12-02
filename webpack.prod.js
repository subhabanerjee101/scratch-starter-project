const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const path = require("path");

process.env["NODE_ENV"] = "production";

module.exports = merge(common, {
  mode: "production",
  output: {
    // Set the output directory to 'build'
    path: path.resolve(__dirname, "build"),
    filename: "static/js/[name].[contenthash].js", // Set filename with contenthash for better cache handling
    clean: true, // Clean the build folder before each build
  },
  optimization: {
    minimize: true,
    minimizer: [
      // Use CssMinimizerPlugin for CSS minimization
      new CssMinimizerPlugin(),
    ],
  },
});
