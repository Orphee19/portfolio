# Proxy Brevo (Cloudflare Worker)

GitHub Pages est 100 % statique : la clé API Brevo ne doit **jamais** être dans le front.

## 1. Compte Brevo

1. Crée une clé API (SMTP & API → API keys).
2. Vérifie l’expéditeur / domaine (ou utilise un email vérifié).
3. Note l’adresse pro qui doit recevoir les messages (`TO_EMAIL`).

## 2. Déploiement (gratuit)

```bash
cd brevo-worker
npx wrangler login
npx wrangler secret put BREVO_API_KEY
npx wrangler secret put TO_EMAIL
# optionnel si différent :
# npx wrangler secret put FROM_EMAIL
npx wrangler deploy
```

## 3. Brancher le portfolio

Dans `docs/assets/js/config.js` :

```js
brevoProxyUrl: "https://portfolio-brevo.<ton-compte>.workers.dev",
contactEmail: "ton@email-pro.com",
```

Puis commit + push : le formulaire utilisera Brevo (sinon fallback FormSubmit).
