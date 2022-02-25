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


var common = 
{
    getLayout (layout_name, level, structure_type, center)
    {
        let mem = Memory.layouts[layout_name][level][LOOK_UP[structure_type]];
        
        if (!mem){ return; }

        let points_str = mem;
        let points_split = points_str.split (',');
        let result = [];
        for (let idx in points_split)
        {
            let point = points_split[idx];
            let point_split = point.split ('.');
            let point_dict = {'x': center.x + parseInt(point_split[0]), 'y': center.y + parseInt(point_split[1])}
            result.push (point_dict);
        }
        return result;
    },

    stringifyPos (pos)
    {
        return pos.x + '-' + pos.y;
    },

    unstringifyPos (pos)
    {
        let str = pos;
        if (Array.isArray(pos))
        {
            str = pos[0];
        }

        let split_string = str.split('-');
        return {'x': parseInt(split_string[0]), 'y': parseInt(split_string[1])};
    },

    encodeStructure (str)
    {
        return LOOK_UP[str];
    },

    decodeStructure (str)
    {
        return Object.keys (LOOK_UP).find(key => LOOK_UP[key] === str);
    },

    decodeStrutureTypeAndPosition (str)
    { 
        let encoding = str.slice (0,2);
        let stringPosition = str.slice (2);

        let type = common.decodeStructure (encoding);
        let position = common.unstringifyPos (stringPosition);

        return {type, position}
    },

    log ()
    {
        for (var i = 0; i < arguments.length; i++)
        {
            console.log(JSON.stringify(arguments[i]));
        }
    },

    logCpuUsage (header)
    {
        console.log(header + " - " + Game.cpu.getUsed());
    },

    showLayout (center, layout, level, roomName)
    {
        if (!Game.rooms[roomName]) { return; }

        let points = this.getLayout (layout, level, STRUCTURE_EXTENSION, center);
        for (let idx in points)
        {
            let point = points[idx];
            Game.rooms[roomName].visual.circle(point.x, point.y, {opacity: 0.4, fill: '#e5b832', radius: .25, stroke: 2});
        }

        points = this.getLayout (layout, level, STRUCTURE_WALL, center);
        for (let idx in points)
        {
            let point = points[idx];
            Game.rooms[roomName].visual.rect(point.x-.25, point.y-.25, .5, .5, {opacity: 1, fill: '#000000'});
        }

        points = this.getLayout (layout, level, STRUCTURE_ROAD, center);
        for (let idx in points)
        {
            let point = points[idx];
            Game.rooms[roomName].visual.circle(point.x, point.y, {opacity: 0.2, fill: '#ffffff', radius: .2});
        }
        
        points = this.getLayout (layout, level, STRUCTURE_RAMPART, center);
        for (let idx in points)
        {
            let point = points[idx];
            Game.rooms[roomName].visual.rect(point.x - .5, point.y - .5, 1, 1, {opacity: 0.8, fill: '#2F3A30'});
        }

        points = this.getLayout (layout, level, STRUCTURE_STORAGE, center);
        for (let idx in points)
        {
            let point = points[idx];
            Game.rooms[roomName].visual.rect(point.x-.25, point.y-.25, .5, .5, {opacity: 0.2, fill: '#f7ef00'});
        }

        points = this.getLayout (layout, level, STRUCTURE_TOWER, center);
        for (let idx in points)
        {
            let point = points[idx];
            Game.rooms[roomName].visual.circle(point.x, point.y, {opacity: 0.3, fill: '#319300', radius: .2});
        }

        points = this.getLayout (layout, level, STRUCTURE_CONTAINER, center);
        for (let idx in points)
        {
            let point = points[idx];
            Game.rooms[roomName].visual.rect(point.x-.25, point.y-.5, .5, 1, {opacity: 0.5, fill: '#ffbf00', stroke: 3});
        }

        // let controller_path = Room.deserializePath(this.memory.paths.controller);
        // for (let idx in controller_path)
        // {
        //     let pos = controller_path[idx];
        //     Game.rooms[this.room_name].visual.circle(pos.x, pos.y, {opacity: 0.2, fill: '#ffffff', radius: .2});
        // }

        // for (let i in this.memory.paths.sources)
        // {
        //     let source_path = this.memory.paths.sources[i];
        //     let path = Room.deserializePath(source_path);
        //     for (let idx in path)
        //     {
        //         let pos = path[idx];
        //         Game.rooms[this.room_name].visual.circle(pos.x, pos.y, {opacity: 0.2, fill: '#ffffff', radius: .2});
        //     }
        // }


        // if (this.memory.layout.storage.upgrade_container)
        // {
        //     let point = common.unstringifyPos(this.memory.layout.storage.upgrade_container);
        //     Game.rooms[this.room_name].visual.rect(point.x-.25, point.y-.5, .5, 1, {opacity: 0.5, fill: '#ffbf00', stroke: 3});
        // }

        // for (let id in this.memory.sources)
        // {   
        //     if (this.memory.sources[id].container)
        //     {
        //         let point = common.unstringifyPos(this.memory.sources[id].container);
        //         Game.rooms[this.room_name].visual.rect(point.x-.25, point.y-.5, .5, 1, {opacity: 0.5, fill: '#ffbf00', stroke: 3});
        //     }
        // }

    },
}

module.exports = common;