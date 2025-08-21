// Solución alternativa: Configurar headers CORS en la aplicación
// Agrega esto a tu archivo de configuración de Next.js

// En next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};

// Para Firebase Storage, configura las reglas así:
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /transfers/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
