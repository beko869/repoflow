const express = require('express');
const path = require('path');
const nodegitKit = require('nodegit-kit');
const Promise = require('bluebird');
const arangoDatabaseConnection = require('../arangoDatabaseConnection')
const router = express.Router();


/* GET create data listing. */
router.get('/', (req, res, next)=>{
    res.send('giving me parameters you must!');
});

/* PUT repository data in db. */
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
                                    fileDataArray.push( {"status":diff[j].status,"path":diff[j].path} )
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
                   for( let i = 0; i<commitDataArray.length; i++ ){
                        //insert commit data
                       arangoDatabaseConnection.query(
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
                            });

                        let fileArray = commitDataArray[i].files;
                        
                        for( let j = 0; j<fileArray.length; j++ ){
                            //insert file data
                            arangoDatabaseConnection.query(
                                "INSERT " +
                                "   {   name:@name," +
                                "       commitId:@sha," +
                                "       status:@status, " +
                                "       color:@color," +
                                "       quality_metric_1:@quality_metric_1, " +
                                "       quality_metric_2:@quality_metric_2, " +
                                "       quality_metric_3:@quality_metric_3 " +
                                "   } " +
                                "IN file " +
                                "RETURN NEW",
                                {   name: fileArray[j].path,
                                    sha: commitDataArray[i].commit.commit_sha,
                                    status: fileArray[j].status,
                                    color: '#'+Math.floor(Math.random()*16777215).toString(16),
                                    quality_metric_1: Math.random(),
                                    quality_metric_2: Math.random(),
                                    quality_metric_3: Math.random()
                                })
                            .then((data)=>{
                                arangoDatabaseConnection.query( "UPSERT {name: @filename} INSERT {name: @filename,color: @color}UPDATE {}IN file_color RETURN {file_color: NEW}",
                                    { filename: data["_result"][0].name,
                                      color: '#'+Math.floor(Math.random()*16777215).toString(16)
                                    });
                            });
                        }
                    }

                    //TODO richtig promisen und status retournieren
                    res.send( commitDataArray );
                });
        });
});

module.exports = router;