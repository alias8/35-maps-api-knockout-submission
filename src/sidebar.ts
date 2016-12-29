import * as ko from 'knockout';
/**
 * Knockout implementation of sidebar 
 */
export class Sidebar {
    private isClosed: KnockoutObservable<boolean>;
     
    constructor() {
        this.isClosed = ko.observable(true); 
    }

    toggleMenu(object: any, event: any): void {
        this.isClosed(!this.isClosed());
    }
}

