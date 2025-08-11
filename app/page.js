'use client';

import { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';

export default function Home() {
  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || '';
  const [apps, setApps] = useState([]);
  const playerRefs = useRef({});

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
            loop: false,
          });

          playerRefs.current[app.id] = {
            sound: sound,
            timeoutId: null,
            playLoop: function(appState, updateApp) {
              const adjustedSpeed = Math.pow(parseInt(appState.speed) + 15, 1.2) / 10;
              const rand = Math.round(Math.random() * (500 * adjustedSpeed - 200 * adjustedSpeed) + 200 * adjustedSpeed);

              this.timeoutId = setTimeout(() => {
                if (playerRefs.current[app.id]?.sound.playing()) {
                    // The sound might be finishing from the last play, stop it before playing again
                    playerRefs.current[app.id]?.sound.stop();
                }
                playerRefs.current[app.id]?.sound.play();
                const newCount = appState.notificationCount + 1;
                updateApp(app.id, { notificationCount: newCount });
                this.playLoop(
                    {...appState, notificationCount: newCount}, 
                    updateApp
                );
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

    // Cleanup on unmount
    return () => {
      Object.values(playerRefs.current).forEach(player => {
        player.stopLoop();
      });
    };
  }, [apps, assetPrefix]);

  const updateApp = (id, updates) => {
    setApps(prevApps =>
      prevApps.map(app => (app.id === id ? { ...app, ...updates } : app))
    );
  };

  const togglePlay = (id) => {
    const app = apps.find(a => a.id === id);
    if (!app) return;

    const player = playerRefs.current[id];
    if (app.isPlaying) {
      player.stopLoop();
      updateApp(id, { isPlaying: false, notificationCount: 0 });
    } else {
      const newCount = 1;
      updateApp(id, { isPlaying: true, notificationCount: newCount });
      player.sound.play();
      player.playLoop(
        { ...app, isPlaying: true, notificationCount: newCount },
        updateApp
      );
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
