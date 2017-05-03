var express = require("express");
var api = express.Router();

var beacons = {};
var updateHandler = null;;

api.get("/reset", function(req, res) {
    beacons = {};
    res.json({ success: true });

    onBeaconUpdate(beacons);
})

api.get("/enter/:beacon", function(req, res) {
    if (req.params.beacon)
    {
        for (var beacon in beacons)
        {
            beacons[beacon] = 0;
        }
        beacons[req.params.beacon] = 1;
        res.json({ success: true });
    }
    else
        res.json({ success: false, error: "Missing beacon parameter" });
    
    onBeaconUpdate(beacons);
})

api.get("/leave/:beacon", function(req, res) {
    if (req.params.beacon)
    {
        beacons[req.params.beacon] = -1;
        res.json({ success: true });
    }
    else
        res.json({ success: false, error: "Missing beacon parameter" });
    
    onBeaconUpdate(beacons);
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
    "getBeaconInfo": getBeaconInfo,
    "onBeaconUpdate": function(func) {
        updateHandler = func;
    }
};