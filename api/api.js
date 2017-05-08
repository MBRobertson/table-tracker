var express = require("express");
var api = express.Router();
var db = require("./db/db.js");

var updateHandler = null;;

api.get("/reset", function(req, res) {
    beacons = {};
    res.json({ success: true });

    onBeaconUpdate(beacons);
})

api.get("/enter/:identity/:beacon", function(req, res) {
    db.deviceEnter(req.params.identity, req.params.beacon, function(data)
    {
        onBeaconUpdate(data);
    })
    res.json({ success: true });
})

api.get("/leave/:identity/:beacon", function(req, res) {
    db.deviceLeave(req.params.identity, req.params.beacon, function(data)
    {
        onBeaconUpdate(data);
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