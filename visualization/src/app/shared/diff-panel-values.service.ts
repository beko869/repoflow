import {Injectable} from '@angular/core';
import {UtilityService} from "./utility.service";

@Injectable()
/**
 * used for setting and retrieving values in and from the diff panel component
 */
export class DiffPanelValuesService {

    private leftFileData: any = { fileName:'N/A', sha:'N/A' };
    private rightFileData: any = { fileName:'N/A', sha:'N/A' };

    private leftFileFixated: boolean = false;
    private rightFileFixated: boolean = false;

    private leftContent: string;
    private rightContent: string;

    private _leftQualityValue: any;
    private _rightQualityValue: any;

    private _leftQualityLabel: string;
    private _rightQualityLabel: string;

    private fileName: string;
    private qualityColor: string;


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

    public getLeftQualityValue(): any {
        return this._leftQualityValue;
    }

    public setLeftQualityValue(value: any) {
        this._leftQualityValue = value;
    }

    public getRightQualityValue(): any {
        return this._rightQualityValue;
    }

    public setRightQualityValue(value: any) {
        this._rightQualityValue = value;
    }

    public getLeftQualityLabel(): string {
        return this._leftQualityLabel;
    }

    public setLeftQualityLabel(value: string) {
        this._leftQualityLabel = value;
    }

    public getRightQualityLabel(): string {
        return this._rightQualityLabel;
    }

    public setRightQualityLabel(value: string) {
        this._rightQualityLabel = value;
    }

    public getFileName(): string {
        return this.fileName;
    }

    public setFileName(value: string) {
        this.fileName = value;
    }

    public setQualityColor(value: string) {
        this.qualityColor = value;
    }

    public getQualityColor() {
        return this.qualityColor;
    }
}