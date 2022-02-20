function State(name, scope) 
{
    this.name = name || "IDLE";
    this.scope = scope || {};
}

State.prototype.Seralize = function() 
{
    return {
        name: this.name,
        scope: this.scope
    }
}

function MoveState(position, range)
{
    this.scope = {
        position: position,
        range: range
    };

    State.call(this, "MOVE", this.scope);
}

MoveState.prototype = new State();
MoveState.prototype.constructor = MoveState;

module.exports = {
    State, 
    MoveState
};