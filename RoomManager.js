var UNIT_TYPES = ['transporter', 'miner', 'harvester', 'attacker', 'upgrader', 'builder', 'ranged_attacker', 'colony_seed', 'scout', 'defender'];

var common = require('common');
require('prototype.tower');

var OPERATING_MODES = 
{
    'SEED_ROOM': 
        {
            'miner': 'TBD'
        },
    'NORMAL_OPERATION': 
        {
            'miner': 'TBD',
            'transporter': 'TBD',
            'defender': 1,
            'scout': 0,
            'builder': 3,
            'upgrader': 2
        },
    'UNDER_ATTACK': 
        {
            'defender': 3,
            'builder': 3,
        },
};

/*  
    TODO:
        - create more strategys
            - under attack
            - energy low & need miners/transp?
            
        * find a way to only check the vaules of the rooms pop on change of Operation status
*/
 

var RoomManager =
{
    /** @param {Room} room **/
    run: function (room)
    {
        this.initMemory (room);

        this.manageOperationalMode ();
        this.manageSpawnQueue ();
        this.assignTransporters ();
        this.assignMiners (room);

        this.manageTowers (room);
        
        if (this.memory.units.miners < Object.keys(this.memory.sources).length)
        {
            this.memory.haltOperations = true;
        } else {
            this.memory.haltOperations = false;
        }
        
        this.scoreBoard (room);
        this.flushMemory (room);
    },


    initMemory (room)
    {
        this.room_name = room.name;
        this.level = room.controller.level;
        
        // Memory for rooms
        if (!Memory.rooms)
        {
            Memory.rooms = {};
        }

        if (!Memory.rooms[room.name])
        {
            Memory.rooms[room.name] = {};
            console.log('MEM:   Created memory for room \'' + this.room_name + '\'');
        }

        this.memory = Memory.rooms[room.name];
        
        // Unit memory
        if (!this.memory.units) 
        {
            this.memory.units = {};
        }

        for (let idx in UNIT_TYPES) 
        {
            let role = UNIT_TYPES[idx];
            if (this.memory.units[role] == undefined)
            {
                var creepsInRoom = room.find(FIND_MY_CREEPS);
                this.memory.units[role] = _.sum(creepsInRoom, (c) => c.memory.role == role);
                console.log('MEM:   Created memory for unit \'' + role + '\'');
            }
        }

        // Spawn Queue Memory
        if (this.memory.nextSpawn == undefined) 
        {
            this.memory.nextSpawn = "";
            console.log('MEM:   Created memory for nextSpawn');
        }

        this.initSourceMemory ();
        this.initStrategyMemory ();
    },

    initStrategyMemory()
    {
        // Keeps track of current operating mode
        if (!this.memory.operating_mode == undefined) 
        {
            this.memory.operating_mode = "";
            console.log('MEM:   Created memory for room strategy');
        }

        // Adds operation modes to shared memory
        if (!Memory.strategys) 
        {
            Memory.strategys = {};
            console.log('MEM:   Created shared strategy list');
        }

        const modes = Object.keys(OPERATING_MODES)
        for (let idx in modes) {
            const mode = modes[idx];
            if (!Memory.strategys[mode]) 
            {
                Memory.strategys[mode] = OPERATING_MODES[mode];
                console.log("MEM:   Created Strategy '" + mode + "'");
            }

        }

    },

    initSourceMemory ()
    {
        if (!this.memory.sources) 
        {
            this.memory.sources = {};
        }

        let sources = Game.rooms[this.room_name].find(FIND_SOURCES);
        for (let idx in sources) 
        {
            let source_id = sources[idx].id;

            // Check for source mem
            if (this.memory.sources[source_id] == undefined)
            {
                this.memory.sources[source_id] = {};
                this.memory.sources[source_id].container_id = ''
                console.log('MEM:   Created memory for source \'' + source_id + '\'');
            }

            // Check for container_id
            if (this.memory.sources[source_id].container_id == undefined)
            {
                // possibly search area for container and set its id here, 
                // so that if mem is deleted it can recover
                this.memory.sources[source_id].container_id = '';
            }

            // Check for miners & transporters
            if (this.memory.sources[source_id].miners == undefined ||
                this.memory.sources[source_id].transporters == undefined)
            {
                // todo: fix so it will work with remote miners
                var creepsInRoom = Game.rooms[this.room_name].find(FIND_MY_CREEPS);
                let miner_count = _.sum(creepsInRoom, (c) => c.memory.role == 'miner' && c.memory.source == source_id);
                
                let transporter_count = _.sum(creepsInRoom, (c) => c.memory.role == 'transporter' && c.memory.source == source_id);

                this.memory.sources[source_id].miners = miner_count;
                this.memory.sources[source_id].transporters = transporter_count;
            }
            
        }
    },

    flushMemory (room)
    {
        Memory.rooms[room.name] = this.memory;
    },

    // Needs work, possibly its own class to manage the various states of the colony
    manageOperationalMode ()
    {
        let enemies = Game.rooms[this.room_name].find(FIND_HOSTILE_CREEPS, {
            filter: function(object) {
                return object.getActiveBodyparts(ATTACK) > 0 || object.getActiveBodyparts(RANGED_ATTACK) > 0;
            }
        });

        // TODO: ensure enemies arnt just teleporting back and forth
        if (enemies && enemies.length)
        {
            this.memory.operating_mode = 'UNDER_ATTACK'
            return;
        }

        if (this.level == 1)
        {
            this.memory.operating_mode = 'SEED_ROOM'
        } 
        else
        {
            this.memory.operating_mode = 'NORMAL_OPERATION'
        }
    },

    manageSpawnQueue ()
    {
        // if the queue is empty
        if (this.memory.nextSpawn == "") 
        {
            let mode = this.memory.operating_mode
            // if the strategys memery has a strat with the name of our current operating mode
            if (Memory.strategys[mode])
            {
                for (let role in Memory.strategys[mode])
                {
                    // Miners and transporters goal population is variable from room to room
                    let goal_population;
                    if (role == 'miner' || role == 'transporter')
                    {
                        goal_population = Object.keys(this.memory.sources).length;
                    } else {
                        goal_population = Memory.strategys[mode][role];
                    }

                    let current_population = this.memory.units[role];

                    if (current_population < goal_population)
                    {
                        this.memory.nextSpawn = role;
                        console.log('SPAWN: Next to spawn is \'' + role + '\'');
                        return;
                    }
                }
            } else { 
                console.log ('ERROR:   Could not find strategy \'' + mode + '\''); 
            }
        }
    },

    // manages tower operation
    manageTowers (room)
    {
        var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER && s.room.name == this.room_name);
        // for each tower
        if (this.memory.operating_mode == 'UNDER_ATTACK')
        {
            for (let tower of towers) {
                tower.defend_room();
            }
        } else {
            for (let tower of towers) {
                if (tower.store[RESOURCE_ENERGY] >= 500)
                {
                    tower.repair_structures();
                }
            }
        }
    },


    scoreBoard (room)
    {
        //------Unit Counts-----//
        let i = 1;
        room.visual.text('Population Totals', 1, .5, {align: 'left', font: 'bold 1 Times New Roman'});
        for (let idx in UNIT_TYPES) 
        {
            let role_total = this.memory.units[UNIT_TYPES[idx]];
            if (role_total == 0)
            {
                continue;
            }
            i++
            room.visual.text(this.memory.units[UNIT_TYPES[idx]] + " - " + UNIT_TYPES[idx], 1, i, {align: 'left', opacity: 0.8});
        }
        var decRatio = (room.energyAvailable / room.energyCapacityAvailable) * 100;
        var rounded_percentage = Math.round(decRatio);
        
        // log stats
    
        if (!Memory.stats.roomEnergy)
        {
            Memory.stats.roomEnergy = 0;
        }
        
        Memory.roomEnergy = rounded_percentage.toFixed(2);
        
        let roomTotalStored = room.storage.store.getUsedCapacity(RESOURCE_ENERGY);
        if (!Memory.stats.roomTotalStored)
        {
            Memory.stats.roomTotalStored = 0;
        }
        
        Memory.stats.roomTotalStored = roomTotalStored;

        let energy_color = '#ffffff';
        if (parseInt(rounded_percentage) < 25)
        {
            energy_color = '#ff0000';
        } else if (parseInt(rounded_percentage) < 50 && parseInt(rounded_percentage) >= 25)
        {
            energy_color = '#d18e00';
        } else if (parseInt(rounded_percentage) < 75 && parseInt(rounded_percentage) >= 50)
        {
            energy_color = '#f6ff00';
        }else if (parseInt(rounded_percentage) >= 75)
        {
            energy_color = '#119300';
        }

        let row = 0;
        //------Top Right room status-----//
        room.visual.text('Operation Mode: ' + this.memory.operating_mode, 49, ++row, {align: 'right', color: '#a8f0ff'});
        room.visual.text("Next unit to spawn: " + this.memory.nextSpawn, 49, ++row, {align: 'right', color: '#a8f0ff'});
        room.visual.text("Energy: " + rounded_percentage + '%', 49, ++row, {align: 'right', color: energy_color});
        room.visual.text("Energy Amount: " + room.energyAvailable, 49, ++row, {align: 'right', color: energy_color});
        
        //------Construction queue-----//
        room.visual.text("Construction Queue", 49, 6, {align: 'right', color: '#a8f0ff'});
        row += 2;
        this.memory.construction.forEach(structureEncoding => 
        {
            let point = structureEncoding.slice(2);
            let type = common.decodeStructure(structureEncoding.slice(0,2));
            let text = `(${this.memory.construction.indexOf(structureEncoding)}):\t\t${type} ${point}`; 
            Game.rooms[this.room_name].visual.text(text, 49, ++row, {align: 'right', color: '#a8f0ff'});
        });

    },

    // Could be done in the Miner role?
    assignMiners (room)
    {
        let unassigned_miners = _.filter(Game.creeps, (creep) =>  creep.memory.role == 'miner' &&
                                                                creep.room.name == this.room_name &&
                                                                !creep.memory.source);
        if (unassigned_miners.length == 0) {return;}
        
        // Store the ID's of all sources that have 0 miners
        let sources = this.memory.sources;
        let open_sources = [];
        for (let source_id in sources) 
        {
            let miner_count = this.memory.sources[source_id].miners;
            if (miner_count == 0) 
            {
                open_sources.push (source_id);
            }
        }
        
        if (open_sources.length == 0) {return;}

        while (unassigned_miners.length > 0 && open_sources.length > 0)
        {
            let miner = unassigned_miners.pop ();
            let source_id = open_sources.pop ();
            
            miner.memory.source = source_id;
            this.memory.sources[source_id].miners++;

            console.log("CREEP: Creep '" + miner.name + "' assigned to source '" + source_id + "'");
        }
    },

    // Good
    assignTransporters (room)
    {
        let unassigned_transporters = _.filter(Game.creeps, (creep) =>  creep.memory.role == 'transporter' &&
                                                                creep.room.name == this.room_name &&
                                                                !creep.memory.source);
        if (unassigned_transporters.length == 0) {return;}
        
        // Store the ID's of all sources that have less miners than transporters
        let sources = this.memory.sources;
        let open_sources = [];
        for (let source_id in sources) 
        {
            let transporter_count = this.memory.sources[source_id].transporters;
            let miner_count = this.memory.sources[source_id].miners;
            if (transporter_count < miner_count) 
            {
                open_sources.push (source_id);
            }
        }
        
        if (open_sources.length == 0) {return;}

        while (unassigned_transporters.length > 0 && open_sources.length > 0)
        {
            let transporter = unassigned_transporters.pop ();
            let source_id = open_sources.pop ();
            
            transporter.memory.source = source_id;
            this.memory.sources[source_id].transporters++;

            console.log("CREEP: Creep '" + transporter.name + "' assigned to source '" + source_id + "'");
        }
    },
}

module.exports = RoomManager;
