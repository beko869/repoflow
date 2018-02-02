import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
    Output
} from '@angular/core';
import {OptionsPanelValueService} from "../shared/OptionsPanelValueService";

@Component({
    selector: 'app-options-panel',
    templateUrl: './options-panel.component.html',
    styleUrls: ['./options-panel.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class OptionsPanelComponent {

    @Output() switchViewEvent = new EventEmitter<number>();
    @Output() addFileToVisualizationEvent = new EventEmitter<string>();
    @Output() removeFileFromVisualizationEvent = new EventEmitter<string>();

    constructor( private optionsPanelValueService:OptionsPanelValueService, private ref:ChangeDetectorRef ) {
    }

    /**
     * sets the file list for the file list select from the options panel value service
     * @param {string[]} paraValues
     */
    public setFileList( paraValuesArray ): void {
        this.optionsPanelValueService.setFileList( paraValuesArray );
        this.ref.markForCheck();
    }


    /**
     * gets the the file list from the file list select
     * @returns {string[]}
     */
    public getFileListForSelect(): string[] {
        return this.optionsPanelValueService.getFileList();
    }

    public getSelectedFileList(): string[] {
        return this.optionsPanelValueService.getSelectedFileList();
    }

    public removeFromSelectedFileList( paraValueToBeRemoved:string ): void {
        this.optionsPanelValueService.removeFromSelectedFileList( paraValueToBeRemoved );
        this.removeFileFromVisualizationEvent.emit();
        this.ref.markForCheck();
    }


    /**
     sets the currently fitered file option and emits a filter for file event
     */
    public setFileSelectValueAndEmitAddFileToVisualizationEvent( paraValue:string ): void {
        this.optionsPanelValueService.setFileSelectValue( paraValue );
        this.addFileToVisualizationEvent.emit();
        this.ref.markForCheck();
    }
}
