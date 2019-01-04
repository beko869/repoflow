const arangoDatabaseConnection = require('./arangoDatabaseConnection');
const colorScheme = require('./colorScheme');

let helper = {};

//returns promise
helper.selectSHAFileArray = async function selectSHAFileArray() {

    const cursor = await arangoDatabaseConnection.query("FOR f IN file RETURN  {_key:f._key, fileContent:f.fileContent, name:f.name, commitId:f.commitId}", {}, {count: true});
    const result = await cursor.all();
    return result;
};

helper.selectCommitsForUpdateArray = function selectCommitsForUpdateArray() {
    //TODO maybe update file count so it does only display file count for specific quality?
    return arangoDatabaseConnection.query("FOR c IN commit RETURN  {_key:c._key, commitId:c.id}")
        .then( (values)=>{
            return values._result;
        } );
};

//returns promise
helper.updateFileCollectionWithQualityData = function updateSHAFilePairsWithQualityData( paraQualityMetricArray ){
    let fileCollection = arangoDatabaseConnection.collection( 'file' );
    return fileCollection.bulkUpdate( paraQualityMetricArray );
};

//returns promise
helper.insertQualityMetricCollection = function updateSHAFilePairsWithQualityData( paraQualityMetricArray ){
    let qualityMetricCollection = arangoDatabaseConnection.collection( 'quality_metric' );

    for( let i = 0; i < paraQualityMetricArray.length; i++ ){
        paraQualityMetricArray[i].color = colorScheme[colorScheme.length-i-1];
    }

    //TODO validate if quality key already exists
    return qualityMetricCollection.import( paraQualityMetricArray );
};

helper.updateCommitCollection = function updateCommitCollection( paraQualityMetricArray, paraCommitCollectionResult ) {
    let keyArray = [];

    for( let k = 0; k<paraQualityMetricArray[0].length; k++ ) {
        //get keys of added quality metrics
        keyArray.push( paraQualityMetricArray[0][k].key );
    }

    let updateArray = [];

    for( let i = 0; i<paraCommitCollectionResult.length; i++ ) {
        let dynamicMetricsTmp = {};
        for (let j = 0; j < keyArray.length; j++) {
            let qualityMetricTmp = 0;
            let counterForAverage = 0;

            for (let k = 0; k < paraQualityMetricArray[1].length; k++) {
                let currentEntry = paraQualityMetricArray[1][k];
                if( currentEntry.commitId == paraCommitCollectionResult[i].commitId ) {
                    qualityMetricTmp = qualityMetricTmp + currentEntry[keyArray[j]];
                    counterForAverage++;
                }
            }

            dynamicMetricsTmp[keyArray[j]] = qualityMetricTmp/counterForAverage;

        }
        dynamicMetricsTmp['_key'] = paraCommitCollectionResult[i]._key;
        updateArray.push(dynamicMetricsTmp);
    }

    let commitCollection = arangoDatabaseConnection.collection( 'commit' );
    return commitCollection.bulkUpdate( updateArray );
};

helper.getFileTypeMatches = function getFileTypeMatches( paraFileNamesArray, paraFileTypesArray ) {
    let matchedFileNames = [];

    //check for filetype
    paraFileNamesArray.forEach( (fileName)=>{
        for( let i = 0; i<paraFileTypesArray.length; i++ ){
            let fileTypeLength = paraFileTypesArray[i].length;
            if( fileName.substr( fileName.length - fileTypeLength ) == paraFileTypesArray[i] ){
                matchedFileNames.push( fileName );
            }
        }
    });

    return matchedFileNames;
};

helper.truncateDatabase = truncateDatabase = () => {
    let dropPromiseArray = [];

    dropPromiseArray.push( arangoDatabaseConnection.collection( 'commit' ).truncate() );
    dropPromiseArray.push( arangoDatabaseConnection.collection( 'file' ).truncate() );
    dropPromiseArray.push( arangoDatabaseConnection.collection( 'file_color' ).truncate() );
    dropPromiseArray.push( arangoDatabaseConnection.collection( 'quality_metric' ).truncate() );

    return Promise.all(dropPromiseArray).then( ()=>{
        return true;
    }).catch( (err) => {
        return false;
    });
};

module.exports = helper;