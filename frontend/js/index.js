const API_BASE = "http://localhost:3000";

// Create Room
document.getElementById("createRoomBtn").addEventListener("click", async () => {
    const folderPath = document.getElementById("folderPath").value;
    const expiryTime = Number(document.getElementById("expiryTime").value);
    const accessMode = document.getElementById("accessMode").value;

    try {
        const res = await fetch(`${API_BASE}/createRoom`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folderPath, expiryTime, accessMode }),
        });
        const data = await res.json();
        document.getElementById("roomResult").innerText = JSON.stringify(data, null, 2);
    } catch (err) {
        document.getElementById("roomResult").innerText = "Error: " + err.message;
    }
});

// Get Room Info
document.getElementById("getRoomBtn").addEventListener("click", async () => {
    const roomId = document.getElementById("roomIdInput").value.trim();
    if (!roomId) return alert("Enter Room ID");

    try {
        const res = await fetch(`${API_BASE}/room/${roomId}`);
        const data = await res.json();
        document.getElementById("roomInfo").innerText = JSON.stringify(data, null, 2);
    } catch (err) {
        document.getElementById("roomInfo").innerText = "Error: " + err.message;
    }
});


// Delete Room Info
// Delete Room
document.getElementById("getDeleteRoomBtn").addEventListener("click", async () => {
    const roomId = document.getElementById("roomIdInput").value.trim();
    const display = document.getElementById("roomDeletedInfo");
    if (!roomId) {
        display.innerText = JSON.stringify({ error: "Enter Room ID to delete" }, null, 2);
        return;
    }

    try {
        const res = await fetch(`http://localhost:5000/room/${roomId}`, {
            method: "DELETE",
        });
        const data = await res.json();
        display.innerText = JSON.stringify(data, null, 2);
        // Optionally clear the room info display
        document.getElementById("roomInfo").innerText = "";
    } catch (err) {
        display.innerText = JSON.stringify({ error: err.message }, null, 2);
    }
});
