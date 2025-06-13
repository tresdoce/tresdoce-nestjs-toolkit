declare function _exports(): {
    entry: string;
    mode: string;
    target: string;
    externalsPresets: {
        node: boolean;
    };
    externals: any[];
    output: {
        filename: string;
    };
    resolve: {
        extensions: string[];
    };
    module: {
        rules: {
            test: RegExp;
            exclude: RegExp;
            use: {
                loader: string;
                options: {
                    transpileOnly: boolean;
                };
            }[];
        }[];
    };
    optimization: {
        minimize: boolean;
        minimizer: TerserPlugin<import("terser").MinifyOptions>[];
        nodeEnv: string | boolean;
    };
    devtool: string | boolean;
};
export = _exports;
import TerserPlugin = require("terser-webpack-plugin");
