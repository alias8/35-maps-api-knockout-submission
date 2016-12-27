/**
 * Hacky way of making typescript module compile properly.
 * I think Oauth is meant to be done server side (node.js) so this kind of things shouldn't be used in production
 */

declare var oauthSignature: any;

declare module "oauthSignature" {
    export = oauthSignature;
}