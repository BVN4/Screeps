module.exports = {

	findSources : function(creep){
		let target;

		if(creep.memory.subrole == 'tower')
			target = creep.pos.findClosestByPath([
				...creep.room.find(FIND_SOURCES_ACTIVE),
				...creep.room.find(FIND_RUINS, { filter : r => r.store[RESOURCE_ENERGY] != 0 }),
				...creep.room.find(FIND_TOMBSTONES, { filter : t => t.store[RESOURCE_ENERGY] != 0 }),
				...creep.room.find(FIND_DROPPED_RESOURCES)
			]);

		if(!target || !creep.memory.subrole)
			target = creep.pos.findClosestByPath([
				...creep.room.find(FIND_STRUCTURES, { filter : s => s.structureType == STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] != 0 }),
				...creep.room.find(FIND_RUINS, { filter : r => r.store[RESOURCE_ENERGY] != 0 }),
				...creep.room.find(FIND_TOMBSTONES, { filter : t => t.store[RESOURCE_ENERGY] != 0 }),
				...creep.room.find(FIND_DROPPED_RESOURCES)
			]);

		if(!target){
			target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
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
		creep.memory.targetAction = 'harvest';
	},

	findStorage : function(creep){
		let target;

		if(creep.memory.subrole == 'tower')
			target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: s => s.structureType == STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
			});

		if(!target || !creep.memory.subrole)
			target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: structure => (structure.structureType == STRUCTURE_EXTENSION ||
					structure.structureType == STRUCTURE_SPAWN ||
					structure.structureType == STRUCTURE_TOWER) &&
					structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
			});

		if(!target)
			target = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter : s => s.structureType == STRUCTURE_STORAGE }).id;

		creep.memory.target = target.id
		creep.say('⚡ transfer');
	},

	/** @param {Creep} creep **/
	run : function(creep){
		if(!creep.memory.target || (creep.memory.transfer && creep.store[RESOURCE_ENERGY] == 0)){
			creep.memory.transfer = false;
			this.findSources(creep);
		}
		if(!creep.memory.transfer && creep.store.getFreeCapacity() == 0){
			creep.memory.transfer = true;
			this.findStorage(creep);
		}

		if(creep.memory.transfer){
			const target = Game.getObjectById(creep.memory.target);
			if(!target || (target.store.getFreeCapacity(RESOURCE_ENERGY) == 0))
				return this.findStorage(creep);
			if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
				creep.moveTo(target, { visualizePathStyle : { stroke : '#ffffff' } });
		}else{
			const target = Game.getObjectById(creep.memory.target);
			if(!target || !creep.memory.targetAction || (target.store && target.store[RESOURCE_ENERGY] == 0)) return this.findSources(creep);
			if(creep[creep.memory.targetAction](target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
				creep.moveTo(target, { visualizePathStyle : { stroke : '#ffaa00' } });
		}
	}
};
