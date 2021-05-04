const { RawSource } = require("webpack-sources");
class WorkerManifestWebpackPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap("worker-manifest", (compilation) => {
      const workerChunk = compilation.chunks.find(
        (chunk) => chunk.id === "worker"
      );
      const source = new RawSource(
        JSON.stringify({
          path: workerChunk.files[0],
        })
      );
      compilation.assets["worker-manifest.json"] = source;
      workerChunk.files.push(source);
    });
  }
}

module.exports = WorkerManifestWebpackPlugin;
