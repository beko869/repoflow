const express = require('express');
const path = require('path');
const nodegitKit = require('nodegit-kit');
const nodegit = require('nodegit');
const Promise = require('bluebird');
const jshint = require('jshint');
const tslint = require("tslint");
const tss = require("typescript-simple");
const arangoDatabaseConnection = require('../arangoDatabaseConnection')
const colorScheme = require('../colorScheme');
const router = express.Router();


/* GET create data listing. */
router.get('/', (req, res, next)=>{
    res.send('giving me parameters you must!');
});

/* PUT (for idempotence) repository data in db. */
router.put('/database', (req, res, next)=>{
    nodegitKit.open(path.resolve(__dirname, "../../.git"))
        .then((repo)=>{
            return nodegitKit.log(repo, { sort: 'reverse' })
                .then((history)=>{
                    //get commit data
                    //step in commit history
                    let dataPromiseArray = [];
                    for( let i = 1; i<history.length; i++ ){

                        //promise function that gets the file data difference from one commit to the next
                        //returns an array with filename and status (modified,deleted,added)
                        let fileDataPromise = nodegitKit.diff( repo, history[i-1].commit, history[i].commit )
                            .then( (diff)=>{
                                //put all file differences in an array
                                let fileDataArray = [];
                                for( let j=0; j<diff.length;j++ ) {
                                    fileDataArray.push( { "status":diff[j].status,"path":diff[j].path,"hunks":diff[j].hunks } );
                                }
                                return fileDataArray;
                            });

                        //data object that holds commit information
                        let commitDataObject = {
                            "date":history[i].date,
                            "message":history[i].message,
                            "author":history[i].author.name,
                            "commit_sha":history[i].commit
                        };

                        //push the file and commit data to the promise array
                        dataPromiseArray.push( { "commit":commitDataObject, "files":fileDataPromise } );
                    }

                    //resolve the data promise array that holds commit and file data
                    return Promise.map( dataPromiseArray, ( values )=>{
                        return Promise.props( values );
                    });
                })
                .then(( commitDataArray )=>{

                   let commitInsertPromises = [];
                   let fileInsertPromises = [];

                   for( let i = 0; i<commitDataArray.length; i++ ){
                        //insert commit data
                       commitInsertPromises.push( arangoDatabaseConnection.query(
                            "INSERT " +
                            "   {   id:@sha, " +
                            "       name:@message, " +
                            "       color:@color, " +
                            "       datetime:@datetime, " +
                            "       quality_metric_1:@quality_metric_1, " +
                            "       quality_metric_2:@quality_metric_2, " +
                            "       quality_metric_3:@quality_metric_3, " +
                            "       fileCount:@fileCount," +
                            "       author:@author" +
                            "   } " +
                            "IN commit " +
                            "RETURN NEW",
                            {   sha: commitDataArray[i].commit.commit_sha,
                                message: commitDataArray[i].commit.message,
                                color: "blue",
                                datetime: commitDataArray[i].commit.date,
                                quality_metric_1: Math.random(),
                                quality_metric_2: Math.random(),
                                quality_metric_3: Math.random(),
                                fileCount: commitDataArray[i].files.length,
                                author: commitDataArray[i].commit.author
                            }).then( (commitInsertResult) => { return { "commitInsertResult":commitInsertResult["_result"] }; } ));

                        let fileArray = commitDataArray[i].files;
                        
                        for( let j = 0; j<fileArray.length; j++ ){
                            //insert file data
                            fileInsertPromises.push( arangoDatabaseConnection.query(
                                `INSERT
                                   {   name:@name,
                                       commitId:@sha,
                                       status:@status,
                                       hunks:@hunks,
                                       fileContent:@fileContent,
                                       quality_metric_1:@quality_metric_1,
                                       quality_metric_2:@quality_metric_2,
                                       quality_metric_3:@quality_metric_3
                                   }
                                IN file
                                RETURN NEW`,
                                {   name: fileArray[j].path,
                                    sha: commitDataArray[i].commit.commit_sha,
                                    status: fileArray[j].status,
                                    hunks: fileArray[j].hunks,
                                    fileContent: '',
                                    quality_metric_1: Math.random(),
                                    quality_metric_2: Math.random(),
                                    quality_metric_3: Math.random()
                                })
                            .then((insertedFileData)=>{
                                let resultData = insertedFileData;
                                //insert file color entry if name in file color document does not exist yet
                                return arangoDatabaseConnection.query(
                                    `UPSERT 
                                        {   name: @filename } 
                                     INSERT 
                                        {   name: @filename,
                                            color: @color
                                        }
                                     UPDATE 
                                        {}
                                     IN 
                                        file_color 
                                     RETURN 
                                        {   file_color: NEW }`,
                                    { filename: insertedFileData["_result"][0].name,
                                      color: ''
                                    }).then( (insertedColorData) => { return {"fileInsertResult":resultData["_result"], "fileColorInsertResult":insertedColorData["_result"]} } );
                            }));
                        }
                    }

                    //resolve the data promise array that holds commit and file data
                    return Promise.map( [commitInsertPromises,fileInsertPromises], ( values )=>{
                        return Promise.props( values );
                    });
                }).then( ( result ) => {

                    //get all unique file_color keys to set color from color scheme
                    let fileColorKeys = [];
                    for( let x in result[1] ){
                        let fileColorKey = result[1][x].fileColorInsertResult[0].file_color._key;
                        if( !fileColorKeys.includes( fileColorKey ) ) {
                            fileColorKeys.push(fileColorKey);
                        }
                    }

                    let colorUpdatePromises = [];

                    fileColorKeys.forEach( (key,i)=>{
                        //update colors
                        colorUpdatePromises.push( arangoDatabaseConnection.query(
                            `       UPDATE  
                                        @key
                                     WITH {
                                        color: @color }
                                     IN file_color`,{key:key, color:colorScheme[i]}));
                    });

                    return Promise.map( colorUpdatePromises, ( values )=>{
                        return Promise.props( values );
                    });

                }).then( ( colorUpdateResult ) => {
                    //update file entries with file content
                    return arangoDatabaseConnection.query( "FOR f IN file RETURN f" )
                        .then( (queryResult)=>{
                            let fileResult = queryResult._result;
                            let fileUpdatePromises = [];

                            for( let i=0;i<fileResult.length;i++ ) {
                                nodegit.Repository.open(path.resolve(__dirname, "../../.git"))
                                    .then(function(repo) {

                                        nodegit.Commit.lookup(repo, fileResult[i].commitId)
                                            .then((commit) => {

                                                commit.getEntry(fileResult[i].name)
                                                    .then((entry) => {
                                                        entry.getBlob().then((blob) => {
                                                            //if( entry.sha() == fileResult[i].commitId ) {
                                                            let fileType = fileResult[i].name.slice(-3);
                                                            let fileContent = String(blob);

                                                            if( fileType == '.js' )
                                                            {
                                                                //javascript code quality check
                                                                jshint.JSHINT("function(a){ if(a=1){ if(b=2){ a+b=3; } } }", {undef: true,esversion:6}, {foo:false});
                                                                let qualityData = jshint.JSHINT.data();

                                                                console.log("//-----------------------//");
                                                                console.log(qualityData.functions[0]);
                                                                console.log(fileResult[i].name);
                                                                console.log("//-----------------//");
                                                            }

                                                            /*if( fileType == '.ts' )
                                                            {
                                                                try {
                                                                    //console.log("its ts");
                                                                    let options = {
                                                                        fix: false,
                                                                        formatter: "json"
                                                                    };

                                                                    const rawConfig = tslint.Configuration.DEFAULT_CONFIG;

                                                                    rawConfig.rules = {
                                                                        semicolon: [true, 'always'],
                                                                    };

                                                                    console.log(rawConfig);

                                                                    let linter = new tslint.Linter(options);
                                                                    linter.lint(fileResult[i].name, String(blob), rawConfig );
                                                                    let result = linter.getResult();

                                                                    //console.log(result);
                                                                }catch(e){console.log(e);process.exit(1);}
                                                            }*/


                                                            fileUpdatePromises.push(arangoDatabaseConnection.query(
                                                                `UPDATE  
                                                                @key
                                                             WITH {
                                                                fileContent: @fileContent,
                                                                complexity: @complexity}
                                                             IN 
                                                                file`, {
                                                                    key: fileResult[i]._key,
                                                                    fileContent: String(blob),
                                                                    complexity: ''
                                                                }));
                                                            //}
                                                        });
                                                    });
                                            });
                                    });
                            }
                        })
                }).then( () => {
                    res.send( {status:200, message:"Database created!"} );
                } );
        });
});

router.put('/add/quality/:files_with_sha_and_computed_metric', (req,res,next)=>{
    //TODO Plan für diesen call
    //1. parameter kommt als array hier an (JSON decode)
    //2. array wird gelooped
    //2.1. in der loop wird für jedes file/sha pair in der db geschaut ob es existiert und der mitgegebene wert abgespeichert

    //TODO Sinn: Parameter können auch woanders berechnet werden als in NodeJS: PHP, Java, whatever...solange die Parameter in dieser Form ankommen
    //TODO damit die Parameter so ankommen können die caller /read/files_with_sha aufrufen, da kommen dann alle files mit sha als array mit
    //TODO der Plan wäre also: create/database -> dann sind mal alle file/sha pairs existent (also alle fileversionen im repo liegen dann in der db)
    //TODO dann kann man von irgendwo aus /read/files_with_sha aufrufen
    //TODO qualität berechnen
    //TODO und wieder zurückschicken
});

router.put('/test', (req, res, next)=>{

});

module.exports = router;