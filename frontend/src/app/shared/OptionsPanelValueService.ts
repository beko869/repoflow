import {Injectable} from '@angular/core';

@Injectable()
/**
 * used for setting and retrieving values in and from the options panel component
 */
export class OptionsPanelValueService {

    private fileSelectValue: string;
    public fileList: any;

    /**
     * sets the selected file value from the options panel component file dropdown
     * @param {string} paraValue
     */
    public setFileSelectValue( paraValue: string ){
        this.fileSelectValue = paraValue;
    }

    /**
     * gets the selected file value from the options panel component file dropdown
     * @returns {string}
     */
    public getFileSelectValue():string {
        return this.fileSelectValue;
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
}