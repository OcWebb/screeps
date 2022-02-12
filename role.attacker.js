var roleInvader = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
    	let flag = Game.flags["attack"];
        let enemy = creep.room.find(FIND_HOSTILE_CREEPS);    
        if (enemy.length)
        {
                creep.say('THREAT');
                target = creep.pos.findClosestByPath(enemy)
                if (creep.attack(target) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(target);
                }
        }
        else if (flag) 
        {
            if (creep.pos.roomName === flag.pos.roomName) 
            {
                let spawn = creep.room.find(FIND_HOSTILE_SPAWNS)[0];
                let outcome = creep.attack(spawn);
                if (creep.attack(spawn) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(spawn)
                } 
            }
            else
            {
                creep.moveTo(flag)
            }
        }
             
        if(!flag && enemy.length == 0)
        {
            if (Game.flags.idle)
            {
                creep.moveTo(Game.flags.idle)
            }
        }
    }
};
module.exports = roleInvader;