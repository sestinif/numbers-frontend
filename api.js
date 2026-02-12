// Numbers API Client
class NumbersAPI {
    constructor() {
        this.baseURL = window.location.hostname === 'localhost'
            ? 'http://localhost:3000/api'
            : 'https://numbers-backend-jw5i.onrender.com/api';
        this.token = localStorage.getItem('token');
    }

    // Get auth headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    // Handle API errors
    async handleResponse(response) {
        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Token expired or invalid
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'auth.html';
            }
            throw new Error(data.error || 'Errore API');
        }
        return data;
    }

    // ===== AUTH =====
    async getCurrentUser() {
        const response = await fetch(`${this.baseURL}/auth/me`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // ===== COMPANIES =====
    async getCompanies() {
        const response = await fetch(`${this.baseURL}/companies`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async createCompany(data) {
        const response = await fetch(`${this.baseURL}/companies`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async updateCompany(id, data) {
        const response = await fetch(`${this.baseURL}/companies/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async deleteCompany(id) {
        const response = await fetch(`${this.baseURL}/companies/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // ===== CUSTOMERS =====
    async getCustomers(companyId) {
        const response = await fetch(`${this.baseURL}/companies/${companyId}/customers`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async createCustomer(companyId, data) {
        const response = await fetch(`${this.baseURL}/companies/${companyId}/customers`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async updateCustomer(id, data) {
        const response = await fetch(`${this.baseURL}/customers/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async deleteCustomer(id) {
        const response = await fetch(`${this.baseURL}/customers/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // ===== INVOICES =====
    async getInvoices(companyId) {
        const response = await fetch(`${this.baseURL}/companies/${companyId}/invoices`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async createInvoice(companyId, data) {
        const response = await fetch(`${this.baseURL}/companies/${companyId}/invoices`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async updateInvoice(id, data) {
        const response = await fetch(`${this.baseURL}/invoices/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async deleteInvoice(id) {
        const response = await fetch(`${this.baseURL}/invoices/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // ===== EXPENSES =====
    async getExpenses(companyId) {
        const response = await fetch(`${this.baseURL}/companies/${companyId}/expenses`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async createExpense(companyId, data) {
        const response = await fetch(`${this.baseURL}/companies/${companyId}/expenses`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async updateExpense(id, data) {
        const response = await fetch(`${this.baseURL}/expenses/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async deleteExpense(id) {
        const response = await fetch(`${this.baseURL}/expenses/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // ===== REMINDERS =====
    async getReminders(companyId) {
        const response = await fetch(`${this.baseURL}/companies/${companyId}/reminders`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async createReminder(companyId, data) {
        const response = await fetch(`${this.baseURL}/companies/${companyId}/reminders`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async updateReminder(id, data) {
        const response = await fetch(`${this.baseURL}/reminders/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async deleteReminder(id) {
        const response = await fetch(`${this.baseURL}/reminders/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
}

// Initialize API client
const api = new NumbersAPI();
