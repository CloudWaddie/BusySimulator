'use client';

import { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';

export default function Home() {
  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || '';
  const [apps, setApps] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const playerRefs = useRef({});
  const iconRefs = useRef({});
  const appsRef = useRef(apps);
  appsRef.current = apps;

  // Effect to fetch app configuration
  useEffect(() => {
    fetch(`${assetPrefix}/config.json`)
      .then((res) => res.json())
      .then((data) => {
        const initialAppsState = data.map(app => ({
          ...app,
          isPlaying: false,
          notificationCount: 0,
          speed: 50,
        }));
        setApps(initialAppsState);
      });
  }, [assetPrefix]);

  // Effect to initialize players
  useEffect(() => {
    if (apps.length > 0) {
      apps.forEach(app => {
        if (!playerRefs.current[app.id]) {
          const sound = new Howl({
            src: [`${assetPrefix}/sounds/${app.sound}`],
            loop: false
          });

          playerRefs.current[app.id] = {
            sound: sound,
            timeoutId: null,
            playLoop: function() {
              const appState = appsRef.current.find(a => a.id === app.id);
              if (!appState || !appState.isPlaying) {
                this.stopLoop();
                return;
              }

              const adjustedSpeed = Math.pow(parseInt(appState.speed) + 15, 1.2) / 10;
              const rand = Math.round(Math.random() * (800 * adjustedSpeed - 100 * adjustedSpeed) + 100 * adjustedSpeed);

              this.timeoutId = setTimeout(() => {
                if (playerRefs.current[app.id]?.sound.playing()) {
                    playerRefs.current[app.id]?.sound.stop();
                }
                playerRefs.current[app.id]?.sound.play();
                
                const iconEl = iconRefs.current[app.id];
                if (iconEl) {
                  iconEl.classList.add('bouncing');
                  setTimeout(() => {
                    iconEl.classList.remove('bouncing');
                  }, 500); // Animation duration
                }

                updateApp(app.id, { notificationCount: appState.notificationCount + 1 });
                this.playLoop();
              }, rand);
            },
            stopLoop: function() {
              clearTimeout(this.timeoutId);
              this.sound.stop();
            }
          };
        }
      });
    }

    return () => {
      Object.values(playerRefs.current).forEach(player => {
        player.stopLoop();
      });
    };
  }, [apps.length, assetPrefix]);

  const updateApp = (id, updates) => {
    setApps(prevApps =>
      prevApps.map(app => (app.id === id ? { ...app, ...updates } : app))
    );
  };

  const togglePlay = (id) => {
    const app = apps.find(a => a.id === id);
    if (!app) return;

    const player = playerRefs.current[id];
    const isPlaying = !app.isPlaying;

    updateApp(id, { isPlaying, notificationCount: isPlaying ? 1 : 0 });

    if (isPlaying) {
      player.sound.play();
      const iconEl = iconRefs.current[id];
      if (iconEl) {
        iconEl.classList.add('bouncing');
        setTimeout(() => {
          iconEl.classList.remove('bouncing');
        }, 500); // Animation duration
      }
      setTimeout(() => player.playLoop(), 0);
    } else {
      player.stopLoop();
    }
  };

  const updateSpeed = (id, speed) => {
    updateApp(id, { speed });
  };

  const stopAll = () => {
    setApps(prevApps =>
      prevApps.map(app => ({ ...app, isPlaying: false, notificationCount: 0 }))
    );
    Object.values(playerRefs.current).forEach(player => {
      player.stopLoop();
    });
  };

  return (
    <>
      <header style={{background: `url('${assetPrefix}/logo.png') top center no-repeat`, backgroundSize: 'contain'}}>
        <h1 style={{display: 'none'}}>Busy Simulator</h1>
        <div id="bubble">
          <h2>Feign importance with repeating app sounds!</h2>
          Click an app to begin.
          <strong id="mobile-tip">(HINT: Turn phone off silent)</strong>
        </div>
      </header>
      <div className="container">
        {apps.map((app) => (
          <div id={app.id} className="app" key={app.id}>
            <a onClick={(e) => { e.preventDefault(); togglePlay(app.id); }} href="#">
              <div className="app-icon" ref={el => iconRefs.current[app.id] = el}>
                <img src={`${assetPrefix}/icons/${app.icon}`} alt={app.name} draggable={false} />
                <div
                  className={'badge'} 
                  style={{ display: app.notificationCount > 0 ? 'block' : 'none' }}
                >
                  {app.notificationCount}
                </div>
              </div>
              <label className={app.isPlaying ? 'selected' : ''}>{app.name}</label>
            </a>
            <div className="slidecontainer">
              <label className="speed-label">Faster</label>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={app.speed} 
                className="slider" 
                onChange={(e) => updateSpeed(app.id, e.target.value)}
              />
              <label className="speed-label">Slower</label>
            </div>
          </div>
        ))}
        <div id="stopall" className="app">
          <a onClick={(e) => { e.preventDefault(); stopAll(); }} href="#">
            <img src={`${assetPrefix}/icons/stop.png`} alt="Stop All" draggable={false} />
            <label>Stop all</label>
          </a>
        </div>
        <div id="about" className="app">
          <a onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }} href="#">
            <img src={`${assetPrefix}/icons/bonzi.png`} alt="About" draggable={false} />
            <label>About</label>
          </a>
        </div>
        <div className="filling-empty-space-childs"></div>
        <div className="filling-empty-space-childs"></div>
        <div className="filling-empty-space-childs"></div>
        <div className="filling-empty-space-childs"></div>
        <div className="filling-empty-space-childs"></div>
      </div>
      {isModalOpen && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <span className="close-button" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2>Busy Simulator</h2>
            <p>Pretend you're busy by playing a bunch of app notification sounds.</p>
            <p>Click on the app icon to start its notifications. Use the sliders to increase the speed of the insanity or whatever.</p>
            <p>Tip: turn "Original Sound" to On on Zoom for best effect.</p>
            <p>Original by <a href="https://twitter.com/lanewinfield" target="_blank" rel="noopener noreferrer">Brian Moore</a></p>
            <p>This version by <a href="https://github.com/cloudwaddie" target="_blank" rel="noopener">CloudWaddie</a></p>
            <p>Want to get an app added? Just create an issue on the github page <a href="https://github.com/cloudwaddie/BusySimulator" target="_blank" rel="noopener">here</a></p>
          </div>
        </div>
      )}
    </>
  );
}
