export default function Home() {
  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || '';

  return (
    <header style={{background: `url('${assetPrefix}/logo.png') top center no-repeat`, backgroundSize: 'contain'}}>
      <h1 style={{display: 'none'}}>Busy Simulator</h1>
      <div id="bubble">
        <h2>Feign importance with repeating app sounds!</h2>
        Click an app to begin.
        <strong id="mobile-tip">(HINT: Turn phone off silent)</strong>
      </div>
    </header>
  );
}
