var roleColonySeed = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        if (!Game.flags['claim']) 
        {   
            creep.say("No 'claim' flag found");
            return;
        }

        let flag = Game.flags["claim"];

        // Enter the flags room
        if (creep.room != flag.room)
        {
            creep.moveTo(flag);
            return
        }
        
        // Claim the controller
        if(creep.room.controller) {
            if (creep.room.controller.my)
            {
                Game.rooms[creep.room.name].createConstructionSite(flag.pos.x, flag.pos.y, STRUCTURE_SPAWN);
            } else {
                if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
        }
    },  
};

module.exports = roleColonySeed;