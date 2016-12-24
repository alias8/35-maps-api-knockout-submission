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
//# sourceMappingURL=require-config.js.map