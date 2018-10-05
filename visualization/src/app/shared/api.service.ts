import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

const API_URL = environment.apiUrl;

@Injectable()
export class ApiService {

    constructor(private http: HttpClient) {
    }

    /**
     * get call for initial visualization data
     * @returns {Observable<any>}
     */
    public getInitialVisualizationData() {
        return this.http
            .get(API_URL + 'get/initial_data')
            .catch(this.handleError);
    }

    /**
     * get call for commit data
     * @returns {Observable<any>}
     */
    public getCommitData( paraMetric ) {
        return this.http
            .get(API_URL + 'get/commit_data' + ( paraMetric ? '?metric='+paraMetric : '' ) )
            .catch(this.handleError);
    }

    /**
     * get call for retrieving file data by file path
     * @param {string} paraFilePath the file path to be found
     * @returns {Observable<any>}
     */
    public getFileDataByFilePath(paraFilePath: string) {
        return this.http
            .get(API_URL + 'get/file_data_by_name/' + encodeURIComponent(paraFilePath))
            .catch(this.handleError);
    }

    /**
     * get call for retrieving file data by commit sha
     * @param {string} paraSHA the sha of the commit where files should be found
     * @param paraQualityMetricKey currently selected quality key
     * @returns {Observable<any>}
     */
    public getFileDataBySHAAndQualityKey(paraSHA: string, paraQualityMetricKey: string) {
        return this.http
            .get(API_URL + 'get/file_data_by_sha/' + encodeURIComponent(paraSHA) + '/' + paraQualityMetricKey)
            .catch(this.handleError);
    }

    /**
     * get call to only retrieve files where the selected quality metric can be computed on
     * @param {string} paraQualityMetricKey the key of the metric
     * @returns {Observable<any>}
     */
    public getFileDataByFileTypesOfQualityMetric(paraQualityMetricKey: string) {
        return this.http
            .get(API_URL + 'get/file_data_by_quality_metric_key/' + paraQualityMetricKey)
            .catch(this.handleError);
    }

    /**
     * get call for the min and max value of the currently selected metric
     * @param {string} paraMetric the key of the metric as string
     * @returns {Observable<any>}
     */
    public getMinMaxOfMetric(paraMetric: string) {
        return this.http
            .get(API_URL + 'get/min_max_for_metric/' + paraMetric)
            .catch(this.handleError);
    }

    /**
     * get call for the min and max value of the currently selected metric
     * @param {string} paraMetric the key of the metric as string
     * @returns {Observable<any>}
     */
    public getModuleFileData(paraFileNames: string, paraMetric: string) {
        return this.http
            .get(API_URL + 'get/module_data/' + encodeURIComponent( paraFileNames ) + '/' + encodeURIComponent( paraMetric ) )
            .catch(this.handleError);
    }

    /**
     * Error Handler for API Calls
     * @param {Response | any} error
     * @returns {ErrorObservable}
     */
    private handleError(error: Response | any) {
        console.log(error);
        console.error('ApiService::handleError', error);
        return Observable.throw(error);
    }
}