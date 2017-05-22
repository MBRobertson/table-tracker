var API_SERVER = "http://interact-comp241.rhcloud.com";
//var API_SERVER = "";
var socket = io.connect(API_SERVER);
var events = {
    onTableUpdate: [],
    onDeviceUpdate: []
}

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

var API = {
    'onTableUpdate': function(callback) {
        events.onTableUpdate.push(callback);
    },
    'onDeviceUpdate': function(callback) {
        events.onDeviceUpdate.push(callback);
    },
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
