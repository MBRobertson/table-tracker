var express = require("express");
var api = express.Router();
var db = require("./db/db");

var updateHandler = null;;

api.get("/reset", function(req, res) {
    db.reset(function() {
        db.getBeacons(function(err, data) {
            onBeaconUpdate(data.rows);
        })
    })
    res.json({ success: true });
});

api.get("/beacons", function(req, res) {
    db.getBeacons(function(err, data) {
        res.json(data.rows);
    })
})

api.get("/enter/:identity/:beacon", function(req, res) {
    db.deviceEnter(req.params.identity, req.params.beacon, function(err, data)
    {
        onBeaconUpdate(data.rows);
    })
    res.json({ success: true });
})

api.get("/leave/:identity/:beacon", function(req, res) {
    db.deviceLeave(req.params.identity, req.params.beacon, function(err, data)
    {
        onBeaconUpdate(data.rows);
    })
    res.json({ success: true });
})

getBeaconInfo = function() {
    return beacons;
}

function onBeaconUpdate(beacons)
{
    if (updateHandler)
        updateHandler(beacons);
}

module.exports = {
    "router": api,
    "onBeaconUpdate": function(func) {
        updateHandler = func;
    }
};