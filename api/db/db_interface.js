const pg = require('pg');

// PostgreSQL database configuration, should generally be pulled from environment variables
var config = {
  user: process.env.OPENSHIFT_POSTGRESQL_DB_USERNAME || 'admin',
  database: 'interact',
  password: process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD || 'doorframe',
  host: process.env.OPENSHIFT_POSTGRESQL_DB_HOST || "192.168.56.20",
  port: process.env.OPENSHIFT_POSTGRESQL_DB_PORT || 5432,
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

// Create a new pool of database clients that can make requests
const pool = new pg.Pool(config);

// Log any database errors
pool.on('error', function(err, client) {
    console.error("idle client error", err.message, err.stack);
})

// Expose the query function to all other files
module.exports.query = function(text, values, callback) {
    return pool.query(text, values, callback);
}

module.exports.connect = function(callback) {
    return pool.connect(callback);
}




























// function deviceEnter(device, beacon, onUpdate)
// {
//     getBeacon(beacon, function(obj) {
//         //console.log(obj);
//         if (obj.devices.indexOf(device) == -1)
//         {
//             obj.devices.push(device);
//             db.update({beacon: beacon}, obj).then(onUpdate);
//         }
//     });
// }

// function deviceLeave(device, beacon, onUpdate)
// {
//     getBeacon(beacon, function(obj) {
//         var index = obj.devices.indexOf(device)
//         if (index != -1)
//         {
//             obj.devices.splice(index, 1);;
//             db.update({beacon: beacon}, obj).then(onUpdate);
//         }
//     });
// }

// function reset(callback)
// {
//     db.remove({}).then(callback);
// }

// function getBeacon(beacon, callback)
// {
//     db.findOne({ beacon: beacon}).then(function(d)
//     {
//         if (d)
//         {
//             callback(d);
//         }
//         else
//         {
//             console.log("making ")
//             db.insert({ beacon: beacon, devices: []}).then(
//                 function(data) { callback(data); }
//             )
//         }
//     })
// }

// function getBeacons(callback)
// {
//     db.find({}).then(callback);
// }


// module.exports = {
//     "deviceEnter": deviceEnter,
//     "deviceLeave": deviceLeave,
//     "reset": reset,
//     "getBeacons": getBeacons
// }