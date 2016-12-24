import * as $ from 'jquery';

export class Sidebar {
    private button: any;
    private isClosed: boolean;

    constructor() {
        this.isClosed = false;
        this.button = $('.hamburger');
    }

    toggleMenu(object: any, event: any): void {
        if (this.isClosed) {
            this.button.removeClass('is-open');
            this.button.addClass('is-closed');
            this.isClosed = false;
            $ ('#wrapper').toggleClass ('toggled');
        } else {
            this.button.removeClass('is-closed');
            this.button.addClass('is-open');
            this.isClosed = true;
            $ ('#wrapper').toggleClass ('toggled');
        }
    }
}

