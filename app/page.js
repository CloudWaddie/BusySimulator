'use client';

import { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';

export default function Home() {
  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || '';
  const [apps, setApps] = useState([]);
  const playerRefs = useRef({});
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
              const rand = Math.round(Math.random() * (500 * adjustedSpeed - 200 * adjustedSpeed) + 200 * adjustedSpeed);

              this.timeoutId = setTimeout(() => {
                if (playerRefs.current[app.id]?.sound.playing()) {
                    playerRefs.current[app.id]?.sound.stop();
                }
                playerRefs.current[app.id]?.sound.play();
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
      setTimeout(() => player.playLoop(), 0);
    } else {
      player.stopLoop();
    }
  };

  const updateSpeed = (id, speed) => {
    updateApp(id, { speed });
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
              <div className="app-icon">
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
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={app.speed} 
                className="slider" 
                onChange={(e) => updateSpeed(app.id, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
