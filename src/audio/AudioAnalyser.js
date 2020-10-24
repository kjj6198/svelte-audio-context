import { writable } from 'svelte/store';

function mapSpectrumToFrequency(n, sampleRate, fftSize) {
	return (n * sampleRate) / fftSize;
}

export function getPartialVolume(spectrum, from, to) {
  if (from > to) {
    throw new RangeError('from can not be larger than to.');
  }
  let sum = 0;
  for (let i = from; i < to; i += 1) {
    sum += spectrum[i] ** 2;
  }

  return Math.sqrt(sum / (to - from + 1));
}

export default class AudioAnalyser {
	constructor(source) {
		this.context = new AudioContext({ sampleRate: 44100 });
		this.sampleRate = 44100;
		this.analyser = this.context.createAnalyser();
		this.analyser.smoothingTimeConstant = 0.1;
		this.analyser.fftSize = 1024;
		this.source = this.context.createMediaElementSource(source);
		this.script = this.context.createScriptProcessor(1024 * 2, 1, 1);
		this.spectrum = new Uint8Array(this.analyser.frequencyBinCount);
		this.source.connect(this.analyser);
    this.store = writable(this.spectrum);
    
    this.process = this.process.bind(this);
    this.processNode = this.processNode.bind(this);
    this.stop = this.stop.bind(this);
    this.connect = this.connect.bind(this);
    this.destroy = this.destroy.bind(this);
	}
	
	process() {
		this.script.addEventListener('audioprocess', this.processNode);
	}
	
	processNode() {
    this.analyser.getByteFrequencyData(this.spectrum);
    const fre = this.mapNodeToFrequency()
    const arr = [...fre.veryLow, ...fre.low, ...fre.high, ...fre.h]
    if (arr.length <= 150) {
      arr.unshift(...Array.from({ length: 150 - arr.length }).fill(0))
    }

		this.store.set(arr);
	}
	
	stop() {
		this.script.removeEventListener('audioprocess', this.processNode);
  }

	connect() {
		this.analyser.connect(this.context.destination);
		this.analyser.connect(this.script);
		this.script.connect(this.context.destination);
	}
	
	destroy() {
		this.stop();
		this.context.close();
		this.source.disconnect();
		this.analyser.disconnect();
	}
	
	mapNodeToFrequency() {
    const highFreq = [];
    const HFreq = [];
    const midFreq = [];
    const lowFreq = [];
    const veryLowReq = [];
    const sampleRate = 44100;
    const fftSize = 1024;

    this.spectrum.forEach((v, i) => {
      const frequency = mapSpectrumToFrequency(i, sampleRate / 2, fftSize);
      if (frequency > 30 && frequency < 40) {
        veryLowReq.push(v);
      } else if (frequency >= 40 && frequency <= 220) {
        lowFreq.push(v);
      } else if (frequency > 220 && frequency <= 500) {
        midFreq.push(v);
      } else if (frequency >= 500 && frequency <= 1000) {
        highFreq.push(v);
      } else if (frequency >= 800 && frequency <= 3000) {
        HFreq.push(v);
      }
    });

    return {
      h: HFreq,
      high: highFreq,
      mid: midFreq,
      low: lowFreq,
      veryLow: veryLowReq,
    };
	}
}