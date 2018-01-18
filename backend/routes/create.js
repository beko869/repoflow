var express = require('express');
var path = require('path');
var nodegit = require('nodegit');
var nodegitKit = require('nodegit-kit');
var Database = require('arangojs');
var Promise = require('bluebird');
var router = express.Router();

/* GET create data listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

/* PUT repository data in db. */
router.put('/database', function (req, res, next) {
    nodegitKit.open(path.resolve(__dirname, "../../.git"))
        .then(function(repo){
            return nodegitKit.log(repo, { sort: 'reverse' })
                .then(function(history){
                    //get commit data
                    //step in commit history
                    var dataPromiseArray = [];
                    for( var i = 1; i<history.length; i++ ){

                        //promise function that gets the file data difference from one commit to the next
                        //returns an array with filename and status (modified,deleted,added)
                        var fileDataPromise = nodegitKit.diff( repo, history[i-1].commit, history[i].commit )
                            .then( function(diff){
                                //put all file differences in an array
                                var fileDataArray = [];
                                for( var j=0; j<diff.length;j++ ) {
                                    fileDataArray.push( {"status":diff[j].status,"path":diff[j].path} )
                                }
                                return fileDataArray;
                            });

                        //data object that holds commit information
                        var commitDataObject = {
                            "date":history[i].date,
                            "message":history[i].message,
                            "author":history[i].author.name,
                            "commit_sha":history[i].commit

                        };

                        //push the file and commit data to the promise array
                        dataPromiseArray.push( { "commit":commitDataObject, "files":fileDataPromise } );
                    }

                    //resolve the data promise array that holds commit and file data
                    return Promise.map( dataPromiseArray, function( values ){
                        return Promise.props( values );
                    });
                })
                .then(function( commitDataArray ){
                    //put commit data into database
                    //TODO: konfigurierbar machen
                    var db = new Database( {url:'http://root:Nenya123@127.0.0.1:8529'} );
                    db.useDatabase('repoflow');
                    db.useBasicAuth('root','Nenya123');

                    for( var i = 0; i<commitDataArray.length; i++ ){
                        //insert commit data
                        db.query(
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

                        var fileArray = commitDataArray[i].files;

                        for( var j = 0; j<fileArray.length; j++ ){
                            //insert file data
                            db.query(
                                "INSERT " +
                                "   {   name:@name," +
                                "       commitId:@sha," +
                                "       status:@status, " +
                                "       quality_metric_1:@quality_metric_1, " +
                                "       quality_metric_2:@quality_metric_2, " +
                                "       quality_metric_3:@quality_metric_3 " +
                                "   } " +
                                "IN file " +
                                "RETURN NEW",
                                {   name: fileArray[j].path,
                                    sha: commitDataArray[i].commit.commit_sha,
                                    status: fileArray[j].status,
                                    quality_metric_1: Math.random(),
                                    quality_metric_2: Math.random(),
                                    quality_metric_3: Math.random()
                                });
                        }
                    }

                    //TODO richtig promisen und status retournieren
                    res.send( commitDataArray );
                });
        });
});

module.exports = router;