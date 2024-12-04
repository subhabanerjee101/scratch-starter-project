const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

process.env["NODE_ENV"] = "production";

module.exports = merge(common, {
  mode: "production",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "static/js/[name].[contenthash].js",
    publicPath: "/",
    clean: true,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "public", to: ".", globOptions: { ignore: ["**/index.html"] } },
      ],
    }),
  ],
});
