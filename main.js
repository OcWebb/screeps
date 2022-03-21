var RoomManager = require('RoomManager');
var RoomPlanner = require('RoomPlanner');
var LAYOUTS = require('Layouts');
const common = require('./common');
require('prototype.spawn');
require('prototype.creep');

module.exports.loop = function ()
{
    if(Game.cpu.bucket > 9000) 
    {
        Game.cpu.generatePixel();
    }

    let visualFlag = Game.flags["visual-3"];
    if (visualFlag)
    {
        common.showLayout (visualFlag.pos, "bunker", 2, visualFlag.room.name);
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

    let myRooms = [];
    for (let spawn_name in Game.spawns)
    {
        let spawn = Game.spawns[spawn_name];
        // Run spawning logic for each spawn
        spawn.run ();

        // Create a list of rooms which have my spawns, no repeats
        if (!myRooms[spawn]) 
        {
            myRooms.push (spawn.room);
        }
    }

    // Run the RoomManager for each room
    let cpu1 = Game.cpu.getUsed();
    for(const room in myRooms)
    {
        RoomManager.run(myRooms[room]);
        RoomPlanner.run(myRooms[room]);
    };
    let cpu2 = Game.cpu.getUsed();
    let elapsed = cpu2 - cpu1;
    // console.log("room planner + manager: " + elapsed.toFixed(2));

    let creepCPU = [];
    // Execute all creeps scripts
    for(const name in Game.creeps)
    {
        let cpu3 = Game.cpu.getUsed();
        Game.creeps[name].runRole();
        let cpu4 = Game.cpu.getUsed();
        
        let elapsed = cpu4 - cpu3;
        creepCPU.push({name:name, cpu:elapsed})
        // console.log("creep " + name + "'s CPU:     " + elapsed);
    };

    let sorted = _.sortBy(creepCPU, "cpu").reverse();

    for (let c in sorted)
    {
        // console.log(sorted[c]["cpu"]);
        // console.log(sorted[c]['name'] + ": " + sorted[c]["cpu"].toFixed(2))
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
    
    if (!Memory.stats)
    {
        Memory.stats = {};
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
        var creep_room = creep_memory.room;
        if (!Game.rooms[creep_room] || !Game.rooms[creep_room].memory)
        {
            continue;
        }

        Game.rooms[creep_room].memory.units[creep_memory.role] -= 1;

        if (creep_memory.source != undefined)
        {
            let source_memory = false;
            try {
                source_memory = Game.rooms[creep_room].memory.sources[creep_memory.source]
                console.log(source_memory);
            } catch (e) {
                console.log ("GARB: Memory not found for source '" + creep_memory.source + "'");
            }

            if (source_memory)
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
