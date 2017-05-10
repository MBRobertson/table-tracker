var path = require("path");

var express = require("express");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var db = require("./api/db/db.js");

var api = require("./api/api.js");

app.use("/api", api.router);

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "client", "index.html"));
});

app.use(express.static("public"));

io.on('connection', function (socket) {
    db.getBeacons(function(err, data) {

        socket.emit('update', data.rows);
    })

    db.getDevices(function(err, data) {

        socket.emit('deviceupdate', data.rows);
    })
    
    // socket.on('my other event', function (data) {
    //       console.log(data);
    // });
});

api.onBeaconUpdate(function(beaconData) {
    io.emit('update', beaconData);

    db.getDevices(function(err, data) {

        io.emit('deviceupdate', data.rows);
    })
})

var port = process.env.OPENSHIFT_NODEJS_PORT || 3000
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

server.listen(port, ip, function(){
  console.log("Listening on " + ip + ":" + port)
});
