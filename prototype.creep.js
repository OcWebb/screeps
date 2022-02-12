let states = require('states')

var roles = 
{
    upgrader: require('role.upgrader'),
    builder: require('role.builder'),
    miner: require('role.miner'),
    transporter: require('role.transporter'),
    colony_seed: require('role.colony_seed'),
    attacker: require('role.attacker'),
    defender: require('role.defender'),
    scout: require('role.scout')
};

Creep.prototype.runRole =
    function () 
    {
        if (!this.memory.state) 
        {
            this.initStateMemory();
        }

        if (this.memory.role)
        {
            roles[this.memory.role].run(this);
        }
    };

Creep.prototype.isFull =
    function() 
    {
        if (!this._isFull) 
        {
            this._isFull = _.sum(this.carry) === this.carryCapacity;
        }
        return this._isFull;
    }    

Creep.prototype.initStateMemory = 
    function() 
    {
        if (this.memory.state) 
        {
            delete this.memory.state;
        }
        // state = a stack of states, each with a name and a scope containing parameters
        this.memory.state = [
            {
                name: "IDLE",
                scope: { }
            }
        ]
    }

Creep.prototype.pushState = 
    function(state) 
    {
        if (this.memory.state) 
        {
            this.memory.state.unshift(state)
        }
    }

Creep.prototype.popState = 
    function() 
    {
        if (this.memory.state) 
        {
            this.memory.state.shift();
        }
    }

Creep.prototype.getState = 
    function() 
    {
        if (this.memory.state) 
        {
            return this.memory.state[0];
        }

        return undefined;
    }

Creep.prototype.executeState = 
    function() 
    {
        let state = this.getState();
        if (state)
        {
            states[state.name](this, state.scope);
        }
    }