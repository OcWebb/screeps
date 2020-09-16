let common = require('common');

var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        var room_level = creep.room.controller.level;

        if (!creep.memory.source) 
        {   
            creep.say("No Sources Open");
        }
        this.room_mem = Game.rooms[creep.room.name].memory;
        this.source_id = creep.memory.source;
        let container = common.unstringifyPos (this.room_mem.sources[creep.memory.source].container);
        this.container_pos = new RoomPosition (container.x, container.y, creep.room.name);

        if(creep.memory.carrying && creep.carry.energy == 0)
        {
            creep.memory.carrying = false;
        }
        
        if(!creep.memory.carrying && creep.isFull ()) 
        {
	        creep.memory.carrying = true;
        }


        // under attack, hide in base
        if (creep.room.memory.operating_mode == "UNDER_ATTACK")
        {
            let center = creep.room.memory.layout.center;
            let pos = new RoomPosition (center.x, center.y, creep.room.name);
            creep.moveTo (pos, {visualizePathStyle: {stroke: '#ffffff'}});
            return;
        }

        // spawn startup
        if (room_level < 2)
        {
            if (creep.memory.carrying)
            {
                if (creep.room.memory.units.miner < Object.keys(creep.room.memory.sources).length)
                {
                    var targets_to_fill = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_SPAWN &&
                                    structure.energyAvailable != structure.energyCapacity);
                        }
                    });
                    if (!targets_to_fill) {return}
                    // Fill up spawn
                    if (creep.transfer (targets_to_fill[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
                    {
                        creep.moveTo (targets_to_fill[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) 
                    {
                        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            } else {
                this.moveToContainer (creep);
                creep.harvest (Game.getObjectById (this.source_id));
            }
            return;
        }

        // If theres no transporter assigned yet, fill spawn
        if (creep.memory.carrying && this.room_mem.sources[this.source_id].transporters == 0)
        {
            var targets_to_fill = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_SPAWN  ||
                            structure.structureType == STRUCTURE_EXTENSION) &&
                            structure.energyAvailable != structure.energyCapacity);
                }
                });

            if (creep.transfer (targets_to_fill[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo (targets_to_fill[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } 
        else
        {
            this.moveToContainer (creep);
            creep.harvest (Game.getObjectById (this.source_id));
        }
    },

    // Moves the miner on top of his container
    moveToContainer (creep)
    {
        if (creep.pos != this.container_pos)
        {
            creep.moveTo (this.container_pos, {visualizePathStyle: {stroke: '#ffffff'}, reusePath: 10});
        }
    },    
};

module.exports = roleMiner;