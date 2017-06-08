var express = require("express");
var api = express.Router();
var db = require("./db/db");

var tableUpdateHandler = null;
var deviceUpdateHandler = null;

// Allow cross origin requests, used for local development and not needed
api.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, HEAD");
    next();
});

// DEBUG: when a requuest to this path is made, remove all tracked devces
api.get("/reset", function(req, res) {
    db.reset(function(err, data) {
        // Communicate any changes to the client
        onDeviceUpdate(data.rows);
    })
    res.json({ success: true }); // For this demo success is just assumed, it should properly reflect actual success when properly implemented
});

// GET request returns a JSON list of all the tables
api.get("/beacons", function(req, res) {
    db.getBeacons(function(err, data) {
        if (err)
            res.json({ success: false });
        else
            res.json(data.rows);
    })
})

// Inserts a table into the database
api.put('/beacons', function(req, res) {
    var name =  req.body.name, 
        region = req.body.region, 
        x = parseInt(req.body.x), 
        y = parseInt(req.body.y);
    console.log(name, region, x, y);
    if (name  && region && x && y)
    {
        // Push changes to the database and push changes to the client
        db.addBeacon(name, region, x, y, function(err, data) {
            if (err)
                console.error("Error :", err);
            else
                onBeaconUpdate(data.rows);
        })
    }
    res.json({success: true});
})

// Modifys a beacons state
api.post("/beacons", function(req, res) {
    var id = req.body.id;
    var state = req.body.state;
    if (id && state)
    {
        // Push changes to the database and push changes to the client
        db.setBeaconState(id, state, function(err, data) {
            if (err)
                console.error("Error :", err);
            onBeaconUpdate(data.rows);  
        });
    }
    res.json({ success: true });
})

// Delete a tables from the database
api.delete("/beacons", function(req, res) {
    var id = req.body.id;
    if (id)
    {
        // Push changes to the database and push changes to the client
        db.deleteBeacon(id, function(err, data) {
            if (err)
                console.error("Error :", err);
            onBeaconUpdate(data.rows);  
        });
    }
    res.json({ success: true });
})

// Get a JSON list of all devices near a table
api.get("/devices", function(req, res) {
    db.getDevices(function(err, data) {
        if (err)
            res.json({ success: false });
        else
            res.json(data.rows);
    })
})

// Used by the mobile app to register that it has entered the range of a beacon
api.get("/enter/:identity/:beacon", function(req, res) {
    // Push changes to the database and push changes to the client
    db.deviceEnter(req.params.identity, req.params.beacon, function(err, data)
    {
        if (err)
            console.error("Error: ", err)
        else
            onDeviceUpdate(data.rows);
    })
    res.json({ success: true });
})

// Used by the mobile app to register that it has left a region
api.get("/leave/:identity/:beacon", function(req, res) {
    // Push changes to the database and push changes to the client
    db.deviceLeave(req.params.identity, req.params.beacon, function(err, data)
    {
        if (err)
            console.error("Error: ", err);
        else
            onDeviceUpdate(data.rows);
    })
    res.json({ success: true });
})

// Allows other files in the app to access the beacons list
getBeaconInfo = function() {
    return beacons;
}

// Use event triggering functions
function onBeaconUpdate(beacons)
{
    if (tableUpdateHandler)
        tableUpdateHandler(beacons);
}

function onDeviceUpdate(devices)
{
    if (deviceUpdateHandler)
        deviceUpdateHandler(devices);
}


// Expose certain functions to other files
module.exports = {
    "router": api,
    "onBeaconUpdate": function(func) {
        tableUpdateHandler = func;
    },
    "onDeviceUpdate": function(func) {
        deviceUpdateHandler = func;
    }
};