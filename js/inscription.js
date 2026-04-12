/**
 * ASL Louveciennes — Formulaire d'inscription multi-étapes
 * Étape 1 : Joueur (nom, prénom, date naissance, sexe, lieu, nationalité, licence)
 * Étape 2 : Responsable légal (adresse, contacts, WhatsApp, urgence)
 * Étape 3 : Options & Réductions (équipement, Pass'Sport, Pass+, PF, QS, règlement)
 * Étape 4 : Documents & Autorisations (certificat, photo, droit image, infos médicales)
 */

const API_URL = 'https://script.google.com/macros/s/AKfycbzmrtVgeQLGzsm93kiwQmJ49tYaSn4SpUr9yV40JwM5bqtbIro3C_1QFPn5O62nrwW1_g/exec';

let currentStep = 1;
const totalSteps = 4;

document.addEventListener('DOMContentLoaded', () => {
  initStepper();
  initDateNaissance();
  initFileUploads();
  initOptionToggles();
  initAdherentLookup();
  initLieuNaissanceAutocomplete();
  initCodePostalAutocomplete();
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

  document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
  document.querySelector(`.form-step[data-step="${step}"]`).classList.add('active');

  updateStepperUI(step);
  currentStep = step;

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
  const saisonYear = 2027;
  const age = saisonYear - birthDate.getFullYear();

  if (age < 5) return null;
  if (age <= 6) return 'U6-U7';
  if (age <= 8) return 'U8-U9';
  if (age <= 10) return 'U10-U11';
  if (age <= 12) return 'U12-U13';
  if (age <= 14) return 'U14-U15';
  return null; // Pas de U16+ cette saison
}

// ─── Option Toggles ─────────────────────────────────────────────

function initOptionToggles() {
  const toggles = [
    { checkbox: 'passSport', target: 'passSportNumeroGroup' },
    { checkbox: 'passPlus', target: 'passPlusNumeroGroup' },
    { checkbox: 'cartePF', target: 'cartePFGroup' },
    { checkbox: 'reductionQS', target: 'reductionQSGroup' }
  ];

  toggles.forEach(({ checkbox, target }) => {
    const cb = document.getElementById(checkbox);
    const el = document.getElementById(target);
    if (!cb || !el) return;

    cb.addEventListener('change', () => {
      el.style.display = cb.checked ? 'block' : 'none';
    });
  });
}

// ─── Autocomplétion Lieu de naissance (geo.api.gouv.fr) ──────────

function initLieuNaissanceAutocomplete() {
  var input = document.getElementById('lieuNaissance');
  var list = document.getElementById('lieuNaissanceSuggestions');
  if (!input || !list) return;

  var debounce;

  function onInput() {
    clearTimeout(debounce);
    var txt = input.value.trim();
    // Chercher dès 2 caractères alphabétiques
    var letters = txt.replace(/[^a-zA-ZÀ-ÿ]/g, '');
    if (letters.length < 2) { list.style.display = 'none'; return; }

    debounce = setTimeout(function() {
      fetch('https://geo.api.gouv.fr/communes?nom=' + encodeURIComponent(txt) + '&fields=nom,codesPostaux,departement&limit=8')
        .then(function(res) { return res.json(); })
        .then(function(communes) {
          if (!communes.length) { list.style.display = 'none'; return; }

          list.innerHTML = communes.map(function(c) {
            var cp = c.codesPostaux[0] || '';
            var label = c.nom + ' ' + cp;
            return '<div class="autocomplete-item" data-value="' + label + '">' + c.nom + ' — ' + cp + '</div>';
          }).join('');
          list.style.display = 'block';

          list.querySelectorAll('.autocomplete-item').forEach(function(item) {
            item.addEventListener('click', function() {
              input.value = item.dataset.value;
              list.style.display = 'none';
            });
          });
        })
        .catch(function() { list.style.display = 'none'; });
    }, 250);
  }

  input.addEventListener('input', onInput);
  input.addEventListener('keyup', onInput);

  document.addEventListener('click', function(e) {
    if (!e.target.closest('#lieuNaissance') && !e.target.closest('#lieuNaissanceSuggestions')) {
      list.style.display = 'none';
    }
  });
}

// ─── Autocomplétion Code Postal / Ville (geo.api.gouv.fr) ───────

function initCodePostalAutocomplete() {
  const cpInput = document.getElementById('codePostal');
  const villeInput = document.getElementById('ville');
  const cpList = document.getElementById('cpSuggestions');
  const villeList = document.getElementById('villeSuggestions');

  if (!cpInput || !villeInput) {
    console.warn('[ASL] CP autocomplete: champs CP/Ville non trouvés');
    return;
  }
  if (!cpList || !villeList) {
    console.warn('[ASL] CP autocomplete: listes suggestions non trouvées');
    return;
  }

  let debounceTimer;
  let lastCpSearched = '';
  function rechercherCP(cp) {
    if (cp === lastCpSearched) return;
    lastCpSearched = cp;

    fetch('https://geo.api.gouv.fr/communes?codePostal=' + cp + '&fields=nom,codesPostaux&limit=10')
      .then(function(res) { return res.json(); })
      .then(function(communes) {

        if (communes.length === 0) { cpList.style.display = 'none'; return; }

        if (communes.length === 1) {
          villeInput.value = communes[0].nom;
          cpList.style.display = 'none';
          villeInput.style.backgroundColor = '#d4edda';
          setTimeout(function() { villeInput.style.backgroundColor = ''; }, 1500);
          return;
        }

        cpList.innerHTML = communes.map(function(c) {
          return '<div class="autocomplete-item" data-ville="' + c.nom + '" data-cp="' + c.codesPostaux[0] + '">' + c.nom + '</div>';
        }).join('');
        cpList.style.display = 'block';

        cpList.querySelectorAll('.autocomplete-item').forEach(function(item) {
          item.addEventListener('click', function() {
            villeInput.value = item.dataset.ville;
            cpList.style.display = 'none';
          });
        });
      })
      .catch(function() { cpList.style.display = 'none'; });
  }

  function onCpChange() {
    clearTimeout(debounceTimer);
    var cp = cpInput.value.trim().replace(/\D/g, '');
    if (cp.length < 5) { cpList.style.display = 'none'; return; }

    debounceTimer = setTimeout(function() { rechercherCP(cp); }, 200);
  }

  cpInput.addEventListener('input', onCpChange);
  cpInput.addEventListener('keyup', onCpChange);
  cpInput.addEventListener('change', onCpChange);

  // Saisie ville → suggestions avec code postal
  function onVilleChange() {
    clearTimeout(debounceTimer);
    var ville = villeInput.value.trim();
    if (ville.length < 2) { villeList.style.display = 'none'; return; }

    debounceTimer = setTimeout(function() {
      fetch('https://geo.api.gouv.fr/communes?nom=' + encodeURIComponent(ville) + '&fields=nom,codesPostaux&limit=8')
        .then(function(res) { return res.json(); })
        .then(function(communes) {
          if (communes.length === 0) { villeList.style.display = 'none'; return; }

          villeList.innerHTML = communes.map(function(c) {
            return '<div class="autocomplete-item" data-ville="' + c.nom + '" data-cp="' + c.codesPostaux[0] + '">' + c.nom + ' — ' + c.codesPostaux[0] + '</div>';
          }).join('');
          villeList.style.display = 'block';

          villeList.querySelectorAll('.autocomplete-item').forEach(function(item) {
            item.addEventListener('click', function() {
              villeInput.value = item.dataset.ville;
              cpInput.value = item.dataset.cp;
              villeList.style.display = 'none';
            });
          });
        })
        .catch(function() { villeList.style.display = 'none'; });
    }, 300);
  }

  villeInput.addEventListener('input', onVilleChange);
  villeInput.addEventListener('keyup', onVilleChange);

  // Fermer les suggestions quand on clique ailleurs
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#codePostal') && !e.target.closest('#cpSuggestions')) cpList.style.display = 'none';
    if (!e.target.closest('#ville') && !e.target.closest('#villeSuggestions')) villeList.style.display = 'none';
  });

}

// ─── Recherche adhérent existant ─────────────────────────────────

let lookupDone = false;

function initAdherentLookup() {
  const nomField = document.getElementById('nom');
  const prenomField = document.getElementById('prenom');
  if (!nomField || !prenomField) return;

  const doLookup = () => {
    const nom = nomField.value.trim();
    const prenom = prenomField.value.trim();
    if (!nom || !prenom || lookupDone) return;
    lookupDone = true;
    rechercherAdherent(nom, prenom);
  };

  // Déclencher à la perte de focus du prénom (les 2 champs sont remplis)
  prenomField.addEventListener('blur', doLookup);
  nomField.addEventListener('blur', () => {
    if (prenomField.value.trim()) doLookup();
  });
}

async function rechercherAdherent(nom, prenom) {
  try {
    const params = new URLSearchParams({ action: 'recherche-adherent', nom, prenom });
    const response = await fetch(`${API_URL}?${params}`);
    const result = await response.json();

    if (result.status === 'found') {
      // Pré-remplir les champs trouvés
      if (result.numeroLicence) {
        document.getElementById('numeroLicence').value = result.numeroLicence;
      }
      if (result.email) {
        document.getElementById('email').value = result.email;
      }
      if (result.telephone) {
        const tel = String(result.telephone).replace(/^0?(\d)/, '0$1');
        document.getElementById('telephone').value = tel;
      }
      if (result.adresse) {
        document.getElementById('adresse').value = result.adresse;
      }
      if (result.nationalite) {
        document.getElementById('nationalite').value = result.nationalite;
      }

      // Notification visuelle
      const hint = document.createElement('div');
      hint.className = 'alert alert--success';
      hint.style.cssText = 'margin-top:var(--sp-4);font-size:var(--fs-sm);';
      hint.textContent = `Adhérent trouvé (saison ${result.saison}). Vos informations ont été pré-remplies. Vérifiez et complétez si nécessaire.`;
      const step1 = document.querySelector('.form-step[data-step="1"]');
      const existingHint = step1.querySelector('.alert--success');
      if (existingHint) existingHint.remove();
      step1.querySelector('h2').after(hint);
    }
  } catch (err) {
    // Silencieux — la recherche est un bonus, pas critique
    console.log('Recherche adhérent:', err.message);
  }
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

    // Checkbox
    if (field.type === 'checkbox') {
      if (!field.checked) {
        showFieldError(field, 'Ce champ est obligatoire.');
        valid = false;
      }
      return;
    }

    // File
    if (field.type === 'file') {
      if (!field.files || !field.files.length) {
        showFieldError(field, 'Ce document est obligatoire.');
        valid = false;
      }
      return;
    }

    if (!field.value.trim()) {
      showFieldError(field, 'Ce champ est obligatoire.');
      valid = false;
      return;
    }

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
        showFieldError(field, 'Date de naissance invalide ou catégorie non disponible cette saison (U6 à U15 uniquement).');
        valid = false;
      }
    }
  });

  // Validation conditionnelle Pass'Sport numéro
  if (step === 3) {
    const passSport = document.getElementById('passSport');
    const passSportNum = document.getElementById('passSportNumero');
    if (passSport && passSport.checked && passSportNum && !passSportNum.value.trim()) {
      showFieldError(passSportNum, 'Numéro Pass\'Sport requis.');
      valid = false;
    }
  }

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

    if (!validateStep(4)) return;

    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Envoi en cours...';

    try {
      const certFile = document.getElementById('certificat').files[0];
      const photoFile = document.getElementById('photo').files[0];

      const [certificat, photo] = await Promise.all([
        fileToBase64(certFile),
        fileToBase64(photoFile)
      ]);

      const payload = {
        route: 'inscription',
        // Joueur
        nom: document.getElementById('nom').value.trim(),
        prenom: document.getElementById('prenom').value.trim(),
        dateNaissance: document.getElementById('dateNaissance').value,
        sexe: document.getElementById('sexe').value,
        categorie: document.getElementById('categorie').value,
        lieuNaissance: document.getElementById('lieuNaissance').value.trim(),
        nationalite: document.getElementById('nationalite').value.trim(),
        numeroLicence: document.getElementById('numeroLicence').value.trim(),
        // Responsable
        adresse: document.getElementById('adresse').value.trim(),
        codePostal: document.getElementById('codePostal').value.trim(),
        ville: document.getElementById('ville').value.trim(),
        email: document.getElementById('email').value.trim(),
        telephone: document.getElementById('telephone').value.trim(),
        whatsapp1: document.getElementById('whatsapp1').checked,
        email2: document.getElementById('email2').value.trim(),
        telephone2: document.getElementById('telephone2').value.trim(),
        whatsapp2: document.getElementById('whatsapp2').checked,
        contactUrgenceNom: document.getElementById('contactUrgenceNom').value.trim(),
        contactUrgenceTel: document.getElementById('contactUrgenceTel').value.trim(),
        // Options
        equipement: document.getElementById('equipement').checked,
        passSport: document.getElementById('passSport').checked,
        passSportNumero: document.getElementById('passSportNumero').value.trim(),
        passPlus: document.getElementById('passPlus').checked,
        passPlusNumero: document.getElementById('passPlusNumero').value.trim(),
        cartePF: document.getElementById('cartePF').checked,
        cartePFNumero: document.getElementById('cartePFNumero').value.trim(),
        cartePFTaux: document.getElementById('cartePFTaux').value,
        reductionQS: document.getElementById('reductionQS').checked,
        reductionQSTaux: document.getElementById('reductionQSTaux').value,
        reglement: document.getElementById('reglement').value,
        // Documents & autorisations
        certificat: certificat,
        photo: photo,
        autorisationImage: document.getElementById('autorisationImage').checked,
        autorisationParentale: document.getElementById('autorisationParentale').checked,
        infosMedicales: document.getElementById('infosMedicales').value.trim()
      };

      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });

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
      <p style="margin-top:var(--sp-4);">L'inscription sera validée après vérification des documents et réception du règlement.</p>
      <p style="margin-top:var(--sp-2);font-size:var(--fs-sm);color:var(--gris-500);">IBAN : FR76 3000 3019 0200 0372 8306 293</p>
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
