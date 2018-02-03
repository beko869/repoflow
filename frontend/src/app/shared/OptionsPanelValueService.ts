import {Injectable} from '@angular/core';
import {UtilityService} from "./UtilityService";

@Injectable()
/**
 * used for setting and retrieving values in and from the options panel component
 */
export class OptionsPanelValueService {

    private fileSelectValue: string;
    private fileRemoveValue: string;
    private commitQualityRemoveValue: string;
    private fileList: string[];
    private fileColorList: any;
    private selectedFileList: string[] = [];
    private selectedCommitQualityList: string[] = [];
    private commitQualitySelectValue: string;


    /**
     * sets the selected file value from the options panel component file dropdown
     * @param {string} paraValue
     */
    public setFileSelectValue( paraValue: string ){
        this.fileSelectValue = paraValue;
        this.selectedFileList.push( paraValue );
    }

    public setCommitQualitySelectValue( paraValue: string ){
        this.commitQualitySelectValue = paraValue;
        this.selectedCommitQualityList.push( paraValue );
    }


    /**
     * gets the selected file value from the options panel component file dropdown
     * @returns {string}
     */
    public getFileSelectValue():string {
        return this.fileSelectValue;
    }

    public getCommitQualitySelectValue():string {
        return this.commitQualitySelectValue;
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

        for (var i=this.selectedFileList.length-1; i>=0; i--) {
            if (this.selectedFileList[i] === paraValueToBeRemoved) {
                this.selectedFileList.splice(i, 1);
            }
        }
    }

    public removeFromSelectedCommitQualityList( paraValueToBeRemoved ): void {
        this.commitQualityRemoveValue = paraValueToBeRemoved;

        for (var i=this.selectedCommitQualityList.length-1; i>=0; i--) {
            if (this.selectedCommitQualityList[i] === paraValueToBeRemoved) {
                this.selectedCommitQualityList.splice(i, 1);
            }
        }
    }
}