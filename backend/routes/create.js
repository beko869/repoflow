var express = require('express');
var path = require('path');
var nodegit = require('nodegit');
var nodegitKit = require('nodegit-kit');
var Database = require('arangojs');
var router = express.Router();

/* GET create data listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

/* PUT repository data in db. */
router.put('/', function (req, res, next) {

    /**
     * 1) build commits in json with following structure: commit_nodes: [ {id,name,color,datetime,quality} ]
     * 2) build file links in json with following structure: file_links: [ {links:[name,commitId],color} ]
     */
});

router.put('/database', function (req, res, next) {
    nodegitKit.open(path.resolve(__dirname, "../../.git"))
        .then(function(repo){
            return nodegitKit.log(repo, { sort: 'reverse' })
                .then(function(history){
                    //step in commit history
                    var diffPromiseArray = [];
                    for( var i = 1; i<history.length; i++ ){
                        //promise function that gets the file difference from one commit to the next
                        //difference is an array with filename and status (modified,deleted,added)
                        var diffPromise = nodegitKit.diff( repo, history[i-1].commit, history[i].commit )
                            .then( function(diff){
                                //put all file differences in an array
                                var fileArray = [];
                                for( var j=0; j<diff.length;j++ ) {
                                    fileArray.push( {"status":diff[j].status,"path":diff[j].path,"commit_sha":diff[j].sha} )
                                }
                                //return the array with file differences
                                return fileArray;
                            });
                        //push the promise to the promise array
                        diffPromiseArray.push( diffPromise );
                    }
                    //resolve the promise array and return the values
                    return Promise.all( diffPromiseArray ).then( function(values){
                        return values;
                    });
                })
                .then(function(filediff){
                    //log the filediff to the console
                    console.log(filediff);

                    //TODO: hier fortsetzen mit Datenbank inserts
                    var db = new Database( {url:'http://root:Nenya123@127.0.0.1:8529'} );

                    db.useDatabase('repoflow');
                    db.useBasicAuth('root','Nenya123');
                    db.query("INSERT { status: @status, path:@path} IN commit RETURN NEW",{status: 'asdf', path: 'asdf/asdf'});
                });
        });
});

module.exports = router;