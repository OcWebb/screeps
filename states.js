let common = require('common');

/**
 * States
 * 
 *  Idle
 *  Move
 *  Harvest
 *  Gather
 *  Fill
 *  Attack
 *  Defend
 **/

var states = {

    /** @param {Creep} creep **/
    "IDLE": (creep, context) =>
        {
            creep.say("Idle!");

            let flag = Game.flags["idle"];
            if (flag)
            {
                creep.moveTo(flag)
            }
        },

    /** @param {Creep} creep **/
    "MOVE": (creep, context) =>
        {
            let {position, range=1} = context;

            let parsedPosition = common.unstringifyPos(position);
            // add room to pos string?
            let roomPosition = new RoomPosition (parsedPosition.x, parsedPosition.y, creep.room.name);
            
            if (!creep.pos.inRangeTo(roomPosition, range))
            {
                creep.moveTo (roomPosition, {visualizePathStyle: {stroke: '#ffffff'}, reusePath: 10});
            } else {
                creep.popState();
            }
        }, 

    /** @param {Creep} creep **/
    "HARVEST": (creep, context) =>
    {
        let {sourceId} = context;
        let source = Game.getObjectById (sourceId);

        if (!source) { return; }
        
        if (creep.pos.inRangeTo(source.pos, 1))
        {
            creep.harvest (source);
        } else {
            let containerMemory = creep.room.memory.sources[sourceId].container;
            let moveDestiation = common.stringifyPos(source.pos);

            if (containerMemory != "")
            {
                moveDestiation = containerMemory;
            }

            let state = {
                name: "MOVE",
                context: {
                    position: moveDestiation,
                    range: 0
                }
            }
            creep.pushState(state);
        }
    }, 

    /** @param {Creep} creep **/
    "FILL": (creep, context) =>
    {
        let {targetId, amount=0} = context;
        let targetToFill = Game.getObjectById (targetId);
        
        if (creep.carry.energy == 0 || !targetToFill)
        {
            creep.popState();
            return;
        }
        
        if (targetToFill.store[RESOURCE_ENERGY] == targetToFill.store.getCapacity(RESOURCE_ENERGY))
        {
            creep.popState();
            return;
        }
        
        if (creep.pos.inRangeTo(targetToFill.pos, 1))
        {
            creep.transfer (targetToFill, RESOURCE_ENERGY);
        } else {
            let state = {
                name: "MOVE",
                context: {
                    position: common.stringifyPos(targetToFill.pos)
                }
            }
            creep.pushState(state);
        }
    }, 

    /** @param {Creep} creep **/
    "COLLECT": (creep, context) =>
    {
        // let {pickupPosition} = context;
        // let parsedPickupPosition = common.unstringifyPos(targetToFill.pos);
        
        if (creep.isFull())
        {
            creep.popState();
        }
    }, 
};

module.exports = states;

