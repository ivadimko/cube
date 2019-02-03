import '@/styles/main.scss';

import * as math from 'mathjs';
import * as dat from 'dat.gui';

class Sketch {
  constructor(selector) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.vw = window.innerWidth;
    this.vh = window.innerHeight;

    this.container = document.querySelector(selector);
    this.container.appendChild(this.canvas);

    this.dpi = window.devicePixelRatio;

    this.time = 0;

    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);

    this.points = new Array(8);
    this.projected2D = new Array(8);

    this.size = 100;
    this.distance = 2;

    this.setupSettings();
    this.setupResize();
    this.addObjects();


    this.resize();
    this.animate();
  }

  setupResize() {
    window.addEventListener('resize', this.resize);
  }

  setupSettings() {
    this.settings = {
      size: Math.min(Math.min(this.vw, this.vh) / 2, 500),
      distance: 2,
      rotationX: false,
      rotationY: true,
      rotationZ: false,
      orthographic: false,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, 'size', 20, 500);
    this.gui.add(this.settings, 'distance', 1, 10);
    this.gui.add(this.settings, 'rotationX');
    this.gui.add(this.settings, 'rotationY');
    this.gui.add(this.settings, 'rotationZ');
    this.gui.add(this.settings, 'orthographic');
  }


  resize() {
    this.vw = window.innerWidth;
    this.vh = window.innerHeight;
    this.canvas.width = this.vw * this.dpi;
    this.canvas.height = this.vh * this.dpi;
    this.canvas.style.width = `${this.vw}px`;
    this.canvas.style.height = `${this.vh}px`;
  }

  addObjects() {
    this.points[0] = [-0.5, -0.5, -0.5];
    this.points[1] = [0.5, -0.5, -0.5];
    this.points[2] = [0.5, 0.5, -0.5];
    this.points[3] = [-0.5, 0.5, -0.5];
    this.points[4] = [-0.5, -0.5, 0.5];
    this.points[5] = [0.5, -0.5, 0.5];
    this.points[6] = [0.5, 0.5, 0.5];
    this.points[7] = [-0.5, 0.5, 0.5];
  }


  animate() {
    this.time += 0.01;

    requestAnimationFrame(this.animate);

    this.render();
  }

  connectPoints(i, j) {
    this.ctx.strokeStyle = '#fff';
    this.ctx.beginPath();
    const a = this.projected2D[i];
    const b = this.projected2D[j];

    this.ctx.moveTo(a[0] * this.dpi * this.settings.size, a[1] * this.dpi * this.settings.size);
    this.ctx.lineTo(b[0] * this.dpi * this.settings.size, b[1] * this.dpi * this.settings.size);
    this.ctx.closePath();
    this.ctx.stroke();
  }

  render() {
    const rotationX = [
      [1, 0, 0],
      [0, Math.cos(this.time), -Math.sin(this.time)],
      [0, Math.sin(this.time), Math.cos(this.time)],
    ];

    const rotationY = [
      [Math.cos(this.time), 0, -Math.sin(this.time)],
      [0, 1, 0],
      [Math.sin(this.time), 0, Math.cos(this.time)],
    ];

    const rotationZ = [
      [Math.cos(this.time), -Math.sin(this.time), 0],
      [Math.sin(this.time), Math.cos(this.time), 0],
      [0, 0, 1],
    ];


    this.ctx.clearRect(0, 0, this.vw * this.dpi, this.vh * this.dpi);
    this.ctx.save();
    this.ctx.translate(this.vw * this.dpi / 2, this.vh * this.dpi / 2);
    this.ctx.fillStyle = '#fff';

    for (let i = 0; i < this.points.length; i += 1) {
      let rotated = this.points[i];
      rotated = this.settings.rotationX ? math.multiply(rotationX, rotated) : rotated;
      rotated = this.settings.rotationY ? math.multiply(rotationY, rotated) : rotated;
      rotated = this.settings.rotationZ ? math.multiply(rotationZ, rotated) : rotated;

      const z = 1 / (this.settings.distance - rotated[2]);

      const projection = this.settings.orthographic ?
        [
          [1 / this.settings.distance, 0, 0],
          [0, 1 / this.settings.distance, 0],
        ]
        :
        [
          [z, 0, 0],
          [0, z, 0],
        ];

      const projected2D = math.multiply(projection, rotated);
      this.projected2D[i] = projected2D;

      // const [x, y] = projected2D;
      // this.ctx.beginPath();
      // this.ctx.arc(x * this.dpi * this.size, y * this.dpi * this.size, 2, 0, 2 * Math.PI);
      // this.ctx.closePath();
      // this.ctx.fill();
    }

    for (let i = 0; i < 4; i += 1) {
      this.connectPoints(i, i + 4);
      this.connectPoints(i, (i + 1) % 4);
      this.connectPoints(i + 4, (i + 1) % 4 + 4);
    }
    this.ctx.restore();
  }
}

// eslint-disable-next-line no-new
new Sketch('#container');
