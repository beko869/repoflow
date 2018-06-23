import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DiffPanelValuesService} from "../shared/diff-panel-values.service";

@Component({
    selector: 'app-diff-panel',
    templateUrl: './diff-panel.component.html',
    styleUrls: ['./diff-panel.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class DiffPanelComponent implements OnInit {

    constructor(private diffPanelValueService: DiffPanelValuesService, private ref: ChangeDetectorRef) {
    }

    ngOnInit() {

    }

    public setLeftFileData( paraLeftFileData: any ) {
        this.diffPanelValueService.setLeftFileData( paraLeftFileData );
        this.ref.markForCheck();
    }

    public setRightFileData( paraRightFileData: any ) {
        this.diffPanelValueService.setRightFileData( paraRightFileData );
        this.ref.markForCheck();
    }

    public getLeftFileData() {
        return this.diffPanelValueService.getLeftFileData();
    }

    public getRightFileData() {
        return this.diffPanelValueService.getRightFileData();
    }

    public getLeftFileFixated() {
        return this.diffPanelValueService.getLeftFileFixated();
    }

    public getRightFileFixated() {
        return this.diffPanelValueService.getRightFileFixated()
    }

    public toggleLeftFileFixated() {
        this.diffPanelValueService.toggleLeftFileFixated();
    }

    public toggleRightFileFixated() {
        this.diffPanelValueService.toggleRightFileFixated()
    }

}
