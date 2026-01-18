import { useState, useEffect } from 'react'
import './styles/styles.css'
import './styles/App.css'

export default function App() {
  const [stats, setStats] = useState(null);
  const [containers, setContainers] = useState([]);

  const restartContainer = (id) => {
    fetch(`/docker/restart/${id}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        console.log(data.message);
      })
      .catch(err => console.error(err))
  }

  const stopContainer = (id) => {
    fetch(`/docker/stop/${id}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        console.log(data.message);
      })
      .catch(err => console.log(err))
  }
  const startContainer = (id) => {
    fetch(`/docker/start/${id}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        console.log(data.message);
      })
      .catch(err => console.log(err))
  }

  const CONTAINER_URLS = {
    'portainer': 'http://docker.pi',
    'homarr': 'http://homarr.pi',
    'pihole': 'http://pihole.pi',
    'nginx-proxy-manager': 'http://proxy.pi',
    'pi-ui': 'http://pi.ui/',
  };
  useEffect(() => {
    const fetchData = () => {
      fetch('/stats')
        .then(response => response.json())
        .then(data => setStats(data))
        .catch(err => console.error(err));
    };
    fetchData();
    const intervalId = setInterval(fetchData, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const fetchData = () => {
      fetch('/docker')
        .then(res => res.json())
        .then(data => setContainers(data))
        .catch(err => console.error("Docker fetch error:", err));
    };
    fetchData();
    const intervalId = setInterval(fetchData, 1000 * 10);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <h1 className='heading'>pi ui</h1>
      <div className="container flex">
        <div className="stats-card">
          <h2>Network</h2>
          <div className='info'>
        <p>No Information</p>
          </div>
        </div>
        <div className="stats-card">
          <h2>System</h2>
          <div className='info'>

            {stats ? (
              (() => {
                const { uptime } = stats.time;
                return (
                  <>
                    <h3>Cpu</h3>
                    {/* <p>Cpu Brand: {stats.cpu.brand}</p> */}
                    <p>CPU Temp: {stats.cpuTemp.main}°C</p>
                    {/* <p>CPU Vendor: {stats.cpu.vendor}</p> */}
                    <hr />
                    <h3>Memory</h3>
                    <p>RAM total: <TotalMemoryCalculator bytes={stats.memory.total} /> GBs</p>
                    <div>
                      <MemoryUsage
                        total={stats.memory.total}
                        available={stats.memory.available}
                      />
                    </div>
                    <hr />
                    <h3>Uptime: </h3>
                    <UptimeLogic uptime={uptime} />
                  </>
                )
              }
              )()
            ) : <>Loading Metrics</>}
          </div>
        </div>

        <div className="stats-card">
          <h2>Hosting</h2>
          <div className="info">
            {containers.length > 0 ? (
              containers.map((container) => {
                const cleanName = container.name.replace('/', '');
                const proxyUrl = CONTAINER_URLS[cleanName];
                const publicPort = container.ports?.[0]?.PublicPort;
                const fallbackUrl = publicPort ? `http://192.168.0.50:${publicPort}` : null;
                const finalUrl = proxyUrl || fallbackUrl;
                const displayUrl = new URL(finalUrl).hostname;
                return (
                  <div key={container.id} className="container-item">
                    <strong>{cleanName}</strong>
                    {displayUrl && (
                      <p>URL: <a href={finalUrl} target="_blank" rel="noreferrer">{displayUrl}</a></p>
                    )}

                    <p>
                      Status: <span className={container.state === "running" ? "running" : "stopped"}>
                        {container.state}
                      </span>
                    </p>
                    {/* <p>Uptime: {container.status}</p> */}
                    {/* <p>Mounts: {}</p> */}
                    {/* <p>Image: {container.image}</p> */}

                    <button className="dockerBtn btnStart" onClick={() => startContainer(container.id)}>
                      Start
                    </button>
                    <button className="dockerBtn btnStop" onClick={() => stopContainer(container.id)}>
                      Stop
                    </button>
                    <button className="dockerBtn btnRestart" onClick={() => restartContainer(container.id)}>
                      Restart
                    </button>
                    <hr />
                  </div>
                )
              })
            ) : (
              <p>No containers found.</p>
            )}
          </div>
        </div>
      </div>
    </>


  )
}

function UptimeLogic({ uptime }) {
  const totalSeconds = Math.floor(uptime);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return (
    <>
      {days + 'd, '} {hours + 'h, '}{minutes + 'm, '}{seconds + 's'}
    </>
  )
}

function TotalMemoryCalculator({ bytes }) {
  return (
    `${(bytes / Math.pow(1024, 3)).toFixed(2)}`
  )
}

function MemoryUsage({ total, available }) {
  // 1. Calculate used bytes
  const usedBytes = total - available;

  // 2. Convert to GB
  const usedGB = (usedBytes / Math.pow(1024, 3)).toFixed(2);

  // 3. Calculate percentage
  const usagePercentage = ((usedBytes / total) * 100).toFixed(1);

  return (
    <>
      <p>Usage: {usagePercentage}% / {usedGB} GB</p>
      {/* <p>Usage GB: {usedGB} GB</p> */}
    </>
  );
}