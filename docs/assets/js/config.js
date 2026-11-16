/**
 * Configuration publique du portfolio.
 * Ne jamais y mettre de clé API Brevo (elle reste dans le worker Cloudflare).
 */
window.PORTFOLIO_CONFIG = {
  // URL du worker Brevo après déploiement (ex: https://portfolio-brevo.xxx.workers.dev)
  // Tant que vide : fallback FormSubmit vers CONTACT_EMAIL (toujours gratuit).
  brevoProxyUrl: "",

  // Boîte qui reçoit les demandes (Brevo TO + fallback FormSubmit)
  contactEmail: "orpheengouessi0810@gmail.com",

  // Expéditeur affiché côté Brevo (doit être un domaine vérifié dans Brevo)
  brevoSenderName: "Portfolio Orphée NGOUESSI",
  brevoSenderEmail: "orpheengouessi0810@gmail.com",
};
