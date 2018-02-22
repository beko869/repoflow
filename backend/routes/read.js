const express = require('express');
const router = express.Router();
const Promise = require('bluebird');
const arangoDatabaseConnection = require('../arangoDatabaseConnection');


/* GET mock listing. */
router.get('/', (req, res, next)=>{
    res.send('giving me parameters you must!');
});

/* GET commit data */
router.get('/initial_data', (req, res, next)=>{
    let commitsQueryPromise = arangoDatabaseConnection.query("FOR c IN commit RETURN c").then( (values)=>{ return values; } );
    let fileCcolorsQueryPromise = arangoDatabaseConnection.query("FOR fc IN file_color RETURN fc").then( (values)=>{ return values; } );
    let filesPromise = arangoDatabaseConnection.query("FOR f IN file COLLECT name = f.name RETURN name").then( (values)=>{ return values; } ); //TODO join auf die color tabelle

    Promise.all( [commitsQueryPromise, filesPromise, fileCcolorsQueryPromise] ).then( (values)=>{
        //creating Commit array from result
        let commitResult = values[0]["_result"];    //for eventual modifying purposes
        let commitDataArray = commitResult;

        //creating File array from result with links consisting of files from the same name
        let filesResult = values[1]["_result"];     //for eventual modifying purposes
        let fileDataArray = filesResult;

        //creating file color array from file color result
        let fileColorResult = values[2]["_result"]; //for eventual modifying purposes
        let fileColorDataArray = fileColorResult;

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
router.get('/commit_data',  (req, res, next)=>{
    arangoDatabaseConnection.query("FOR c IN commit RETURN c")
        .then( (values)=>{
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
router.get('/file_data/:filename', (req, res, next)=>{
    arangoDatabaseConnection.query("FOR c IN commit FOR f IN file FILTER f.name=='"+req.params.filename+"' AND f.commitId == c.id RETURN {f,c}") //TODO join auf die color tabelle?
        .then( (values)=>{

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
/*var commits = arangoDatabaseConnection.query("FOR c IN commit RETURN c").then( function(values){ return values; } );
var files = arangoDatabaseConnection.query("FOR f IN file RETURN f").then( function(values){ return values; } );

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