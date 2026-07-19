/* ============================================================
   BeeMaster AI — Risk Engine
   Computes 6-axis risk scores (0–100) from hive + season data.
   Implements workflows/risk-engine.md
   ============================================================ */

(function (global) {
  'use strict';

  // Season classification by month (Northern Hemisphere)
  function getSeason(date) {
    const m = new Date(date).getMonth() + 1;
    if (m >= 3 && m <= 5) return 'spring';
    if (m >= 6 && m <= 8) return 'summer';
    if (m >= 9 && m <= 11) return 'autumn';
    return 'winter';
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function varroaScore(perHundred, season) {
    // BIP thresholds:
    //   spring 2, summer 3, late-summer 3, autumn 1
    // Convert to risk 0–100
    const thresholds = { spring: 2, summer: 3, autumn: 1, winter: 1 };
    const t = thresholds[season] ?? 2;
    if (perHundred <= 0) return 5;
    // Up to 4× threshold = full risk
    return clamp(Math.round((perHundred / (t * 4)) * 100), 0, 100);
  }

  function swarmScore({ queenCells = 0, framesOfBees = 5, framesOfBrood = 4, queenAgeMonths = 12, season }) {
    let s = 0;
    // Queen cells — biggest signal
    s += Math.min(60, queenCells * 15);
    // Congestion: bees / brood > 2.5
    if (framesOfBrood > 0) {
      const ratio = framesOfBees / framesOfBrood;
      if (ratio > 2.5) s += 15;
      else if (ratio > 2) s += 8;
    }
    // Old queen
    if (queenAgeMonths > 24) s += 15;
    else if (queenAgeMonths > 18) s += 8;
    // Season
    if (season === 'spring' || season === 'summer') s += 10;
    return clamp(s, 0, 100);
  }

  function starvationScore({ framesOfStores = 4, framesOfBees = 5, daysToFlowEnd = 30, season }) {
    let s = 0;
    // Stores low
    if (framesOfStores < 2) s += 50;
    else if (framesOfStores < 4) s += 30;
    else if (framesOfStores < 6) s += 15;
    // More bees = faster consumption
    if (framesOfBees > 8) s += 10;
    else if (framesOfBees > 6) s += 5;
    // Late season / winter
    if (season === 'autumn') s += 15;
    if (season === 'winter') s += 25;
    // Days to flow end
    if (daysToFlowEnd < 14) s += 10;
    return clamp(s, 0, 100);
  }

  function queenFailureScore({ queenSeen = true, eggsSeen = true, queenAgeMonths = 12, broodPattern = 'solid', droneCellsExcess = false }) {
    let s = 0;
    if (!queenSeen) s += 15;
    if (!eggsSeen) s += 30;
    if (queenAgeMonths > 24) s += 20;
    else if (queenAgeMonths > 18) s += 10;
    if (broodPattern === 'scattered' || broodPattern === 'shotgun') s += 25;
    if (droneCellsExcess) s += 15;
    return clamp(s, 0, 100);
  }

  function honeyProductionScore({ foragingActive = true, flowStrength = 'moderate', framesOfBees = 5, supersAdded = 1 }) {
    // Higher score = better production potential
    let s = 50; // baseline
    if (foragingActive) s += 15;
    if (flowStrength === 'strong') s += 20;
    else if (flowStrength === 'moderate') s += 10;
    else if (flowStrength === 'weak') s -= 10;
    else if (flowStrength === 'dearth') s -= 30;
    if (framesOfBees >= 8) s += 10;
    else if (framesOfBees < 4) s -= 15;
    if (supersAdded >= 2) s += 5;
    return clamp(s, 0, 100);
  }

  function winterSurvivalScore({ varroaPerHundred = 0, framesOfStores = 4, queenAgeMonths = 12, framesOfBees = 5, season }) {
    // Higher = better survival
    let s = 80;
    // Varroa penalty (heaviest)
    if (varroaPerHundred > 3) s -= 40;
    else if (varroaPerHundred > 2) s -= 25;
    else if (varroaPerHundred > 1) s -= 10;
    // Stores
    if (framesOfStores < 4) s -= 25;
    else if (framesOfStores < 6) s -= 10;
    else if (framesOfStores >= 8) s += 5;
    // Queen
    if (queenAgeMonths > 24) s -= 15;
    else if (queenAgeMonths > 18) s -= 8;
    // Cluster size
    if (framesOfBees < 4) s -= 20;
    else if (framesOfBees >= 8) s += 5;
    return clamp(s, 0, 100);
  }

  // Main entry — given a hive + inspections, compute the 6-axis score.
  function compute(hive, latestInspection, options = {}) {
    const today = options.date ? new Date(options.date) : new Date();
    const season = getSeason(today);

    const ins = latestInspection || {};
    const framesOfBees = ins.framesOfBees ?? 5;
    const framesOfBrood = ins.framesOfBrood ?? 4;
    const framesOfStores = ins.framesOfStores ?? 4;
    const varroaPerHundred = ins.varroaPer100 ?? 0;
    const queenSeen = ins.queenSeen ?? true;
    const eggsSeen = ins.eggsSeen ?? true;
    const broodPattern = ins.broodPattern ?? 'solid';
    const queenCells = ins.queenCells ?? 0;
    const queenCellType = ins.queenCellType ?? 'none';

    const queenAgeMonths = hive ? queenAgeInMonths(hive, today) : 12;

    const disease = varroaScore(varroaPerHundred, season);
    const swarm = swarmScore({
      queenCells, framesOfBees, framesOfBrood, queenAgeMonths, season,
    });
    const starvation = starvationScore({ framesOfStores, framesOfBees, season });
    const queenFailure = queenFailureScore({
      queenSeen, eggsSeen, queenAgeMonths, broodPattern,
    });
    const honey = honeyProductionScore({
      foragingActive: ins.foragingActive ?? true,
      flowStrength: ins.flowStrength ?? 'moderate',
      framesOfBees, supersAdded: ins.supersAdded ?? 1,
    });
    const winter = winterSurvivalScore({
      varroaPerHundred, framesOfStores, queenAgeMonths, framesOfBees, season,
    });

    return {
      disease,
      swarm,
      starvation,
      queenFailure,
      honeyProduction: honey,
      winterSurvival: winter,
      computedAt: today.toISOString(),
      season,
      inputs: {
        framesOfBees, framesOfBrood, framesOfStores,
        varroaPerHundred, queenSeen, eggsSeen, broodPattern,
        queenCells, queenAgeMonths,
      },
    };
  }

  function queenAgeInMonths(hive, now) {
    if (!hive || !hive.queenInstalled) return 12;
    const installed = new Date(hive.queenInstalled);
    const months = (now - installed) / (1000 * 60 * 60 * 24 * 30.44);
    return Math.max(0, Math.round(months));
  }

  function aggregate(riskArr) {
    // Average across hives for apiary-level view
    if (!riskArr.length) return null;
    const sum = riskArr.reduce((acc, r) => ({
      disease: acc.disease + r.disease,
      swarm: acc.swarm + r.swarm,
      starvation: acc.starvation + r.starvation,
      queenFailure: acc.queenFailure + r.queenFailure,
      honeyProduction: acc.honeyProduction + r.honeyProduction,
      winterSurvival: acc.winterSurvival + r.winterSurvival,
    }), { disease: 0, swarm: 0, starvation: 0, queenFailure: 0, honeyProduction: 0, winterSurvival: 0 });
    const n = riskArr.length;
    return {
      disease: Math.round(sum.disease / n),
      swarm: Math.round(sum.swarm / n),
      starvation: Math.round(sum.starvation / n),
      queenFailure: Math.round(sum.queenFailure / n),
      honeyProduction: Math.round(sum.honeyProduction / n),
      winterSurvival: Math.round(sum.winterSurvival / n),
    };
  }

  function riskColor(pct, invert = false) {
    // invert=true for "higher = better" axes (production, winter survival)
    if (invert) {
      if (pct >= 75) return 'var(--c-emerald-500)';
      if (pct >= 50) return 'var(--c-amber-500)';
      return 'var(--c-rose-500)';
    }
    if (pct < 35) return 'var(--c-emerald-500)';
    if (pct < 65) return 'var(--c-amber-500)';
    return 'var(--c-rose-500)';
  }

  function queenPerformance(hive, inspections) {
    const today = new Date();
    const ageMonths = queenAgeInMonths(hive, today);
    let score = 100;
    if (ageMonths > 36) score -= 40;
    else if (ageMonths > 24) score -= 25;
    else if (ageMonths > 18) score -= 10;
    else if (ageMonths < 3) score -= 15;
    const race = (hive.queenSubspecies || '').toLowerCase();
    const goodRaces = ['anadolu', 'kafkas', 'karniyol', 'karpat', 'yığılca', 'muğla', 'kırklareli', 'sakarya'];
    const exoticRaces = ['mısır', 'kıbrıs', 'suriye', 'italyan'];
    if (goodRaces.some(r => race.includes(r))) score += 5;
    else if (exoticRaces.some(r => race.includes(r))) score -= 5;
    if (inspections && inspections.length > 0) {
      const lastIns = inspections[0];
      const brood = lastIns.framesOfBrood || 0;
      if (brood >= 5) score += 10;
      else if (brood >= 3) score += 5;
      else if (brood === 0) score -= 15;
      if (lastIns.broodPattern === 'shotgun') score -= 15;
      else if (lastIns.broodPattern === 'scattered') score -= 5;
    } else {
      score -= 10;
    }
    score = Math.max(0, Math.min(100, score));
    let level, color, label;
    if (score >= 80) {
      level = 'excellent';
      color = 'var(--c-emerald-500, #10b981)';
      label = 'Mükemmel';
    } else if (score >= 60) {
      level = 'good';
      color = 'var(--c-sky-500, #0ea5e9)';
      label = 'İyi';
    } else if (score >= 40) {
      level = 'fair';
      color = 'var(--c-amber-500, #f59e0b)';
      label = 'Orta';
    } else {
      level = 'poor';
      color = 'var(--c-rose-500, #f43f5e)';
      label = 'Zayıf';
    }
    return { score: score, level: level, color: color, label: label, ageMonths: ageMonths, race: race };
  }

  global.BeeRisk = {
    compute,
    aggregate,
    riskColor,
    queenAgeInMonths,
    getSeason,
  };
})(window);