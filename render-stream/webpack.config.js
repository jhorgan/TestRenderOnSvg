var path = require("path");

module.exports = {
    entry: {
        app: ["./src/app.ts"]
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },

    // Turn on sourcemaps
    devtool: 'source-map',

    resolve: {
        extensions: ['.ts', '.js']
    },

    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    }
};