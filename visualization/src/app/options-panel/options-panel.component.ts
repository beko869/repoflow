import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
    Output, ViewChild, Input, ElementRef
} from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';


import {OptionsPanelValuesService} from "../shared/options-panel-values.service";
import {DiffPanelComponent} from "../diff-panel/diff-panel.component";

@Component({
    selector: 'app-options-panel',
    templateUrl: './options-panel.component.html',
    styleUrls: ['./options-panel.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('slideInOut', [
            transition(':enter', [
                style({transform: 'translateY(-100%)'}),
                animate('500ms ease-in', style({transform: 'translateY(0%)'}))
            ]),
            transition(':leave', [
                animate('500ms ease-in', style({transform: 'translateY(-100%)'}))
            ])
        ])
    ]
})

export class OptionsPanelComponent {

    @Output() switchViewEvent = new EventEmitter<number>();
    @Output() addFileToVisualizationEvent = new EventEmitter<string>();
    @Output() qualityMetricChangedEvent = new EventEmitter<string>();
    @Output() qualityMetricCompareChangedEvent = new EventEmitter<string>();
    @Output() removeFileFromVisualizationEvent = new EventEmitter<string>();
    @Output() removeCommitQualityFromVisualizationEvent = new EventEmitter<string>();
    @Output() clearFileViewEvent = new EventEmitter<string>();
    @Output() clearCommitViewEvent = new EventEmitter<string>();
    @Output() clearFileDetailViewEvent = new EventEmitter<string>();
    @Output() showFileDetailViewEvent = new EventEmitter<string>();
    @Output() addSelectedFileListToVisualizationEvent = new EventEmitter<string>();
    @Output() addFileToModuleWrapperEvent = new EventEmitter<string>();
    @Output() addSelectedCommitQualityListToVisualizationEvent = new EventEmitter<string>();
    @Output() fadeFileViewEvent = new EventEmitter<string>();
    @Output() fadeCommitViewEvent = new EventEmitter<string>();
    @Output() showFileAndCommitViewsEvent = new EventEmitter<string>();
    @Output() removeFileFromModuleListEvent = new EventEmitter<string>();
    @Output() hideFileEvent = new EventEmitter<string>();
    @Output() showFileEvent = new EventEmitter<string>();
    private selectOptions: any;

    @Input() selectedIndex: number | null;

    public diffPanel : DiffPanelComponent;

    @ViewChild('diffPanel') set ch(ch: DiffPanelComponent){
        this.diffPanel = ch;
        this.ref.detectChanges();
    }

    constructor(private optionsPanelValueService:OptionsPanelValuesService, public ref:ChangeDetectorRef ) {
        this.selectOptions = {"width":"100%"}
        this.selectedIndex = 0;
    }

    public getDiffPanel(): any {
        return this.diffPanel;
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
     * sets the file list for the file list select from the options panel value service
     * @param {string[]} paraValues
     */
    public setQualityMetricList( paraValuesArray ): void {
        this.optionsPanelValueService.setQualityMetricList( paraValuesArray );
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

    public getIsFileInfo(){
        return this.optionsPanelValueService.getIsFileInfo();
    }

    public getInfo(){
        return this.optionsPanelValueService.getInfo();
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
    public getFileListForSelect(): any {
        return this.optionsPanelValueService.getFileList();
    }

    /**
     * uses the optionsPanelValueService to return the list of all commit qualities
     * @returns {string[]}
     */
    public getQualityMetricListForSelect(): any {
        return this.optionsPanelValueService.getQualityMetricListForSelect();
    }

    /**
     * uses the optionsPanelValueService to return the list of selected files
     * @returns {string[]}
     */
    public getSelectedFileList(): any[] {
        return this.optionsPanelValueService.getSelectedFileList();
    }

    public getCommitQualityList(): string[] {
        return this.optionsPanelValueService.getSelectedCommitQualityList();
    }

    public getCommitQualityCompareList(): string[] {
        return this.optionsPanelValueService.getCommitQualityCompareValues();
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
        this.optionsPanelValueService.removeFromCommitQualityForCompareList( paraValueToBeRemoved );
        this.qualityMetricCompareChangedEvent.emit();
        this.ref.markForCheck();
    }


    /**
     * adds a value from the selected list with the optionspanelvalueservice, emits a addFileToVisualizationEvent and marks the optionspanel component for refresh
     * @param {string} paraValue
     */
    public setFileSelectValueAndEmitAddFileToVisualizationEvent( paraOption: any ): void {
        //TODO: make better check if option is placeholder, check for 0 value or similar
        if( paraOption != "--- choose file ---" ) {
            this.optionsPanelValueService.setFileSelectValue({'filename':paraOption,'checked':true});
            this.addFileToVisualizationEvent.emit();
            this.ref.markForCheck();
        }
    }

    public setQualityMetricSelectValueAndEmitQualityMetricChangedEvent( paraValue: string ): void {
        if( paraValue != '0' ) {
            this.optionsPanelValueService.setQualityMetricSelectValue( paraValue );
            this.qualityMetricChangedEvent.emit();
            this.ref.markForCheck();
        }

        if( paraValue == '0' ){
            this.optionsPanelValueService.setQualityMetricSelectValue( null );
            this.qualityMetricChangedEvent.emit();
            this.ref.markForCheck();
        }
    }

    public setQualityMetricSelectValueForCompare( paraValue: string ): void {
        if( paraValue != '0' ) {
            this.optionsPanelValueService.setQualityMetricSelectValueForCompare( paraValue );
            this.qualityMetricCompareChangedEvent.emit();
            this.ref.markForCheck();
        }
    }

    public lookupQualityNameForKey( paraKey ): string {
        return this.optionsPanelValueService.lookupQualityNameForKey( paraKey );
    }

    public getSelectLayoutOptions(){
        return this.selectOptions;
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

    public emitAddFileToModuleWrapperEvent( paraFile ): void {
        this.optionsPanelValueService.addFileToModuleFileData( paraFile );
        this.removeFromSelectedFileList( paraFile );
        this.addFileToModuleWrapperEvent.emit();
        this.ref.markForCheck();
    }

    public removeFromModuleFileList( paraFile ): void {
        this.optionsPanelValueService.removeFromModuleFileData( paraFile );
        this.optionsPanelValueService.setFileSelectValue( { 'filename':paraFile,'checked':true } );
        this.removeFileFromModuleListEvent.emit();
        this.ref.markForCheck();
    }

    public getModuleFileData(): any {
        return this.optionsPanelValueService.getModuleFileData();
    }

    public showFileAndCommmitViews(): void {
        this.showFileAndCommitViewsEvent.emit();
        this.ref.markForCheck();
    }

    public fadeFileView(): void {
        this.fadeFileViewEvent.emit();
        this.ref.markForCheck();
    }

    public fadeCommitView(): void {
        this.fadeCommitViewEvent.emit();
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

    public setQualityColorList( paraQualityColorList: any ): void {
        this.optionsPanelValueService.setQualityColorList( paraQualityColorList );
    }

    public getQualityColorByLabel( paraQualityLabel: any ): string {
        return this.optionsPanelValueService.getQualityColorList()[ paraQualityLabel ];
    }

    public getSelectedQualityMetrc(): any {
        return this.optionsPanelValueService.getQualityMetricSelectValue();
    }

    public triggerFileVisibility( paraEvent:any, paraFile:any ): void {
        this.optionsPanelValueService.setFileNameForFileTrigger( paraFile.filename );
        this.optionsPanelValueService.triggerCheckedFlagInSelectedFileList( paraFile.filename );

        if (paraEvent.target.checked) {
            this.showFileEvent.emit();
        }  else {
            this.hideFileEvent.emit();
        }

    }

}
