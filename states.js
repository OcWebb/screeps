let common = require('common');

/**
 * States
 * 
 *  Idle
 *  Move
 *  Harvest
 *  Fill
 *  Attack
 *  Defend
 **/

var states = {

    /** @param {Creep} creep **/
    "IDLE": (creep, scope) =>
        {
            creep.say("Idle!");

            let flag = Game.flags["idle"];
            if (flag)
            {
                creep.moveTo(flag)
            }
        },

    /** @param {Creep} creep **/
    "MOVE": (creep, scope) =>
        {
            let {position} = scope;

            let parsedPosition = common.unstringifyPos(position);
            // add room to pos string?
            let roomPosition = new RoomPosition (parsedPosition.x, parsedPosition.y, creep.room.name);
            
            if (!creep.pos.inRangeTo(roomPosition, 1))
            {
                creep.moveTo (roomPosition, {visualizePathStyle: {stroke: '#ffffff'}, reusePath: 10});
            }
        }, 

    /** @param {Creep} creep **/
    "HARVEST": (creep, scope) =>
    {
        let {stringSourceId} = scope;
        let source = Game.getObjectById (this.source_id);
        
        if (source && creep.pos.inRangeTo(source.pos, 1))
        {
            creep.harvest (source)
        }
    }, 
};

module.exports = states;

