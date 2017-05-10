var db = require("./db_interface");

db.query("SELECT * FROM beacons", [], function(err, res) {
    if (err)
    {
        return console.error("error running query", err);
    }

    //console.log("Successfully made query", res);
})

module.exports.getBeacons = function(callback) {
    db.query("SELECT * FROM beacons", [], callback);
    console.log("Getting beacons");
}

module.exports.getDevices = function(callback) {
    db.query("SELECT * FROM devices", [], callback);
}

module.exports.deviceEnter = function(device, beacon, callback) {
    db.query("DELETE FROM devices WHERE device=$1::text", [device], function() {
        db.query("INSERT INTO devices(beacon, device, time) VALUES ($1, $2::text, $3)", [beacon, device, new Date()], function(err) {
            if (err)
                console.error("Error: ", err);
            module.exports.getBeacons(callback);
        });
    });
}

module.exports.deviceLeave = function(device, beacon, callback) {
    db.query("DELETE FROM devices WHERE beacon=$1 AND device=$2::text", [beacon, device], function() {
        module.exports.getBeacons(callback);
    });
}