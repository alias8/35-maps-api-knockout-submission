define(["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    class Sidebar {
        constructor() {
            this.isClosed = false;
            this.button = $('.hamburger');
        }
        toggleMenu(object, event) {
            if (this.isClosed) {
                this.button.removeClass('is-open');
                this.button.addClass('is-closed');
                this.isClosed = false;
                $('#wrapper').toggleClass('toggled');
            }
            else {
                this.button.removeClass('is-closed');
                this.button.addClass('is-open');
                this.isClosed = true;
                $('#wrapper').toggleClass('toggled');
            }
        }
    }
    exports.Sidebar = Sidebar;
});
//# sourceMappingURL=sidebar.js.map