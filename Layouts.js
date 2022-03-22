

const LAYOUTS = 
{
    'bunker': 
    {
        1:
            {
            'sp': '0.0',
            'co': '-2.1,-1.2,1.-2',
            },
        2:
            {
            'sp': '0.0',
            'ro': '-1.0,-2.0,-3.0,-4.0,-5.0,-6.0,1.0,2.0,3.0,4.0,5.0,6.0,0.1,0.2,0.3,0.4,0.5,0.6,0.-1,0.-2,0.-3,0.-4,0.-5,0.-6',
            'ex': '2.-3,3.-2,4.-3,3.-4,4.-1',
            'co': '-2.1,-1.2,1.-2',
            },
        3:
            {
            'sp': '0.0',
            'wa': '1.7,2.7,3.7,-1.7,-2.7,-3.7,-3.6,-4.6,-5.6,3.6,4.6,5.6,-5.5,-6.5,5.5,6.5,-6.4,-6.3,6.4,6.3,-7.3,7.3,-7.2,-7.1,-7.-1,-7.-2,-7.-3,7.2,7.1,7.-1,7.-3,7.-2,-6.-3,-6.-4,-6.-5,6.-3,6.-4,6.-5,5.-5,5.-6,-5.-5,-5.-6,-4.-6,-3.-6,4.-6,3.-6,-3.-7,-2.-7,-1.-7,2.-7,1.-7,3.-7',
            'ro': '-1.0,-2.0,-3.0,-4.0,-5.0,-6.0,1.0,2.0,3.0,4.0,5.0,6.0,0.1,0.2,0.3,0.4,0.5,0.6,0.-1,0.-2,0.-3,0.-4,0.-5,0.-6',
            'ex': '2.-3,3.-2,4.-3,3.-4,4.-1,1.-4,2.-5,1.-6,5.-2,6.-1',
            'co': '-2.1,-1.2,1.-2',
            'to': '3.-1',
            'ra': '7.0,0.-7,-7.0,0.7',
            },
        4:
            {
            'sp': '0.0',
            'wa': '1.7,2.7,3.7,-1.7,-2.7,-3.7,-3.6,-4.6,-5.6,3.6,4.6,5.6,-5.5,-6.5,5.5,6.5,-6.4,-6.3,6.4,6.3,-7.3,7.3,-7.2,-7.1,-7.-1,-7.-2,-7.-3,7.2,7.1,7.-1,7.-3,7.-2,-6.-3,-6.-4,-6.-5,6.-3,6.-4,6.-5,5.-5,5.-6,-5.-5,-5.-6,-4.-6,-3.-6,4.-6,3.-6,-3.-7,-2.-7,-1.-7,2.-7,1.-7,3.-7',
            'ro': '-1.0,-2.0,-3.0,-4.0,-5.0,-6.0,1.0,2.0,3.0,4.0,5.0,6.0,0.1,0.2,0.3,0.4,0.5,0.6,0.-1,0.-2,0.-3,0.-4,0.-5,0.-6',
            'ex': '-2.-1,-1.-2,-3.-2,-2.-3,-4.-1,-1.-4,2.-3,3.-2,4.-3,3.-4,4.-5,5.-4,5.-2,4.-1,6.-1,6.-2,2.-5,2.-6,1.-6,1.-4',
            'st': '2.-1',
            'co': '-2.1,-1.2,1.-2',
            'to': '3.-1',
            'ra': '7.0,0.-7,-7.0,0.7',
            },
        5:
            {
            'sp': '0.0',
            'wa': '1.7,2.7,3.7,-1.7,-2.7,-3.7,-3.6,-4.6,-5.6,3.6,4.6,5.6,-5.5,-6.5,5.5,6.5,-6.4,-6.3,6.4,6.3,-7.3,7.3,-7.2,-7.1,-7.-1,-7.-2,-7.-3,7.2,7.1,7.-1,7.-3,7.-2,-6.-3,-6.-4,-6.-5,6.-3,6.-4,6.-5,5.-5,5.-6,-5.-5,-5.-6,-4.-6,-3.-6,4.-6,3.-6,-3.-7,-2.-7,-1.-7,2.-7,1.-7,3.-7',
            'ra': '-1.0,-2.0,-3.0,-4.0,-5.0,-6.0,1.0,2.0,3.0,4.0,5.0,6.0,0.1,0.2,0.3,0.4,0.5,0.6,0.-1,0.-2,0.-3,0.-4,0.-5,0.-6',
            'ex': '-2.-1,-1.-2,-3.-2,-2.-3,-4.-1,-5.-2,-4.-3,-5.-4,-3.-4,-1.-4,-2.-5,-1.-6,-4.-5,-6.-1,-6.-2,-2.-6,2.-3,3.-2,4.-3,3.-4,4.-5,5.-4,5.-2,4.-1,6.-1,6.-2,2.-5,2.-6,1.-6,1.-4',
            'st': '2.-1',
            'co': '-2.1,-1.2,1.-2',
            'to': '3.-1,-3.1',
            'ra': '7.0,0.-7,-7.0,0.7',
            'li': '-3.-1',
            },
        6:
            {
            'sp': '0.0',
            'wa': '1.7,2.7,3.7,-1.7,-2.7,-3.7,-3.6,-4.6,-5.6,3.6,4.6,5.6,-5.5,-6.5,5.5,6.5,-6.4,-6.3,6.4,6.3,-7.3,7.3,-7.2,-7.1,-7.-1,-7.-2,-7.-3,7.2,7.1,7.-1,7.-3,7.-2,-6.-3,-6.-4,-6.-5,6.-3,6.-4,6.-5,5.-5,5.-6,-5.-5,-5.-6,-4.-6,-3.-6,4.-6,3.-6,-3.-7,-2.-7,-1.-7,2.-7,1.-7,3.-7',
            'ra': '-1.0,-2.0,-3.0,-4.0,-5.0,-6.0,1.0,2.0,3.0,4.0,5.0,6.0,0.1,0.2,0.3,0.4,0.5,0.6,0.-1,0.-2,0.-3,0.-4,0.-5,0.-6',
            'ex': '-2.-1,-1.-2,-3.-2,-2.-3,-4.-1,-5.-2,-4.-3,-5.-4,-3.-4,-1.-4,-2.-5,-1.-6,-4.-5,-6.-1,-6.-2,-2.-6,-3.2,-2.3,-1.4,-2.5,-3.4,-4.3,-5.2,-6.1,-4.1,-6.2,2.-3,3.-2,4.-3,3.-4,4.-5,5.-4,5.-2,4.-1,6.-1,6.-2,2.-5,2.-6,1.-6,1.-4',
            'st': '2.-1',
            'co': '-2.1,-1.2,1.-2',
            'to': '3.-1,-3.1',
            'ra': '7.0,0.-7,-7.0,0.7',
            'li': '-3.-1',
            },
        7:
            {
            'sp': '0.0',
            'wa': '1.7,2.7,3.7,-1.7,-2.7,-3.7,-3.6,-4.6,-5.6,3.6,4.6,5.6,-5.5,-6.5,5.5,6.5,-6.4,-6.3,6.4,6.3,-7.3,7.3,-7.2,-7.1,-7.-1,-7.-2,-7.-3,7.2,7.1,7.-1,7.-3,7.-2,-6.-3,-6.-4,-6.-5,6.-3,6.-4,6.-5,5.-5,5.-6,-5.-5,-5.-6,-4.-6,-3.-6,4.-6,3.-6,-3.-7,-2.-7,-1.-7,2.-7,1.-7,3.-7',
            'ra': '-1.0,-2.0,-3.0,-4.0,-5.0,-6.0,1.0,2.0,3.0,4.0,5.0,6.0,0.1,0.2,0.3,0.4,0.5,0.6,0.-1,0.-2,0.-3,0.-4,0.-5,0.-6',
            'ex': '-2.-1,-1.-2,-3.-2,-2.-3,-4.-1,-5.-2,-4.-3,-5.-4,-3.-4,-1.-4,-2.-5,-1.-6,-4.-5,-6.-1,-6.-2,-2.-6,-3.2,-2.3,-1.4,-2.5,-3.4,-4.3,-5.4,-5.2,-6.1,-4.1,-1.6,-4.5,-2.6,-6.2,1.2,2.1,3.2,2.3,1.4,4.1,2.-3,3.-2,4.-3,3.-4,4.-5,5.-4,5.-2,4.-1,6.-1,6.-2,2.-5,2.-6,1.-6,1.-4',
            'st': '2.-1',
            'co': '-2.1,-1.2,1.-2',
            'to': '3.-1,-3.1,-1.-3',
            'ra': '7.0,0.-7,-7.0,0.7',
            'li': '-3.-1',
            },
        8:
            {
            'sp': '0.0',
            'wa': '1.7,2.7,3.7,-1.7,-2.7,-3.7,-3.6,-4.6,-5.6,3.6,4.6,5.6,-5.5,-6.5,5.5,6.5,-6.4,-6.3,6.4,6.3,-7.3,7.3,-7.2,-7.1,-7.-1,-7.-2,-7.-3,7.2,7.1,7.-1,7.-3,7.-2,-6.-3,-6.-4,-6.-5,6.-3,6.-4,6.-5,5.-5,5.-6,-5.-5,-5.-6,-4.-6,-3.-6,4.-6,3.-6,-3.-7,-2.-7,-1.-7,2.-7,1.-7,3.-7',
            'ra': '-1.0,-2.0,-3.0,-4.0,-5.0,-6.0,1.0,2.0,3.0,4.0,5.0,6.0,0.1,0.2,0.3,0.4,0.5,0.6,0.-1,0.-2,0.-3,0.-4,0.-5,0.-6',
            'ex': '-2.-1,-1.-2,-3.-2,-2.-3,-4.-1,-5.-2,-4.-3,-5.-4,-3.-4,-1.-4,-2.-5,-1.-6,-4.-5,-6.-1,-6.-2,-2.-6,-3.2,-2.3,-1.4,-2.5,-3.4,-4.3,-5.4,-5.2,-6.1,-4.1,-1.6,-4.5,-2.6,-6.2,1.2,2.1,3.2,2.3,3.4,4.3,5.4,4.5,2.5,1.4,1.6,5.2,4.1,6.1,6.2,2.6,2.-3,3.-2,4.-3,3.-4,4.-5,5.-4,5.-2,4.-1,6.-1,6.-2,2.-5,2.-6,1.-6,1.-4',
            'st': '2.-1',
            'co': '-2.1,-1.2,1.-2',
            'to': '3.-1,-3.1,-1.-3,1.3',
            'ra': '7.0,0.-7,-7.0,0.7',
            'li': '-3.-1',
            },

    }
}
module.exports = LAYOUTS;