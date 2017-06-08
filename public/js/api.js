var API_SERVER = "http://interact-comp241.rhcloud.com/";

var socket = io.connect(API_SERVER);

var events = {
    onTableUpdate: [],
    onDeviceUpdate: []
}

// Listen for socket.io updates from the server
socket.on('tableupdate', function(data) {
    events.onTableUpdate.forEach(function(func) {
        func(data);
    })
});

socket.on('deviceupdate', function(data) {
    events.onDeviceUpdate.forEach(function(func) {
        func(data);
    })
});

// A object containing all abtracted api calls to the server
var API = {
    // Allows binding and event to socket.io updates
    'onTableUpdate': function(callback) {
        events.onTableUpdate.push(callback);
    },
    'onDeviceUpdate': function(callback) {
        events.onDeviceUpdate.push(callback);
    },
    // Adds a table to the server list
    'addTable': function (name, region, x, y, callback) {
        $.ajax({
            url: API_SERVER + '/api/beacons',
            type: 'PUT',
            data: {
                name: name,
                region: parseInt(region),
                x: parseInt(x),
                y: parseInt(y)
            }
        }).done(function (res) {
            if (callback)
                callback (res);
        }).fail(function(err) {
            console.error(err);
        });
    },
    // Removes a table from the server
    'removeTable': function(id, callback) {
        $.ajax({
            url: API_SERVER + '/api/beacons',
            type: 'DELETE',
            data: {
                id: id
            }
        }).done(function(res) {
            if (callback)
                callback(res);
        }).fail(function(err) {
            console.error(err);
        });
    },
    // Gets a JSON list of all the tables
    'getTables': function(callback) {
        $.ajax({
            url: API_SERVER + '/api/beacons',
            type: 'GET'
        }).done(function(res) {
            if (callback)
                callback(res);
        }).fail(function(err) {
            console.error(err);
        });
    },
    // Set a table state (eg. free, reserved)
    'setTableState': function(id, state, callback) {
        $.ajax({
            url: API_SERVER + '/api/beacons',
            type: 'POST',
            data: {
                id: id,
                state: state
            }
        }).done(function(res) {
            if (callback)
                callback(res);
        }).fail(function(err) {
            console.error(err);
        });
    },
    // Get a list of all devices that are next to beacons
    'getDevices': function(callback) {
        $.ajax({
            url: API_SERVER + '/api/devices',
            type: 'GET'
        }).done(function(res) {
            if (callback)
                callback(res);
        }).fail(function(err) {
            console.error(err);
        });
    }
}

