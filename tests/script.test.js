global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
require('@testing-library/jest-dom');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');

let dom;
let container;

beforeEach(() => {
  dom = new JSDOM(html, { runScripts: 'dangerously' });
  container = dom.window.document.body;
  const scriptElement = dom.window.document.createElement('script');
  scriptElement.textContent = scriptContent;
  dom.window.document.head.appendChild(scriptElement);
});

test('vérifie que les fonctions existent', () => {
  expect(typeof dom.window.resetForm).toBe('function');
  expect(typeof dom.window.ajouterLoyer).toBe('function');
  expect(typeof dom.window.supprimerLoyer).toBe('function');
  expect(typeof dom.window.extraireLoyers).toBe('function');
  expect(typeof dom.window.trouverAnneePertesInferieures).toBe('function');
  expect(typeof dom.window.calculPertesAchat).toBe('function');
  expect(typeof dom.window.calculPertesLocation).toBe('function');
  expect(typeof dom.window.genererRapport).toBe('function');
  expect(typeof dom.window.genererGraphique).toBe('function');
  expect(typeof dom.window.forcerModeClair).toBe('function');
  expect(typeof dom.window.restaurerMode).toBe('function');
  expect(typeof dom.window.telechargerPDF).toBe('function');
});

test('vérifie que les éléments du DOM sont utilisés correctement', () => {
  const prixInput = container.querySelector('#prix');
  expect(prixInput).toBeInTheDocument();
  const notaireInput = container.querySelector('#notaire');
  expect(notaireInput).toBeInTheDocument();
});