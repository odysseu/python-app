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

test('vérifie que le formulaire existe', () => {
  const form = container.querySelector('#calculette-form');
  expect(form).toBeInTheDocument();
});

test('vérifie que les champs du formulaire existent', () => {
  const prixInput = container.querySelector('#prix');
  const notaireInput = container.querySelector('#notaire');
  const tauxAppreciationInput = container.querySelector('#taux-appreciation');
  const tauxLoyerFictifInput = container.querySelector('#taux-loyer-fictif');
  const commissionInput = container.querySelector('#commission');
  const apportInput = container.querySelector('#apport');
  const tauxInput = container.querySelector('#taux');
  const dureeInput = container.querySelector('#duree-pret');
  const loyerFictifInput = container.querySelector('#loyer-fictif');
  const taxeHabitationInput = container.querySelector('#taxe-habitation');
  const taxeFonciereInput = container.querySelector('#taxe-fonciere');

  expect(prixInput).toBeInTheDocument();
  expect(notaireInput).toBeInTheDocument();
  expect(tauxAppreciationInput).toBeInTheDocument();
  expect(tauxLoyerFictifInput).toBeInTheDocument();
  expect(commissionInput).toBeInTheDocument();
  expect(apportInput).toBeInTheDocument();
  expect(tauxInput).toBeInTheDocument();
  expect(dureeInput).toBeInTheDocument();
  expect(loyerFictifInput).toBeInTheDocument();
  expect(taxeHabitationInput).toBeInTheDocument();
  expect(taxeFonciereInput).toBeInTheDocument();
});

test('vérifie que le bouton Calculer existe', () => {
  const calculerButton = container.querySelector('#calculer-button');
  expect(calculerButton).toBeInTheDocument();
});