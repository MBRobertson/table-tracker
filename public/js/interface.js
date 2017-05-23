var mouse = { x: 0, y: 0 }
var position = { x: 0, y: 0 }
var scrolling = false;
var menu = 1;
var state = 0;
var stateEvents = [];

var MENUS = {
    MAIN: 1,
    RESERVE: 2,
    MANAGE: 4,
    PLACE: 5,
    REMOVE: 6
}

var STATES = {
    NONE: 0,
    RESERVING: 1,
    MANAGING: 2,
    PLACING: 3,
    REMOVING: 4
}

function setState(s) {
    state = s;
    stateEvents.forEach(function(func) {
        func(state);
    })
}

function onStateChange(func) {
    stateEvents.push(func);
}

var menuDebounce = false;
function setMenu(menuID) {
    if (!menuDebounce)
    {   
        menuDebounce = true;
        var newMenu = $('#menu-' + menuID);
        var oldMenu = $('#menu-' + menu);
        menu = menuID;
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

function $tables(region) { return $('#' + region); }

$(document).ready(function() {
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

    $("#reserve").click(function() {    
        setState(STATES.RESERVING);      
    });

    $('.cancel').click(function() { setState(STATES.NONE); });
    $('.cancel-store').click(function() { setState(STATES.MANAGING); });

    $("#addtable").click(function() { setState(STATES.PLACING) });
    $("#removetable").click(function() { setState(STATES.REMOVING) });

    $("#storelogin").click(function() { setState(STATES.MANAGING) });
    $("#storelogout").click(function() { setState(STATES.NONE) });
})

var Tables = {
    curTables: [],
    // Reserve a given table
    reserveTable: function(region) {
        if (Devices.deviceNearTable(region)) {
            alert("This table is taken");
            return;
        }
        $tables(region).addClass('table-reserved');
        API.setTableState(region, 1);
        setState(STATES.NONE);
        // setTimeout(function() {
        //     reservetimout(elemID);
        // }, 4000)
    },
    removeTable: function(table) {
        API.removeTable(parseInt(table.ID));
        $('#'+table.region).remove();
        $('.table').removeClass('table-glow');
        setState(STATES.MANAGING);
    }
}
API.onTableUpdate(function(tables) {
    Tables.curTables = tables;
    Interface.redraw();
})

var Devices = {
    curDevices: [],
    deviceNearTable: function(region) {
        for (var i = 0; i < Devices.curDevices.length; i++)
        {
            if (Devices.curDevices[i].beacon == region)
                return true;
        }
        return false;
    }
}
API.onDeviceUpdate(function(devices) {
    Devices.curDevices = devices;
    Interface.redraw();
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
        if (Devices.deviceNearTable(table.region)) {
            obj.addClass('table-taken')
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
    }
}

// Handle menus on state changes
onStateChange(function(state) {
    if (state == STATES.NONE) {
        setMenu(MENUS.MAIN);
    }
});

onStateChange(function(state) {
    if (state == STATES.RESERVING)
    {
        setMenu(MENUS.RESERVE);
        $('.table:not(.table-taken):not(.table-reserved)').addClass('table-glow');
    }
    else
    {
        $('.table').removeClass('table-glow');
    }
})

onStateChange(function(state) {
    if (state == STATES.MANAGING)
    {
        setMenu(MENUS.MANAGE);
    }
});

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

onStateChange(function(state) {
    if (state == STATES.REMOVING)
    {
        setMenu(MENUS.REMOVE);
        $('.table').addClass('table-glow');
        
    }
});