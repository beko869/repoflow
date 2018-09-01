const request = require('request');
const config = require( '../config.js' );

/**
 * api call for cloning a repository
 * @param paraRepositoryURL the URL of the repository
 * @param paraRepositoryDirectory the directory where the repository gets cloned into
 * @returns {Promise}
 */
const cloneRepository = (paraRepositoryURL, paraRepositoryDirectory) => {
    let options = {
        hostname: config.apiUrl,
        port: config.apiPort,
        path: '/read/clone'
    };

    return new Promise( (resolve,reject)=>{
        request.get( {
            url: options.hostname + ":" + options.port + options.path,
            qs : {"repo_url" : paraRepositoryURL, "repo_directory" : paraRepositoryDirectory }
        }, (err, response, body) => {
            if( err == null ) {
                resolve( JSON.parse( body ) );
            } else {
                reject(err);
            }
        });
    });
};


/**
 * api call for creating database for a specific repository
 * @param paraRepositoryDirectory
 * @returns {Promise}
 */
const createDatabase = (paraRepositoryDirectory) => {
    let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    let options = {
        method: 'PUT',
        uri: config.apiUrl + ":" + config.apiPort + '/post/database',
        headers: headers,
        form: { 'repo_directory':paraRepositoryDirectory }
    };

    return new Promise( (resolve,reject)=>{
        request(options, (err, response, body) => {
            if( err == null ) {
                resolve( JSON.parse( body ) );
            } else {
                reject(err);
            }
        });
    });
};


const clearDatabase = () => {
    let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    let options = {
        method: 'PUT',
        uri: config.apiUrl + ":" + config.apiPort + '/post/truncate',
        headers: headers
    };

    return new Promise( (resolve,reject)=>{
        request(options, (err, response, body) => {
            if( err == null ) {
                resolve( JSON.parse( body ) );
            } else {
                reject(err);
            }
        });
    });
};


const demoDatabase = () => {
    let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    let options = {
        method: 'PUT',
        uri: config.apiUrl + ":" + config.apiPort + '/post/quality',
        headers: headers,
        form: { 'files_with_sha_and_computed_metric':{},
                'compute_js_metrics':1 }

    };

    return new Promise( (resolve,reject)=>{
        request(options, (err, response, body) => {
            if( err == null ) {
                resolve( JSON.parse( body ) );
            } else {
                reject(err);
            }
        });
    });
};

module.exports.cloneRepository = cloneRepository;
module.exports.createDatabase = createDatabase;
module.exports.clearDatabase = clearDatabase;
module.exports.demoDatabase = demoDatabase;