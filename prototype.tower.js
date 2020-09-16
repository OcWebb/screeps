StructureTower.prototype.defend_room =
    function () {
        var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target != undefined) {
            this.attack(target);
        }
    };

StructureTower.prototype.heal_units =
    function () {
        var lowest_unit = this.pos.findClosestByRange(FIND_MY_CREEPS);
        if (lowest_unit != undefined) {
            this.heal(lowest_unit);
        }
    };

StructureTower.prototype.repair_structures =
    function () {
        var containers = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER &&
                structure.hits < structure.hitsMax * .60);
            }
        });
        var roads = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_ROAD &&
                structure.hits < structure.hitsMax * .60);
            }
        });
        var walls = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_WALL && structure.hits < 80000);
            }
        });
        var ramparts = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_RAMPART && structure.hits < 80000);
            }
        });
        
        var low_ramparts = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_RAMPART && structure.hits < 10000);
            }
        });

        walls.concat (ramparts);
        
        if (low_ramparts.length)
        {
            let low_rampart = _.min(low_ramparts, function(o) { return o.hits; });
            if(this.repair(low_rampart) == ERR_NOT_IN_RANGE)
            {
                this.repair(low_rampart);
            }
        }
        else if (containers.length)
        {
            let loweset_container = _.min(containers, function(o) { return o.hits; });
            if(this.repair(loweset_container) == ERR_NOT_IN_RANGE)
            {
                this.repair(loweset_container);
            }
        }
        // Else if there are roads
        else if (roads.length)
        {
            var lowest_Road = _.min(roads, function(o) { return o.hits; });
            if(this.repair(lowest_Road) == ERR_NOT_IN_RANGE)
            {
                this.repair(lowest_Road);
            }
        }
        else if (walls.length != 0)
        {
            let loweset_wall = _.min(walls, function(o) { return o.hits; });
            if(this.repair(loweset_wall) == ERR_NOT_IN_RANGE)
            {
                this.repair(loweset_wall);
            }
        }
    };