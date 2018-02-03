var express = require('express');
var path = require('path');
var nodegit = require('nodegit');
var router = express.Router();
var Database = require('arangojs');
var Promise = require('bluebird');

/* GET mock listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

/* GET commit data */
router.get('/initial_data', function (req, res, next) {
    //TODO konfigurierbar machen
    var db = new Database( {url:'http://root:Nenya123@127.0.0.1:8529'} );
    db.useDatabase('repoflow');
    db.useBasicAuth('root','Nenya123');

    var commitsQueryPromise = db.query("FOR c IN commit RETURN c").then( function(values){ return values; } );
    var fileCcolorsQueryPromise = db.query("FOR fc IN file_color RETURN fc").then( function(values){ return values; } );
    var filesPromise = db.query("FOR f IN file COLLECT name = f.name RETURN name").then( function(values){ return values; } ); //TODO join auf die color tabelle

    Promise.all( [commitsQueryPromise, filesPromise, fileCcolorsQueryPromise] ).then( function(values){
        //creating Commit array from result
        var commitResult = values[0]["_result"];
        var commitDataArray = commitResult;

        //creating File array from result with links consisting of files from the same name
        var filesResult = values[1]["_result"];
        var fileDataArray = filesResult;

        //creating file color array from file color result
        var fileColorResult = values[2]["_result"];
        var fileColorDataArray = fileColorResult;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(JSON.stringify(
            {
                "commit-nodes":commitDataArray,
                "file-names":fileDataArray,
                "file-colors":fileColorDataArray
            }
        ));
    } );
});

/* GET commit data */
router.get('/commit_data', function (req, res, next) {
    //TODO konfigurierbar machen
    var db = new Database( {url:'http://root:Nenya123@127.0.0.1:8529'} );
    db.useDatabase('repoflow');
    db.useBasicAuth('root','Nenya123');

    db.query("FOR c IN commit RETURN c")
        .then( function(values){
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.send(JSON.stringify(
                {
                    "commit-nodes":values._result
                }
            ));
        });
});

/* GET file data by name*/
router.get('/file_data/:filename', function (req, res, next) {
    //TODO konfigurierbar machen
    var db = new Database( {url:'http://root:Nenya123@127.0.0.1:8529'} );
    db.useDatabase('repoflow');
    db.useBasicAuth('root','Nenya123');

    db.query("FOR c IN commit FOR f IN file FILTER f.name=='"+req.params.filename+"' AND f.commitId == c.id RETURN {f,c}") //TODO join auf die color tabelle
        .then( function(values){

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.send(JSON.stringify(
                {
                    "files":values._result
                }
            ));
        } );
});

//TODO deprecated: maybe use this later for commits with file links, but refactor queries
/*var commits = db.query("FOR c IN commit RETURN c").then( function(values){ return values; } );
var files = db.query("FOR f IN file RETURN f").then( function(values){ return values; } );

Promise.all( [commits, files] ).then( function(values){

    //creating File array from result with links consisting of files from the same name
    var filesResult = values[1]["_result"];
    var fileDataArray = [];
    for( var i=0; i<filesResult.length;i++ )
    {
        var filesResult = values[1]["_result"];
        var fileDataArray = [];
        for( var i=0; i<filesResult.length;i++ )
        {
            var fileLinkArray = [];
            //so that files do net get counted twice
            for( var j=i; j<filesResult.length;j++ )
            {
                if( filesResult[i].name == filesResult[j].name)
                    fileLinkArray.push( {"name":filesResult[j].name, "commitId":filesResult[j].commitId} )
            }

            if( fileLinkArray.length > 1 )
                fileDataArray.push( { links:fileLinkArray,color:"red"} )
        }
    }

    //creating Commit array from result
    var commitResult = values[0]["_result"];
    var commitDataArray = commitResult;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(JSON.stringify(
        {
            "commit-nodes":commitDataArray,
            "file-links":fileDataArray
        }
    ));
} );*/


module.exports = router;