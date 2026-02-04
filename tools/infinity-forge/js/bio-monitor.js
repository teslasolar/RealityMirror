// bio-monitor.js - Human Biological Dynamics Model
// ISA-95: Cell level - biophysical monitoring sub-agent
// Konomi Systems | Biophysical Applications
//
// kappa_biological = H(state) / H_max
// Optimal awareness: kappa = 0.6138
// Peak experience: kappa = 0.7-0.8
// Rest state: kappa = 0.3-0.4

import { PHI, INV_PHI } from './geometry.js';

export class HumanSystem {
  constructor() {
    this.state = {
      // Sensory channels
      S: {
        visual: 0.5,
        auditory: 0.4,
        tactile: 0.6,
        olfactory: 0.3,
        gustatory: 0.2
      },
      // Hormonal levels (normalized 0-1)
      H: {
        dopamine: 0.5,
        oxytocin: 0.4,
        serotonin: 0.6,
        cortisol: 0.3,
        endorphins: 0.4,
        testosterone: 0.5,
        estrogen: 0.5
      },
      // Nervous system state
      N: {
        sympathetic: 0.4,
        parasympathetic: 0.6,
        kappa_neural: 0.5
      }
    };
    this.kappa = INV_PHI;
    this.kappa_history = [];
    this.phase = 'baseline';
    this.resonance = 0;
    this.tick = 0;
  }

  entropy(values) {
    const sum = values.reduce((a, b) => a + b, 0);
    if (sum === 0) return 0;
    let H = 0;
    values.forEach(v => {
      const p = v / sum;
      if (p > 0) H -= p * Math.log2(p);
    });
    return H / Math.log2(values.length);
  }

  calculateKappa() {
    const S_entropy = this.entropy(Object.values(this.state.S));
    const H_entropy = this.entropy(Object.values(this.state.H));
    const N_balance = this.state.N.parasympathetic /
      (this.state.N.sympathetic + this.state.N.parasympathetic);

    this.kappa = S_entropy * 0.3 + H_entropy * 0.5 + N_balance * 0.2;

    // Natural convergence toward golden ratio
    this.kappa += (INV_PHI - this.kappa) * 0.05;

    this.kappa_history.push(this.kappa);
    if (this.kappa_history.length > 200) this.kappa_history.shift();

    return this.kappa;
  }

  // Simulate sensory input from scene metrics
  ingestSceneMetrics(metrics) {
    // Visual load from geometry complexity
    this.state.S.visual = Math.min(1, metrics.totalPoints / 800);
    // Auditory from entropy variance
    this.state.S.auditory = Math.min(1, metrics.avgEntropy * 2);

    // Dopamine from mutation events
    this.state.H.dopamine = 0.4 + metrics.mutations * 0.05;
    // Cortisol from agent energy variance
    this.state.H.cortisol = Math.max(0.1, 1 - metrics.avgEnergy);
    // Serotonin from kappa convergence
    this.state.H.serotonin = 0.3 + (1 - Math.abs(metrics.avgKappa - INV_PHI) * 3) * 0.5;
    // Endorphins from visual novelty
    this.state.H.endorphins = Math.min(1, metrics.taskDiversity * 0.2);

    // Neural balance shifts with scene intensity
    const intensity = metrics.totalPoints / 500;
    this.state.N.sympathetic = 0.3 + intensity * 0.2;
    this.state.N.parasympathetic = 1 - this.state.N.sympathetic;
    this.state.N.kappa_neural = this.calculateKappa();
  }

  // Simulate user reading/interaction patterns
  ingestUserMetrics(userMetrics) {
    // Mouse velocity affects sympathetic activation
    this.state.N.sympathetic = Math.min(0.9,
      this.state.N.sympathetic * 0.9 + userMetrics.mouseVelocity * 0.001);
    this.state.N.parasympathetic = 1 - this.state.N.sympathetic;

    // Scroll/interaction boosts dopamine
    this.state.H.dopamine = Math.min(1,
      this.state.H.dopamine * 0.95 + (userMetrics.interacting ? 0.1 : 0));

    // Idle time increases parasympathetic
    if (userMetrics.idleTime > 3000) {
      this.state.N.parasympathetic = Math.min(0.8,
        this.state.N.parasympathetic + 0.01);
      this.state.N.sympathetic = 1 - this.state.N.parasympathetic;
    }

    // Oxytocin from sustained engagement
    if (userMetrics.sessionDuration > 30000) {
      this.state.H.oxytocin = Math.min(0.9, this.state.H.oxytocin + 0.002);
    }
  }

  determinePhase() {
    if (this.kappa > 0.7) this.phase = 'peak';
    else if (this.kappa > 0.55) this.phase = 'flow';
    else if (this.kappa > 0.4) this.phase = 'baseline';
    else this.phase = 'rest';
    return this.phase;
  }

  update(sceneMetrics, userMetrics) {
    this.tick++;
    this.ingestSceneMetrics(sceneMetrics);
    this.ingestUserMetrics(userMetrics);
    this.calculateKappa();
    this.determinePhase();

    // Resonance: how close to golden ratio
    this.resonance = 1 - Math.abs(this.kappa - INV_PHI) * PHI;

    return this.getReport();
  }

  getReport() {
    return {
      kappa: this.kappa,
      phase: this.phase,
      resonance: this.resonance,
      sensory: { ...this.state.S },
      hormonal: { ...this.state.H },
      neural: { ...this.state.N },
      history: this.kappa_history.slice(-60)
    };
  }
}

// Sub-agent task runner for background monitoring
export class SubAgentMonitor {
  constructor() {
    this.tasks = [];
    this.completed = [];
    this.running = null;
  }

  enqueue(task) {
    this.tasks.push({
      id: this.tasks.length + this.completed.length,
      name: task.name,
      fn: task.fn,
      status: 'queued',
      result: null,
      queued_at: Date.now()
    });
  }

  async tick() {
    if (this.running) return;
    if (this.tasks.length === 0) return;

    const task = this.tasks.shift();
    task.status = 'running';
    task.started_at = Date.now();
    this.running = task;

    try {
      task.result = await task.fn();
      task.status = 'done';
    } catch (e) {
      task.status = 'error';
      task.result = e.message;
    }

    task.finished_at = Date.now();
    task.duration = task.finished_at - task.started_at;
    this.completed.push(task);
    this.running = null;

    // Keep last 50 completed
    if (this.completed.length > 50) this.completed.shift();
  }

  getStatus() {
    return {
      queued: this.tasks.length,
      running: this.running ? this.running.name : null,
      completed: this.completed.length,
      recent: this.completed.slice(-5).map(t => ({
        name: t.name,
        status: t.status,
        duration: t.duration
      }))
    };
  }
}
