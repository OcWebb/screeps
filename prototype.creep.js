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