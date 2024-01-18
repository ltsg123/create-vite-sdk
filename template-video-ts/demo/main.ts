import { setupCamera } from "./media";
import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Agora Extension</h1>
    <span>Extension 1: <span>
    <button id="ext-switch">ENABLE</button>
    <span>Extension 2: <span>
    <button id="ext2-switch">ENABLE</button>
    <div class="card">
      <section class="player-card">
        <div class="card-header">
          Origin Stream
        </div>
        <div class="card-body">
        <video id="before-extension" class="player" autoplay muted width="700" height="400">
          
        </video>
      </section>
      <section class="player-card">
        <div class="card-header">
          Use Insertable Stream
        </div>
        <div class="card-body">
        <video id="after-extension" class="player" autoplay muted width="700" height="400">
        
        </video>
      </section>

      <section class="player-card">
        <div class="card-header">
          Use Web GL
        </div>
        <div class="card-body">
        <video id="canvas-extension" class="player" autoplay muted width="700" height="400">
        
        </video>
      </section>
  </div>
`;

setupCamera(document.querySelector<HTMLVideoElement>("#before-extension")!);
