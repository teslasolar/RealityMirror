// geometry.js - Geometry agent system
// ISA-95: Cell level - individual production units

const PHI = (1 + Math.sqrt(5)) / 2;
const INV_PHI = 1 / PHI;
const TAU = Math.PI * 2;

export { PHI, INV_PHI, TAU };

export class GeometryAgent {
  constructor(id) {
    this.id = id;
    this.kappa = INV_PHI + (Math.random() - 0.5) * 0.2;
    this.phase = Math.random() * TAU;
    this.freq = 0.5 + Math.random() * 2;
    this.timeline = [-1, 0, 1][Math.floor(Math.random() * 3)];
    this.task = ['spiral','wave','fractal','torus','crystal','helix','mobius','klein'][Math.floor(Math.random() * 8)];
    this.output = [];
    this.age = 0;
    this.energy = 1.0;
    this.mutations = 0;
  }

  entropy() {
    return -this.kappa * Math.log2(this.kappa + 1e-10) * Math.exp(-Math.abs(this.kappa - INV_PHI) * PHI);
  }

  generate(time) {
    this.age++;
    const pts = [], e = this.entropy(), k = this.kappa;
    const p = this.phase + time * 0.01 * this.freq;

    switch(this.task) {
      case 'spiral':
        for (let t = 0; t < 60; t++) {
          let r = Math.pow(PHI, t * 0.1 * k);
          let a = t * k * 0.5 + p;
          pts.push({
            x: Math.cos(a) * r * 0.3,
            y: t * 0.1 - 3 + Math.sin(p + t * 0.2) * e,
            z: Math.sin(a) * r * 0.3
          });
        }
        break;

      case 'wave':
        for (let i = 0; i < 80; i++) {
          let u = i / 80 * TAU;
          pts.push({
            x: Math.cos(u * 3 + p) * (2 + Math.sin(u * 5 + p * 2) * k),
            y: Math.sin(u * 7 + p) * e * 2,
            z: Math.sin(u * 3 + p) * (2 + Math.cos(u * 5 + p * 2) * k)
          });
        }
        break;

      case 'fractal':
        let fx = 0, fy = 0, fz = 0;
        for (let i = 0; i < 100; i++) {
          let r = Math.random();
          if (r < 0.33) { fx = fx * k; fy = fy * k + 1.6; fz = fz * k; }
          else if (r < 0.66) {
            fx = k * fx - k * fy + p * 0.1;
            fy = k * fx + k * fy;
            fz = Math.sin(i * 0.1 + p) * e;
          } else {
            fx = -k * fx + k * fy;
            fy = k * fx + k * fy + 0.44;
            fz = Math.cos(i * 0.1 + p) * e;
          }
          pts.push({ x: fx * 2, y: fy - 5, z: fz * 2 });
        }
        break;

      case 'torus':
        for (let u = 0; u < 50; u++) {
          let uu = u / 50 * TAU + p;
          let R = 2 + Math.sin(uu * 3 + p) * k;
          let r = 0.5 + Math.sin(uu * 7 + p * 2) * e * 0.5;
          for (let v = 0; v < 4; v++) {
            let vv = v / 4 * TAU + p * 2;
            pts.push({
              x: (R + r * Math.cos(vv)) * Math.cos(uu),
              y: r * Math.sin(vv),
              z: (R + r * Math.cos(vv)) * Math.sin(uu)
            });
          }
        }
        break;

      case 'crystal':
        const faces = [[1,1,1],[-1,1,1],[1,-1,1],[1,1,-1],[-1,-1,1],[-1,1,-1],[1,-1,-1],[-1,-1,-1]];
        faces.forEach((f, i) => {
          let s = 1.5 + Math.sin(p + i) * k * 0.5;
          for (let j = 0; j < 12; j++) {
            let t = j / 12;
            pts.push({
              x: f[0] * s * (1 - t + Math.sin(p * 2 + j) * e * 0.2),
              y: f[1] * s * (1 - t + Math.cos(p * 2 + j) * e * 0.2),
              z: f[2] * s * (1 - t + Math.sin(p * 3 + j) * e * 0.2)
            });
          }
        });
        break;

      case 'helix':
        for (let t = 0; t < 100; t++) {
          let angle = t * 0.15 + p;
          let r1 = 2 + Math.sin(t * 0.05 + p) * k;
          let r2 = 1.5 + Math.cos(t * 0.07 + p * 1.3) * k * 0.5;
          pts.push({
            x: Math.cos(angle) * r1 + Math.cos(angle * PHI) * r2 * 0.3,
            y: (t - 50) * 0.08 + Math.sin(t * 0.03 + p) * e,
            z: Math.sin(angle) * r1 + Math.sin(angle * PHI) * r2 * 0.3
          });
        }
        break;

      case 'mobius':
        for (let u = 0; u < 80; u++) {
          let uu = u / 80 * TAU + p;
          let halfU = uu / 2;
          for (let v = 0; v < 2; v++) {
            let vv = (v - 0.5) * 0.8;
            pts.push({
              x: (2 + vv * Math.cos(halfU)) * Math.cos(uu) * (1 + e * 0.2 * Math.sin(p * 3)),
              y: (2 + vv * Math.cos(halfU)) * Math.sin(uu) * k,
              z: vv * Math.sin(halfU) * (1 + e * 0.3)
            });
          }
        }
        break;

      case 'klein':
        for (let u = 0; u < 40; u++) {
          let uu = u / 40 * TAU + p;
          for (let v = 0; v < 3; v++) {
            let vv = v / 3 * TAU + p * 0.5;
            let r = 4 * (1 - Math.cos(uu) / 2);
            pts.push({
              x: (6 * (1 + Math.sin(uu)) + r * Math.cos(vv + TAU)) * 0.2 * k,
              y: r * Math.sin(vv) * 0.3 * (1 + e * 0.5),
              z: -16 * Math.sin(uu) * 0.15 * k
            });
          }
        }
        break;
    }

    this.output = pts;

    // Mutation: occasionally shift task
    if (Math.random() < 0.002) {
      this.task = ['spiral','wave','fractal','torus','crystal','helix','mobius','klein'][Math.floor(Math.random() * 8)];
      this.mutations++;
    }

    // Drift toward golden ratio
    if (Math.random() < 0.05) {
      this.kappa += (INV_PHI - this.kappa) * 0.1;
    }

    // Energy decay and renewal
    this.energy = 0.5 + Math.sin(time * 0.001 + this.id) * 0.5;

    return pts;
  }

  getStatus() {
    return {
      id: this.id,
      task: this.task,
      timeline: this.timeline,
      kappa: this.kappa,
      entropy: this.entropy(),
      energy: this.energy,
      age: this.age,
      mutations: this.mutations,
      points: this.output.length
    };
  }
}
