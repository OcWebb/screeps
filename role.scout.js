var roleScout = {
    
    /** @param {Creep} creep **/
    run: function (creep) 
    {
        let maxExplorationDepth = 2;

        // Number of new rooms explored
        if (!creep.memory.depth)
        {
            creep.memory.depth = 0;
        }

        // Save the string of our home base
        if (!creep.memory.homeRoom)
        {
            creep.memory.homeRoom = creep.room.name;
        }

        // Save the string of our target room
        if (!creep.memory.targetRoom)
        {
            creep.memory.targetRoom = creep.room.name;
        }

        if (!creep.memory.path)
        {
            creep.memory.path = [];
        }



        let currentState = creep.getState();
        // creep.logState();
        
        switch (currentState.name) {
            case "IDLE":
                if (creep.memory.depth <= maxExplorationDepth)
                {
                    let nextRoomName = this.findNewRoom(creep);
                    creep.memory.targetRoom = nextRoomName;
                    this.pushMove(creep, '25-25', nextRoomName);
                } 
                else 
                {
                    if (creep.room.name != creep.memory.homeRoom)
                    {
                        creep.memory.targetRoom = creep.memory.homeRoom;
                        this.pushMove(creep, '25-25', creep.memory.homeRoom);
                    } else {
                        // we have returned home, start exploring again 
                        creep.memory.depth = 0;
                    }
                }
                break;
            
            case "MOVE":
                let currentTimestamp = Game.time;
                if (!Memory.map[creep.room.name] || 
                    (Memory.map[creep.room.name].timestamp - currentTimestamp) > 10)
                {
                    console.log("SCOUT: Storing room " + creep.room.name + " in Memory.map");
                    creep.memory.depth += 1;
                    this.addRoomToMemory (creep);
                }

                if (creep.memory.room == creep.memory.targetRoom)
                {
                    creep.popState();
                    break;
                }


                break;
        }

        creep.executeState();
    },

    pushMove (creep, position='25-25', roomName=creep.memory.homeRoom)
    {
        let state = {
            name: "MOVE",
            context: {
                position: position,
                roomName: roomName,
                range: 40,
            }
        };
        creep.pushState(state)
    },

    addRoomToMemory (creep)
    {
        Memory.map[creep.room.name] = {};
        let room = Game.rooms[creep.room.name];


        // only store these once
        if (!Memory.map[room.name].distance)
        {
            Memory.map[room.name].distance = Game.map.getRoomLinearDistance(creep.memory.homeRoom, room.name);
        }

        if (!Memory.map[room.name].status)
        {
            Memory.map[room.name].status = Game.map.getRoomStatus(room.name).status;
        }

        
        // store these every time we enter room

        Memory.map[room.name].timestamp = Game.time;

        if (room.controller)
        {
            Memory.map[room.name].owner = room.controller.owner;
            Memory.map[room.name].level = room.controller.level;
            Memory.occupiedRooms.push(room.name);
        }

        let hostilesInRoom = creep.room.find(FIND_HOSTILE_CREEPS);
        Memory.map[room.name].hostiles = hostilesInRoom.length > 0;

        let sources = Game.rooms[room.name].find(FIND_SOURCES);

        if (sources.length)
        {
            Memory.map[room.name].numberOfSources = sources.length;
            Memory.map[room.name].sourceIds = _.map(sources, 'id');
        }


    },

    managePath (creep)
    {
        if (creep.memory.path[0] == creep.room.name)
        {
            return;
        }

        creep.memory.path.unshift(creep.room.name);

        if (creep.memory.path.length > 3)
        {
            creep.memory.path.pop();
        }

    },

    findNewRoom (creep)
    {
        // prevent it from back tracking
        let exits = Game.map.describeExits(creep.room.name);

        if (!exits) {return}
        
        for (let idx in exits)
        {
            let room_name = exits[idx];

            if (!Memory.map[room_name])
            {
                return room_name;
            }
        }
        
        var room_arr = Object.keys(exits).map(function(key){
            return exits[key];
        });
        let idx = Math.floor(Math.random() * exits.length);

        let unexploredRooms = [];
        _.forEach(room_arr, (roomName) => 
        {
            if (creep.memory.path.contains(room_arr[idx]))
            {
                unexploredRooms.add(roomName);
            }
        })

        if (unexploredRooms.length)
        {
            return unexploredRooms[0];
        }

        let i = 4;
        while (creep.memory.path &&
                !Memory.map.occupiedRooms.contains(room_arr[idx]) && 
                i-- != 0)
        {
            exits.splice(idx, 1);
            idx = Math.floor(Math.random() * exits.length);
        }

        return room_arr[idx];
    }
};

module.exports = roleScout;