<script>
  import { onMount } from 'svelte';
  import AudioAnalyser from './audio/AudioAnalyser';
  import SpectrumCanvas from './audio/SpectrumCanvas';

  let audio;
  let canvas;
  onMount(() => {
    const analyser = new AudioAnalyser(audio);
    analyser.connect();
    audio.addEventListener('play', () => {
      analyser.process();
    });
    audio.addEventListener('pause', analyser.stop);
    console.log(analyser.totalVolume);
    const drawer = new SpectrumCanvas(canvas.getContext('2d'), 105);

    analyser.store.subscribe((spectrum) => {
      console.log(spectrum);
      drawer.draw(spectrum);
    });
  });

  export let name;
</script>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
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
</style>

<main>
  <audio bind:this={audio} src="music.mp3" controls />
  <canvas bind:this={canvas} width="1000" height="1000" />
</main>
