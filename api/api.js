var express = require("express");
var api = express.Router();
var db = require("./db/db");

var updateHandler = null;

api.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods: *");
    next();
});

api.get("/reset", function(req, res) {
    db.reset(function(err, data) {
        onBeaconUpdate(data.rows);
    })
    res.json({ success: true });
});

api.get("/beacons", function(req, res) {
    db.getBeacons(function(err, data) {
        if (err)
            res.json({ success: false });
        else
            res.json(data.rows);
    })
})

api.put('/beacons', function(req, res) {
    var name =  req.body.name, 
        region = req.body.region, 
        x = parseInt(req.body.x), 
        y = parseInt(req.body.y);
    console.log(name, region, x, y);
    if (name  && region && x && y)
    {
        console.log("Putting");
        db.addBeacon(name, region, x, y, function(err, data) {
            if (err)
                console.error("Error :", err);
            else
                onBeaconUpdate(data.rows);
        })
    }
    res.json({success: true});
})

api.delete("/beacons", function(req, res) {
    var id = req.body.id;
    if (id)
    {
        db.deleteBeacon(id, function(err, data) {
            if (err)
                console.error("Error :", err);
            onBeaconUpdate(data.rows);  
        });
    }
    res.json({ success: true });
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