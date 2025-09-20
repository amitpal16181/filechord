const { nanoid } = require("nanoid");

// In-memory store for active rooms
const rooms = new Map();

/**
 * Create a new room
 * @param {string} folderPath - Path of folder being shared
 * @param {number} expiryTime - Time in ms until room expires
 * @param {string} accessMode - "manual" or "open"
 * @returns {object} room data with roomId
 */
function createRoom(folderPath, expiryTime, accessMode = "manual") {
    const roomId = nanoid(12); // unique room ID
    const roomData = {
        folderPath,
        accessMode,
        createdAt: Date.now(),
        expiresAt: Date.now() + expiryTime,
        active: true,
    };
    rooms.set(roomId, roomData);
    return { roomId, ...roomData };
}

/**
 * Get room data by roomId
 * Returns null if room is expired or inactive
 */
function getRoom(roomId) {
    const room = rooms.get(roomId);
    if (!room) return null;

    if (Date.now() > room.expiresAt || !room.active) {
        rooms.delete(roomId);
        return null;
    }

    return room;
}

/**
 * Close a room manually
 */
function closeRoom(roomId) {
    if (rooms.has(roomId)) {
        rooms.get(roomId).active = false;
        rooms.delete(roomId);
    }
}

/**
 * Optional: Get all active rooms
 */
function getAllRooms() {
    return Array.from(rooms.values());
}

module.exports = {
    createRoom,
    getRoom,
    closeRoom,
    getAllRooms,
};
