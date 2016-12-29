define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    /**
     * Knockout implementation of sidebar
     */
    class Sidebar {
        constructor() {
            this.isClosed = ko.observable(true);
        }
        toggleMenu(object, event) {
            this.isClosed(!this.isClosed());
        }
    }
    exports.Sidebar = Sidebar;
});
//# sourceMappingURL=sidebar.js.map