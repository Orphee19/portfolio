# Portfolio — Orphée Keneitch NGOUESSI

Site portfolio **statique**, hébergé gratuitement sur **GitHub Pages**.

- Site : dossier [`docs/`](docs/)
- Contact : Brevo via [Cloudflare Worker](brevo-worker/) (clé API hors front) — fallback FormSubmit tant que le worker n’est pas branché
- Ancienne version Django / Render : conservée à la racine pour référence (`portfolio/`, `templates/`, `render.yaml`)

## URL

Après activation Pages (source = branche `main` / dossier `/docs`) :

**https://orphee19.github.io/portfolio/**

## Contenu (aligné NDA / droit du travail)

- Employeur **Nexxus Gabon** cité clairement
- Missions (CRM, TALI PVE, Kimba Connect / billetterie, tests sécu) décrites sans secrets ni logos clients
- **O-IMMO** marqué *projet personnel — en cours*

## Développement local

Ouvre `docs/index.html` dans le navigateur, ou :

```bash
npx serve docs
```

## Brevo

Voir [`brevo-worker/README.md`](brevo-worker/README.md).
