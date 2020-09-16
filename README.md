# Screeps?
Screeps is an online MMO RTS game created for programmers.  The basic premise of the game is to gather as much territory as possible and use that territory to upgrade the rooms.  This can be accomplished by many means, but some basic game concepts are universal, which I will list below:

- 'creeps' are your game units, usually assigned roles to complete tasks
 - Energy is gathered from sources that spawn in the games rooms
 - Energy is used to
	 - Create new creeps
	 - Upgrade controllers (which is the goal of the game, higher controller levels allow more units and structures to be build)
	 - build and repair structures and defences
 - Players choose to spawn into one of 4 'shards' which are all populated by other players AI's
 - Your AI runs 24/7, even while you are offline

# My AI
In this section I will describe the different parts of my AI and how they help me maintain and expand my colony.
## Roles
- **Attacker** - A very basic attack unit which locates an 'attack flag' that I provide, travels to the room containing the flag, and attempts to destroy all units
- **Defender** - This unit contains multiple tasks relating to the defence of my rooms. These include defending a position, defending an entryway, defending a unit, and chasing down enemies.
- **Miner** - This units only task is to walk to a source, mine, and drop its energy on the ground to be picked up by transporters
- **Transporters** - This unit deals with energy logistics.  It takes energy from miners and transfers it to the various areas in the room that require it, and if it is not needed anywhere, it stockpiles the energy in large containers
- **Upgrader** - This units sole task is to take energy from nearby containers and use it to upgrade the rooms controller
- **Builder** - Takes energy from the nearest source and uses it to build new structures and repair existing ones
- **Scout** - This unit uses a depth first search to travel to new rooms and write to memory all information about the room which is important to my AI
- **Colony seed** - A basic unit which travels to a room which the AI is attempting to colonize, claims the controller, and attempts to place a spawn
## Managers
I decided to implement multiple 'Manager' classes to control various game and planning operations in a single place.  They are as follows:
- RoomManager - This is the main, high level controller created for each room under my control.  Its tasks include:
	- Managing the spawn queue (which creeps to spawn next and what their priority is)
	- Controlling all towers in the room
	- Setting the rooms 'OPERATING_MODE' which all units use to determine what the best course of action is, and also population totals
		- modes include NORMAL_OPERATION, SEED_ROOM, and UNDER_ATTACK currently
	- Assigning transporters and miners to sources where they are needed
	- Displays useful information as text overlayed on the game screen (such as population totals)
	- calls RoomPlanner
- RoomPlanner is a class dedicated to automatically deciding on locations to build structures, and once locations are chosen, updating the builders queue with priority so that the builders can take over