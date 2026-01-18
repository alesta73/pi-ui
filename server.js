const express = require('express');
const si = require("systeminformation");
const path = require('path');
const app = express();
const port = 3001;

// 1. SERVE STATIC FILES (The React App)
// Vite outputs the build to the 'dist' folder.
app.use(express.static(path.join(__dirname, 'dist')));

// 2. API ROUTES (The Data)
app.get('/stats', async (req, res) => {
    try {
        const [cpu, cpuTemp, mem, os] = await Promise.all([
            si.cpu(),
            si.cpuTemperature(),
            si.mem(),
            si.osInfo()
        ]);
        const time = si.time();
        res.json({ cpu, cpuTemp, memory: mem, time, os });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/docker', async (req, res) => {
    try {
        const containers = await si.dockerContainers(true);
        res.json(containers);
    } catch {
        res.status(500).json({ error: "Docker socket access failed" });
    }
});

// 3. FALLBACK ROUTE
// If the request isn't for /stats or /docker, send the React app.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});