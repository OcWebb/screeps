var BODYPART_COST = { move: 50, work: 100, attack: 80, carry: 50, heal: 250, ranged_attack: 150, tough: 10, claim: 600 };
var ratios = 
{
    upgrader: {"move": 1, "carry": 2, "work": 1},
    builder: {"work": 2, "carry": 1, "move": 1},
    transporter: {"move": 1, "carry": 2},
    miner: {"work": 2, "move": 1, "carry": 1},
    colony_seed: {"claim": 1, "move": 1},
    attacker: {"attack": 1, "move": 1},
    defender: {"ranged_attack": 1, "move": 1, "tough": 1},
    scout: {'move': 1}
};


StructureSpawn.prototype.run = 
function ()
{
    if (this.spawning)
    {
        // Display some text about whos spawning
        var spawningCreep = Game.creeps[this.spawning.name];
        this.room.visual.text(
            spawningCreep.memory.role,
            this.pos.x,
            this.pos.y - 2,
            {align: 'left', opacity: 0.8});
        return;
    }
    else
    {
        let role = this.room.memory.nextSpawn;

        if (!role) {return;}

        //  get the cost of the creep to be spawned
        var cost = this.creepCost (this.creepFromRatio (12, ratios[role]));
        if (this.room.energyAvailable >=  cost && cost != 0)
        {   
            var creepParts;
            if (role == "miner")
            {
                creepParts = this.creepFromRatio (9, ratios[role]);
            } else if (role == 'scout') {
                creepParts = ['move']
            } else {
                creepParts = this.creepFromRatio (12, ratios[role]);
            }
            
            let num = Game.time;
            let name = this.room.name + "-" + role + '.' + num;
            let response = this.spawnCreep (creepParts, name, { memory: {role: role, room: this.room.name} });
            if (response == OK)
            {
                this.room.memory.units[role]++;
                this.room.memory.nextSpawn = '';
                console.log ("SPAWN: Creep \'" + name + "\' created");
            }
        }
    }
}


StructureSpawn.prototype.creepFromRatio = 
    function (maxBodyParts, parts)
    {
        //Should not return 0
        var body = [];
        var ratioCost = 0;
        for(var bodyPart in parts)
        {
            for(var i = 0; i < parts[bodyPart]; i++)
            {
                ratioCost += BODYPART_COST[bodyPart];
            }
        }
        
        //With our ratio cost, we now figure out the maximum amount of the ratio we can make. We     
        //test three things, whether we run into the maximum energy for the room, the maximum 
        //bodyparts allowed, or the specified bodypart limit we put into the options
        var maxUnits = Math.min(
            Math.floor(this.room.energyAvailable / ratioCost),
            Math.floor((maxBodyParts || 50) / _.sum(parts)),
            Math.floor(maxBodyParts / _.sum(parts))
        );
        
        //Now we know how many of each bodypart we will make, we cycle through the order given to 
        //create the body
        for(var bodyPart in parts)
        {
            for(var i = 0; i < maxUnits * parts[bodyPart]; i++)
            {
                body.push(bodyPart);
            }
        }
        return body;
    }


StructureSpawn.prototype.creepCost = 
    function (partArray)
    {
        var cost = 0;
        for(var bodyPart in partArray)
        {
            cost += BODYPART_COST[partArray[bodyPart]];
        }
        return cost;
    }
