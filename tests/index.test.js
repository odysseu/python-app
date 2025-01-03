global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
require('@testing-library/jest-dom');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

let dom;
let container;

beforeEach(() => {
  dom = new JSDOM(html, { runScripts: 'dangerously' });
  container = dom.window.document.body;
});

// Tests pour les identifiants utilisés dans dark-mode.js
test('vérifie que les identifiants utilisés dans dark-mode.js existent', () => {
  const toggleSwitch = container.querySelector('#dark-mode-toggle');
  const homeLogo = container.querySelector('#home-logo');
  const favicon = container.querySelector('#favicon');
  const githubLogo = container.querySelector('#github-logo');

  expect(toggleSwitch).toBeInTheDocument();
  expect(homeLogo).toBeInTheDocument();
  expect(favicon).toBeInTheDocument();
  expect(githubLogo).toBeInTheDocument();
});

// Tests pour les identifiants utilisés dans script.js
test('vérifie que les identifiants utilisés dans script.js existent', () => {
  const form = container.querySelector('#calculette-form');
  const resultat = container.querySelector('#resultat');
  const myChart = container.querySelector('#myChart');
  const loyersContainer = container.querySelector('#loyers-container');
  const prixInput = container.querySelector('#prix');
  const notaireInput = container.querySelector('#notaire');
  const tauxAppreciationInput = container.querySelector('#taux-appreciation');
  const tauxLoyerFictifInput = container.querySelector('#taux-loyer-fictif');
  const commissionInput = container.querySelector('#commission');
  const apportInput = container.querySelector('#apport');
  const tauxInput = container.querySelector('#taux');
  const dureePretInput = container.querySelector('#duree-pret');
  const loyerFictifInput = container.querySelector('#loyer-fictif');
  const taxeHabitationInput = container.querySelector('#taxe-habitation');
  const taxeFonciereInput = container.querySelector('#taxe-fonciere');
  const calculerButton = container.querySelector('#calculer-button');
  const rapportBouton = container.querySelector('#rapportBouton');

  expect(form).toBeInTheDocument();
  expect(resultat).toBeInTheDocument();
  expect(myChart).toBeInTheDocument();
  expect(loyersContainer).toBeInTheDocument();
  expect(prixInput).toBeInTheDocument();
  expect(notaireInput).toBeInTheDocument();
  expect(tauxAppreciationInput).toBeInTheDocument();
  expect(tauxLoyerFictifInput).toBeInTheDocument();
  expect(commissionInput).toBeInTheDocument();
  expect(apportInput).toBeInTheDocument();
  expect(tauxInput).toBeInTheDocument();
  expect(dureePretInput).toBeInTheDocument();
  expect(loyerFictifInput).toBeInTheDocument();
  expect(taxeHabitationInput).toBeInTheDocument();
  expect(taxeFonciereInput).toBeInTheDocument();
  expect(calculerButton).toBeInTheDocument();
  expect(rapportBouton).toBeInTheDocument();
});