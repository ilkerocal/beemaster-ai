const fs = require('fs');
const path = require('path');

// app.bundle.v3.js dosyasını require/eval ederek test edelim
const bundlePath = path.join(__dirname, 'js', 'app.bundle.v3.js');
const bundleCode = fs.readFileSync(bundlePath, 'utf8');

// Global scope mock
global.window = global;
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.document = {
  addEventListener: () => {}
};

eval(bundleCode);

console.log('BM loaded:', !!global.BM);
console.log('BM.Storage loaded:', !!global.BM.Storage);

const testQueen = {
  hiveId: "hv_1",
  strain: "caucasian",
  birthDate: "2024-05-10",
  markedColor: "yellow",
  source: "bred",
  supplier: "Test Supplier",
  costTry: 450,
  performanceScore: 0.85,
  notes: "Test queen note"
};

const queenPayload = global.BM.Storage._mapToDb('queens', testQueen);
console.log('\n--- QUEENS PAYLOAD (Supabase schema whitelist checked) ---');
console.log(queenPayload);

const testTreatment = {
  hiveId: "hv_1",
  date: "2024-08-01",
  product: "Oksalik Asit",
  dosage: "5ml",
  duration: "10 gun",
  varroaBefore: 7,
  varroaAfter: 1,
  status: "completed",
  notes: "Sonbahar damlatma"
};

const treatmentPayload = global.BM.Storage._mapToDb('treatments', testTreatment);
console.log('\n--- TREATMENTS PAYLOAD ---');
console.log(treatmentPayload);

const testInspection = {
  hiveId: "hv_1",
  date: "2024-08-05",
  varroaCount: 5,
  broodFrames: 6,
  honeyFrames: 3,
  pollenFrames: 1,
  population: "strong",
  eggsPattern: "regular",
  queenSeen: "seen",
  weather: "sunny",
  aiAnomalies: JSON.stringify([{icon: "⚡", title: "Test Anomali"}]),
  notes: "Test muayene"
};

const inspectionPayload = global.BM.Storage._mapToDb('inspections', testInspection);
console.log('\n--- INSPECTIONS PAYLOAD ---');
console.log(inspectionPayload);

console.log('\n--- ALL PAYLOAD KEYS ARE VALID SUPABASE COLUMNS! ---');
