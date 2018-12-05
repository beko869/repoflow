import {Injectable} from '@angular/core';
import {UtilityService} from "./utility.service";

@Injectable()
/**
 * used for setting and retrieving values in and from the options panel component
 */
export class OptionsPanelValuesService {

    private fileSelectValue: string;
    private fileRemoveValue: string;
    private commitQualityRemoveValue: string;
    private moduleDataRemoveValue: string;
    private fileList: string[];
    private fileColorList: any;
    private selectedFileList: string[] = [];
    private selectedCommitQualityList: string[] = [];
    private qualityMetricSelectValueForCompare: string[] = [];
    private qualityMetricSelectValue: string;
    private isFileInfo: boolean;
    private info: any;
    private qualityMetricList: string[];
    private moduleFileData: string[] = [];


    public setIsFileInfo( paraValue: boolean ){
        this.isFileInfo = paraValue;
    }

    public getIsFileInfo(){
        return this.isFileInfo;
    }

    public setInfo( paraValue: any ){
        this.info = paraValue;
    }

    public getInfo(){
        return this.info;
        //return {"value":"0.1","filename":"bla","time":"1h 12"}
    }

    /**
     * sets the selected file value from the options panel component file dropdown
     * @param {string} paraValue
     */
    public setFileSelectValue( paraValue: string ){
        this.fileSelectValue = paraValue;
        this.selectedFileList.push( paraValue );
    }

    public setQualityMetricSelectValue( paraValue: string ){
        this.qualityMetricSelectValue = paraValue;

        //change this if list behavior is desired
        this.selectedCommitQualityList = [];

        this.selectedCommitQualityList.push( paraValue );
    }

    public setQualityMetricSelectValueForCompare( paraValue: string ){
        this.qualityMetricSelectValueForCompare.push( paraValue );
    }

    /**
     * gets the selected file value from the options panel component file dropdown
     * @returns {string}
     */
    public getFileSelectValue():string {
        return this.fileSelectValue;
    }

    public getQualityMetricSelectValue():string {
        return this.qualityMetricSelectValue;
    }


    /**
     * gets the removed file value from the options panel component selected file list
     * @returns {string}
     */
    public getFileRemovedValue():string {
        return this.fileRemoveValue;
    }

    public getCommitQualityRemoveValue():string {
        return this.commitQualityRemoveValue;
    }


    /**
     * sets the values of the file list
     * @param {string[]} paraFileList
     */
    public setFileList( paraFileList: string[] ) {
        this.fileList = paraFileList;
        this.fileList.unshift( "--- choose file ---" );
    }


    /**
     * sets the values of the file list
     * @param {string[]} paraFileList
     */
    public setQualityMetricList( paraQualityMetricList: any ) {
        let keyValueArray = [];

        for( let i=0; i<paraQualityMetricList.length; i++ ){
            keyValueArray.push({
                id: paraQualityMetricList[i].key,
                text: paraQualityMetricList[i].label
            });
        }

        keyValueArray.unshift( {id:0,text:"--- choose quality metric ---"} );

        this.qualityMetricList = keyValueArray;
    }


    /**
     * sets the values of the file color list
     * @param {} paraFileColorList
     */
    public setFileColorList( paraFileColorList: any ) {
        this.fileColorList = paraFileColorList;
    }


    /**
     * gets the values of the file list
     * @returns {any}
     */
    public getFileList(): any {
        return this.fileList;
    }

    /**
     * gets the values of the file list
     * @returns {any}
     */
    public getQualityMetricListForSelect(): any {
        return this.qualityMetricList;
    }


    public getCommitQualityCompareValues() : any{
        return this.qualityMetricSelectValueForCompare;
    }

    /**
     * searches in the fileColorList array for the color of the given filename
     * @param {string} paraFileName
     */
    public getFileColorByFileName( paraFileName: string ){
        return this.fileColorList[paraFileName].color;
    }

    /**
     * returns a list of currently selected Files
     * @returns {string[]}
     */
    public getSelectedFileList(): string[] {
        return this.selectedFileList;
    }

    public getSelectedCommitQualityList(): string[] {
        return this.selectedCommitQualityList;
    }

    /**
     * returns a list of currently selected Files
     * @returns {string[]}
     */
    public emptySelectedFileList(): void {
        this.selectedFileList = [];
    }

    /**
     * removes entry from the selected file list
     * @param paraValueToBeRemoved
     */
    public removeFromSelectedFileList( paraValueToBeRemoved ): void {
        this.fileRemoveValue = paraValueToBeRemoved;

        for (let i=this.selectedFileList.length-1; i>=0; i--) {
            if (this.selectedFileList[i] === paraValueToBeRemoved) {
                this.selectedFileList.splice(i, 1);
            }
        }
    }

    public removeFromCommitQualityForCompareList( paraValueToBeRemoved ): void {
        this.commitQualityRemoveValue = paraValueToBeRemoved;

        for (let i=this.qualityMetricSelectValueForCompare.length-1; i>=0; i--) {
            if (this.qualityMetricSelectValueForCompare[i] === paraValueToBeRemoved) {
                this.qualityMetricSelectValueForCompare.splice(i, 1);
            }
        }
    }

    public removeFromModuleFileData( paraValueToBeRemoved ): void {
        this.moduleDataRemoveValue = paraValueToBeRemoved;

        for (let i=this.moduleFileData.length-1; i>=0; i--) {
            if (this.moduleFileData[i] === paraValueToBeRemoved) {
                this.moduleFileData.splice(i, 1);
            }
        }
    }

    public addFileToModuleFileData( paraFileValue ): void {
        this.moduleFileData.push( paraFileValue );
    }

    public getModuleFileData(): any {
        return this.moduleFileData;
    }

    public lookupQualityNameForKey( paraKey ): string {
        let qualityName = "";
        for( let i = 0; i<this.qualityMetricList.length; i++ ) {
            if( this.qualityMetricList[i]['id'] == paraKey ) {
                qualityName = this.qualityMetricList[i]['text'];
            }
        }

        return qualityName;
    }
}