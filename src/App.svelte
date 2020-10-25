<script>
  import { onMount, onDestroy } from 'svelte';
  import AudioAnalyser from './audio/AudioAnalyser';
  import SpectrumCanvas from './audio/SpectrumCanvas';

  let audio;
  let canvas;
  let analyser;
  let spectrum = [];
  let userPerformAction = false;

  $: {
    if (audio && userPerformAction) {
      analyser = new AudioAnalyser(audio);
      analyser.connect();

      analyser.process();

      audio.addEventListener('pause', analyser.stop);
    }
  }

  $: {
    if (analyser) {
      analyser.store.subscribe((volume) => {
        spectrum = volume;
      });
    }
  }

  export let name;
</script>

<style>
  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

  canvas {
    display: block;
    width: 500px;
    height: 500px;
  }

  .spectrum {
    position: absolute;
    bottom: 0;
    left: 0;
    display: inline-block;
    width: 3px;
    height: 500px;
    background-color: #27cc95;
    margin-right: 2px;
    transition: transform ease 0.2s;
    transform: scale(0.01);
    transform-origin: center bottom;
  }

  .container {
    position: relative;
    height: 500px;
    width: 100%;
    margin: 0 auto;
  }
</style>

<main>
  <audio
    on:play={() => {
      userPerformAction = true;
      analyser.process();
    }}
    bind:this={audio}
    src="music.mp3"
    controls />
  <div class="container">
    {#each spectrum as vol, i}
      <span
        class="spectrum"
        style="transform: scale(1, {vol / 255 + 0.005}); left: {i * 5}px;
        background-color: hsl({(180 / Math.PI) * ((i / spectrum.length) * 360 * (Math.PI / 180))},
        100%, 50%)" />
    {/each}
  </div>
</main>
