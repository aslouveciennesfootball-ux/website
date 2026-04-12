/**
 * ASL Louveciennes — Formulaire de contact
 */

const CONTACT_API_URL = 'https://script.google.com/macros/s/AKfycbzmrtVgeQLGzsm93kiwQmJ49tYaSn4SpUr9yV40JwM5bqtbIro3C_1QFPn5O62nrwW1_g/exec';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
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

      if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        group.classList.add('has-error');
        const err = group.querySelector('.form-error');
        if (err) err.textContent = 'Email invalide.';
        valid = false;
      }
    });

    if (!valid) return;

    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Envoi en cours...';

    try {
      const payload = {
        route: 'contact',
        nom: document.getElementById('contactNom').value.trim(),
        prenom: document.getElementById('contactPrenom').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        telephone: document.getElementById('contactTel')?.value.trim() || '',
        sujet: document.getElementById('contactSujet').value,
        message: document.getElementById('contactMessage').value.trim()
      };

      await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });

      form.innerHTML = `
        <div class="alert alert--success" style="text-align:center;padding:var(--sp-8);">
          <div style="font-size:3rem;margin-bottom:var(--sp-4);">✅</div>
          <h3 style="margin-bottom:var(--sp-3);">Message envoyé !</h3>
          <p>Nous vous répondrons dans les meilleurs délais.</p>
        </div>
      `;
    } catch (err) {
      const alert = document.createElement('div');
      alert.className = 'alert alert--error';
      alert.textContent = 'Erreur lors de l\'envoi. Veuillez réessayer.';
      form.insertBefore(alert, form.firstChild);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
