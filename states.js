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
 *  Build
 *  Repair
 **/

var states = {

    /** @param {Creep} creep **/
    "IDLE": (creep, context) =>
        {
            creep.say("Idle!");

            let flag = Game.flags["idle"];
            if (flag)
            {
                creep.moveTo (flag.pos, {visualizePathStyle: {stroke: '#ffffff'}, reusePath: 10});
            }
        },

    /** @param {Creep} creep **/
    "MOVE": (creep, context) =>
        {
            let {position, range=1} = context;

            let parsedPosition = common.unstringifyPos(position);
            if (!parsedPosition) { return; }
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
            let moveDestiation = source.pos;

            if (!containerMemory)
            {
                moveDestiation = common.unstringifyPos(containerMemory);
            }

            pushMoveState(creep, moveDestiation);
        }
    }, 

    /** @param {Creep} creep **/
    "FILL": (creep, context) =>
    {
        let {targetId, amount=0} = context;
        let targetToFill = Game.getObjectById (targetId);

        if (!targetToFill) { return; }
        
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
        
        if (creep.transfer (targetToFill, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
        {
            pushMoveState(creep, targetToFill.pos);
        }
    }, 

    /** @param {Creep} creep **/
    "COLLECT": (creep, context) =>
    {
        let {targetId, resourceType=RESOURCE_ENERGY} = context;
        let targetToCollect = Game.getObjectById (targetId);

        if (!targetToCollect) { return; }

        var droppedResource = targetToCollect.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: (r) => r.resourceType == resourceType && targetToCollect.pos.getRangeTo (r) < 3
        });

        // Pick up dropped resource
        if (droppedResource)
        {
            if (creep.pickup (droppedResource) == ERR_NOT_IN_RANGE)
            {
                pushMoveState(creep, droppedResource.pos);
                return;
            }
        }
        if (targetToCollect)
        {
            if (creep.withdraw (targetToCollect, resourceType) == ERR_NOT_IN_RANGE)
            {
                pushMoveState(creep, targetToCollect.pos)
                return;
            }
        }

        if (creep.isFull())
        {
            creep.popState();
        }
    }, 

    /** @param {Creep} creep **/
    "BUILD": (creep, context) =>
    {
        let {targetId} = context;
        let constructionSite = Game.getObjectById (targetId);
        if (!constructionSite) 
        { 
            creep.popState();
            return; 
        }
        
        common.log(targetId)
        common.log(creep.build(constructionSite))
        if(creep.build(constructionSite) == ERR_NOT_IN_RANGE)
        {
            pushMoveState(creep, constructionSite.pos);
        }
    }, 

    /** @param {Creep} creep **/
    "REPAIR": (creep, context) =>
    {
        let {targetId, targetHitpoints} = context;
        let targetToRepair = Game.getObjectById (targetId);

        if (!targetToRepair) 
        { 
            creep.popState();
            return; 
        }

        if(creep.repair(targetToRepair) == ERR_NOT_IN_RANGE)
        {
            let state = {
                name: "MOVE",
                context: {
                    position: common.stringifyPos(targetToRepair.pos)
                }
            }
            creep.pushState(state);
        }
    }, 
};

function pushMoveState(creep, position)
{ 
    let state = {
        name: "MOVE",
        context: {
            position: common.stringifyPos(position)
        }
    }
    creep.pushState(state);
}

module.exports = states;

