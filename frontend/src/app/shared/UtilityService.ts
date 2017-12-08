import {Injectable} from '@angular/core';
import * as _ from 'lodash';

@Injectable()

export class UtilityService {
    /**
     * counts the number of occurence of a specific value in an array
     * the entries in the array must have the same datatype as the value to be searched
     * @param paraValue the value to be counted in the array
     * @param paraArray array with values
     */
    public getCounterForValueInArray( paraValue: any, paraArray: any ) {

        let counter = 0;

        if( paraArray.length > 0 ) {
            paraArray.forEach((entry) => {
                if (paraValue == entry) {
                    counter++;
                }
            });
        }

        return counter;
    }
}