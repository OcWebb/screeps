let common = require('common');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep)
    {
        if (!creep.memory.target)
        {
            for (let prio in creep.room.memory.construction)
            {
                let build_arr = creep.room.memory.construction[prio];
                if (!build_arr || !build_arr.length){continue}
                creep.memory.target = build_arr[0];
                return;
            }
        }


        if(creep.memory.building && creep.carry.energy == 0 || (!creep.memory.target || creep.memory.target == ''))
        {
            creep.memory.building = false;
        }

        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity && creep.memory.target && creep.memory.target != '')
        {
            creep.memory.building = true;
        }

        if(creep.memory.repairing && creep.carry.energy == 0 || creep.memory.building)
        {
            creep.memory.repairing = false;
        }

        if (!creep.memory.repairing && creep.carry.energy == creep.carryCapacity && !creep.memory.building)
        {
            creep.memory.repairing = true;
        }

        // under attack, repair walls
        if (creep.room.memory.operating_mode == "UNDER_ATTACK")
        {
            let center = creep.room.memory.layout.center;
            let pos = new RoomPosition (center.x, center.y, creep.room.name);
            creep.moveTo (pos, {visualizePathStyle: {stroke: '#ffffff'}});
            return;
        }

        //If building
        if(creep.memory.building)
        {
            // add target from mem
            if (creep.memory.target)
            {
                let prio = creep.memory.target.slice (0,2);
                let str_pos = creep.memory.target.slice (4);
                let encoding = creep.memory.target.slice (2,4);
                let type = common.decodeStructure (encoding);
                let target_pos = common.unstringifyPos (str_pos);

                const room_pos = new RoomPosition(target_pos.x, target_pos.y, creep.room.name);
                let ret = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, room_pos);

                // no sites found, delete pos from construct memory and reset target
                if (!ret.length)
                {
                    let create = creep.room.createConstructionSite(target_pos.x, target_pos.y, type);
                    if (create == OK) 
                    {
                        return;
                    }
                    creep.room.memory.construction[prio].shift();
                    delete creep.memory.target;
                // site found, build
                } else {
                    let site = ret[0];
                    if(creep.build(site) == ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(site, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
        }
        //If repairing
        else if (creep.memory.repairing)
        {
            /*  Priority:
             *  (1) Ramparts
             *  (2) Containers
             *  (3) Roads
             *  (4) Walls
             */
             
             //dump energy and then check for new min
             

            var ramparts = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_RAMPART &&
                            structure.hits < structure.hitsMax * .50 &&
                            structure.hits < 50000);
                }
            });
            
            var low_ramparts = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_RAMPART &&
                            structure.hits < structure.hitsMax * .50 &&
                            structure.hits < 1000);
                }
            });
            
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER &&
                    structure.hits < structure.hitsMax * .60);
                }
            });
            var roads = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_ROAD &&
                    structure.hits < structure.hitsMax * .60);
                }
            });
            var walls = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_WALL &&
                    structure.hits < structure.hitsMax * .60 &&
                    structure.hits < 50000);
                }
            });

            //If there are ramparts to repair
            if (low_ramparts.length != 0)
            {
                var closestRampart = creep.pos.findClosestByPath(low_ramparts);
                if(creep.repair(closestRampart) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(closestRampart, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                return;
            }
            // else if there are containers
            else if (containers.length)
            {
                var closestContainer = creep.pos.findClosestByPath(containers);
                if(creep.repair(closestContainer) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(closestContainer, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            // Else if there are roads
            else if (roads.length)
            {
                var closestRoad = creep.pos.findClosestByPath(roads);
                if(creep.repair(closestRoad) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(closestRoad, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if (ramparts.length != 0)
            {
                var closestRampart = creep.pos.findClosestByPath(ramparts);
                if(creep.repair(closestRampart) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(closestRampart, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            //Else walls
            else if(walls.length)
            {
                //  Find lowest health target
                /*
                var min = walls[0];
                var minIndex = 0;
                for (var i = 1; i < walls.length; i++)
                {
                    if (walls[i].hits < min)
                    {
                        min = walls[i].hits;
                        minIndex = i;
                    }
                }*/
                var closestWall = creep.pos.findClosestByPath(walls);
                if(creep.repair(closestWall) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(closestWall, {visualizePathStyle: {stroke: '#ffffaa'}});
                }
            } else {
                creep.memory.repairing = false;
            }
            
        }
        //If not building or repairing
        else if (!creep.memory.building && !creep.memory.repairing && !creep.room.memory.haltOperations)
        {
	        let goodContainers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER &&
                            structure.store[RESOURCE_ENERGY] > 200);
                }
            });

            let resource = creep.pos.findClosestByPath (FIND_DROPPED_RESOURCES);
            if (goodContainers.length != 0)
            {
                var newContainer = creep.pos.findClosestByPath(goodContainers);
                if(creep.withdraw(newContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(newContainer, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 10});
                }
            }// Pick up dropped energy
            else if (resource)
            {
                if (creep.pickup (resource) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo (resource);
                }
            } 
            else
            {
                var sourceObj = creep.room.find(FIND_SOURCES_ACTIVE);
    
                if(creep.harvest (sourceObj[0]) == ERR_NOT_IN_RANGE) 
                {
                    creep.moveTo ((sourceObj[0]), {visualizePathStyle: {stroke: '#ffaa00'}});
                    
                }
            }
	    }
    },
      
    manageState (creep)
    {
        //  STATES  gather_energy, repair, build, 

        let room_status = Game.rooms[creep.memory.room].memory.operating_mode;

        // If we are under attack, repair the attack point
        if(creep.memory.task != "repair" && room_status == "UNDER_ATTACK")
        {
            creep.memory.task = "repair";
            return;
        }

        if(creep.memory.task != "build")
        {
            creep.memory.task = "repair";
            return;
        }
    },
};

module.exports = roleBuilder;
