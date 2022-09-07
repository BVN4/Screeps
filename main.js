const autoSpawn = require('autoSpawn');
const role = {
	harvester : require('role.harvester'),
	upgrader : require('role.upgrader'),
	builder : require('role.builder'),
	miner : require('role.miner'),
};

module.exports.loop = function () {

	const room = Game.rooms['W42S45'];
	const spawner = Game.spawns['Spawn1'];

	let creeps = { harvester : 0, builder : 0, miner : 0, upgrader : 0, total : 0 };
	for(const name in Game.creeps){
		++creeps[Game.creeps[name].memory.role];
		++creeps.total;
	}
	let text = '';
	for(const role in creeps)
		text += role[0] + ':' + creeps[role] + ' ';
	spawner.room.visual.text(text, spawner.pos.x, spawner.pos.y - 3, {align: 'left', opacity: 0.8});

	const towers = room.find(FIND_MY_STRUCTURES, {
		filter : s => s.structureType == STRUCTURE_TOWER && s.store[RESOURCE_ENERGY] > 0
	});
	for(const t in towers){
		const closestHostile = towers[t].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if(closestHostile){
			towers[t].attack(closestHostile);
			continue;
		}

		const closestDamagedStructure = towers[t].pos.findClosestByRange(FIND_STRUCTURES, { filter : s => s.hits < s.hitsMax && s.hits < 80000 });
		if(closestDamagedStructure){
			towers[t].repair(closestDamagedStructure);
			continue;
		}
	}

	if(room.energyAvailable == room.energyCapacityAvailable || (creeps.harvester <= 1 && room.energyAvailable >= 300))
		autoSpawn(creeps, spawner, room.energyAvailable);

	if(spawner.spawning)
		spawner.room.visual.text('🛠️' + spawner.spawning.name, spawner.pos.x + 1, spawner.pos.y, {align: 'left', opacity: 0.8});

	for(const name in Game.creeps){
		const creep = Game.creeps[name];
		role[creep.memory.role].run(creep);
	}
}
