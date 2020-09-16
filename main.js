var RoomManager = require('RoomManager');
var RoomPlanner = require('RoomPlanner');
var LAYOUTS = require('Layouts');
require('prototype.spawn');
require('prototype.creep');

module.exports.loop = function ()
{

    if(Game.cpu.bucket > 9000) {
        Game.cpu.generatePixel();
    }

    if (Memory.newGame)
    {
        Memory = {}
        Memory.creeps = {};
        Memory.rooms = {};
        Memory.newGame = false;
    }
    initMemory ();
    garbageCollection ();

    drawMapInfo ();

    let my_rooms = [];
    for (let spawn_name in Game.spawns)
    {
        let spawn = Game.spawns[spawn_name];
        // Run spawning logic for each spawn
        spawn.run ();

        // Create a list of rooms which have my spawns, no repeats
        if (!my_rooms[spawn]) 
        {
            my_rooms.push (spawn.room);
        }
    }

    // Run the RoomManager for each room
    my_rooms.forEach(function (room){
        RoomManager.run(room);
        RoomPlanner.run(room);
    });
    // Execute all creeps scripts
    for(var name in Game.creeps)
    {
        Game.creeps[name].runRole ();
    }
}

function initMemory ()
{
    
    if (!Memory.map)
    {
        Memory.map = {};
    }

    if (!Memory.layouts)
    {
        Memory.layouts = {};
    }

    let layout_names = Object.keys(LAYOUTS);

    for (let idx in layout_names)
    {
        let name = layout_names[idx];
        if (!Memory.layouts[name])
        {
            Memory.layouts[name] = LAYOUTS[name];
        }
    }
}

function drawMapInfo ()
{
    for (let room in Memory.map)
    {
        Game.map.visual.text (room, new RoomPosition(2, 1, room), {align: 'left', opacity: 0.8, fontSize: 4}); 
        let i = 2;
        for (let j in Memory.map[room]) 
        {
            //console.log(j)
            i+= 3.5
            let text = Memory.map[room][j];
            if (j == 'owner')
            {
                text = Memory.map[room][j]['username'];
            }
            Game.map.visual.text(j + ': ' + text, new RoomPosition(2, i, room), {align: 'left', opacity: 0.8, fontSize: 4});
        }
    }
}

function garbageCollection ()
{
    // For every creep in memory
    for(var name in Memory.creeps)
    {
        // If the creep is alive, return
        if(Game.creeps[name])
        {
            continue;
        }

        var creep_memory = Memory.creeps[name];
        if (!Game.rooms[creep_memory.room] || !Game.rooms[creep_memory.room].memory)
        {
            continue;
        }

        Game.rooms[creep_memory.room].memory.units[creep_memory.role] -= 1;

        if (creep_memory.source != undefined)
        {
            let source_memory = false;
            try {
                source_memory = Game.rooms[creep_memory.room].memory.sources[creep_memory.source]
                console.log(source_memory);
            } catch (e) {
                console.log ("GARB: Memory not found for source '" + creep_memory.source + "'");
            }

            if (source_memory != false)
            {
                if (creep_memory.role == 'miner')
                {
                    source_memory.miners -= 1;
                }
                else if (creep_memory.role == 'transporter')
                {
                    source_memory.transporters -= 1;
                }
            }
        }
        
        delete Memory.creeps[name];
    }
}
