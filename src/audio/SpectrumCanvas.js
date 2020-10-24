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


export default class WaveformCanvas {
  constructor(
    ctx,
    radius,
  ) {
    this.ctx = ctx;
    this.radius = radius;
    this.rotation = 0;
  }

  clearRotation() {
    this.rotation = 0;
    this.draw();
  }

  spectrumToPoints(spectrum) {
    const result = [];
    const interval = Math.floor(spectrum.length);
    let volume = 0;
    spectrum.forEach((val) => {
      volume += val ** 2;
    });

    volume /= spectrum.length;
    volume = Math.sqrt(volume);

    for (let i = 0; i < spectrum.length; i += 1) {
      result.push(getPartialVolume(spectrum, i, i + 1) / volume);
    }

    this.points = result.map((vol, i) => {
      const angle = (i / result.length) * 360 * (Math.PI / 180);
      return {
        x: Math.cos(angle) * this.radius,
        y: Math.sin(angle) * this.radius,
        volume: vol,
        angle,
      };
    });
  }

  draw(spectrum) {
    const { ctx, radius } = this;
    console.log(spectrum);
    this.spectrumToPoints(spectrum);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    ctx.translate(20, ctx.canvas.height / 2);
    ctx.lineWidth = 4;
    this.points.forEach((p, i) => {
      ctx.strokeStyle = `hsl(${180 / Math.PI * p.angle}, 100%, 50%)`;
      ctx.beginPath();
      ctx.moveTo(i * 8, 500);
      ctx.lineTo(i * 8, 500 - (p.volume * 100 + 4));
      ctx.stroke();
    });
    ctx.restore();
  }
}
