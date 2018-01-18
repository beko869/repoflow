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

    /**
     * returns a lookup that can be searched for the id of an object in an array
     * @param paraArray an array with objects, the objects have to contain an id field
     * @returns the lookup array that can be searched for an id
     */
    public createIDLookupForArray( paraArray: any ) {
        var lookup = {};
        for (var i = 0, len = paraArray.length; i < len; i++) {
            lookup[paraArray[i].id] = paraArray[i];
        }

        return lookup;
    }

    /**
     * returns a lookup that can be searched for the id of an object in an array
     * @param paraArray an array with objects, the objects have to contain an id field
     * @returns the lookup array that can be searched for an id
     */
    public createXLookupForArray( paraArray: any ) {
        var lookup = {};
        for (var i = 0, len = paraArray.length; i < len; i++) {
            lookup[paraArray[i].x] = paraArray[i];
        }

        return lookup;
    }

    /**
     * returns the closest value in an array that is lower than the the given value
     * @param paraArray
     * @param paraValue
     * @returns {any}
     */
    public getClosestValueInArray( paraArray: any, paraValue: any ) {

        let allLowerValuesArray = [];
        for( let i = 0; i<paraArray.length; i++ ) {
            if( paraArray[i] < paraValue ) {
                allLowerValuesArray.push(paraArray[i]);
            }
        }

        let closest = allLowerValuesArray.reduce(function(prev, curr) {
            return (Math.abs(curr - paraValue) < Math.abs(prev - paraValue) ? curr : prev);
        });

        return closest;
    }

    /**
     * compare function for datetimes from commitnodes
     * @param a element to be compared
     * @param b element to be compared
     * @returns {number} returns 1, -1 or 0 depending if a or b is bigger or same value
     */
    public commitDatetimeComparer(a,b){
        if( a.datetime < b.datetime ){
            return -1;
        }
        if( a.datetime > b.datetime ){
            return 1
        }
        return 0
    }

    public fileDatetimeComparer(a,b){
        if( a.c.datetime < b.c.datetime ){
            return -1;
        }
        if( a.c.datetime > b.c.datetime ){
            return 1
        }
        return 0
    }
}