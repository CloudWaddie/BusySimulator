import Image from "next/image";

export default function Home() {
  return (
    <header>
      <h1 style={{display: 'none'}}>Busy Simulator</h1>
      <div id="bubble">
        <h2>Feign importance with repeating app sounds!</h2>
        Click an app to begin.
        <strong id="mobile-tip">(HINT: Turn phone off silent)</strong>
      </div>
    </header>
  );
}
