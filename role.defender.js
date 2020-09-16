var common = require('common');

var roleDefender = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        if (!creep.memory.task)
        {
            creep.memory.task = "idle";
        }

        if (!creep.memory.target)
        {
            creep.memory.target = "";
        }

        this.manageState (creep);
        this.executeTask (creep);
    },

    manageState (creep)
    {
        //  STATES  defend_entry, attack_hostiles, defend_unit, defend_pos, idle
        // to check if a rooms center is closed try setting ramparts impossible and path out

        let room_status = Game.rooms[creep.memory.room].memory.operating_mode;
        if(creep.memory.task != "attack_hostiles" && room_status == "UNDER_ATTACK")
        {
            creep.memory.task = "attack_hostiles";
            return;
        }
    },

    /** @param {Creep} creep **/
    executeTask (creep)
    {
        let task = creep.memory.task;
        let room = Game.rooms[creep.memory.room];
        let hostiles;

        switch (task)
        {
            case "defend_entry":
                hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
                if (hostiles.length)
                {
                    let center = room.memory.layout.center;
                    let entries = common.getLayout (room.memory.layout.name, 4, STRUCTURE_RAMPART, center);
                    let room_pos = new RoomPosition(center.x, center.y, room.name);
                    let hostile = room_pos.findClosestByPath (hostiles);
                    common.log(center.x, center.y);
                    
                    if (entries) 
                    {
                        let room_pos_entries = [];
                        for (let idx in entries)
                        {
                            const entry = entries[idx];
                            room_pos_entries.push (new RoomPosition (entry.x, entry.y, room.name));
                        }

                        let rampart = hostile.pos.findClosestByPath (room_pos_entries);
                        creep.moveTo (rampart);
                    }
                    creep.ranged_attack (hostile);
                }
                break;

            case "attack_hostiles":
                hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
                if (hostiles.length)
                {
                    // target closest and kite
                    let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                        filter: function(object) {
                            return object.getActiveBodyparts(ATTACK) != 0 || object.getActiveBodyparts(RANGED_ATTACK) != 0;
                        }
                    });

                    if (creep.rangedAttack (target) == ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(target);
                        //break;
                    } 

                    if (creep.pos.inRangeTo (target, 3))
                    {
                        let path = PathFinder.search(creep.pos, {pos:target.pos,range:3},{flee:true}).path
                        creep.moveByPath (path);
                        break;
                    }

                } else {
                    creep.memory.task = 'idle'
                }
                break;

            case "idle":
                let flag = Game.flags['idle'];
                if (flag)
                {
                    creep.moveTo (flag);
                }

            default:
                //console.log(creep.name + " - Task not found");
        }

    },

    canKill (my_creep, hostile)
    {

    }

};
module.exports = roleDefender;