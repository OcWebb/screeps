let common = require('common');

// Add target and Fill to memory;
var roleTransporter = 
{
    /** @param {Creep} creep **/
    run: function(creep) 
    {
        this.room_mem = Memory.rooms[creep.room.name];

        if(creep.memory.carrying && creep.carry.energy == 0)
        {
            creep.memory.carrying = false;
        }
        
        if(!creep.memory.carrying && creep.isFull()) 
        {
	        creep.memory.carrying = true;
        }

        if (!creep.memory.source_container)
        {
            let container_pos = common.unstringifyPos (this.room_mem.sources[creep.memory.source].container)
            const objAtPos = Game.rooms[creep.room.name].getPositionAt(container_pos.x, container_pos.y).lookFor(LOOK_STRUCTURES);
            if(objAtPos.length && objAtPos[0].structureType == STRUCTURE_CONTAINER)
            {
                creep.memory.source_container = objAtPos[0].id;
            }
        }

        if (!creep.memory.upgrade_container)
        {
            let container_pos = common.unstringifyPos (this.room_mem.layout.storage.upgrade_container)
            const objAtPos = Game.rooms[creep.room.name].getPositionAt(container_pos.x, container_pos.y).lookFor(LOOK_STRUCTURES);
            if(objAtPos.length && objAtPos[0].structureType == STRUCTURE_CONTAINER)
            {
                creep.memory.upgrade_container = objAtPos[0].id;
            }
        }

        if (!creep.memory.spawn)
        {
            var spawns = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN);
            }});
            creep.memory.spawn = spawns[0].id;
        }




        let currentState = creep.getState();
        // creep.logState();
        
        switch (currentState.name) {
            case "IDLE":

                if (creep.carry.energy == 0)
                {
                    if (creep.memory.source_container)
                    {
                        let container = Game.getObjectById (creep.memory.source_container);
                        let state = {
                            name: "COLLECT",
                            context: {
                                targetId: container.id
                            }
                        };
                        creep.pushState(state)
                    } 
                    else if (creep.memory.source)
                    {
                        let state = {
                            name: "COLLECT",
                            context: {
                                targetId: creep.memory.source
                            }
                        };
                        creep.pushState(state)
                    }
                    
                } else {
                    let state = {
                        name: "FILL",
                        context: {
                            targetId: this.getTargetIdToFill(creep)
                        }
                    };
                    creep.pushState(state)
                }
                break;
            
            case "COLLECT":
                // all else fails wait by source
                let source = Game.getObjectById (creep.memory.source)
                if (!creep.pos.inRangeTo(source, 3))
                {
                    let state = {
                        name: "MOVE",
                        context: {
                            position: common.stringifyPos(source.pos),
                            range: 3
                        }
                    };
                    creep.pushState(state)
                    break;
                }


                break;

            case "MOVE":
                break;
            
            case "FILL":
                break;

        }

        creep.executeState();


        
    //     // under attack
    //     if (creep.room.memory.operating_mode == "UNDER_ATTACK")
    //     {
    //         var storage_vat = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    //         filter: (structure) => {
    //             return (structure.structureType == STRUCTURE_STORAGE &&
    //                     structure.store[RESOURCE_ENERGY] != structure.store.getCapacity(RESOURCE_ENERGY));
    //         }
    //         });
    //         if (storage_vat)
    //         {
    //             return storage_vat;
    //         } 
            
    //         var tower = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    //         filter: (structure) => {
    //             return (structure.structureType == STRUCTURE_TOWER &&
    //                     structure.store[RESOURCE_ENERGY] <= structure.store.getCapacity(RESOURCE_ENERGY) * fill_amount);
    //         }
    //         });
            
    //         if (tower && storage_vat)
    //         {
    //             // fill target
    //             if (creep.transfer (newTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
    //             {
    //                 creep.moveTo (newTarget, {visualizePathStyle: {stroke: '#ffffff'}});
    //             }
    //         }
        
    //         // let center = creep.room.memory.layout.center;
    //         // let pos = new RoomPosition (center.x, center.y, creep.room.name);
    //         // creep.moveTo (pos, {visualizePathStyle: {stroke: '#ffffff'}});
    //         // return;
    //     }


    //     // If empty
    //     if(!creep.memory.carrying)
    //     {
    //         // Make sure source is assigned in memory
    //         if (!creep.memory.source)
    //         {
    //             return;
    //         }
            
    //         this.gatherEnergy (creep);
    //     //If full
    //     }else{
    //         let newTarget = this.getTargetToFill (creep);
    //         if (newTarget != 'none') 
    //         {
    //             // fill target
    //             if (creep.transfer (newTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
    //             {
    //                 creep.moveTo (newTarget, {visualizePathStyle: {stroke: '#ffffff'}});
    //             }
    //         } 
            
    //     }
    },

    getTargetIdToFill (creep)
    {
        /*  Priority:
        *  (1) Spawn
        *  (2) Extensions
        *  (3) Upgrade container
        *  (4) Stockpile
        */

        let fill_amount = .6;

        //If the spawn is not full
        var spawn = Game.getObjectById (creep.memory.spawn)
        if (spawn && spawn.store[RESOURCE_ENERGY] != spawn.store.getCapacity(RESOURCE_ENERGY))
        {
            return spawn.id;
        } 

        //If there are non-full extensions
        var extension = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION &&
                        structure.store[RESOURCE_ENERGY] != structure.store.getCapacity(RESOURCE_ENERGY));
            }
        });
        if (extension)
        {
            return extension.id;
        } 

        //If the upgrade container is not full
        if (creep.memory.upgrade_container)
        {
            let upgrade_container = Game.getObjectById (creep.memory.upgrade_container);
            if (upgrade_container.store[RESOURCE_ENERGY] <= upgrade_container.store.getCapacity(RESOURCE_ENERGY) * fill_amount)
            {
                return upgrade_container.id
            }
        }

        // towers
        var tower = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_TOWER &&
                        structure.store[RESOURCE_ENERGY] <= structure.store.getCapacity(RESOURCE_ENERGY) * fill_amount);
            }
        });
        if (tower)
        {
            return tower.id;
        }

        // long term storage
        // any container within the blueprint should be long term storage.
        // loop through containers.  check if placed. use if placed

        let center = creep.room.memory.layout.center;
        let storages = common.getLayout (creep.room.memory.layout.name, 4, STRUCTURE_CONTAINER, center);
        
        for (let idx in storages)
        {
            const cont = storages[idx];
            let pos = new RoomPosition (cont.x, cont.y, creep.room.name);
            let ret = creep.room.lookForAt(LOOK_STRUCTURES, pos);

            if (ret.length)
            {
                for (let j in ret)
                {
                    if (ret[j].store[RESOURCE_ENERGY] < ret[j].storeCapacity)
                    {
                        //console.log(JSON.stringify(ret[j]))
                        return ret[j].id
                    }
                }
                
            }
        }
        
        //If there are non-full extensions
        var storage_vat = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE &&
                        structure.store[RESOURCE_ENERGY] != structure.store.getCapacity(RESOURCE_ENERGY));
            }
        });
        if (storage_vat)
        {
            return storage_vat.id;
        } 
        
        return 'none'
    },
};

module.exports = roleTransporter;