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
            "links": [
                {"source": 0, "target": 1, "fileName": "file_1", "value": 0.1},
                {"source": 0, "target": 4, "fileName": "file_1", "value": 0.1},
                {"source": 1, "target": 2, "fileName": "file_3", "value": 0.1},
                {"source": 1, "target": 4, "fileName": "file_3", "value": 0.1},
                {"source": 2, "target": 3, "fileName": "file_4", "value": 0.1},
                {"source": 3, "target": 4, "fileName": "file_3", "value": 0.1}/*,
                {"source": 3, "target": 4, "fileName": "file_4", "value": 0.5},
                {"source": 5, "target": 4, "fileName": "file_5", "value": 0.5},
                {"source": 6, "target": 4, "fileName": "file_6", "value": 0.5},
                {"source": 7, "target": 2, "fileName": "file_4", "value": 0.5},
                {"source": 8, "target": 9, "fileName": "file_2", "value": 0.5},
                {"source": 9, "target": 10, "fileName": "file_2", "value": 0.5},
                {"source": 4, "target": 11, "fileName": "file_3", "value": 0.5},
                {"source": 4, "target": 12, "fileName": "file_4", "value": 0.5},
                {"source": 4, "target": 13, "fileName": "file_1", "value": 0.5},
                {"source": 4, "target": 14, "fileName": "file_5", "value": 0.5},
                {"source": 4, "target": 15, "fileName": "file_6", "value": 0.5}*/
            ],/*
            "nodes": [
                {"name": "Commit 1", "color": "blue", "timestamp": 1508492354, "quality":""},
                {"name": "Commit 2", "color": "chocolate", "timestamp": 1508495954, "quality":""},
                {"name": "Commit 3", "color": "brown", "timestamp": 1508517554, "quality":""},
                {"name": "Commit 4", "color": "darkmagenta", "timestamp": 1508657954, "quality":""},
                {"name": "Commit 5", "color": "chocolate", "timestamp": 1508917154, "quality":""},
                {"name": "Commit 6", "color": "darkmagenta", "timestamp": 1509089954, "quality":""},
                {"name": "Commit 7", "color": "blue", "timestamp": 1509349154, "quality":""},
                {"name": "Commit 8", "color": "darkmagenta", "timestamp": 1509694754, "quality":""},
                {"name": "Commit 9", "color": "blue", "timestamp": 1509867554, "quality":""},
                {"name": "Commit 10", "color": "blue", "timestamp": 1510126754, "quality":""},
                {"name": "Commit 11", "color": "chocolate", "timestamp": 1510472354, "quality":""},
                {"name": "Commit 12", "color": "brown", "timestamp": 1510731554, "quality":""},
                {"name": "Commit 13", "color": "blue", "timestamp": 1510990754, "quality":""},
                {"name": "Commit 14", "color": "darkmagenta", "timestamp": 1511012354, "quality":""},
                {"name": "Commit 15", "color": "blue", "timestamp": 1511185154, "quality":""},
                {"name": "Commit 16", "color": "blue", "timestamp": 1511199554, "quality":""}
            ],*/
            "nodes": [
                {"name": "Commit 1", "color": "blue", "timestamp": 1, "quality":""},
                {"name": "Commit 2", "color": "chocolate", "timestamp": 2, "quality":""},
                {"name": "Commit 3", "color": "brown", "timestamp": 3 , "quality":""},
                {"name": "Commit 4", "color": "darkmagenta", "timestamp": 4, "quality":""},
                {"name": "Commit 5", "color": "chocolate", "timestamp": 5, "quality":""},
                {"name": "Commit 6", "color": "darkmagenta", "timestamp": 6, "quality":""},
                {"name": "Commit 7", "color": "blue", "timestamp": 7, "quality":""},
                {"name": "Commit 8", "color": "darkmagenta", "timestamp": 8, "quality":""},
                {"name": "Commit 9", "color": "blue", "timestamp": 9, "quality":""},
                {"name": "Commit 10", "color": "blue", "timestamp": 10, "quality":""},
                {"name": "Commit 11", "color": "chocolate", "timestamp": 11, "quality":""},
                {"name": "Commit 12", "color": "brown", "timestamp": 12, "quality":""},
                {"name": "Commit 13", "color": "blue", "timestamp": 13, "quality":""},
                {"name": "Commit 14", "color": "darkmagenta", "timestamp": 14, "quality":""},
                {"name": "Commit 15", "color": "blue", "timestamp": 15, "quality":""},
                {"name": "Commit 16", "color": "blue", "timestamp": 16, "quality":""}
            ],
            "files": [
                {"name": "file_1"},
                {"name": "file_2"},
                {"name": "file_3"},
                {"name": "file_4"},
                {"name": "file_5"},
                {"name": "file_6"}
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