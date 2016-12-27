require.config({
    paths: {
        knockout: "./externals/knockout-3.4.1.debug",
        jquery: "./externals/jquery-3.1.1",
        oauthSignature: "./externals/oauth-signature"
    },
    /**
     * shim parameter is needed because the "./externals/oauth-signature.js" file is not AMD compatible (it doesn't have a define() somewhere inside)
     */
    shim: {
        "oauthSignature": {
            exports: "oauthSignature"
        }
    }
});
//# sourceMappingURL=require-config.js.map