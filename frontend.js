import { Caido } from "caido:frontend";

class SecretFinderUI {
  constructor() {
    this.secrets = [];
    this.stats = { processed: 0, found: 0 };
    this.scanningEnabled = true;
    this.filters = {
      severity: 'ALL',
      secretType: 'ALL',
      search: ''
    };
  }

  async init() {
    // Registrar página del plugin
    Caido.navigation.addPage("/secretfinder", "SecretFinder", {
      body: this.createMainInterface()
    });

    // Escuchar eventos del backend
    Caido.backend.onEvent("secret-found", (secret) => {
      this.addSecret(secret);
    });

    Caido.backend.onEvent("scan-stats", (stats) => {
      this.updateStats(stats);
    });

    // Obtener estadísticas iniciales
    try {
      this.stats = await Caido.backend.call("getStats");
      this.updateStatsDisplay();
    } catch (error) {
      console.error("Error getting initial stats:", error);
    }

    console.log("SecretFinder frontend initialized");
  }

  createMainInterface() {
    const container = document.createElement("div");
    container.className = "secretfinder-container";
    container.innerHTML = `
      <!-- Header con estadísticas -->
      <div class="secretfinder-header">
        <div class="stats-container">
          <div class="stat-item">
            <span class="stat-label">Requests Processed:</span>
            <span class="stat-value" id="processed-count">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Secrets Found:</span>
            <span class="stat-value" id="secrets-count">0</span>
          </div>
          <div class="stat-item">
            <button id="toggle-scanning" class="btn btn-primary">
              <span id="scanning-status">Scanning: ON</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-container">
        <div class="filter-group">
          <label for="severity-filter">Severity:</label>
          <select id="severity-filter" class="filter-select">
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="type-filter">Secret Type:</label>
          <select id="type-filter" class="filter-select">
            <option value="ALL">All Types</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="search-filter">Search:</label>
          <input type="text" id="search-filter" class="filter-input" placeholder="Search in URL or context...">
        </div>
        
        <button id="clear-secrets" class="btn btn-secondary">Clear All</button>
        <button id="export-secrets" class="btn btn-secondary">Export JSON</button>
      </div>

      <!-- Lista de secretos -->
      <div class="secrets-container">
        <div id="secrets-list" class="secrets-list">
          <div class="empty-state">
            <h3>No secrets found yet</h3>
            <p>SecretFinder will automatically scan responses as they come through the proxy.</p>
          </div>
        </div>
      </div>

      <!-- Modal para detalles -->
      <div id="secret-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modal-title">Secret Details</h3>
            <span class="modal-close">&times;</span>
          </div>
          <div class="modal-body" id="modal-body">
            <!-- Contenido del modal -->
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners(container);
    return container;
  }

  setupEventListeners(container) {
    // Toggle scanning
    const toggleBtn = container.querySelector('#toggle-scanning');
    toggleBtn?.addEventListener('click', () => {
      this.scanningEnabled = !this.scanningEnabled;
      this.toggleScanning();
    });

    // Filtros
    const severityFilter = container.querySelector('#severity-filter');
    severityFilter?.addEventListener('change', (e) => {
      this.filters.severity = e.target.value;
      this.applyFilters();
    });

    const typeFilter = container.querySelector('#type-filter');
    typeFilter?.addEventListener('change', (e) => {
      this.filters.secretType = e.target.value;
      this.applyFilters();
    });

    const searchFilter = container.querySelector('#search-filter');
    searchFilter?.addEventListener('input', (e) => {
      this.filters.search = e.target.value.toLowerCase();
      this.applyFilters();
    });

    // Botones de acción
    const clearBtn = container.querySelector('#clear-secrets');
    clearBtn?.addEventListener('click', () => {
      this.clearSecrets();
    });

    const exportBtn = container.querySelector('#export-secrets');
    exportBtn?.addEventListener('click', () => {
      this.exportSecrets();
    });

    // Modal
    const modal = container.querySelector('#secret-modal');
    const closeBtn = container.querySelector('.modal-close');
    
    closeBtn?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  async toggleScanning() {
    try {
      await Caido.backend.call("toggleScanning", this.scanningEnabled);
      const statusSpan = document.getElementById('scanning-status');
      if (statusSpan) {
        statusSpan.textContent = `Scanning: ${this.scanningEnabled ? 'ON' : 'OFF'}`;
        statusSpan.parentElement.className = `btn ${this.scanningEnabled ? 'btn-primary' : 'btn-secondary'}`;
      }
    } catch (error) {
      console.error("Error toggling scanning:", error);
    }
  }

  addSecret(secret) {
    this.secrets.unshift(secret); // Agregar al inicio
    this.updateSecretTypes();
    this.renderSecrets();
    this.updateStatsDisplay();
  }

  updateStats(stats) {
    this.stats = stats;
    this.updateStatsDisplay();
  }

  updateStatsDisplay() {
    const processedElement = document.getElementById('processed-count');
    const secretsElement = document.getElementById('secrets-count');
    
    if (processedElement) processedElement.textContent = this.stats.processed;
    if (secretsElement) secretsElement.textContent = this.secrets.length;
  }

  updateSecretTypes() {
    const typeFilter = document.getElementById('type-filter');
    if (!typeFilter) return;

    const types = [...new Set(this.secrets.map(s => s.secretType))];
    
    // Mantener opción "All Types"
    typeFilter.innerHTML = '<option value="ALL">All Types</option>';
    
    types.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
      typeFilter.appendChild(option);
    });
  }

  applyFilters() {
    const filteredSecrets = this.secrets.filter(secret => {
      // Filtro por severidad
      if (this.filters.severity !== 'ALL' && secret.severity !== this.filters.severity) {
        return false;
      }
      
      // Filtro por tipo
      if (this.filters.secretType !== 'ALL' && secret.secretType !== this.filters.secretType) {
        return false;
      }
      
      // Filtro de búsqueda
      if (this.filters.search) {
        const searchStr = this.filters.search;
        return secret.url.toLowerCase().includes(searchStr) ||
               secret.context.toLowerCase().includes(searchStr) ||
               secret.secretType.toLowerCase().includes(searchStr);
      }
      
      return true;
    });

    this.renderSecrets(filteredSecrets);
  }

  renderSecrets(secretsToRender = null) {
    const secretsList = document.getElementById('secrets-list');
    if (!secretsList) return;

    const secrets = secretsToRender || this.secrets;

    if (secrets.length === 0) {
      secretsList.innerHTML = `
        <div class="empty-state">
          <h3>${secretsToRender ? 'No secrets match your filters' : 'No secrets found yet'}</h3>
          <p>${secretsToRender ? 'Try adjusting your filters.' : 'SecretFinder will automatically scan responses as they come through the proxy.'}</p>
        </div>
      `;
      return;
    }

    secretsList.innerHTML = secrets.map(secret => this.createSecretCard(secret)).join('');
  }

  createSecretCard(secret) {
    const timeStr = new Date(secret.timestamp).toLocaleString();
    const severityClass = `severity-${secret.severity.toLowerCase()}`;
    
    return `
      <div class="secret-card ${severityClass}" data-secret-id="${secret.id}">
        <div class="secret-header">
          <div class="secret-type">
            <span class="type-badge">${secret.secretType.replace(/_/g, ' ')}</span>
            <span class="severity-badge ${severityClass}">${secret.severity}</span>
          </div>
          <div class="secret-actions">
            <button class="btn-small" onclick="secretFinderUI.viewDetails('${secret.id}')">View Details</button>
            <button class="btn-small" onclick="secretFinderUI.copySecret('${secret.secretValue}')">Copy</button>
          </div>
        </div>
        <div class="secret-content">
          <div class="secret-url">
            <strong>URL:</strong> 
            <span class="method-badge ${secret.method.toLowerCase()}">${secret.method}</span>
            <a href="${secret.url}" target="_blank" class="url-link">${secret.url}</a>
          </div>
          <div class="secret-value">
            <strong>Secret:</strong> 
            <code class="secret-code">${secret.secretValue}</code>
          </div>
          <div class="secret-context">
            <strong>Context:</strong> 
            <pre class="context-preview">${this.truncateText(secret.context, 150)}</pre>
          </div>
          <div class="secret-meta">
            <span class="timestamp">${timeStr}</span>
          </div>
        </div>
      </div>
    `;
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  viewDetails(secretId) {
    const secret = this.secrets.find(s => s.id === secretId);
    if (!secret) return;

    const modal = document.getElementById('secret-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = `${secret.secretType.replace(/_/g, ' ')} Details`;
    
    modalBody.innerHTML = `
      <div class="modal-detail">
        <div class="detail-section">
          <h4>Request Information</h4>
          <p><strong>Method:</strong> ${secret.method}</p>
          <p><strong>URL:</strong> <a href="${secret.url}" target="_blank">${secret.url}</a></p>
          <p><strong>Timestamp:</strong> ${new Date(secret.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="detail-section">
          <h4>Secret Information</h4>
          <p><strong>Type:</strong> ${secret.secretType.replace(/_/g, ' ')}</p>
          <p><strong>Severity:</strong> <span class="severity-badge severity-${secret.severity.toLowerCase()}">${secret.severity}</span></p>
          <p><strong>Value:</strong></p>
          <div class="secret-value-container">
            <code class="secret-full-value">${secret.secretValue}</code>
            <button class="btn-copy" onclick="secretFinderUI.copySecret('${secret.secretValue}')">Copy</button>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>Context</h4>
          <pre class="context-full">${secret.context}</pre>
        </div>
        
        <div class="detail-section">
          <h4>Recommendations</h4>
          <div class="recommendations">
            ${this.getRecommendations(secret.secretType)}
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'block';
  }

  getRecommendations(secretType) {
    const recommendations = {
      'openai_api_key': [
        'Immediately rotate this API key in your OpenAI dashboard',
        'Review API usage logs for unauthorized access',
        'Implement proper secret management (environment variables)',
        'Enable API key restrictions and monitoring'
      ],
      'aws_access_key': [
        'Immediately disable this access key in AWS IAM',
        'Review CloudTrail logs for unauthorized usage',
        'Rotate credentials and update applications',
        'Implement AWS Secrets Manager or similar service'
      ],
      'jwt_token': [
        'Consider the token compromised and invalidate if possible',
        'Review token contents for sensitive information',
        'Implement shorter token expiration times',
        'Use secure storage mechanisms for tokens'
      ],
      'api_endpoints': [
        'Review if these endpoints should be publicly accessible',
        'Implement proper authentication and authorization',
        'Consider rate limiting and monitoring',
        'Ensure endpoints follow security best practices'
      ],
      'database_uri': [
        'Immediately change database credentials',
        'Review database access logs',
        'Implement connection encryption (SSL/TLS)',
        'Use connection pooling and credential rotation'
      ]
    };

    const typeRecommendations = recommendations[secretType] || [
      'Review if this sensitive information should be exposed',
      'Implement proper secret management practices',
      'Monitor for unauthorized usage',
      'Consider rotating or invalidating if possible'
    ];

    return typeRecommendations.map(rec => `<li>${rec}</li>`).join('');
  }

  copySecret(secretValue) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(secretValue).then(() => {
        this.showToast('Secret copied to clipboard!');
      }).catch(err => {
        console.error('Error copying to clipboard:', err);
        this.fallbackCopy(secretValue);
      });
    } else {
      this.fallbackCopy(secretValue);
    }
  }

  fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showToast('Secret copied to clipboard!');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      this.showToast('Error copying to clipboard', 'error');
    }
    
    document.body.removeChild(textArea);
  }

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : '#f44336'};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  clearSecrets() {
    if (confirm('Are you sure you want to clear all found secrets?')) {
      this.secrets = [];
      this.renderSecrets();
      this.updateStatsDisplay();
      this.updateSecretTypes();
    }
  }

  exportSecrets() {
    const dataStr = JSON.stringify(this.secrets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `secretfinder-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.showToast('Secrets exported successfully!');
  }
}

// Inicializar cuando se carga la página
const secretFinderUI = new SecretFinderUI();

// Exponer globalmente para uso en onclick handlers
window.secretFinderUI = secretFinderUI;

// Auto-inicializar
document.addEventListener('DOMContentLoaded', () => {
  secretFinderUI.init();
});

// Inicializar inmediatamente si el DOM ya está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => secretFinderUI.init());
} else {
  secretFinderUI.init();
}
          