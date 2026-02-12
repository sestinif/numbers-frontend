# Numbers - Frontend

Interfaccia utente per l'app di gestione fatture **Numbers**.

## 🚀 Deploy su Render (Static Site)

### Configurazione

```
Name: numbers-frontend
Branch: main
Root Directory: (lascia vuoto)
Build Command: (lascia vuoto)
Publish Directory: .
```

### File Principali

- `index.html` - App principale (dashboard, fatture, clienti, spese, promemoria)
- `auth.html` - Pagina login/registrazione
- `forgot-password.html` - Recupero password
- `reset-password.html` - Reset password
- `api.js` - Client API per comunicazione con backend

### Backend URL

Il frontend è già configurato per comunicare con:
```
https://numbers-backend-jw5i.onrender.com
```

## 🎨 Funzionalità

- ✅ Dashboard con statistiche
- ✅ Gestione multi-azienda
- ✅ Clienti
- ✅ Fatture (crea, modifica, elimina)
- ✅ Spese
- ✅ Promemoria
- ✅ Tema scuro con accenti verdi
- ✅ Responsive design
- ✅ Autenticazione JWT

## 🔐 Primo Accesso

1. Vai su: `https://your-frontend-url.onrender.com/auth.html`
2. Tab "REGISTRATI"
3. Inserisci email + password
4. Accedi all'app!

## 📱 URL da Salvare

Dopo il deploy, salva questo URL:
```
https://numbers-frontend-xxxx.onrender.com/auth.html
```

Questo è l'URL da usare per fare login!
