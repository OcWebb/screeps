let common = require('common');

// Add target and Fill to memory;
var roleTransporter = 
{
    /** @param {Creep} creep **/
    run: function(creep) 
    {
        this.room_mem = Memory.rooms[creep.room.name];

        if (!creep.memory.spawn)
        {
            var spawns = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN);
            }});
            creep.memory.spawn = spawns[0].id;
        }




        let currentState = creep.getState();
        
        if (!currentState) { return; }
        
        switch (currentState.name) {
            case "IDLE":

                if (creep.carry.energy == 0)
                {
                    let collectTarget = this.getTargetToCollect(creep);
                    console.log("base manager collect target: " + JSON.stringify(collectTarget));
                    if (collectTarget)
                    {
                        let state = {
                            name: "COLLECT",
                            context: {
                                targetId: collectTarget
                            }
                        };
                        creep.pushState(state)
                        break;
                    }
                } else {
                    let fillTarget = this.getTargetIdToFill(creep);
                    if (fillTarget)
                    {
                        let state = {
                            name: "FILL",
                            context: {
                                targetId: fillTarget
                            }
                        };
                        creep.pushState(state)
                        break;
                    }
                }
                console.log(!currentState.context && !currentState.context.position);
                console.log(common.stringifyPos(creep.room.memory.layout.center));
                console.log(currentState.context.position);

                
                if (!currentState.context || 
                    !currentState.context.position)
                {
                    creep.popState();
                    let state = {
                        name: "IDLE",
                        context: {
                            position: common.stringifyPos(creep.room.memory.layout.center)
                        }
                    };
                    creep.pushState(state)
                }
                
                break;

        }

        creep.executeState();
    },

    getTargetIdToFill (creep)
    {
        /*  Priority:
        *  (1) Spawn
        *  (2) Extensions
        *  (3) Upgrade container
        *  (4) Stockpile
        */

        let fill_amount = .75;

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

            if (!ret.length)
            {
                continue;
            }

            for (let j in ret)
            {
                if (ret[j].store[RESOURCE_ENERGY] < ret[j].storeCapacity)
                {
                    return ret[j].id
                }
            }
                
        }
        
        return null;
    },

    /** @param {Creep} creep **/
    getTargetToCollect: function(creep)
    {
        /*  Priority:
        *  (1) Stockpile
        *  (2) Containers
        */

        var storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE &&
                        structure.store[RESOURCE_ENERGY] > 0);
            }
        });
        if (storage)
        {
            return storage.id;
        }

        let center = creep.room.memory.layout.center;
        let containerLocations = common.getLayout (creep.room.memory.layout.name, 4, STRUCTURE_CONTAINER, center);
        
        for (let idx in containerLocations)
        {
            const point = containerLocations[idx];
            let pos = new RoomPosition (point.x, point.y, creep.room.name);
            let containers = creep.room.lookForAt(LOOK_STRUCTURES, pos);

            if (!containers.length)
            {
                continue;
            }

            for (let idx in containers)
            {
                if (containers[idx].store[RESOURCE_ENERGY] < containers[idx].storeCapacity)
                {
                    return containers[idx].id
                }
            }
                
        }
        
        return null;
    }
};

module.exports = roleTransporter;