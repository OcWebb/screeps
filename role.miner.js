let common = require('common');

var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        var room_level = creep.room.controller.level;

        if (!creep.memory.source) 
        {   
            creep.say("No Sources Open");
            return;
        }

        this.room_mem = Game.rooms[creep.room.name].memory;
        this.source_id = creep.memory.source;

        if(creep.memory.carrying && creep.carry.energy == 0)
        {
            creep.memory.carrying = false;
        }
        
        if(!creep.memory.carrying && creep.isFull ()) 
        {
	        creep.memory.carrying = true;
        }

        let currentState = creep.getState();
        // creep.logState();
        
        switch (currentState.name) {
            case "IDLE":
                let state = {
                    name: "HARVEST",
                    context: {
                        sourceId: this.source_id
                    }
                }
                creep.pushState(state)
                break;
            
            case "HARVEST":
                let transportAssigned = this.room_mem.sources[this.source_id].transporters > 0;

                // fill spawn ourselves if seeding room or no transporter assigned
                if ((room_level < 2 || !transportAssigned) && creep.isFull())
                {
                    // fill spawn until enough miners spawn
                    if (creep.room.memory.units.miner < Object.keys(creep.room.memory.sources).length)
                    {
                        var targets_to_fill = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_SPAWN &&
                                        structure.energyAvailable != structure.energyCapacity);
                            }
                        });
        
                        if (targets_to_fill) 
                        {
                            let state = {
                                name: "FILL",
                                context: {
                                    targetId: targets_to_fill[0].id,
                                    amount: 200
                                }
                            }
                            creep.pushState(state)
                            break;
                        }
                    }

                    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) 
                    {
                        let state = {
                            name: "MOVE",
                            context: {
                                position: common.stringifyPos(creep.room.controller.pos),
                                range: 1
                            }
                        }
                        creep.pushState(state)
                        break;
                    }
                }
                break;

            case "MOVE":
                break;
            
            case "FILL":
                break;

        }

        creep.executeState();
    },    
};

module.exports = roleMiner;