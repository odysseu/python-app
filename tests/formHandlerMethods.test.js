global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
require('@testing-library/jest-dom');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const scriptContentForm = fs.readFileSync(path.resolve(__dirname, '../form-handler.js'), 'utf8');

let dom;
let container;

beforeEach(() => {
  dom = new JSDOM(html, { runScripts: 'dangerously' });
  container = dom.window.document.body;
  const scriptElement = dom.window.document.createElement('script');
  scriptElement.textContent = scriptContentForm;
  dom.window.document.head.appendChild(scriptElement);
});

test('vérifie que les fonctions existent', () => {
  expect(typeof dom.window.resetForm).toBe('function');
  expect(typeof dom.window.ajouterLoyer).toBe('function');
  expect(typeof dom.window.supprimerLoyer).toBe('function');
  expect(typeof dom.window.extraireLoyers).toBe('function');
  expect(typeof dom.window.trouverAnneePertesInferieures).toBe('function');
  expect(typeof dom.window.calculerPertesAchat).toBe('function');
  expect(typeof dom.window.calculerPertesLocation).toBe('function');
});

test('vérifie que les éléments du DOM sont utilisés correctement', () => {
  const prixInput = container.querySelector('#prix');
  expect(prixInput).toBeInTheDocument();
  const notaireInput = container.querySelector('#notaire');
  expect(notaireInput).toBeInTheDocument();

//   // Test resetForm function
//   dom.window.resetForm();
//   expect(container.querySelector('#resultat').innerHTML).toBe('');
//   const canvas = container.querySelector('#myChart');
//   const context = canvas.getContext('2d');
//   expect(context.getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 0)).toBe(false);

  // Test ajouterLoyer function
  const loyerInput = container.querySelector('input[name="loyer-0"]');
  const dureeLocationInput = container.querySelector('input[name="duree-location-0"]');
  loyerInput.value = '1000';
  dureeLocationInput.value = '50';
  dom.window.ajouterLoyer();
  expect(container.querySelectorAll('.loyer-container').length).toBe(2);
  expect(loyerInput.value).toBe('');
  expect(dureeLocationInput.value).toBe('');

  // Test supprimerLoyer function
  const loyerContainers = container.querySelectorAll('.loyer-container');
  const removeButton = loyerContainers[1].querySelector('button');
  dom.window.supprimerLoyer(removeButton);
  expect(container.querySelectorAll('.loyer-container').length).toBe(1);

  // Test extraireLoyers function
  loyerInput.value = '1200';
  dureeLocationInput.value = '75';
  dom.window.ajouterLoyer();
  const cumulLoyers = dom.window.extraireLoyers();
  expect(cumulLoyers).toBeCloseTo(1200 * (75 / 100) * 12);

  // Test trouverAnneePertesInferieures function
  // trouverAnneePertesInferieures(prix, fraisNotaire, fraisCommission, apport, mensualite, taxeFonciere, tauxAppreciation, duree, dureePret, loyerFictif, tauxLoyerFictif, cumulLoyers)
  const anneePertes = dom.window.trouverAnneePertesInferieures(200000, (8/100)*200000, 0, 5000, 1000, 1000, 0.02, 30, 20, 1100, 0.01, 0, 0);
  expect(anneePertes).toBeGreaterThanOrEqual(2);

  // Test calculerPertesAchat function
  const pertesAchat = dom.window.calculerPertesAchat(200000, 10000, 5000, 50000, 1000, 1000, 0.02, 30, 20, cumulLoyers, 0);
  expect(pertesAchat.length).toBe(30);

  // Test calculerPertesLocation function
  const pertesLocation = dom.window.calculerPertesLocation(1500, 30, 0.03);
  expect(pertesLocation.length).toBe(30);
});
