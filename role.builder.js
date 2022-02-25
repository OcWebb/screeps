let common = require('common');

let withdrawlableStructures = [ STRUCTURE_CONTAINER, STRUCTURE_STORAGE ];

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep)
    {
        // if (!creep.memory.target && creep.room.memory.construction.length)
        // {
        //     creep.memory.target = creep.room.memory.construction[0];
        // }

        // let t = creep.room.find(FIND_STRUCTURES, {
        //     filter: (structure) => {
        //         return (structure.hits < structure.hitsMax * .20 &&
        //                 structure.hits < 500);
        //     }
        // });


        let currentState = creep.getState();
        
        switch (currentState.name) {
            case "IDLE":
                let nextInBuildQueue = this.getTargetToBuild(creep)

                if (nextInBuildQueue) 
                {
                    let state = {
                        name: "BUILD",
                        context: {
                            targetId: nextInBuildQueue.id
                        }
                    }
                    creep.pushState(state);
                }
                break;

            case "BUILD":
                
                if (creep.carry.energy == 0)
                {
                    let targetToCollect = this.getTargetToCollect(creep);
                    
                    if (targetToCollect)
                    {
                        let state = {
                            name: "COLLECT",
                            context: {
                                targetId: targetToCollect.id,
                            }
                        }
                        creep.pushState(state);
                        break;
                    }
                }
                break;
            
            case "REPAIR":
                break;

        }

        creep.executeState();
    },


    // returns a construction site or faLse
    /** @param {Creep} creep **/
    getTargetToBuild: function(creep)
    {
        let roomConstructionQueue = creep.room.memory.construction;

        if (roomConstructionQueue && roomConstructionQueue.length > 0)
        {
            let stringBuildTarget = roomConstructionQueue[0];
            let {type: type, position: targetPosition} = common.decodeStrutureTypeAndPosition(stringBuildTarget);

            const roomPos = new RoomPosition(targetPosition.x, targetPosition.y, creep.room.name);
            let constructionSites = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, roomPos);
            
            // no sites found, delete pos from construct memory and reset target
            if (constructionSites.length == 0)
            {
                if (creep.room.createConstructionSite(targetPosition.x, targetPosition.y, type) == OK)
                {
                    return constructionSites[0];
                } else {
                    creep.room.memory.construction.shift();
                    return false;
                }
            } 

            return constructionSites[0];
        }
    },

    
    /** @param {Creep} creep **/
    getTargetToCollect: function(creep)
    {
        let storageStructure = creep.pos.findClosestByPath (FIND_STRUCTURES, {
                filter: (structure) => {
                    return (withdrawlableStructures.includes(structure.structureType) &&
                            structure.store[RESOURCE_ENERGY] > 0)
                }});

        return storageStructure;
    }

};

module.exports = roleBuilder;
