/**
 * RequireJS appears to be necessary when using TypeScript.
 * This file is for preloading external libraries so that the following transpiled functions work:
 * define(...) {} for amd 
 * require(...) {} for commonjs
 * see compilerOptions.module in tsconfig.json
 * https://github.com/requirejs/requirejs
 */
declare var require: any;
require.config({
    paths: {
        knockout: "./externals/knockout-3.4.1.debug",
        jquery: "./externals/jquery-3.1.1",
        oauthSignature: "./externals/oauth-signature"
    },
    shim: {
        "oauthSignature": {
            exports: "oauthSignature"
        }
    }
});