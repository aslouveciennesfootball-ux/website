/**
 * ASL Louveciennes — Formulaire d'inscription aux stages
 */

const STAGES_API_URL = 'https://script.google.com/macros/s/AKfycbzmrtVgeQLGzsm93kiwQmJ49tYaSn4SpUr9yV40JwM5bqtbIro3C_1QFPn5O62nrwW1_g/exec';

document.addEventListener('DOMContentLoaded', () => {
  initStageForm();
  initDateNaissanceStage();
});

function initDateNaissanceStage() {
  const input = document.getElementById('stageDateNaissance');
  if (!input) return;

  input.addEventListener('change', () => {
    const cat = calculateCategorieStage(input.value);
    const display = document.getElementById('stageCategorieDisplay');
    if (cat && display) {
      display.textContent = cat;
      document.getElementById('stageCategorie').value = cat;
    }
  });
}

function calculateCategorieStage(dateStr) {
  if (!dateStr) return null;
  const birthYear = new Date(dateStr).getFullYear();
  const age = 2027 - birthYear;
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
  return 'U16+';
}

function initStageForm() {
  const form = document.getElementById('stageForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validation
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      const group = field.closest('.form-group');
      if (!group) return;
      group.classList.remove('has-error');

      if (!field.value.trim()) {
        group.classList.add('has-error');
        const err = group.querySelector('.form-error');
        if (err) err.textContent = 'Ce champ est obligatoire.';
        valid = false;
      }
    });

    if (!valid) return;

    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Envoi en cours...';

    try {
      const selectedStage = form.querySelector('input[name="stage"]:checked');

      const payload = {
        route: 'inscription-stage',
        stage: selectedStage ? selectedStage.value : document.getElementById('stageSelect')?.value || '',
        dates: selectedStage ? selectedStage.dataset.dates : '',
        nom: document.getElementById('stageNom').value.trim(),
        prenom: document.getElementById('stagePrenom').value.trim(),
        dateNaissance: document.getElementById('stageDateNaissance').value,
        categorie: document.getElementById('stageCategorie').value,
        email: document.getElementById('stageEmail').value.trim(),
        telephone: document.getElementById('stageTelephone').value.trim(),
        contactUrgenceNom: document.getElementById('stageUrgenceNom').value.trim(),
        contactUrgenceTel: document.getElementById('stageUrgenceTel').value.trim(),
        infosMedicales: document.getElementById('stageInfosMedicales')?.value.trim() || ''
      };

      await fetch(STAGES_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });

      form.innerHTML = `
        <div class="alert alert--success" style="text-align:center;padding:var(--sp-10);">
          <div style="font-size:3rem;margin-bottom:var(--sp-4);">✅</div>
          <h3 style="margin-bottom:var(--sp-4);">Inscription au stage confirmée !</h3>
          <p>Un email de confirmation vous a été envoyé avec les informations pratiques.</p>
          <a href="index.html" class="btn btn--primary" style="margin-top:var(--sp-6);">Retour à l'accueil</a>
        </div>
      `;

    } catch (err) {
      const alert = document.createElement('div');
      alert.className = 'alert alert--error';
      alert.textContent = 'Une erreur est survenue. Veuillez réessayer.';
      form.insertBefore(alert, form.firstChild);
      console.error('Erreur stage:', err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}
