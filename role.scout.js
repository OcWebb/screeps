var roleScout = {
    
    /** @param {Creep} creep **/
    run: function (creep) 
    {
        // Number of new rooms explored
        if (creep.memory.depth == undefined)
        {
            creep.memory.depth = 0;
        }

        // Save the string of our home base
        if (creep.memory.homeRoom == undefined)
        {
            creep.memory.homeRoom = creep.room.name;
        }


        let currentState = creep.getState();
        // creep.logState();
        
        switch (currentState.name) {
            case "IDLE":
                    let state = {
                        name: "FILL",
                        context: {
                            targetId: this.getTargetIdToFill(creep)
                        }
                    };
                    creep.pushState(state)
                break;
        }

        creep.executeState();

        // Go back home
        if (creep.memory.mode == 'return')
        {
            if (creep.room.name != creep.memory.home_room)
            {
                this.goToRoom (creep, creep.memory.home_room);
            } else {
                // we are home, start again
                creep.memory.mode = 'exploring'
                creep.memory.depth = 0;
                creep.memory.target = '';
                delete(creep.memory.path);
                creep.memory.path = [];
            }
        } 
        // We are exploring
        else if (creep.memory.mode == 'exploring')
        {
            if (creep.memory.depth >= 2)
            {
                creep.memory.mode = 'return'
                return;
            }
            
            if (creep.memory.target)
            {
                // if we are in the target room
                if (creep.memory.target == creep.room.name)
                {
                    if (!Memory.map[creep.memory.target])
                    {
                        creep.memory.depth += 1;
                    }

                    this.addRoomToMemory (creep);
                    creep.memory.path.push (creep.room.name);
                    creep.memory.target = this.findNewRoom (creep);
                    
                } else {
                    this.goToRoom (creep, creep.memory.target);
                }
            } else {
                creep.memory.target = this.findNewRoom (creep);
            }
        }

    },

    goToRoom (creep, room_name)
    {
        creep.moveTo(new RoomPosition(25, 25, room_name), {visualizePathStyle: {stroke: '#02e8f4'}});
    },

    addRoomToMemory (creep)
    {
        Memory.map[creep.room.name] = {};
        let room = Game.rooms[creep.room.name];

        Memory.map[creep.room.name].distance = Game.map.getRoomLinearDistance(creep.memory.home_room, creep.room.name);
        Memory.map[creep.room.name].status = Game.map.getRoomStatus(room.name).status;

        if (room.controller)
        {
            Memory.map[creep.room.name].owner = room.controller.owner;
            Memory.map[creep.room.name].level = room.controller.level;
        }

        // add hostile count
        let room_creeps = creep.pos.lookFor(LOOK_CREEPS);
        let hostile_count = 0;
        if(room_creeps.length) 
        {
            for (let idx in room_creeps)
            {
                if (room_creeps[idx].getActiveBodyparts(ATTACK) > 0 || room_creeps[idx].getActiveBodyparts(RANGED_ATTACK) > 0)
                {
                    hostile_count++;
                }
            }
        }
        Memory.map[creep.room.name].hostiles = hostile_count;

    },

    findNewRoom (creep)
    {
        // prevent it from back tracking
        let exits = Game.map.describeExits(creep.room.name);
        let new_target = 'empty'
        for (let idx in exits)
        {
            let room_name = exits[idx];

            if (Memory.map[room_name] == undefined)
            {
                return room_name
            }
        }
        if (new_target == 'empty')
        {
            if (!exits) {return}
            var room_arr = Object.keys(exits).map(function(key){
                return exits[key];
            });
            let idx = Math.floor(Math.random() * room_arr.length);
            // do not backtrack
            let last_room = creep.memory.path[creep.memory.path.length - 2];
            while (room_arr[idx] == last_room)
            {
                idx = Math.floor(Math.random() * room_arr.length);
            }
            return room_arr[idx];
        }
        return -1
    }
};

module.exports = roleScout;