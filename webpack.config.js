const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkerManifestWebpackPlugin = require("./worker-manifest-webpack-plugin");

module.exports = () => ({
  mode: "development",
  entry: {
    main: "./src/main.tsx",
    worker: "./src/worker.tsx",
  },
  output: {
    path: path.join(__dirname, "./dist"),
    filename: "[name]~[hash].js",
  },
  resolve: {
    extensions: [".tsx", ".ts", "..."],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ["ts-loader"],
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "split-renderer-demo",
      template: "./src/template.html",
      chunks: ["main"],
    }),
    new WorkerManifestWebpackPlugin(),
  ],
});
