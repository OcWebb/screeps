var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep)
    {
        // ADD CONTAINER BEHIND
        var containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER &&
                                structure.store[RESOURCE_ENERGY] > 0);
                    }
            });
        var spawn1 = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN);
                    }
            });

        if(creep.carry.energy == 0 || creep.room.memory.haltOperations)
        {
            creep.memory.upgrading = false;
            //creep.say('🔄 harvest');
	    }
        if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity && !creep.room.memory.haltOperations)
        {
	        creep.memory.upgrading = true;
	        //creep.say('⚡ upgrade');
	    }
        

        // under attack, hide in base
        if (creep.room.memory.operating_mode == "UNDER_ATTACK")
        {
            let center = creep.room.memory.layout.center;
            let pos = new RoomPosition (center.x, center.y, creep.room.name);
            creep.moveTo (pos, {visualizePathStyle: {stroke: '#ffffff'}});
            return;
        }

        if(creep.memory.upgrading)
        {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}, reusePath: 10});
            }
        } else {
            if (creep.room.memory.haltOperations)
            {
                creep.moveTo(spawn1[0].pos.x - 3, spawn1[0].pos.y, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 10});
            } else {
                if (containers.length)
                {
                    let container = creep.pos.findClosestByPath (containers);
                    if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 10});
                    }
                }
                else if(spawn1[0].energy > 100)
                {
                    if(creep.withdraw(spawn1[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(spawn1[0], {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 10});
                    }

                } else {
                    var sources = creep.room.find(FIND_SOURCES);
                    if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 10});
                    }
                }
            }
        }
	}
};

module.exports = roleUpgrader;
