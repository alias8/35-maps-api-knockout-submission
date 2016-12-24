/**
 * RequireJS appears to be necessary when using TypeScript.
 * This file is for preloading external libraries so that "export" and "import" keywords work
 * https://github.com/requirejs/requirejs
 */
declare var require: any;
require.config({
    paths: {
        knockout: "externals/knockout-3.4.1.debug",
        jquery: "externals/jquery-3.1.1",
        oauthSignature: "externals/oauth-signature"
    },
    shim: {
        "oauthSignature": {
            exports: "oauthSignature"
        }
    }
});