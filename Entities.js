const hasEnergy = e => e.store[RESOURCE_ENERGY] !== 0;

class Entities {

	sourcesActive;

	ruins;

	tombstones;

	droppedResources;

	storages;

	spawn;

	/**
	 * @param {Room} room
	 * @constructor
	 */
	constructor(room){
		this.spawn = room.find(FIND_MY_SPAWNS)[0];

		this.sourcesActive = room.find(FIND_SOURCES_ACTIVE);
		this.ruins = room.find(FIND_RUINS, { filter: hasEnergy });
		this.tombstones = room.find(FIND_TOMBSTONES, { filter: hasEnergy });
		this.droppedResources = room.find(FIND_DROPPED_RESOURCES);

		this.storages = room.find(FIND_MY_STRUCTURES, { filter: e => e.structureType === STRUCTURE_STORAGE && hasEnergy(e) });
	}

}