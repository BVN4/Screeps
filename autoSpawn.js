const percentCreeps = [
	{
		name : 'miner', count : 0, min : 1, max : 0,
		stats : [
			{ cost : 1000, val : [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE] }
		]
	},
	{
		name : 'harvester', count : 30, min : 3, max : 0,
		subs : ['', 'tower', '', ''],
		stats : [
			{ cost : 1150, val : [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] },
			{ cost : 850, val : [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] },
			{ cost : 650, val : [WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] },
			{ cost : 300, val : [WORK, CARRY, MOVE] }
		]
	},
	{ name : 'builder', count : 30, min : 0, max : 0 },
	{ name : 'upgrader', count : 40, min : 0, max : 0 },
];

const defaultStats = {
	harvester : [[WORK, 100], [CARRY, 50], [MOVE, 50]],
	builder : [[WORK, 100], [CARRY, 50], [MOVE, 50]],
	upgrader : [[WORK, 100], [CARRY, 50], [MOVE, 50]],
};

module.exports = (creeps, spawner, energy) => {
	for(const name in Memory.creeps){
		if(!Game.creeps[name]) {
			delete Memory.creeps[name];
			console.log('Clearing non-existing creep memory:', name);
		}
	}

	for(const role of percentCreeps){
		if(!creeps[role.name] || creeps[role.name] < role.min || creeps[role.name]*100/creeps.total < role.count){

			if(creeps[role.name] > role.max && role.max != 0) continue;

			let subrole = role.subs ? role.subs[creeps[role.name] % role.subs.length] : '';
			let stats;

			if(role.stats && subrole != 'tower'){
				for(const stat of role.stats){
					if(stat.cost <= energy){
						stats = stat.val;
						break;
					}
				}
			}else{
				let i = 0;
				stats = [WORK, CARRY, MOVE];
				energy = energy - 200;
				while(energy >= 50){
					const stat = defaultStats[role.name][i % defaultStats[role.name].length];
					++i;

					if(energy - stat[1] < 0) continue;
					energy -= stat[1];

					stats.push(stat[0]);
				}
			}

			if(!stats) continue;

			const newName = role.name + Game.time;
			console.log('Spawning new harvester: ' + newName);
			return spawner.spawnCreep(stats, newName, {
				memory : { role : role.name, subrole : subrole }
			});

		}
	}
};
