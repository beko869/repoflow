import {Injectable} from '@angular/core';

@Injectable()
/**
 * used for setting and retrieving values in and from the options panel component
 */
export class OptionsPanelValueService {

    private fileSelectValue: string;
    private fileRemoveValue: string;
    private fileList: string[];
    private selectedFileList: string[] = [];

    /**
     * sets the selected file value from the options panel component file dropdown
     * @param {string} paraValue
     */
    public setFileSelectValue( paraValue: string ){
        this.fileSelectValue = paraValue;
        this.selectedFileList.push( paraValue );
    }

    /**
     * gets the selected file value from the options panel component file dropdown
     * @returns {string}
     */
    public getFileSelectValue():string {
        return this.fileSelectValue;
    }

    /**
     * gets the removed file value from the options panel component selected file list
     * @returns {string}
     */
    public getFileRemovedValue():string {
        return this.fileRemoveValue;
    }

    /**
     * sets the values of the file list
     * @param {string[]} paraFileList
     */
    public setFileList( paraFileList: string[] ) {
        this.fileList = paraFileList;
    }

    /**
     * gets the values of the file list
     * @returns {any}
     */
    public getFileList(): any {
        return this.fileList;
    }

    public getSelectedFileList(): string[] {
        return this.selectedFileList;
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
}