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
    @Output() addCommitQualityToVisualizationEvent = new EventEmitter<string>();
    @Output() removeFileFromVisualizationEvent = new EventEmitter<string>();
    @Output() removeCommitQualityFromVisualizationEvent = new EventEmitter<string>();
    @Output() clearFileViewEvent = new EventEmitter<string>();
    @Output() clearCommitViewEvent = new EventEmitter<string>();
    @Output() clearFileDetailViewEvent = new EventEmitter<string>();
    @Output() showFileDetailViewEvent = new EventEmitter<string>();
    @Output() addSelectedFileListToVisualizationEvent = new EventEmitter<string>();
    @Output() addSelectedCommitQualityListToVisualizationEvent = new EventEmitter<string>();

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
     * sets the file color list for the file list in the options panel
     * @param paraValues
     */
    public setFileColorList( paraValuesArray ): void {
        this.optionsPanelValueService.setFileColorList( paraValuesArray );
        this.ref.markForCheck();
    }


    /**
     * uses the optionsPanelValueService to return the color of a given filename
     * @param paraFileName
     * @returns {string}
     */
    public getFileColorByFileName( paraFileName ): string {
        return this.optionsPanelValueService.getFileColorByFileName( paraFileName );
    }


    /**
     * uses the optionsPanelValueService to return the list of all files
     * @returns {string[]}
     */
    public getFileListForSelect(): string[] {
        return this.optionsPanelValueService.getFileList();
    }

    /**
     * uses the optionsPanelValueService to return the list of a selected files
     * @returns {string[]}
     */
    public getSelectedFileList(): string[] {
        return this.optionsPanelValueService.getSelectedFileList();
    }

    public getCommitQualityList(): string[] {
        return this.optionsPanelValueService.getSelectedCommitQualityList();
    }

    /**
     * removes a value from the selected list with the optionspanelvalueservice, emits a removeFileFromVisualizationEvent and marks the optionspanel component for refresh
     * @param {string} paraValueToBeRemoved
     */
    public removeFromSelectedFileList( paraValueToBeRemoved:string ): void {
        this.optionsPanelValueService.removeFromSelectedFileList( paraValueToBeRemoved );
        this.removeFileFromVisualizationEvent.emit();
        this.ref.markForCheck();
    }

    public removeFromSelectedCommitQualityList( paraValueToBeRemoved:string ): void {
        this.optionsPanelValueService.removeFromSelectedCommitQualityList( paraValueToBeRemoved );
        this.removeCommitQualityFromVisualizationEvent.emit();
        this.ref.markForCheck();
    }


    /**
     * adds a value from the selected list with the optionspanelvalueservice, emits a addFileToVisualizationEvent and marks the optionspanel component for refresh
     * @param {string} paraValue
     */
    public setFileSelectValueAndEmitAddFileToVisualizationEvent( paraValue:string ): void {
        this.optionsPanelValueService.setFileSelectValue( paraValue );
        this.addFileToVisualizationEvent.emit();
        this.ref.markForCheck();
    }

    public setCommitQualitySelectValueAndEmitAddCommitToVisualizationEvent( paraValue:string ): void {
        this.optionsPanelValueService.setCommitQualitySelectValue( paraValue );
        this.addCommitQualityToVisualizationEvent.emit();
        this.ref.markForCheck();
    }

    public showCommitView(): void {
        this.clearFileDetailView();
        this.clearFileView();
        this.addSelectedCommitQualityListToVisualizationEvent.emit();
        this.ref.markForCheck();
    }

    public showFileView(): void {
        this.clearFileDetailView();
        this.clearCommmitView();
        this.addSelectedFileListToVisualizationEvent.emit();
        this.ref.markForCheck();

    }

    public showFileDetailView(): void {
        this.clearCommmitView();
        this.clearFileView();
        this.showFileDetailViewEvent.emit();
        this.ref.markForCheck();
    }

    public clearFileDetailView(): void {
        this.clearFileDetailViewEvent.emit();
    }

    public clearCommmitView(): void {
        this.clearCommitViewEvent.emit();
    }

    public clearFileView(): void {
        this.clearFileViewEvent.emit();
    }


}
