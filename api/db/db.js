var localdb = require("node-localdb");
var db = localdb("database.json");

function deviceEnter(device, beacon, onUpdate)
{
    getBeacon(beacon, function(obj) {
        //console.log(obj);
        if (obj.devices.indexOf(device) == -1)
        {
            obj.devices.push(device);
            db.update({beacon: beacon}, obj).then(onUpdate);
        }
    });
}

function deviceLeave(device, beacon, onUpdate)
{
    getBeacon(beacon, function(obj) {
        var index = obj.devices.indexOf(device)
        if (index != -1)
        {
            obj.devices.splice(index, 1);;
            db.update({beacon: beacon}, obj).then(onUpdate);
        }
    });
}

function getBeacon(beacon, callback)
{
    db.findOne({ beacon: beacon}).then(function(d)
    {
        if (d)
        {
            callback(d);
        }
        else
        {
            console.log("making ")
            db.insert({ beacon: beacon, devices: []}).then(
                function(data) { callback(data); }
            )
        }
    })
}

function getBeacons(callback)
{
    db.find({}).then(callback);
}


module.exports = {
    "deviceEnter": deviceEnter,
    "deviceLeave": deviceLeave,
    "getBeacons": getBeacons
}