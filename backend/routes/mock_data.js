var express = require('express');
var router = express.Router();

/* GET mock listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

/* GET mocked commit data. */
router.get('/0', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(JSON.stringify(
        {
            "commit-nodes": [
                {"id":1,"name": "Commit 1", "color": "blue", "datetime": "2017-11-13T09:29:29", "quality": 0.1, "quality2":0.3},
                {"id":2,"name": "Commit 2", "color": "chocolate", "datetime": "2017-11-14T09:29:29", "quality": 0.3, "quality2":0.5},
                {"id":3,"name": "Commit 3", "color": "brown", "datetime": "2017-11-15T09:29:29", "quality": 0.2, "quality2":0.6},
                {"id":4,"name": "Commit 4", "color": "darkmagenta", "datetime": "2017-11-16T09:29:29", "quality": 0.4, "quality2":0.7},
                {"id":5,"name": "Commit 5", "color": "chocolate", "datetime": "2017-11-17T09:29:29", "quality": 0.8, "quality2":0.9},
                {"id":6,"name": "Commit 6", "color": "darkmagenta", "datetime": "2017-11-18T09:29:29", "quality": 0.7, "quality2":0.3},
                {"id":7,"name": "Commit 7", "color": "blue", "datetime": "2017-11-20T09:29:29", "quality": 0.5, "quality2":0.1},
                {"id":8,"name": "Commit 8", "color": "darkmagenta", "datetime": "2017-11-22T09:29:29", "quality": 0.6, "quality2":0.4},
                {"id":9,"name": "Commit 9", "color": "blue", "datetime": "2017-11-23T09:29:29", "quality": 0.9, "quality2":0.6},
                {"id":10,"name": "Commit 10", "color": "blue", "datetime": "2017-11-24T09:29:29", "quality": 0.35, "quality2":0.7},
                {"id":11,"name": "Commit 11", "color": "chocolate", "datetime": "2017-12-01T09:29:29", "quality": 0.5, "quality2":0.5},
                {"id":12,"name": "Commit 12", "color": "brown", "datetime": "2017-12-02T09:29:29", "quality": 0.5, "quality2":0.5},
                {"id":13,"name": "Commit 13", "color": "blue", "datetime": "2017-12-03T09:29:29", "quality": 0.8, "quality2":0.7},
                {"id":14,"name": "Commit 14", "color": "darkmagenta", "datetime": "2017-12-06T09:29:29", "quality": 0.9, "quality2":0.3},
                {"id":15,"name": "Commit 15", "color": "blue", "datetime": "2017-12-10T09:29:29", "quality": 0.65, "quality2":0.8},
                {"id":16,"name": "Commit 16", "color": "blue", "datetime": "2017-12-13T09:29:29", "quality": 0.95, "quality2":0.9}
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
                        {"name": "file_1", "commitId": 6 }
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
            "links": [
                {"source": 0, "target": 1, "changeType": "modified", "value": 0.1},
                {"source": 0, "target": 1, "changeType": "added", "value": 0.2},
                {"source": 1, "target": 2, "changeType": "modified", "value": 0.3},
                {"source": 1, "target": 2, "changeType": "added", "value": 0.2},
                {"source": 2, "target": 3, "changeType": "modified", "value": 0.5},
                {"source": 4, "target": 6, "changeType": "added", "value": 0.2},
                {"source": 5, "target": 7, "changeType": "modified", "value": 0.4}
            ],
            "nodes": [
                {"name": "Commit 1 File 1", "color": "blue"},
                {"name": "Commit 2 File 1", "color": "blue"},
                {"name": "Commit 3 File 1", "color": "blue"},
                {"name": "Commit 4 File 1", "color": "blue"},
                {"name": "Commit 1 File 2", "color": "blue"},
                {"name": "Commit 1 File 3", "color": "blue"},
                {"name": "Commit 2 File 2", "color": "blue"},
                {"name": "Commit 3 File 3", "color": "blue"}
            ]
        }
    ));
});

module.exports = router;