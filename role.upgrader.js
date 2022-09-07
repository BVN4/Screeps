module.exports = {

	findSources : function(creep){
		const targets = creep.room.find(FIND_SOURCES);
		creep.memory.target = targets[1].id;
		creep.say('🔄 harvest');
	},

	/** @param {Creep} creep **/
	run: function(creep) {

		if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
			creep.memory.upgrading = false;
			this.findSources(creep);
			creep.say('🔄 harvest');
		}
		if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
			creep.memory.upgrading = true;
			creep.say('⚡ upgrade');
		}

		if(creep.memory.upgrading) {
			if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
			}
		}
		else {
			const target = Game.getObjectById(creep.memory.target);
			if(!target) this.findSources(creep);
			if(creep.harvest(target) == ERR_NOT_IN_RANGE)
				creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
		}
	}
};
