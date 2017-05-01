var express = require("express");
var api = express.Router();

var beacons = {};

api.get("/reset", function(req, res) {
    beacons = {};
    res.json({ success: true });
})

api.get("/enter/:beacon", function(req, res) {
    if (req.params.beacon)
    {
        beacons[req.params.beacon] = true;
        res.json({ success: true });
    }
    else
        res.json({ success: false, error: "Missing beacon parameter" });
})

api.get("/leave/:beacon", function(req, res) {
    if (req.params.beacon)
    {
        beacons[req.params.beacon] = false;
        res.json({ success: true });
    }
    else
        res.json({ success: false, error: "Missing beacon parameter" });
})

getBeaconInfo = function() {
    return beacons;
}

module.exports = {
    "router": api,
    "getBeaconInfo": getBeaconInfo
};