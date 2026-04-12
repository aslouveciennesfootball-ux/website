/**
 * ASL Louveciennes — Formulaire d'inscription multi-étapes
 * Étape 1 : Joueur (nom, prénom, date naissance, sexe, catégorie auto)
 * Étape 2 : Coordonnées (email, tél, adresse, contact urgence)
 * Étape 3 : Documents (certificat médical, photo, autorisation parentale)
 */

// URL de la Web App Google Apps Script (à remplacer après déploiement)
const API_URL = 'https://script.google.com/macros/s/AKfycbzmrtVgeQLGzsm93kiwQmJ49tYaSn4SpUr9yV40JwM5bqtbIro3C_1QFPn5O62nrwW1_g/exec';

let currentStep = 1;
const totalSteps = 3;

document.addEventListener('DOMContentLoaded', () => {
  initStepper();
  initDateNaissance();
  initFileUploads();
  initFormSubmit();
});

// ─── Stepper ────────────────────────────────────────────────────

function initStepper() {
  document.querySelectorAll('.step-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        goToStep(currentStep + 1);
      }
    });
  });

  document.querySelectorAll('.step-prev').forEach(btn => {
    btn.addEventListener('click', () => goToStep(currentStep - 1));
  });
}

function goToStep(step) {
  if (step < 1 || step > totalSteps) return;

  // Masquer étape courante
  document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
  // Afficher nouvelle étape
  document.querySelector(`.form-step[data-step="${step}"]`).classList.add('active');

  // Mettre à jour stepper visuel
  updateStepperUI(step);
  currentStep = step;

  // Scroll vers le haut du formulaire
  document.querySelector('.inscription-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateStepperUI(step) {
  document.querySelectorAll('.stepper__step').forEach((el, i) => {
    const stepNum = i + 1;
    el.classList.remove('active', 'done');
    if (stepNum === step) el.classList.add('active');
    if (stepNum < step) el.classList.add('done');
  });

  document.querySelectorAll('.stepper__line').forEach((el, i) => {
    el.classList.toggle('done', i + 1 < step);
  });
}

// ─── Catégorie automatique ──────────────────────────────────────

function initDateNaissance() {
  const input = document.getElementById('dateNaissance');
  if (!input) return;

  input.addEventListener('change', () => {
    const categorie = calculateCategorie(input.value);
    const display = document.getElementById('categorieDisplay');
    const hidden = document.getElementById('categorie');

    if (categorie) {
      display.textContent = categorie;
      hidden.value = categorie;
      document.querySelector('.categorie-result').style.display = 'block';
    } else {
      document.querySelector('.categorie-result').style.display = 'none';
      hidden.value = '';
    }
  });
}

function calculateCategorie(dateStr) {
  if (!dateStr) return null;

  const birthDate = new Date(dateStr);
  const now = new Date();

  // Saison = année civile de fin de saison (ex: saison 2025-2026, on regarde l'âge au 1er janvier 2026)
  const saisonYear = 2026;
  const age = saisonYear - birthDate.getFullYear();

  if (age < 5) return null;
  if (age <= 6) return 'U7';
  if (age <= 7) return 'U8';
  if (age <= 8) return 'U9';
  if (age <= 9) return 'U10';
  if (age <= 10) return 'U11';
  if (age <= 11) return 'U12';
  if (age <= 12) return 'U13';
  if (age <= 13) return 'U14';
  if (age <= 14) return 'U15';
  if (age <= 15) return 'U16';
  if (age <= 16) return 'U17';
  if (age <= 17) return 'U18';
  if (age <= 18) return 'U19';
  return 'Senior';
}

// ─── File Upload ────────────────────────────────────────────────

function initFileUploads() {
  document.querySelectorAll('.file-upload input[type="file"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const uploadEl = input.closest('.file-upload');
      const nameEl = uploadEl.querySelector('.file-upload__name');

      if (!file) {
        nameEl.textContent = '';
        return;
      }

      // Vérifier taille (5 MB max)
      if (file.size > 5 * 1024 * 1024) {
        showFieldError(input, 'Le fichier ne doit pas dépasser 5 Mo.');
        input.value = '';
        nameEl.textContent = '';
        return;
      }

      nameEl.textContent = file.name;
      clearFieldError(input);
    });
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(null); return; }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Validation ─────────────────────────────────────────────────

function validateStep(step) {
  let valid = true;

  const stepEl = document.querySelector(`.form-step[data-step="${step}"]`);
  const requiredFields = stepEl.querySelectorAll('[required]');

  requiredFields.forEach(field => {
    clearFieldError(field);

    if (!field.value.trim()) {
      showFieldError(field, 'Ce champ est obligatoire.');
      valid = false;
      return;
    }

    // Validations spécifiques
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      showFieldError(field, 'Email invalide.');
      valid = false;
    }

    if (field.type === 'tel' && !/^[\d\s+.\-()]{10,}$/.test(field.value)) {
      showFieldError(field, 'Numéro de téléphone invalide.');
      valid = false;
    }

    if (field.id === 'dateNaissance') {
      const cat = calculateCategorie(field.value);
      if (!cat) {
        showFieldError(field, 'Date de naissance invalide ou âge non éligible.');
        valid = false;
      }
    }
  });

  return valid;
}

function showFieldError(field, message) {
  const group = field.closest('.form-group');
  if (!group) return;
  group.classList.add('has-error');
  const errorEl = group.querySelector('.form-error');
  if (errorEl) errorEl.textContent = message;
}

function clearFieldError(field) {
  const group = field.closest('.form-group');
  if (!group) return;
  group.classList.remove('has-error');
}

// ─── Soumission ─────────────────────────────────────────────────

function initFormSubmit() {
  const form = document.getElementById('inscriptionForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Envoi en cours...';

    try {
      // Convertir fichiers en base64
      const certFile = document.getElementById('certificat').files[0];
      const photoFile = document.getElementById('photo').files[0];

      const [certificat, photo] = await Promise.all([
        fileToBase64(certFile),
        fileToBase64(photoFile)
      ]);

      const payload = {
        route: 'inscription',
        nom: document.getElementById('nom').value.trim(),
        prenom: document.getElementById('prenom').value.trim(),
        dateNaissance: document.getElementById('dateNaissance').value,
        sexe: document.getElementById('sexe').value,
        categorie: document.getElementById('categorie').value,
        email: document.getElementById('email').value.trim(),
        telephone: document.getElementById('telephone').value.trim(),
        adresse: document.getElementById('adresse').value.trim(),
        codePostal: document.getElementById('codePostal').value.trim(),
        ville: document.getElementById('ville').value.trim(),
        contactUrgenceNom: document.getElementById('contactUrgenceNom').value.trim(),
        contactUrgenceTel: document.getElementById('contactUrgenceTel').value.trim(),
        certificat: certificat,
        photo: photo,
        autorisationParentale: document.getElementById('autorisationParentale').checked
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });

      // En mode no-cors, on ne peut pas lire la réponse, on assume le succès
      showSuccessMessage();

    } catch (err) {
      showAlert('error', 'Une erreur est survenue. Veuillez réessayer ou nous contacter directement.');
      console.error('Erreur inscription:', err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

function showSuccessMessage() {
  const form = document.getElementById('inscriptionForm');
  form.innerHTML = `
    <div class="alert alert--success" style="text-align:center;padding:var(--sp-10);">
      <div style="font-size:3rem;margin-bottom:var(--sp-4);">✅</div>
      <h3 style="margin-bottom:var(--sp-4);">Inscription envoyée avec succès !</h3>
      <p>Nous avons bien reçu l'inscription. Un email de confirmation a été envoyé.</p>
      <p style="margin-top:var(--sp-4);">L'inscription sera validée après vérification des documents.</p>
      <a href="index.html" class="btn btn--primary" style="margin-top:var(--sp-6);">Retour à l'accueil</a>
    </div>
  `;
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showAlert(type, message) {
  const existing = document.querySelector('.inscription-form .alert');
  if (existing) existing.remove();

  const alert = document.createElement('div');
  alert.className = `alert alert--${type}`;
  alert.textContent = message;

  const form = document.getElementById('inscriptionForm');
  form.insertBefore(alert, form.firstChild);

  setTimeout(() => alert.remove(), 8000);
}
