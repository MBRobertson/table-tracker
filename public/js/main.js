var socket = io.connect();

socket.on('update', function(data) {
    console.log(data);
    $('.beacon').remove();
    for (var b in data)
    {
        var usage = "wait";
        var text = "WIP";
        // if (data[b] == 0)
        // {
        //     usage = "wait";
        //     text = "Phone Nearby";
        // }
        // if (data[b].devices.length >= 1)
        // {
        //     usage = "";
        //     text = data[b].devices.join() + " Nearby";
        // }
        $('.beacon-list').append("<li class='beacon " + data[b].region + "'><span class='id'>" + data[b].name + "</span><span class='used " + usage + "'><span class='indicator'></span>" + text + "<span></li>")
    }
    if ($('.beacon').length == 0)
    {
        $('.beacon-list').append("<li class='beacon no-beacons'>No beacons registered</li>")
    }
})

socket.on('deviceupdate', function(data) {
    data.forEach(function(device) {
        $('.' + device.beacon).append("<p>" + device.device + "</p>");
    }, this);
})