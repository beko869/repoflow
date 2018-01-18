import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-options-panel',
    templateUrl: './options-panel.component.html',
    styleUrls: ['./options-panel.component.css']
})
export class OptionsPanelComponent implements OnInit {

    private activeView = 0;

    @Output() switchViewEvent = new EventEmitter<number>();

    constructor() {
    }

    ngOnInit() {
    }

    public switchViewTrigger(): void {
        if (this.activeView === 1 || this.activeView === null) {
            this.activeView = 0;
        } else {
            this.activeView = 1;
        }

        this.switchViewEvent.emit(this.activeView);
    }

    public getActiveView(): number {
        return this.activeView;
    }

    public getActiveViewName(): string {
        if (this.getActiveView() === 0) {
            return 'to file view';
        } else {
            return 'to commit view';
        }
    }

    public getFilePath(): void {

    }

}
