var path = require("path");

var express = require("express");
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);

var db = require("./api/db/db.js");

var api = require("./api/api.js");

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

api.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, HEAD");
    next();
});

app.use("/api", api.router);

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(express.static("public"));

io.on('connection', function (socket) {
    db.getBeacons(function(err, data) {

        socket.emit('tableupdate', data.rows);
    })

    db.getDevices(function(err, data) {

        socket.emit('deviceupdate', data.rows);
    })
});

api.onBeaconUpdate(function(beaconData) {
    io.emit('tableupdate', beaconData);
})

api.onDeviceUpdate(function(deviceData) {
    io.emit('deviceupdate', deviceData);
})

var port = process.env.OPENSHIFT_NODEJS_PORT || 3000
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

server.listen(port, ip, function(){
  console.log("Listening on " + ip + ":" + port)
});
