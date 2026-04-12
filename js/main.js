/**
 * ASL Louveciennes - Scripts principaux
 * Nav mobile, scroll, active link
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  setActiveLink();
});

function initNavbar() {
  const burger = document.querySelector('.navbar__burger');
  const mobileMenu = document.querySelector('.navbar__mobile');

  if (!burger || !mobileMenu) return;

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  // Fermer le menu au clic sur un lien
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Fermer avec Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

function setActiveLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__links a, .navbar__mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/**
 * Helper : navbar HTML partagée entre toutes les pages
 */
function getNavbarHTML() {
  return `
  <nav class="navbar" role="navigation" aria-label="Navigation principale">
    <div class="container navbar__inner">
      <a href="index.html" class="navbar__logo">
        <img src="assets/img/logo.png" alt="Logo ASL" width="40" height="40">
        <span>AS Louveciennes</span>
      </a>
      <div class="navbar__links">
        <a href="index.html">Accueil</a>
        <a href="club.html">Le Club</a>
        <a href="equipes.html">Équipes</a>
        <a href="actualites.html">Actualités</a>
        <a href="galerie.html">Galerie</a>
        <a href="contact.html">Contact</a>
      </div>
      <a href="inscription.html" class="btn btn--primary btn--sm navbar__cta">Inscription</a>
      <button class="navbar__burger" aria-label="Menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="navbar__mobile" role="menu">
      <a href="index.html" role="menuitem">Accueil</a>
      <a href="club.html" role="menuitem">Le Club</a>
      <a href="equipes.html" role="menuitem">Équipes</a>
      <a href="actualites.html" role="menuitem">Actualités</a>
      <a href="galerie.html" role="menuitem">Galerie</a>
      <a href="contact.html" role="menuitem">Contact</a>
      <a href="inscription.html" class="btn btn--primary" role="menuitem">Inscription saison</a>
      <a href="stages.html" class="btn btn--secondary" role="menuitem">Stages</a>
    </div>
  </nav>`;
}

function getFooterHTML() {
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div>
          <div class="footer__title">AS Louveciennes Football</div>
          <div class="footer__info">
            <p>Fondé en 1911</p>
            <p>« Une Passion Partagée »</p>
            <p>Stade du Cœur Volant, 4 Allée de la Tour du Jongleur</p>
            <p>78430 Louveciennes</p>
          </div>
        </div>
        <div>
          <div class="footer__title">Navigation</div>
          <div class="footer__links">
            <a href="index.html">Accueil</a>
            <a href="club.html">Le Club</a>
            <a href="equipes.html">Équipes</a>
            <a href="actualites.html">Actualités</a>
          </div>
        </div>
        <div>
          <div class="footer__title">S'inscrire</div>
          <div class="footer__links">
            <a href="inscription.html">Inscription saison</a>
            <a href="stages.html">Stages</a>
            <a href="contact.html">Contact</a>
            <a href="galerie.html">Galerie</a>
          </div>
        </div>
        <div>
          <div class="footer__title">Contact</div>
          <div class="footer__info">
            <p>aslouveciennesfootball@gmail.com</p>
            <p>aslouveciennesfootball@gmail.com</p>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <p>&copy; ${new Date().getFullYear()} AS Louveciennes Football. Tous droits réservés.</p>
      </div>
    </div>
  </footer>`;
}
