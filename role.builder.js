module.exports = {

	findSources : function(creep){
		const targets = [
			...creep.room.find(FIND_STRUCTURES, { filter : s => s.structureType == STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] != 0 }),
			...creep.room.find(FIND_RUINS, { filter : r => r.store[RESOURCE_ENERGY] != 0 }),
			...creep.room.find(FIND_TOMBSTONES, { filter : t => t.store[RESOURCE_ENERGY] != 0 }),
			...creep.room.find(FIND_DROPPED_RESOURCES)
		];
		let target = creep.pos.findClosestByPath(targets);

		if(!target){
			let target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
			if(!target){
				delete creep.memory.target;
				delete creep.memory.targetAction;
				return;
			}
			creep.say('🔄 harvest');
			creep.memory.target = target.id;
			creep.memory.targetAction = 'harvest';
			return;
		}

		creep.memory.target = target.id;
		creep.say('🔄 resource');
		if(target.deathTime || target.destroyTimenumber || target.structureType == STRUCTURE_STORAGE)
			return creep.memory.targetAction = 'withdraw';
		if(target.resourceType == RESOURCE_ENERGY)
			return creep.memory.targetAction = 'pickup';
	},

	findStructures : function(creep){
		const targets = [
			...creep.room.find(FIND_STRUCTURES, { filter : o => o.hits < o.hitsMax && o.hits < 1000 }),
			...creep.room.find(FIND_CONSTRUCTION_SITES)
		];
		const target = creep.pos.findClosestByRange(targets);

		if(!target){
			delete creep.memory.target;
			delete creep.memory.targetAction;
			return;
		}

		creep.memory.target = target.id;
		creep.say(target.progressTotal ? '🚧 build' : '🔨 repair');
		creep.memory.targetAction = target.progressTotal ? 'build' : 'repair';
	},

	/** @param {Creep} creep **/
	run: function(creep){
		if(!creep.memory.target || (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0)){
			creep.memory.building = false;
			this.findSources(creep);
		}
		if(!creep.memory.building && creep.store.getFreeCapacity() == 0){
			creep.memory.building = true;
			this.findStructures(creep);
			if(!creep.memory.target) return creep.memory.role = 'upgrader';
		}

		if(creep.memory.building){
			const target = Game.getObjectById(creep.memory.target);
			if(!target || (creep.memory.targetAction == 'repair' && (target.hits == target.hitsMax || target.hits > 1000)))
				return this.findStructures(creep);
			if(creep[creep.memory.targetAction](target) == ERR_NOT_IN_RANGE)
				creep.moveTo(target, { visualizePathStyle : { stroke : '#ffffff' } });
		}else{
			const target = Game.getObjectById(creep.memory.target);
			if(!target || !creep.memory.targetAction || (target.store && target.store[RESOURCE_ENERGY] == 0)) return this.findSources(creep);
			if(creep[creep.memory.targetAction](target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
				creep.moveTo(target, { visualizePathStyle : { stroke : '#ffaa00' } });
		}
	}
};
