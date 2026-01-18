import { useState, useEffect } from 'react'
import './styles/styles.css'
import './styles/App.css'

export default function App() {
  // const si = systeminformation;
  //state är saker som en komponent behöver minnas/komma ihåg. State finns inuti komponenten.
  //state = tillstånd.Tillstånd är att count = 0  
  //setCount används för att uppdatera state, vilket triggar re-render av relevanta element på webbplatsen. 
  const [stats, setStats] = useState(null);
  const [containers, setContainers] = useState([]);

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
    const intervalId = setInterval(fetchData, 1000 * 30);
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  return (
    <>
      <h1>EXPERIMENTAL UI</h1>
      <div className="container flex">
        <div className="stats-card">
          <h2>Network</h2>
          <div className='info'>
            {stats ? (
              (() => {
                const { uptime } = stats.time;
                return (
                  <>
                    {/* <p>Uptime: {uptime}</p> */}
                    <h3>Uptime: </h3>
                    <UptimeLogic uptime={uptime} />
                  </>
                )
              })()
            ) : <p>Loading uptime</p>}
          </div>
        </div>


           <div className="stats-card">
           <h2>System</h2>
            <div className='info'>

            { stats ? (
            (()=>{
              return(
                <>
                     <h3>Cpu</h3>
              {/* <p>Cpu Brand: {stats.cpu.brand}</p> */}
              <p>CPU Temp: {stats.cpuTemp.main}°C</p>
              {/* <p>CPU Vendor: {stats.cpu.vendor}</p> */}
              <h3>Memory</h3>
              <p>RAM total: <TotalMemoryCalculator bytes={stats.memory.total} /> GBs</p>
              <div>
                <MemoryUsage
                  total={stats.memory.total}
                  available={stats.memory.available}
                />
              </div>
                </>
              )
            }
          )()
            ): <>Loading Metrics</>}
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
                    <p>Status: {container.state}</p>
                    {/* <p>Uptime: {container.status}</p> */}
                    {/* <p>Mounts: {}</p> */}
                    {/* <p>Image: {container.image}</p> */}
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