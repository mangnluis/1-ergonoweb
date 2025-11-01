# Guide de Déploiement - Ergonoweb

## 🚀 Déploiement sur VPS (/var/www/site)

### Prérequis
- Serveur web (Apache ou Nginx)
- Accès SSH au VPS
- Certificat SSL (Let's Encrypt recommandé)

### Étapes de déploiement

1. **Copier les fichiers**
```bash
# Depuis votre machine locale
scp -r public/* user@vps:/var/www/site/
```

2. **Configurer les permissions**
```bash
ssh user@vps
cd /var/www/site
chown -R www-data:www-data .
chmod -R 755 .
```

3. **Configurer le serveur web**

#### Apache
- Point DocumentRoot vers `/var/www/site`
- Activer mod_rewrite, mod_deflate, mod_expires, mod_headers
- Le fichier `.htaccess` est déjà présent

#### Nginx
- Créer une configuration similaire avec les mêmes optimisations
- Activer compression gzip
- Configurer cache headers

4. **Configurer SSL (HTTPS)**
```bash
# Avec Certbot
sudo certbot --apache -d www.ergonoweb.com
# OU
sudo certbot --nginx -d www.ergonoweb.com
```

5. **Mettre à jour les URLs dans les fichiers**
- Remplacer `https://www.ergonoweb.com` par votre URL réelle dans :
  - `sitemap.xml`
  - `robots.txt`
  - Tous les fichiers HTML (meta OG, canonical, schema.org)

6. **Configurer EmailJS**
- Créer un compte sur [EmailJS](https://www.emailjs.com)
- Obtenir Service ID, Template ID, et Public Key
- Mettre à jour `public/assets/js/script.js` (voir section EmailJS)

7. **Ajouter Google Analytics (optionnel)**
- Obtenir un ID GA4
- Décommenter le code dans les fichiers HTML
- Remplacer `G-XXXXXXXXXX` par votre ID

8. **Créer les favicons**
- Générer favicon-16.png, favicon-32.png, apple-touch-icon.png
- Placer dans `assets/media/`

9. **Tester**
- Vérifier toutes les pages
- Tester le formulaire de contact
- Valider avec Lighthouse
- Tester l'accessibilité

## 🔧 Configuration EmailJS

Dans `public/assets/js/script.js`, ligne ~140, remplacer :
```javascript
const EMAILJS_SERVICE_ID = 'VOTRE_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'VOTRE_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'VOTRE_PUBLIC_KEY';
```

## ✅ Checklist post-déploiement

- [ ] Toutes les pages sont accessibles
- [ ] Formulaire de contact fonctionne
- [ ] HTTPS est activé
- [ ] Robots.txt et sitemap.xml sont accessibles
- [ ] Les métadonnées SEO sont correctes
- [ ] Lighthouse score > 90 sur tous les critères
- [ ] Test d'accessibilité réussi
- [ ] Google Analytics configuré (si utilisé)
- [ ] Favicons présents
- [ ] Compression activée

## 📝 Notes

- Le dossier `public/` contient tout le site
- Pour déployer, copier uniquement le contenu de `public/` vers `/var/www/site/`
- Ne pas copier les fichiers à la racine du projet (ils sont obsolètes)

