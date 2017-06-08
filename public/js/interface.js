// Variables to track positions for panning around the display
var mouse = { x: 0, y: 0 }
var position = { x: 0, y: 0 }
var scrolling = false;
var touch = null;
// Variables to keep track of the current state of the app
var menu = 1;
var state = 0;
var stateEvents = [];

// Enum style helpers to better check the state of the app
var MENUS = {
    MAIN: 1,
    RESERVE: 2,
    NEARBY: 3,
    MANAGE: 4,
    PLACE: 5,
    REMOVE: 6
}

var STATES = {
    NONE: 0,
    NEARBY: 5,
    RESERVING: 1,
    MANAGING: 2,
    PLACING: 3,
    REMOVING: 4
}

// Set the current state of the web app, will trigger any onStateChange events set
function setState(s) {
    if (state == s) return;
    state = s;
    stateEvents.forEach(function(func) {
        func(state);
    })
}

// Bind a function to be triggered on a state change
function onStateChange(func) {
    stateEvents.push(func);
}

// Prevents menu transitions in the middle of a transition
var menuDebounce = false;
// Set a specific menu to display (force overrides debounce)
function setMenu(menuID, force) {
    if (!force) force = false;
    if ((!menuDebounce || force) && (menu != menuID))
    {   
        // Get the DOM elements of the respective menus
        menuDebounce = true;
        var newMenu = $('#menu-' + menuID);
        var oldMenu = $('#menu-' + menu);
        menu = menuID;
        // Manipulate classes for a smooth CSS transition between the menus
        newMenu.removeClass('sub-menu-post');
        newMenu.addClass('sub-menu-pre');
        newMenu.addClass('animate');
        oldMenu.addClass('animate');
        newMenu.show();
        setTimeout(function() {
            newMenu.removeClass('sub-menu-pre');
            oldMenu.addClass('sub-menu-post');
            setTimeout(function() {
                newMenu.removeClass('animate');
                oldMenu.removeClass('animate');
                oldMenu.hide();
                oldMenu.removeClass('sub-menu-post');
                menuDebounce = false;
            }, 350);
        }, 100);
    }
}

// Center the camera on a specific point
function lookAt(x, y)
{
    // Don't force movement if the user is scrolling
    if (scrolling) return;
    // Set the current view to be centered on the given position
    var panel = $('#content-container');
    position.x = x + (panel.width()/2);
    position.y = y + (panel.height()/2);
    console.log(position.x + " - " + position.y);

    // Prevent other scrolling events from occuring
    scrolling = true;
    // Animate towards the position
    panel = $('.scroll');
    panel.addClass('animate-pan');
    setTimeout(function() {
        panel.css("left", position.x + "px");
        panel.css("top", position.y + "px");
        setTimeout(function() {
            panel.removeClass('animate-pan');
            scrolling = false;
        }, 310);
    }, 10);
    
}

// Small helper function to get a tables jQuery DOM object from the region id
function $tables(region) { return $('#' + region); }

// On document load, bind any button and mouse events
$(document).ready(function() {
    // Set the default menu to show on startup
    $('.sub-menu').hide().removeClass('animate');
    $('#menu-' + menu).show();
    var panel = $('.scroll');

    // The following allows panning of the interface
    panel.mousedown(function(e) {
        scrolling = true;
        mouse.x = e.pageX;
        mouse.y = e.pageY;
    });

    panel.mouseup(function(e) {
        scrolling = false;
    });

    $(document).mousemove(function(e) {
        if (scrolling)
        {
            position.x = position.x + (e.pageX - mouse.x);
            position.y = position.y + (e.pageY - mouse.y);

            panel.css("left", position.x + "px");
            panel.css("top", position.y + "px");

            mouse.x = e.pageX;
            mouse.y = e.pageY;

            e.preventDefault();
        }
    });

    // Panel drag events for touch devices
    panel.on('touchstart', function(e) {
        var touches = e.changedTouches;
        if (touches.length >= 1 && touch == null)
        {
            touch = touches[0];
            scrolling = true;
            mouse.x = touch.pageX;
            mouse.y = touch.pageY;
        }
    });

    panel.on('touchend', function(e) {
        var touches = e.changedTouches;
        if (touch != null)
        {
            for (var i = 0; i < touches.length; i++) {
                t = touches[i];
                if (t.identifier == touch.identifier)
                {
                    touch = null;
                    scrolling = false;
                }
            }
        }
    });

    $(document).on('touchmove', function(e) {
        var touches = e.changedTouches
        if (touch != null && scrolling)
        {
            for (var i = 0; i < touches.length; i++) {
                t = touches[i];
                if (t.identifier == touch.identifier)
                {
                    position.x = position.x + (t.pageX - mouse.x);
                    position.y = position.y + (t.pageY - mouse.y);

                    panel.css("left", position.x + "px");
                    panel.css("top", position.y + "px");

                    mouse.x = t.pageX;
                    mouse.y = t.pageY;

                    e.preventDefault();
                }
            }
        }
    });

    // The following click event will only trigger when in STATES.PLACING, will allow the placement of new tables
    var tableCount = 0;
    panel.click(function(e) {
        if (state == STATES.PLACING) {
            var x = event.pageX - panel.offset().left;
            var y = event.pageY - panel.offset().top;
            var region = prompt("Enter Region ID:")
            if (parseInt(region) != NaN)
            {
                tableCount++;
                Interface.addTable({region: region, x: x, y: y, state: 0});
                API.addTable("Table " + tableCount, region, x, y);
                setState(STATES.MANAGING);
            }
            else
            {
                alert("Please enter a valid region id!");
            }
        }
    });

    // Bind various buttons to click events 
    $("#reserve").click(function() { setState(STATES.RESERVING);});

    $('.cancel').click(function() { setState(STATES.NEARBY); });
    $('.cancel-store').click(function() { setState(STATES.MANAGING); });

    $("#addtable").click(function() { setState(STATES.PLACING) });
    $("#removetable").click(function() { setState(STATES.REMOVING) });

    $(".storelogin").click(function() { setState(STATES.MANAGING) });
    $("#storelogout").click(function() { 
        if (Devices.deviceNearTable(Devices.kioskID))
            setState(STATES.NEARBY);
        else
            setState(STATES.NONE) 
    });
})

// Temporary helper to fake user information
var Users = {
    fromDevice: function(device) {
        if (device.device == "2d8368086c1d35e7")
            return "Michael";
        else if (device.device == "1")
            return "DummyUser";
        else
            return device.device;
    }
}

// Grouped helper functions for managing tables on the display
var Tables = {
    curTables: [],
    // Reserve a given table
    reserveTable: function(region) {
        if (Devices.deviceNearTable(region) || region == Devices.kioskID) {
            alert("This table is taken");
            return;
        }
        $tables(region).addClass('table-reserved');
        API.setTableState(region, 1);
        setState(STATES.NEARBY);
        //  setTimeout(function() {
        //         API.setTableState(region, 0);
        //  }, 4000)
    },
    // Remove a table both from the interface and the server
    removeTable: function(table) {
        API.removeTable(parseInt(table.ID));
        $('#'+table.region).remove();
        $('.table').removeClass('table-glow');
        setState(STATES.MANAGING);
    }
}
// Listen for changes using websockets and trigger a redraw on a change
API.onTableUpdate(function(tables) {
    Tables.curTables = tables;
    Interface.redraw();
})

// Grouped helper functions for managing device information and their locations
var Devices = {
    // The id of the beacon for this display (will detect devices near the current display)
    kioskID: 1,
    // List of devices currently known
    curDevices: [],
    // Check if there are any devices near a table
    deviceNearTable: function(region) {
        for (var i = 0; i < Devices.curDevices.length; i++)
        {
            if (Devices.curDevices[i].beacon == region)
                return true;
        }
        return false;
    },
    // Get device information for those near the kiosk
    nearKiosk: function() {
        for (var i = 0; i < Devices.curDevices.length; i++)
        {
            if (Devices.curDevices[i].beacon == Devices.kioskID)
                return Devices.curDevices[i];
        }
    }
}
// Listen for changes using websockets and trigger a redraw on a change
API.onDeviceUpdate(function(d) {
    console.log(d);
    if (JSON.stringify(d) != JSON.stringify(Devices.curDevices))
    {
        Devices.curDevices = d;
        // Check if there are any devices near the kiosk
        if (Devices.deviceNearTable(Devices.kioskID) && state == STATES.NONE)
        {
            console.log("Nearby");
            setState(STATES.NEARBY);
            Interface.redraw();
        }
        else if (state == STATES.NEARBY)
        {
            console.log("Not nearby");
            setState(STATES.NONE);
            Interface.redraw();
        }
    }
})

// Control the display of tables
var Interface = {
    // Clear all tables from the display
    clear: function() { $('.table').remove(); },
    // Given a single table object, add it to the display
    addTable: function(table) {
        var obj = $("<li class='table' id='" + table.region + "' width='100px'></li>");
        obj.appendTo("#rightbody");
        obj.css({"left": (table.x - 50), "top": (table.y - 50)});
        if (table.region == Devices.kioskID)
            obj.addClass("table-kiosk");
        else if (Devices.deviceNearTable(table.region)) {
            obj.addClass('table-taken')
            if (table.state == 1) {
                API.setTableState(table.region, 0);
            }
        }
        else if (table.state == 1) {
            obj.addClass('table-reserved');
        }
        // Bind events for the table being clicked
        obj.click(function() { 
            // If in the reserving state allow reservations
            if(state == STATES.RESERVING)
                Tables.reserveTable(table.region); 
            if (state == STATES.REMOVING)
                Tables.removeTable(table);
        });
    },
    // Clear all tables and redraw them all
    redraw: function() {
        Interface.clear();
        Tables.curTables.forEach(function(table) {
            Interface.addTable(table);
        })
        if (Devices.deviceNearTable(Devices.kioskID))
        {
            $('.table-kiosk').append("<span class='kiosk-notify'>You are Here</span>");
        }

        if (state == STATES.RESERVING)
        {
            $('.table:not(.table-taken):not(.table-reserved):not(.table-kiosk)').addClass('table-glow');
        }
        if (state == STATES.REMOVING)
        {
            $('.table').addClass('table-glow');
        }
    }
}

// Highlight avaliable tables when entering the reserving state
onStateChange(function(state) {
    if (state == STATES.RESERVING)
    {
        setMenu(MENUS.RESERVE);
        $('.table:not(.table-taken):not(.table-reserved):not(.table-kiosk)').addClass('table-glow');
    }
    else
    {
        $('.table').removeClass('table-glow');
    }
})

// Display relevant menu when going to the store admin state
onStateChange(function(state) {
    if (state == STATES.MANAGING)
    {
        setMenu(MENUS.MANAGE);
    }
});

// Display relevant menus and change the cursor when placing tables
onStateChange(function(state) {
    if (state == STATES.PLACING)
    {
        setMenu(MENUS.PLACE);
        $("#rightbody").css({"cursor" : "url(img/tablecursor.png) 50 50, auto"});
    }
    else
    {
        $("#rightbody").css({"cursor" : "move"});
    }
});

// Highlight all tables that can be removed when in the remove state
onStateChange(function(state) {
    if (state == STATES.REMOVING)
    {
        setMenu(MENUS.REMOVE);
        $('.table').addClass('table-glow');
        
    }
});

// Reset the display on state change back to default
onStateChange(function(state) {
    if (state == STATES.NONE) {
        if (Devices.deviceNearTable(Devices.kioskID))
            setState(STATES.NEARBY);
        else
        {
            setMenu(MENUS.MAIN, true);
            $('.kiosk-notify').remove();
        }
    }
});

// Display user interface when a device is nearby
onStateChange(function(state) {
    if (state == STATES.NEARBY)
    {
        setMenu(MENUS.NEARBY, true);
        $('.name-holder').html(Users.fromDevice(Devices.nearKiosk()));
        $('.kiosk-notify').remove();
        $('.table-kiosk').append("<span class='kiosk-notify'>You are Here</span>");
    }
    else
    {
        // $('.kiosk-notify').remove();
    }
});