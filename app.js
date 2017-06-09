var path = require("path");

// Load in all dependancies
var express = require("express");
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var io = require('socket.io').listen(server);;

var db = require("./api/db/db.js");

var api = require("./api/api.js");

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Allows cross-origin requests to the api, mainly used for local development and can be removed
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, HEAD");
    next();
});

// Have all api calls under the /api/* path
app.use("/api", api.router);

// Default serve index.html when no path is required
app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Map everying in the public directory to be accessable
app.use(express.static("public"));

// Setup socket.io connections
io.on('connection', function (socket) {
    db.getBeacons(function(err, data) {

        socket.emit('tableupdate', data.rows);
    })

    db.getDevices(function(err, data) {

        socket.emit('deviceupdate', data.rows);
    })
});

// Trigger socket.io on database updates
api.onBeaconUpdate(function(beaconData) {
    io.emit('tableupdate', beaconData);
    db.getDevices(function(err, data) {

        socket.emit('deviceupdate', data.rows);
    })
})

api.onDeviceUpdate(function(deviceData) {
    io.emit('deviceupdate', deviceData);
})

// Pull port informatin from environment variables (or use defaults)
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

// Start the server
server.listen(port, ip, function(){
  console.log("Listening on " + ip + ":" + port)
});
