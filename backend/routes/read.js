const express = require('express');
const router = express.Router();
const Promise = require('bluebird');
const nodegit = require('nodegit');
const path = require('path');
const jshint = require('jshint');
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
router.get('/file_data_by_name/:filename', (req, res, next)=>{
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

/* GET file data by name*/
router.get('/file_data_by_sha/:sha', (req, res, next)=>{
    arangoDatabaseConnection.query("FOR c IN commit FOR f IN file FILTER f.commitId=='"+req.params.sha+"' AND f.commitId == c.id RETURN {f,c}") //TODO join auf die color tabelle?
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

router.get('/files_with_sha', (req, res, next )=>{
    //TODO Plan für diesen call
    //1. liefert alle Fileversionen (File/Commit SHA Pairs) zurück als array
    //2. können dann an anderer stelle für qualitätsberechnung verwendet werden

    //TODO Sinn: Parameter können auch woanders berechnet werden als in NodeJS: PHP, Java, whatever...solange die Parameter in dieser Form ankommen
    //TODO damit die Parameter so ankommen können die caller /read/files_with_sha aufrufen, da kommen dann alle files mit sha als array mit
    //TODO der Plan wäre also: create/database -> dann sind mal alle file/sha pairs existent (also alle fileversionen im repo liegen dann in der db)
    //TODO dann kann man von irgendwo aus /read/files_with_sha aufrufen
    //TODO qualität berechnen
    //TODO und wieder zurückschicken
});

/* GET test file data*/
router.get('/test_plato', (req, res, next)=>{




    //JSHINT(["var a = 3;"], {undef: true}, {foo:false});
   //console.log(jshint.data());

    jshint.JSHINT(["var a = 3;","function(){let b = a; return b;}"], {undef: true}, {foo:false});

    let qualityData = jshint.JSHINT.data();

    console.log(qualityData.functions[0]);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(JSON.stringify(
        {
            "value":"bla"
        }
    ));

});


module.exports = router;