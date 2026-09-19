// Point d'entrée pour Passenger (cPanel > « Setup Node.js App » sur o2switch).
// Passenger charge ce fichier avec require(), ce qui échoue pour src/index.js :
// c'est un module ES qui utilise un await au niveau racine. Un import() dynamique,
// lui, accepte les deux. En local / Docker, on continue de lancer src/index.js directement.
import('./src/index.js').catch((err) => {
  console.error(err)
  process.exit(1)
})
