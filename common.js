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

    log ()
    {
        for (var i = 0; i < arguments.length; i++)
        {
            console.log(JSON.stringify(arguments[i]));
        }
    },
}

module.exports = common;