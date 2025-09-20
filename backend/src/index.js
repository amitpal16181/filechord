// Minimal Express + Socket.IO starter with a file index endpoint
require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { indexFilesForRoot } = require('./services/indexer');
const { createRoom, getRoom, closeRoom } = require("./utils/roomManager");

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Home Route
app.get("/", (req, res) => {
  res.send("FileChord backend is running!");
});

// Health
app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

// Create room
app.post("/createRoom", (req, res) => {
  const { folderPath, expiryTime, accessMode } = req.body;
  const room = createRoom(folderPath, expiryTime, accessMode);
  res.json({ success: true, room });
});

// Simple: one room "demo" bound to DEFAULT_SHARING_ROOT
const ROOM_ID = 'demo';
const SHARING_ROOT = path.resolve(process.env.DEFAULT_SHARING_ROOT || path.join(__dirname, '..', '..', 'sharing'));

// Index files at startup (in-memory index)
const index = indexFilesForRoot(SHARING_ROOT);


// Generated Room 
app.get("/room/:roomId", (req, res) => {
  const room = getRoom(req.params.roomId);
  if (!room) return res.status(404).json({ error: "Room expired or not found" });
  res.json({ success: true, room });
});

// List files for room
app.get('/rooms/:roomId/files', (req, res) => {
    const { roomId } = req.params;
    if (roomId !== ROOM_ID) return res.status(404).json({ error: 'Room not found!' });
    return res.json({ roomId, root: SHARING_ROOT, files: Object.values(index) });
});

// Basic range-aware download endpoint
app.get('/rooms/:roomId/download/:fileId', (req, res) => {
    try {
        const { roomId, fileId } = req.params;
        if (roomId !== ROOM_ID) return res.status(404).json({ error: 'room not found' });
        const fileMeta = index[fileId];
        if (!fileMeta) return res.status(404).json({ error: 'file not found' });

        const fullPath = path.join(SHARING_ROOT, fileMeta.relPath);
        const stat = require('fs').statSync(fullPath);
        const fileSize = stat.size;
        const range = req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = (end - start) + 1;
            const file = require('fs').createReadStream(fullPath, { start, end });
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${path.basename(fullPath)}"`
            });
            file.pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${path.basename(fullPath)}"`
            });
            require('fs').createReadStream(fullPath).pipe(res);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});


// Room Deletion
app.delete("/room/:roomId", (req, res) => {
  closeRoom(req.params.roomId);
  res.json({ success: true, message: "Room closed" });
});

// Socket.IO for notifications (later)
io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
    socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

// Start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT} (room: ${ROOM_ID})`));
