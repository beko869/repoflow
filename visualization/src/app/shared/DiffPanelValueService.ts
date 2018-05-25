import {Injectable} from '@angular/core';
import {UtilityService} from "./UtilityService";

@Injectable()
/**
 * used for setting and retrieving values in and from the diff panel component
 */
export class DiffPanelValueService {
    private leftFileData: any = { fileName:'N/A', sha:'N/A' };
    private rightFileData: any = { fileName:'N/A', sha:'N/A' };

    private leftFileFixated: boolean = false;
    private rightFileFixated: boolean = false;

    private leftContent: string;
    private rightContent: string;


    public setLeftFileData( paraLeftFileData: any ) {
        this.leftFileData = paraLeftFileData;
    }

    public setRightFileData( paraRightFileData: any ) {
        this.rightFileData = paraRightFileData;
    }

    public setLeftContent( paraLeftContent: any ) {
        this.leftContent = paraLeftContent;
    }

    public setRightContent( paraRightContent: any ) {
        this.rightContent = paraRightContent;
    }

    public getLeftContent() {
        return this.leftContent;
    }

    public getRightContent() {
        return this.rightContent;
    }

    public getLeftFileData() {
       return this.leftFileData;
    }

    public getRightFileData() {
        return this.rightFileData;
    }

    public getLeftFileFixated() {
        return this.leftFileFixated;
    }

    public getRightFileFixated() {
        return this.rightFileFixated;
    }

    public toggleLeftFileFixated() {
        this.leftFileFixated = !this.leftFileFixated;
    }

    public toggleRightFileFixated() {
        this.rightFileFixated = !this.rightFileFixated;
    }
}