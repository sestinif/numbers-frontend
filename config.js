// Configurazione centralizzata
const APP_CONFIG = {
    API_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : 'https://numbers-backend-jw5i.onrender.com/api'
};
