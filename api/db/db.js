var db = require("./db_interface");

//Expose a series of methods to abstract useing the database

// Reset deleted all entries in the device table for debug purposes.
module.exports.reset = function(callback) {
    db.query("DELETE FROM devices WHERE TRUE", [], function(err) {
        if (err)
            console.error("Error: ", err);
        module.exports.getDevices(callback);
    })
}

// Gets all the entries in the beacon table
module.exports.getBeacons = function(callback) {
    db.query("SELECT * FROM beacons", [], callback);
}
// Gets all entries in the devices table
module.exports.getDevices = function(callback) {
    db.query("SELECT * FROM devices", [], callback);
}

// Tracks a device intering the range of a beacon
module.exports.deviceEnter = function(device, beacon, callback) {
    db.query("INSERT INTO devices(beacon, device, time) VALUES ($1, $2::text, $3)", [beacon, device, new Date()], function(err) {
        if (err)
            console.error("Error: ", err);
        module.exports.getDevices(callback);
    });
}

// Adds a table to the database
module.exports.addBeacon = function(name, region, x, y, callback) {
    db.query("INSERT INTO beacons(name, region, x, y, state) VALUES ($1::text, $2, $3::int, $4::int, 0)", [name, region, x, y], function(err) {
        if (err)
            console.error("Error: ", err);
        module.exports.getBeacons(callback);
    })
}

// Removes table from the database by id
module.exports.deleteBeacon = function(id, callback) {
    db.query("DELETE FROM beacons WHERE \"ID\"=$1::int", [id], function(err, data) {
        if (err)
            console.error("Error: ", err);
        module.exports.getBeacons(callback);
    })
}

// Tracks a device leaving the range of a specific beacon
module.exports.deviceLeave = function(device, beacon, callback) {
    db.query("DELETE FROM devices WHERE beacon=$1 AND device=$2::text", [beacon, device], function() {
        module.exports.getDevices(callback);
    });
}

// Sets the state column of a beacon entry, in this case beaconId represents the region rather than the id of the row
module.exports.setBeaconState = function(beaconID, state, callback) {
    db.query("UPDATE beacons SET state=$1::int WHERE \"region\"=$2::int", [state, beaconID], function(err, data) {
        if (err)
            console.error("Error: ", err);
        module.exports.getBeacons(callback);
    });
};