var socket = io.connect();

socket.on('update', function(data) {
    console.log(data);
    $('.beacon').remove();
    for (var b in data)
    {
        $('.beacon-list').append("<li class='beacon'><span class='id'>" + b + "</span><span class='used " + (data[b] ? "inuse" : "free") + "'><span class='indicator'></span>" + (data[b] ? "Phone Nearby" : "Nothing Nearby") + "<span></li>")
    }
    if ($('.beacon').length == 0)
    {
        $('.beacon-list').append("<li class='beacon no-beacons'>No beacons registered</li>")
    }
})