module.exports = {

	init : function(creep){

		let occupiedFlags = [];
		const flags = creep.room.find(FIND_FLAGS, f => { /miner/i.test(flag.name) });
		for(const name in Game.creeps){
			if(Game.creeps[name].memory.role == 'miner' && Game.creeps[name].memory.flag)
				occupiedFlags.push(Game.creeps[name].memory.flag);
		}

		for(const f in flags){
			if(occupiedFlags.indexOf(flags[f].name) == -1){
				creep.memory.flag = flags[f].name;
				creep.memory.source = flags[f].pos.findClosestByRange(FIND_SOURCES).id;
				creep.memory.storage = flags[f].pos.findClosestByRange(FIND_STRUCTURES, {
					filter : s => s.structureType == STRUCTURE_STORAGE
				}).id;
				break;
			}
		}

	},

	/** @param {Creep} creep **/
	run : function(creep){

		if(!creep.memory.flag || !Game.flags[creep.memory.flag]) this.init(creep);

		const flag = Game.flags[creep.memory.flag];
		if(flag.pos.y != creep.pos.y || flag.pos.x != creep.pos.x) return creep.moveTo(flag);

		if(creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
			const storage = Game.getObjectById(creep.memory.storage);
			if(creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
				creep.moveTo(storage, { visualizePathStyle : { stroke : '#ffffff' } });
		}else{
			const source = Game.getObjectById(creep.memory.source);
			if(creep.harvest(source) == ERR_NOT_IN_RANGE)
				creep.moveTo(source, { visualizePathStyle : { stroke : '#ffaa00' } });
		}
	}
};
