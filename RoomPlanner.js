
/*  
    TODO:
        - layout
            - spawns placed by claimers?
*/

// more info can be added to each grid location in memory

let common = require('common');

let STRUCTURES = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER, STRUCTURE_ROAD, STRUCTURE_WALL, STRUCTURE_RAMPART, STRUCTURE_STORAGE, 
                STRUCTURE_TOWER, STRUCTURE_LINK];

let BUILD_PRIORITY = 
{  
    'spawn': '00', 
    'extension': '01', 
    'container': '02',
    'road': '03', 
    'constructedWall': '04', 
    'rampart': '04', 
    'storage': '02', 
    'tower': '05', 
    'link': '05'
}

const LOOK_UP = 
{
    'spawn': 'sp', 
    'road': 'ro', 
    'extension': 'ex', 
    'storage': 'st', 
    'container': 'co', 
    'tower': 'to', 
    'rampart': 'ra', 
    'link': 'li', 
    'constructedWall': 'wa'
}

var RoomPlanner =
{
    /** @param {Room} room **/
    run: function (room)
    {
        this.initMemory (room);
        this.initLayout ();
        this.constructionManager ();
        
        //this.showLayout ();

        this.flushMemory(room);
    },

    
    initMemory (room)
    {
        this.room_name = room.name;
        this.level = room.controller.level;
        this.memory = Memory.rooms[room.name];
        

        // Add paths to memory
        if (!this.memory.paths) 
        {
            this.memory.paths = {};
        }
        
        if (!this.memory.layout) 
        {
            this.memory.layout = {}
        }

        if (!this.memory.layout.center) 
        {
            this.memory.layout.center = Game.rooms[this.room_name].find (FIND_MY_SPAWNS)[0].pos;
        }

        if (!this.memory.layout.name) 
        {
            this.memory.layout.name = 'bunker'
        }

        if (!this.entries) 
        {
            let temp = common.getLayout (this.memory.layout.name, 4, STRUCTURE_RAMPART, this.memory.layout.center);
            let res = [];
            for (let idx in temp)
            {
                let pos = temp[idx];
                res.push (new RoomPosition (pos.x, pos.y, this.room_name));
            }
            this.entries = res;
        }

        if (!this.memory.layout.level) 
        {
            this.memory.layout.level = room.controller.level;
        }
        
        if (!this.memory.construction)
        {
            this.memory.construction = {};
            for (let idx in BUILD_PRIORITY)
            {
                let prio = BUILD_PRIORITY[idx];
                this.memory.construction[prio] = [];
            }
        }

        if (!this.memory.layout.storage)
        {
            this.memory.layout.storage = {};
        }
    },
    

    flushMemory (room)
    {
        Memory.rooms[room.name] = this.memory;
    },
    
    
    initLayout ()
    {
        this.initRoads ();
        this.initSourceContainers ();
        this.initUpgraderContainer ();
        // this.initStorageContainers ();
    },
    
    
    initRoads ()
    {
        this.initSourceRoads ();
        this.initControllerRoad ();
    },
    
    initControllerRoad ()
    { 
        if (!this.memory.paths.controller)
        {
            let controller_pos = Game.rooms[this.room_name].controller.pos;
            let entry_pos = controller_pos.findClosestByPath (this.entries);
            let walls = common.getLayout (this.memory.layout.name, 4, STRUCTURE_WALL, this.memory.layout.center);

            let path = Game.rooms[this.room_name].findPath(controller_pos, entry_pos, {range: 0,
                costCallback: function(roomName, costMatrix) {
                    for (let i in walls)
                    {
                        let wall = walls[i];
                        costMatrix.set(wall.x, wall.y, 255);
                    }
                    return costMatrix;
                }
            });
            this.memory.paths.controller = Room.serializePath(path);
        }
    }, 

    // FIX
    initSourceRoads ()
    {   
        if (!this.memory.paths.sources)
        {
            this.memory.paths.sources = {};
            let sources = Game.rooms[this.room_name].find(FIND_SOURCES);
            let walls = common.getLayout (this.memory.layout.name, 4, STRUCTURE_WALL, this.memory.layout.center);

            for (let idx in sources) 
            {
                let source_pos = sources[idx].pos;
                let entry_pos = source_pos.findClosestByPath (this.entries);
                

                let path = Game.rooms[this.room_name].findPath(source_pos, entry_pos, {range: 0,
                    costCallback: function(roomName, costMatrix) {
                        for (let i in walls)
                        {
                            let wall = walls[i];
                            costMatrix.set(wall.x, wall.y, 255);
                        }
                        return costMatrix;
                    }
                });

                this.memory.paths.sources[sources[idx].id] = Room.serializePath(path);;
            }
        }
    },

    /*  
        Fills construction queue on RCL change
    */
    constructionManager ()
    {
        //if (true)
        if (Game.time % 19 == 0 || this.memory.layout.level != Game.rooms[this.room_name].controller.level)
        {
            let build_sites = this.returnNeededStructures ();
            
            if (build_sites)
            {
                this.addToQueue (build_sites);
            }
            
            this.memory.layout.level = Game.rooms[this.room_name].controller.level;
        } 
    },

    returnNeededStructures ()
    {
        let structures = [];

        // Upgrade Container
        if (this.memory.layout.storage.upgrade_container)
        {
            let container_str = this.memory.layout.storage.upgrade_container
            let container_pos = common.unstringifyPos (container_str);
            if (this.checkLocation (container_pos, STRUCTURE_CONTAINER))
            {
                let prio = BUILD_PRIORITY[STRUCTURE_CONTAINER]
                structures.push (prio+'co'+container_str);
            }
        }

        let sources = this.memory.sources;
        for (let id in sources)
        {   
            if (this.memory.sources[id].container)
            {
                let container_str = this.memory.sources[id].container
                let container_pos = common.unstringifyPos (container_str);
                if (this.checkLocation (container_pos, STRUCTURE_CONTAINER))
                {
                    let prio = BUILD_PRIORITY[STRUCTURE_CONTAINER]
                    structures.push (prio+'co'+container_str);
                }
            }
        }

        let path_roads = Room.deserializePath (this.memory.paths.controller);
        for (let idx in this.memory.paths.sources)
        {
            const src = this.memory.paths.sources[idx];
            path_roads.concat (Room.deserializePath (src));
        }

        for (let idx in path_roads)
        {
            let prio = BUILD_PRIORITY[STRUCTURE_ROAD];
            let pos = path_roads[idx]
            if (this.checkLocation (pos, STRUCTURE_ROAD))
            {
                structures.push (prio+LOOK_UP[STRUCTURE_ROAD]+common.stringifyPos(pos));
            }
        }
        

        for (let idx in STRUCTURES)
        {
            let type = STRUCTURES[idx];
            let points = common.getLayout (this.memory.layout.name, this.level, type, this.memory.layout.center);
            if (!points) {continue;}
            
            let prio = BUILD_PRIORITY[type];
            for (let idx in points)
            {
                let pos = points[idx];
                // check for container limit

                if (this.checkLocation (pos, type))
                {
                    structures.push (prio+LOOK_UP[type]+common.stringifyPos(pos));
                }
            }
        }

        return structures;
    },

    checkLocation (pos, type)
    {
        let room_pos = new RoomPosition (pos.x, pos.y, this.room_name)
        let look = Game.rooms[this.room_name].lookForAt(LOOK_STRUCTURES, room_pos)
        let terrain = new Room.Terrain(this.room_name);

        if (look.length)
        {
            for (let idx in look)
            {
                const obj = look[idx];
                if (obj.structureType == type || terrain.get (pos.x, pos.y) != 0)
                {
                    return false;
                }
            }
        }
        return true;
    },

    addToQueue (build_sites)
    {
        // Check if in queue already, if not add it
        // [prio] -> list

        for (let idx in build_sites)
        {
            const str = build_sites[idx];
            let prio = str.slice (0, 2);
            let type_abbrv = str.slice (2,4);
            let type = Object.keys(LOOK_UP).find(key => LOOK_UP[key] === type_abbrv)

            if (!this.memory.construction[prio])
            {
                this.memory.construction[prio] = [];
            }

            if (!this.memory.construction[prio].includes (str))
            {
                this.memory.construction[prio].push (str);
            }
        }
    },

    initSourceContainers ()
    {
        if (this.memory.layout.storage.source_containers)
        {
            return;
        }
        this.memory.layout.storage.source_containers = [];

        let sources = this.memory.sources;
        for (let id in sources)
        {   
            if (!this.memory.sources[id].container)
            {
                let source_path = Room.deserializePath (this.memory.paths.sources[id]);
                let container_pos = source_path[0];

                this.memory.layout.storage.source_containers.push(common.stringifyPos (container_pos));
                this.memory.sources[id].container = common.stringifyPos (container_pos);

                console.log("BUILD: Source container created for source \'" + id + "\' at: " + container_pos.x + ", " + container_pos.y)
            }
        }
    },

    initUpgraderContainer ()
    {
        if (this.memory.layout.storage.upgrade_container || !this.memory.paths.controller)
        {
            return;
        }

        let controller_path = Room.deserializePath (this.memory.paths.controller);
        let container_pos;

        for (let i = 3; i >= 0; i--)
        {
            if (controller_path[i])
            {
                container_pos = controller_path[i];
                break;
            }
        }
        
        this.memory.layout.storage.upgrade_container = container_pos.x + '-' + container_pos.y;
        console.log("BUILD: Upgrader container created at: " + container_pos.x + ", " + container_pos.y)
    },

    // ------------------------------------------------ UTILS ----------------------------------------------------

    showLayout ()
    {
        let points = common.getLayout (this.memory.layout.name, this.level, STRUCTURE_EXTENSION, this.memory.layout.center);
        for (let idx in points)
        {
            let point = points[idx];
            Game.rooms[this.room_name].visual.circle(point.x, point.y, {opacity: 0.4, fill: '#e5b832', radius: .25, stroke: 2});
        }

        points = common.getLayout (this.memory.layout.name, this.level, STRUCTURE_WALL, this.memory.layout.center);
        for (let idx in points)
        {
            let point = points[idx];
            Game.rooms[this.room_name].visual.rect(point.x-.25, point.y-.25, .5, .5, {opacity: 1, fill: '#000000'});
        }

        points = common.getLayout (this.memory.layout.name, this.level, STRUCTURE_ROAD, this.memory.layout.center);
        for (let idx in points)
        {
            let point = points[idx];
            Game.rooms[this.room_name].visual.circle(point.x, point.y, {opacity: 0.2, fill: '#ffffff', radius: .2});
        }
        
        points = common.getLayout (this.memory.layout.name, this.level, STRUCTURE_RAMPART, this.memory.layout.center);
        for (let idx in points)
        {
            let point = points[idx];
            Game.rooms[this.room_name].visual.rect(point.x - .5, point.y - .5, 1, 1, {opacity: 0.8, fill: '#2F3A30'});
        }

        points = common.getLayout (this.memory.layout.name, this.level, STRUCTURE_STORAGE, this.memory.layout.center);
        for (let idx in points)
        {
            let point = points[idx];
            Game.rooms[this.room_name].visual.rect(point.x-.25, point.y-.25, .5, .5, {opacity: 0.2, fill: '#f7ef00'});
        }

        points = common.getLayout (this.memory.layout.name, this.level, STRUCTURE_TOWER, this.memory.layout.center);
        for (let idx in points)
        {
            let point = points[idx];
            Game.rooms[this.room_name].visual.circle(point.x, point.y, {opacity: 0.3, fill: '#319300', radius: .2});
        }

        points = common.getLayout (this.memory.layout.name, this.level, STRUCTURE_CONTAINER, this.memory.layout.center);
        for (let idx in points)
        {
            let point = points[idx];
            Game.rooms[this.room_name].visual.rect(point.x-.25, point.y-.5, .5, 1, {opacity: 0.5, fill: '#ffbf00', stroke: 3});
        }

        let controller_path = Room.deserializePath(this.memory.paths.controller);
        for (let idx in controller_path)
        {
            let pos = controller_path[idx];
            Game.rooms[this.room_name].visual.circle(pos.x, pos.y, {opacity: 0.2, fill: '#ffffff', radius: .2});
        }

        for (let i in this.memory.paths.sources)
        {
            let source_path = this.memory.paths.sources[i];
            let path = Room.deserializePath(source_path);
            for (let idx in path)
            {
                let pos = path[idx];
                Game.rooms[this.room_name].visual.circle(pos.x, pos.y, {opacity: 0.2, fill: '#ffffff', radius: .2});
            }
        }


        if (this.memory.layout.storage.upgrade_container)
        {
            let point = common.unstringifyPos(this.memory.layout.storage.upgrade_container);
            Game.rooms[this.room_name].visual.rect(point.x-.25, point.y-.5, .5, 1, {opacity: 0.5, fill: '#ffbf00', stroke: 3});
        }

        for (let id in this.memory.sources)
        {   
            if (this.memory.sources[id].container)
            {
                let point = common.unstringifyPos(this.memory.sources[id].container);
                Game.rooms[this.room_name].visual.rect(point.x-.25, point.y-.5, .5, 1, {opacity: 0.5, fill: '#ffbf00', stroke: 3});
            }
        }

    },

}

module.exports = RoomPlanner;

