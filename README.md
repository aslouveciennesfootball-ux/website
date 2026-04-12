# AS Louveciennes Football — Site Web

Site web officiel de l'**AS Louveciennes Football**, club fondé en 1911.

## Structure

```
├── index.html          # Accueil
├── inscription.html    # Inscription saison (multi-étapes)
├── stages.html         # Inscription stages vacances
├── club.html           # Le Club (histoire, valeurs, staff)
├── equipes.html        # Catégories U7 → Senior
├── actualites.html     # Actualités du club
├── contact.html        # Contact + formulaire
├── galerie.html        # Galerie photos
├── css/                # Styles (mobile-first, variables CSS)
├── js/                 # Scripts (validation, lightbox)
├── assets/img/         # Logo, images
└── apps-script/        # Backend Google Apps Script
```

## Stack technique

- **Frontend** : HTML/CSS/JS vanilla, mobile-first
- **Backend** : Google Apps Script (Web App)
- **Hébergement** : GitHub Pages
- **Base de données** : Google Sheets existantes
- **Stockage fichiers** : Google Drive

## Déploiement du backend

1. Ouvrir [Google Apps Script](https://script.google.com)
2. Créer un projet, coller le contenu de `apps-script/Code.gs`
3. Déployer → Nouvelle déploiement → Application Web → Accès : Tout le monde
4. Copier l'URL de déploiement
5. Remplacer `VOTRE_URL_APPS_SCRIPT_ICI` dans `js/inscription.js`, `js/stages.js` et `js/contact.js`

## Couleurs

| Couleur | Hex | Usage |
|---------|-----|-------|
| Bleu royal | `#1E3A8A` | Couleur principale |
| Rouge | `#C41E3A` | Accents, CTA |
| Or | `#D4A843` | Détails, badges |
