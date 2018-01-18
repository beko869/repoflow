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
router.get('/commit_data', function (req, res, next) {
    //TODO konfigurierbar machen
    var db = new Database( {url:'http://root:Nenya123@127.0.0.1:8529'} );
    db.useDatabase('repoflow');
    db.useBasicAuth('root','Nenya123');

    var commits = db.query("FOR c IN commit RETURN c").then( function(values){ return values; } );
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
                    fileDataArray.push( { links:fileLinkArray,color:"red"/*"#"+((1<<24)*Math.random()|0).toString(16)*/ } )
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
    } );
});

/* GET mocked commit data. */
router.get('/0', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(JSON.stringify(
        {
            "commit-nodes": [
                {"id":1,"name": "Commit 1", "color": "blue", "datetime": "2017-11-13T09:29:29", "quality": 0.1, "quality2":0.9},
                {"id":2,"name": "Commit 2", "color": "chocolate", "datetime": "2017-11-14T09:29:29", "quality": 0.3, "quality2":0.6},
                {"id":3,"name": "Commit 3", "color": "brown", "datetime": "2017-11-15T09:29:29", "quality": 0.2, "quality2":0.9},
                {"id":4,"name": "Commit 4", "color": "darkmagenta", "datetime": "2017-11-16T09:29:29", "quality": 0.4, "quality2":0.6},
                {"id":5,"name": "Commit 5", "color": "chocolate", "datetime": "2017-11-17T09:29:29", "quality": 0.8, "quality2":0.6},
                {"id":6,"name": "Commit 6", "color": "darkmagenta", "datetime": "2017-11-18T09:29:29", "quality": 0.7, "quality2":0.6},
                {"id":7,"name": "Commit 7", "color": "blue", "datetime": "2017-11-20T09:29:29", "quality": 0.5, "quality2":0.9},
                {"id":8,"name": "Commit 8", "color": "darkmagenta", "datetime": "2017-11-22T09:29:29", "quality": 0.6, "quality2":0.3},
                {"id":9,"name": "Commit 9", "color": "blue", "datetime": "2017-11-23T09:29:29", "quality": 0.9, "quality2":0.6},
                {"id":10,"name": "Commit 10", "color": "blue", "datetime": "2017-11-24T09:29:29", "quality": 0.35, "quality2":0.6},
                {"id":11,"name": "Commit 11", "color": "chocolate", "datetime": "2017-12-01T09:29:29", "quality": 0.5, "quality2":0.9},
                {"id":12,"name": "Commit 12", "color": "brown", "datetime": "2017-12-02T09:29:29", "quality": 0.5, "quality2":0.9},
                {"id":13,"name": "Commit 13", "color": "blue", "datetime": "2017-12-03T09:29:29", "quality": 0.8, "quality2":0.3},
                {"id":14,"name": "Commit 14", "color": "darkmagenta", "datetime": "2017-12-06T09:29:29", "quality": 0.9, "quality2":0.6},
                {"id":15,"name": "Commit 15", "color": "blue", "datetime": "2017-12-10T09:29:29", "quality": 0.65, "quality2":0.3},
                {"id":16,"name": "Commit 16", "color": "blue", "datetime": "2017-12-13T09:29:29", "quality": 0.95, "quality2":0.3}
            ],
            "file-links": [
                {                                         
                    "links":[                             
                        {"name": "file_1", "commitId": 0 },
                        {"name": "file_1", "commitId": 1 },
                        {"name": "file_1", "commitId": 2 },
                        {"name": "file_1", "commitId": 3 },
                        {"name": "file_1", "commitId": 4 },
                        {"name": "file_1", "commitId": 5 },
                        {"name": "file_1", "commitId": 6 },
                        {"name": "file_1", "commitId": 7 },
                        {"name": "file_1", "commitId": 8 },
                        {"name": "file_1", "commitId": 9 },
                        {"name": "file_1", "commitId": 10 },
                        {"name": "file_1", "commitId": 11 },
                        {"name": "file_1", "commitId": 12 },
                        {"name": "file_1", "commitId": 13 },
                        {"name": "file_1", "commitId": 14 },
                        {"name": "file_1", "commitId": 15 }
                    ],
                    "color":"blue"
                },
                {
                    "links":[
                        {"name": "file_2", "commitId": 0  },
                        {"name": "file_2", "commitId": 1  },
                        {"name": "file_2", "commitId": 2  },
                        {"name": "file_2", "commitId": 6  },
                        {"name": "file_2", "commitId": 7  },
                        {"name": "file_2", "commitId": 8  },
                        {"name": "file_2", "commitId": 9  },
                        {"name": "file_2", "commitId": 11 },
                        {"name": "file_2", "commitId": 12 }
                    ],
                    "color":"orange"
                },
                {
                    "links":[
                        {"name": "file_3", "commitId": 0  },
                        {"name": "file_3", "commitId": 2  },
                        {"name": "file_3", "commitId": 4  },
                        {"name": "file_3", "commitId": 6  },
                        {"name": "file_3", "commitId": 9  },
                        {"name": "file_3", "commitId": 10 },
                        {"name": "file_3", "commitId": 11 },
                        {"name": "file_3", "commitId": 12 },
                        {"name": "file_3", "commitId": 13 }
                    ],
                    "color":"magenta"
                },
                {
                    "links":[
                        {"name": "file_4", "commitId": 1  },
                        {"name": "file_4", "commitId": 8  },
                        {"name": "file_4", "commitId": 9  },
                        {"name": "file_4", "commitId": 10 },
                        {"name": "file_4", "commitId": 11 },
                        {"name": "file_4", "commitId": 13 },
                        {"name": "file_4", "commitId": 14 },
                        {"name": "file_4", "commitId": 15 }
                    ],
                    "color":"green"
                },
                {
                    "links":[
                        {"name": "file_2", "commitId": 6 }
                    ],
                    "color":"green"
                },
                {
                    "links":[
                        {"name": "file_2", "commitId": 6 }
                    ],
                    "color":"red"
                }
            ]
        }
    ));
});

/* GET mocked file data. */
router.get('/1', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(JSON.stringify(
        {
            "commit-nodes": [
                {"id":1,"name": "Commit 1", "color": "blue", "datetime": "2017-11-13T09:29:29", "quality": 0.4, "quality2":0.9},
                {"id":2,"name": "Commit 2", "color": "chocolate", "datetime": "2017-11-14T09:29:29", "quality": 0.1, "quality2":0.6},
                {"id":3,"name": "Commit 3", "color": "brown", "datetime": "2017-11-15T09:29:29", "quality": 0.2, "quality2":0.9},
                {"id":4,"name": "Commit 4", "color": "darkmagenta", "datetime": "2017-11-16T09:29:29", "quality": 0.4, "quality2":0.6},
                {"id":5,"name": "Commit 5", "color": "chocolate", "datetime": "2017-11-17T09:29:29", "quality": 0.6, "quality2":0.6},
                {"id":6,"name": "Commit 6", "color": "darkmagenta", "datetime": "2017-11-18T09:29:29", "quality": 0.7, "quality2":0.6},
                {"id":7,"name": "Commit 7", "color": "blue", "datetime": "2017-11-20T09:29:29", "quality": 0.1, "quality2":0.9},
                {"id":8,"name": "Commit 8", "color": "darkmagenta", "datetime": "2017-11-22T09:29:29", "quality": 0.3, "quality2":0.3},
                {"id":9,"name": "Commit 9", "color": "blue", "datetime": "2017-11-23T09:29:29", "quality": 0.6, "quality2":0.6},
                {"id":10,"name": "Commit 10", "color": "blue", "datetime": "2017-11-24T09:29:29", "quality": 0.7, "quality2":0.6},
                {"id":11,"name": "Commit 11", "color": "chocolate", "datetime": "2017-12-01T09:29:29", "quality": 0.8, "quality2":0.9},
                {"id":12,"name": "Commit 12", "color": "brown", "datetime": "2017-12-02T09:29:29", "quality": 0.9, "quality2":0.9},
                {"id":13,"name": "Commit 13", "color": "blue", "datetime": "2017-12-03T09:29:29", "quality": 0.92, "quality2":0.3},
                {"id":14,"name": "Commit 14", "color": "darkmagenta", "datetime": "2017-12-06T09:29:29", "quality": 0.94, "quality2":0.6},
                {"id":15,"name": "Commit 15", "color": "blue", "datetime": "2017-12-10T09:29:29", "quality": 0.95, "quality2":0.3},
                {"id":16,"name": "Commit 16", "color": "blue", "datetime": "2017-12-13T09:29:29", "quality": 0.95, "quality2":0.3}
            ],
            "file-links": [
                {
                    "links":[
                        {"name": "file_1", "commitId": 0 },
                        {"name": "file_1", "commitId": 1 },
                        {"name": "file_1", "commitId": 2 },
                        {"name": "file_1", "commitId": 3 },
                        {"name": "file_1", "commitId": 4 },
                        {"name": "file_1", "commitId": 5 },
                        {"name": "file_1", "commitId": 6 },
                        {"name": "file_1", "commitId": 7 },
                        {"name": "file_1", "commitId": 8 },
                        {"name": "file_1", "commitId": 9 },
                        {"name": "file_1", "commitId": 10 },
                        {"name": "file_1", "commitId": 11 },
                        {"name": "file_1", "commitId": 12 },
                        {"name": "file_1", "commitId": 13 },
                        {"name": "file_1", "commitId": 14 },
                        {"name": "file_1", "commitId": 15 }
                    ],
                    "color":"blue"
                }
            ]
        }
    ));
});

/* GET commit view data. */
router.get('/2', function (req, res, next) {
    nodegit.Repository.open(path.resolve(__dirname, "../../.git"))
        .then(function(repo) {
            return repo.getMasterCommit();
        })
        .then(function(firstCommitOnMaster) {
            return firstCommitOnMaster.getTree();
        })
        .then(function(tree) {
            // `walk()` returns an event.
            var walker = tree.walk();
            walker.on("entry", function(entry) {
                console.log(entry.path());
            });

            // Don't forget to call `start()`!
            walker.start();
        })
        .done();
});

/* GET file view data. */
router.get('/3', function (req, res, next) {
    nodegit.Repository.open(path.resolve(__dirname, "../../.git"))
        .then(function(repo) {
            return repo.getMasterCommit();
        })
        .then(function(firstCommitOnMaster){
            // History returns an event.
            var history = firstCommitOnMaster.history(nodegit.Revwalk.SORT.Time);

            // History emits "commit" event for each commit in the branch's history
            history.on("commit", function(commit) {
                console.log("commit " + commit.sha());
                console.log("Author:", commit.author().name() +
                    " <" + commit.author().email() + ">");
                console.log("Date:", commit.date());
                console.log("\n    " + commit.message());
            });

            // Don't forget to call `start()`!
            history.start();
        })
        .done();
});

module.exports = router;