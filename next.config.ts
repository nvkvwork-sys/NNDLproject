const nextConfig = {
    // (Optional) Export as a static site
    // See https://nextjs.org/docs/pages/building-your-application/deploying/static-exports#configuration
    output: 'export', // Feel free to modify/remove this option

    turbopack: (config: any) => {
        // See https://webpack.js.org/configuration/resolve/#resolvealias
        config.resolve.alias = {
            ...config.resolve.alias,
            "sharp$": false,
            "onnxruntime-node$": false,
        }
        return config;
    },
    webpack: (config: any) => {
        // See https://webpack.js.org/configuration/resolve/#resolvealias
        config.resolve.alias = {
            ...config.resolve.alias,
            "sharp$": false,
            "onnxruntime-node$": false,
        }
        return config;
    },
}

module.exports = nextConfig
