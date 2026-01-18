const express = require('express');
const si = require("systeminformation");
const path = require('path');
const app = express();
const port = 3001;
const Docker = require('dockerode');
const docker = new Docker({socketPath: '/var/run/docker.sock'});

// console.log(docker.getContainer(id));
app.use(express.static(path.join(__dirname, 'dist')));


app.post('/docker/restart/:id', async (req, res)=>{
    try{
        const container = docker.getContainer(req.params.id);
        await container.restart();
        res.json({message: "Restarted"})
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
});
app.post('/docker/stop/:id', async (req, res)=>{
    try{
        const container = docker.getContainer(req.params.id);
        await container.stop();
        res.json({message: "Stopped"})
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
});

app.post('/docker/start/:id', async (req, res)=>{
    try{
        const container = docker.getContainer(req.params.id);
        await container.start();
        res.json({message: "Started"})
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
});

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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});