var express = require("express");
var app = express();

var api = require("./api/api.js");

app.use("/api", api.router);

app.get("/", function(req, res) {
    res.send(api.getBeaconInfo());
})

app.use(express.static("public"));

var port = process.env.OPENSHIFT_NODEJS_PORT || 3000
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

app.listen(port, ip, function(){
  console.log("Listening on " + ip + ":" + port)
});
