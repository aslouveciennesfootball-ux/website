/**
 * ASL Louveciennes — Backend API (Google Apps Script)
 *
 * Déployé en Web App : reçoit des POST JSON depuis le site GitHub Pages.
 * Routes : inscription, inscription-stage, contact
 *
 * Google Sheets :
 * - Adhérents : 1rEvlFTFIcNkYoX_qRvIuf-oYz9bj96M_u11nIB91ERg
 * - Stages   : 1nkmXvbHoCwMCOnhVa2D6-8RwZbHcBgPZMUeMB9CuM70
 */

// ─── Configuration ───────────────────────────────────────────────

const CONFIG = {
  SHEET_ADHERENTS: '1rEvlFTFIcNkYoX_qRvIuf-oYz9bj96M_u11nIB91ERg',
  SHEET_STAGES: '1nkmXvbHoCwMCOnhVa2D6-8RwZbHcBgPZMUeMB9CuM70',
  ONGLET_INSCRIPTIONS: 'Inscriptions_Web',
  ONGLET_STAGES: 'Inscriptions_Stages_Web',
  DRIVE_FOLDER_NAME: 'ASL_Inscriptions_Documents',
  EMAIL_CLUB: 'aslouveciennesfootball@gmail.com',
  SAISON: '2026-2027'
};

// ─── Point d'entrée GET (test) ───────────────────────────────────

function doGet(e) {
  e = e || {};
  const params = e.parameter || {};
  const action = params.action || '';

  if (action === 'recherche-adherent') {
    return handleRechercheAdherent({
      nom: params.nom || '',
      prenom: params.prenom || ''
    });
  }

  return jsonResponse({ status: 'ok', message: 'API ASL Louveciennes active' });
}

// ─── Point d'entrée POST (routage) ──────────────────────────────

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const route = data.route;

    switch (route) {
      case 'inscription':
        return handleInscription(data);
      case 'inscription-stage':
        return handleInscriptionStage(data);
      case 'contact':
        return handleContact(data);
      case 'recherche-adherent':
        return handleRechercheAdherent(data);
      default:
        return jsonResponse({ status: 'error', message: 'Route inconnue : ' + route }, 400);
    }
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message }, 500);
  }
}

// ─── Inscription Saison ─────────────────────────────────────────

function handleInscription(data) {
  const sheet = getOrCreateSheet(CONFIG.SHEET_ADHERENTS, CONFIG.ONGLET_INSCRIPTIONS, [
    'Horodatage', 'Saison',
    'Nom', 'Prénom', 'Date de naissance', 'Sexe', 'Catégorie',
    'Lieu de naissance', 'Nationalité', 'N° Licence',
    'Adresse', 'Code Postal', 'Ville',
    'Email', 'Téléphone', 'WhatsApp',
    'Email 2', 'Téléphone 2', 'WhatsApp 2',
    'Contact urgence nom', 'Contact urgence tél',
    'Équipement', 'Pass Sport', 'N° Pass Sport',
    'Pass+', 'N° Pass+',
    'Carte PF', 'N° Carte PF', 'Taux PF',
    'Réduction QS', 'Taux QS',
    'Règlement',
    'Certificat médical', 'Photo',
    'Autorisation image', 'Autorisation parentale',
    'Infos médicales',
    'Statut'
  ]);

  // Upload documents vers Drive
  const folder = getOrCreateDriveFolder();
  const playerFolder = folder.createFolder(`${data.nom}_${data.prenom}_${data.categorie}`);

  let certLink = '';
  let photoLink = '';

  if (data.certificat) {
    certLink = saveBase64File(playerFolder, data.certificat, `certificat_${data.nom}_${data.prenom}`);
  }
  if (data.photo) {
    photoLink = saveBase64File(playerFolder, data.photo, `photo_${data.nom}_${data.prenom}`);
  }

  // Écrire dans la sheet
  sheet.appendRow([
    new Date(),
    CONFIG.SAISON,
    data.nom,
    data.prenom,
    data.dateNaissance,
    data.sexe,
    data.categorie,
    data.lieuNaissance || '',
    data.nationalite || '',
    data.numeroLicence || '',
    data.adresse,
    data.codePostal || '',
    data.ville || '',
    data.email,
    data.telephone,
    data.whatsapp1 ? 'Oui' : 'Non',
    data.email2 || '',
    data.telephone2 || '',
    data.whatsapp2 ? 'Oui' : 'Non',
    data.contactUrgenceNom,
    data.contactUrgenceTel,
    data.equipement ? 'Oui (53€)' : 'Non',
    data.passSport ? 'Oui (-50€)' : 'Non',
    data.passSportNumero || '',
    data.passPlus ? 'Oui' : 'Non',
    data.passPlusNumero || '',
    data.cartePF ? 'Oui' : 'Non',
    data.cartePFNumero || '',
    data.cartePFTaux || '',
    data.reductionQS ? 'Oui' : 'Non',
    data.reductionQSTaux || '',
    data.reglement || '',
    certLink,
    photoLink,
    data.autorisationImage ? 'Oui' : 'Non',
    data.autorisationParentale ? 'Oui' : 'Non',
    data.infosMedicales || '',
    'Nouvelle'
  ]);

  // Email de confirmation
  sendConfirmationEmail(data);
  sendNotificationClub('inscription', data);

  return jsonResponse({
    status: 'success',
    message: `Inscription de ${data.prenom} ${data.nom} enregistrée avec succès !`
  });
}

// ─── Inscription Stage ──────────────────────────────────────────

function handleInscriptionStage(data) {
  const sheet = getOrCreateSheet(CONFIG.SHEET_STAGES, CONFIG.ONGLET_STAGES, [
    'Horodatage', 'Stage', 'Dates', 'Nom', 'Prénom', 'Date de naissance', 'Catégorie',
    'Email parent', 'Téléphone', 'Contact urgence nom', 'Contact urgence tél',
    'Allergies / Infos médicales', 'Statut'
  ]);

  sheet.appendRow([
    new Date(),
    data.stage,
    data.dates,
    data.nom,
    data.prenom,
    data.dateNaissance,
    data.categorie,
    data.email,
    data.telephone,
    data.contactUrgenceNom,
    data.contactUrgenceTel,
    data.infosMedicales || '',
    'Nouvelle'
  ]);

  sendConfirmationStageEmail(data);
  sendNotificationClub('stage', data);

  return jsonResponse({
    status: 'success',
    message: `Inscription au stage "${data.stage}" enregistrée pour ${data.prenom} ${data.nom} !`
  });
}

// ─── Contact ────────────────────────────────────────────────────

function handleContact(data) {
  const subject = `[ASL Site Web] Message de ${data.nom} ${data.prenom}`;
  const body = `
Nouveau message depuis le site web ASL Louveciennes :

Nom : ${data.nom} ${data.prenom}
Email : ${data.email}
Téléphone : ${data.telephone || 'Non renseigné'}

Sujet : ${data.sujet}

Message :
${data.message}

---
Message envoyé depuis le formulaire de contact du site aslouveciennes.fr
  `.trim();

  MailApp.sendEmail({
    to: CONFIG.EMAIL_CLUB,
    subject: subject,
    body: body,
    replyTo: data.email
  });

  return jsonResponse({
    status: 'success',
    message: 'Votre message a été envoyé. Nous vous répondrons dans les meilleurs délais.'
  });
}

// ─── Recherche Adhérent (pré-remplissage) ───────────────────────

function handleRechercheAdherent(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ADHERENTS);
    const sheetNames = ss.getSheets().map(s => s.getName());

    const nomRecherche = (data.nom || '').trim().toUpperCase();
    const prenomRecherche = (data.prenom || '').trim().toUpperCase();

    if (!nomRecherche || !prenomRecherche) {
      return jsonResponse({ status: 'not_found' });
    }

    for (const sheetName of sheetNames) {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet.getLastRow() < 2) continue;

      const allData = sheet.getDataRange().getValues();
      const headers = allData[0].map(h => String(h).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim());

      // Recherche robuste des colonnes (gère typos et accents)
      const colNom = findCol(headers, ['nom de l', 'nom'], ['prenom', 'urgence', 'lieu']);
      const colPrenom = findCol(headers, ['prenom', 'prénom']);
      const colLicence = findCol(headers, ['licence', 'liccen', 'licen', 'lic']);
      const colEmail = findCol(headers, ['mail', 'email'], ['2nd', '2eme', '2e ']);
      const colTel = findCol(headers, ['telephone de contact', 'telephone', 'tel de contact']);
      const colAdresse = findCol(headers, ['adresse']);
      const colNationalite = findCol(headers, ['nationalit']);

      if (colNom === -1 || colPrenom === -1) continue;

      for (let i = 1; i < allData.length; i++) {
        const row = allData[i];
        const nom = String(row[colNom] || '').trim().toUpperCase();
        const prenom = String(row[colPrenom] || '').trim().toUpperCase();

        if (nom === nomRecherche && prenom === prenomRecherche) {
          return jsonResponse({
            status: 'found',
            numeroLicence: colLicence !== -1 ? String(row[colLicence] || '') : '',
            email: colEmail !== -1 ? String(row[colEmail] || '') : '',
            telephone: colTel !== -1 ? String(row[colTel] || '') : '',
            adresse: colAdresse !== -1 ? String(row[colAdresse] || '') : '',
            nationalite: colNationalite !== -1 ? String(row[colNationalite] || '') : '',
            saison: sheetName
          });
        }
      }
    }

    return jsonResponse({ status: 'not_found' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  }
}

// Trouve l'index d'une colonne par mots-clés (premier match), en excluant certains mots
function findCol(headers, includes, excludes) {
  excludes = excludes || [];
  for (const keyword of includes) {
    const idx = headers.findIndex(h => h.includes(keyword) && !excludes.some(ex => h.includes(ex)));
    if (idx !== -1) return idx;
  }
  return -1;
}

// Fonction de test — exécuter depuis l'éditeur pour vérifier
function testRecherche() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ADHERENTS);
  const sheets = ss.getSheets();

  for (const sheet of sheets) {
    const name = sheet.getName();
    const lastRow = sheet.getLastRow();
    Logger.log('Onglet: ' + name + ' — Lignes: ' + lastRow);

    if (lastRow < 2) continue;

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log('Headers: ' + JSON.stringify(headers));

    // Afficher les 3 premières lignes de données
    if (lastRow >= 2) {
      const rows = sheet.getRange(2, 1, Math.min(3, lastRow - 1), sheet.getLastColumn()).getValues();
      rows.forEach((row, i) => {
        Logger.log('Ligne ' + (i+2) + ': nom=' + row[1] + ', prenom=' + row[2] + ', licence=' + row[14]);
      });
    }
  }

  // Test de recherche
  const result = handleRechercheAdherent({ nom: 'Ollivon', prenom: 'Kamerone' });
  Logger.log('Résultat recherche: ' + result.getContent());
}

// ─── Helpers : Sheets ───────────────────────────────────────────

function getOrCreateSheet(spreadsheetId, sheetName, headers) {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#1E3A8A')
      .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

// ─── Helpers : Drive ────────────────────────────────────────────

function getOrCreateDriveFolder() {
  const folders = DriveApp.getFoldersByName(CONFIG.DRIVE_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(CONFIG.DRIVE_FOLDER_NAME);
}

function saveBase64File(folder, base64Data, fileName) {
  // Format attendu : "data:image/jpeg;base64,/9j/4AAQ..."
  const parts = base64Data.split(',');
  const meta = parts[0]; // "data:image/jpeg;base64"
  const raw = parts[1];

  const mimeType = meta.match(/data:(.*?);/)[1];
  const ext = mimeType.split('/')[1].replace('jpeg', 'jpg');

  const blob = Utilities.newBlob(Utilities.base64Decode(raw), mimeType, `${fileName}.${ext}`);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return file.getUrl();
}

// ─── Helpers : Emails ───────────────────────────────────────────

function sendConfirmationEmail(data) {
  const subject = `Confirmation d'inscription - ASL Louveciennes Saison ${CONFIG.SAISON}`;
  const body = `
Bonjour,

Nous avons bien reçu l'inscription de ${data.prenom} ${data.nom} pour la saison ${CONFIG.SAISON}.

Récapitulatif :
- Catégorie : ${data.categorie}
- Date de naissance : ${data.dateNaissance}

Votre inscription sera validée après vérification des documents.
Vous recevrez un email de confirmation définitive.

Sportivement,
AS Louveciennes Football
  `.trim();

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    body: body,
    name: 'AS Louveciennes Football'
  });
}

function sendConfirmationStageEmail(data) {
  const subject = `Confirmation inscription stage - ASL Louveciennes`;
  const body = `
Bonjour,

Nous confirmons l'inscription de ${data.prenom} ${data.nom} au stage "${data.stage}" (${data.dates}).

Informations pratiques :
- Horaires : 9h à 17h au Stade du Cœur Volant
- Prévoir : chaussures de foot, protège-tibias, gourde, picnic (pizza offerte le vendredi)
- Contact urgence : ${data.contactUrgenceNom} (${data.contactUrgenceTel})

À bientôt sur les terrains !

Sportivement,
AS Louveciennes Football
  `.trim();

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    body: body,
    name: 'AS Louveciennes Football'
  });
}

function sendNotificationClub(type, data) {
  const subject = type === 'inscription'
    ? `[ASL] Nouvelle inscription : ${data.prenom} ${data.nom} (${data.categorie})`
    : `[ASL] Inscription stage : ${data.prenom} ${data.nom} - ${data.stage}`;

  const body = type === 'inscription'
    ? `Nouvelle inscription saison ${CONFIG.SAISON}\n\n${data.prenom} ${data.nom}\nCatégorie : ${data.categorie}\nNé(e) le : ${data.dateNaissance}\nEmail : ${data.email}\nTél : ${data.telephone}`
    : `Inscription stage "${data.stage}"\n\n${data.prenom} ${data.nom}\nDates : ${data.dates}\nEmail : ${data.email}\nTél : ${data.telephone}`;

  MailApp.sendEmail({
    to: CONFIG.EMAIL_CLUB,
    subject: subject,
    body: body
  });
}

// ─── Helpers : Réponse JSON ─────────────────────────────────────

function jsonResponse(obj, code) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
