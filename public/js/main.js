var socket = io.connect();

var beacons = null;
var devices = null;

socket.on('update', function(data) {
    beacons = data;
    redraw();
})

socket.on('deviceupdate', function(data) {
    devices = data;
    redraw();
})

scale=25;

function redraw() {
    if (beacons && devices)
    {
        $('.beacon-list').empty();
        beacons.forEach(function(table) {
            $('.beacon-list').append(`<li id='` + table.region + `' class='table' style='left: ` + (table.x * scale - 50) + `px; top: ` + (table.y * scale - 50) + `px;'>
            
            </li>`)
        }, this);
        devices.forEach(function(device) {
            $('#' + device.beacon).addClass('claimed');
        })
    }
}