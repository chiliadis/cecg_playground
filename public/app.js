const API_BASE = '/api';
let currentUser = null;

// Declare functions that will be used by onclick handlers
function loadCustomers() { /* Will be defined below */ }
function showCustomerForm() { /* Will be defined below */ }
function loadPolicies() { /* Will be defined below */ }
function showPolicyForm() { /* Will be defined below */ }
function loadClaims() { /* Will be defined below */ }
function showClaimForm() { /* Will be defined below */ }
function showQuoteCalculator() { /* Will be defined below */ }
function loadUnderwritingQueue() { /* Will be defined below */ }
function showLoginForm() { /* Will be defined below */ }
function closeModal() { /* Will be defined below */ }
function closeDataModal() { /* Will be defined below */ }
function exportDisplayedData() { /* Will be defined below */ }
function convertQuoteToPolicy() { /* Will be defined below */ }
function editCustomer() { /* Will be defined below */ }
function deleteCustomer() { /* Will be defined below */ }
function resetDatabase() { /* Will be defined below */ }

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing app...');

    // Check if user is already logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showMainApp();
    } else {
        showLoginScreen();
    }

    // Initialize search functionality
    setupQuickSearch();
    setupCustomerQuickSearch();
    setupClaimsQuickSearch();
    setupBrokersQuickSearch();

    setupLoginHandlers();
    initializeInsuranceApp();
    setupNavigation();
    setupModalHandlers();
    setupRealTimeValidation();
});

function initializeInsuranceApp() {
    console.log('Chubb Insurance Portal Initialized');
    updateCounters();
}

// Login Management
function showLoginScreen() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
}

function showMainApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    updateUserInfo();
    loadDashboardData();
}

function setupLoginHandlers() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Validate input using enhanced validation
    const emailValidation = validateEmailField(email);
    if (!emailValidation.valid) {
        showValidationPopupWithType(emailValidation.message, document.getElementById('login-email'), 'error');
        return;
    }

    const passwordValidation = validatePasswordField(password, true);
    if (!passwordValidation.valid) {
        showValidationPopupWithType(passwordValidation.message, document.getElementById('login-password'), 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.success) {
            currentUser = result.data.customer;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showToast('Login successful! Welcome back.', 'success');
            showMainApp();
        } else {
            showValidationPopupWithType(result.message || 'Invalid email or password', document.getElementById('login-password'), 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showValidationPopupWithType('Login failed. Please try again.', document.getElementById('login-password'), 'error');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showToast('Logged out successfully', 'info');
    showLoginScreen();
}

function updateUserInfo() {
    if (currentUser) {
        const userStatus = document.getElementById('user-status');
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');

        if (userStatus) userStatus.textContent = `Welcome, ${currentUser.first_name} ${currentUser.last_name}`;
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    }
}

// Navigation Management
function setupNavigation() {
    console.log('Setting up navigation...');
    const navLinks = document.querySelectorAll('.nav-link');
    console.log('Found nav links:', navLinks.length);
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            console.log('Nav link clicked:', this.getAttribute('data-tab'));
            e.preventDefault();
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    // Hide all sections
    const sections = document.querySelectorAll('main section');
    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active-tab');
    });

    // Show target section
    const targetSection = document.getElementById(tabName);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active-tab');
    }

    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Modal Management
function openModal(templateId) {
    const template = document.getElementById(templateId);
    const modalContent = document.getElementById('modal-content');
    const modalOverlay = document.getElementById('modal-overlay');

    if (template && modalContent) {
        modalContent.innerHTML = template.innerHTML;
        modalOverlay.style.display = 'flex';

        // Add fade-in animation
        setTimeout(() => {
            modalOverlay.classList.add('show');
        }, 10);

        // Setup form handlers for the new form
        setupFormHandlers();

        // Focus first input
        const firstInput = modalContent.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

closeModal = function() {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.remove('show');

    setTimeout(() => {
        modalOverlay.style.display = 'none';
        document.getElementById('modal-content').innerHTML = '';
    }, 300);
}

function openDataModal(title, data, type) {
    const dataModal = document.getElementById('data-modal');
    const titleElement = document.getElementById('data-modal-title');
    const contentElement = document.getElementById('data-modal-content');

    titleElement.textContent = title;
    displayDataTable(data, type, contentElement);
    dataModal.style.display = 'flex';

    setTimeout(() => {
        dataModal.classList.add('show');
    }, 10);
}

closeDataModal = function() {
    const dataModal = document.getElementById('data-modal');
    dataModal.classList.remove('show');

    setTimeout(() => {
        dataModal.style.display = 'none';
    }, 300);
}

// Toast Notifications
let currentLoadingToast = null;

function showToast(message, type = 'info', duration = 4000) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');

    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close" onclick="removeToast(this)">&times;</button>
    `;

    // If this is a loading toast, dismiss any previous loading toast
    if (type === 'loading') {
        if (currentLoadingToast) {
            removeToast(currentLoadingToast);
        }
        currentLoadingToast = toast;
    }
    // If this is a success/error toast, dismiss any current loading toast
    else if (type === 'success' || type === 'error') {
        if (currentLoadingToast) {
            removeToast(currentLoadingToast);
            currentLoadingToast = null;
        }
    }

    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove
    const timeoutId = setTimeout(() => {
        removeToast(toast);
        if (toast === currentLoadingToast) {
            currentLoadingToast = null;
        }
    }, duration);

    // Store timeout ID for early removal
    toast._timeoutId = timeoutId;

    return toast;
}

function getToastIcon(type) {
    switch(type) {
        case 'success': return '✓';
        case 'error': return '✗';
        case 'warning': return '⚠';
        case 'loading': return '⟳';
        default: return 'ℹ';
    }
}

function removeToast(toastElement) {
    if (typeof toastElement === 'object' && toastElement.classList) {
        // Clear any pending timeout
        if (toastElement._timeoutId) {
            clearTimeout(toastElement._timeoutId);
        }

        // Remove from DOM with animation
        toastElement.classList.remove('show');
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
        }, 300);

        // Clear reference if this was the current loading toast
        if (toastElement === currentLoadingToast) {
            currentLoadingToast = null;
        }
    }
}

// Dashboard Functions
async function loadDashboardData() {
    try {
        showToast('Loading dashboard data...', 'loading', 2000);

        const [customersRes, policiesRes, claimsRes, brokersRes] = await Promise.all([
            fetch(`${API_BASE}/customers`),
            fetch(`${API_BASE}/policies`),
            fetch(`${API_BASE}/claims`),
            fetch(`${API_BASE}/brokers`)
        ]);

        const customersData = await customersRes.json();
        const policiesData = await policiesRes.json();
        const claimsData = await claimsRes.json();
        const brokersData = await brokersRes.json();

        // Update customer metrics
        const totalCustomers = customersData.count || 0;
        const activeCustomers = customersData.data?.filter(c => c.status === 'active').length || 0;
        const pendingCustomers = customersData.data?.filter(c => c.status === 'pending').length || 0;

        document.getElementById('total-customers-count').textContent = totalCustomers;
        document.getElementById('active-customers').textContent = activeCustomers;
        document.getElementById('pending-customers').textContent = pendingCustomers;

        // Update policy metrics
        const totalPolicies = policiesData.count || 0;
        const activePolicies = policiesData.data?.filter(p => p.status === 'active').length || 0;
        const pendingPolicies = policiesData.data?.filter(p => p.underwriting_status === 'pending').length || 0;

        document.getElementById('total-policies-count').textContent = totalPolicies;
        document.getElementById('active-policies').textContent = activePolicies;
        document.getElementById('pending-policies').textContent = pendingPolicies;

        // Update claims metrics
        const totalClaims = claimsData.count || 0;
        const openClaims = claimsData.data?.filter(c =>
            ['submitted', 'under_review'].includes(c.status)
        ).length || 0;
        const closedClaims = claimsData.data?.filter(c =>
            ['approved', 'denied'].includes(c.status)
        ).length || 0;

        document.getElementById('total-claims-count').textContent = totalClaims;
        document.getElementById('open-claims').textContent = openClaims;
        document.getElementById('closed-claims').textContent = closedClaims;

        // Update broker metrics
        const totalBrokers = brokersData.count || 0;
        const licensedBrokers = brokersData.data?.filter(b => b.license_number).length || 0;
        const specializations = new Set(brokersData.data?.map(b => b.specialization).filter(s => s)).size || 0;

        document.getElementById('total-brokers-count').textContent = totalBrokers;
        document.getElementById('licensed-brokers').textContent = licensedBrokers;
        document.getElementById('broker-specializations').textContent = specializations;

        // Update policy distribution chart
        const policyTypes = {};
        policiesData.data?.forEach(policy => {
            const type = policy.policy_type;
            policyTypes[type] = (policyTypes[type] || 0) + 1;
        });

        document.getElementById('auto-policies').textContent = policyTypes['auto'] || 0;
        document.getElementById('home-policies').textContent = policyTypes['home'] || 0;
        document.getElementById('life-policies').textContent = policyTypes['life'] || 0;
        document.getElementById('commercial-policies').textContent = policyTypes['commercial'] || 0;

        // Update claims status chart
        const claimsStatus = {};
        claimsData.data?.forEach(claim => {
            const status = claim.status;
            claimsStatus[status] = (claimsStatus[status] || 0) + 1;
        });

        document.getElementById('submitted-claims').textContent = claimsStatus['submitted'] || 0;
        document.getElementById('review-claims').textContent = claimsStatus['under_review'] || 0;
        document.getElementById('approved-claims').textContent = claimsStatus['approved'] || 0;
        document.getElementById('denied-claims').textContent = claimsStatus['denied'] || 0;

        // Update old dashboard counts for backward compatibility
        if (document.getElementById('customers-count')) {
            document.getElementById('customers-count').textContent = totalCustomers;
        }
        if (document.getElementById('policies-count')) {
            document.getElementById('policies-count').textContent = totalPolicies;
        }
        if (document.getElementById('claims-count')) {
            document.getElementById('claims-count').textContent = openClaims;
        }
        if (document.getElementById('underwriting-count')) {
            document.getElementById('underwriting-count').textContent = pendingPolicies;
        }

        showToast('Dashboard loaded successfully', 'success');
        updateCounters();
    } catch (error) {
        console.error('Dashboard loading error:', error);
        showToast(`Error loading dashboard: ${error.message}`, 'error');
    }
}

// Customer Management
loadCustomers = async function() {
    try {
        console.log('Loading customers...');
        showToast('Loading customers...', 'loading', 2000);
        const response = await fetch(`${API_BASE}/customers`);
        const data = await response.json();
        console.log('Customer data received:', data);

        if (data.success) {
            openDataModal('Customers', data.data, 'customers');
            showToast(`Loaded ${data.count} customers`, 'success');
        } else {
            showToast(`Error: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        showToast(`Network error: ${error.message}`, 'error');
    }
}

showCustomerForm = function() {
    // Authentication check - only allow admins or authenticated users to create customers
    if (!currentUser) {
        showToast('Please login to create a customer', 'warning');
        showLoginForm();
        return;
    }
    console.log('Show customer form called');
    openModal('customer-form-template');
}

// Policy Management
loadPolicies = async function() {
    try {
        showToast('Loading policies...', 'loading', 2000);
        const response = await fetch(`${API_BASE}/policies`);
        const data = await response.json();

        if (data.success) {
            openDataModal('Policies', data.data, 'policies');
            showToast(`Loaded ${data.count} policies`, 'success');
        } else {
            showToast(`Error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Network error: ${error.message}`, 'error');
    }
}

showPolicyForm = async function() {
    // Authentication check - only allow authenticated users to create policies
    if (!currentUser) {
        showToast('Please login to create a policy', 'warning');
        showLoginForm();
        return;
    }

    try {
        // Load customers and brokers for the dropdowns
        const [customersResponse, brokersResponse] = await Promise.all([
            fetch(`${API_BASE}/customers`),
            fetch(`${API_BASE}/brokers`)
        ]);

        const customersData = await customersResponse.json();
        const brokersData = await brokersResponse.json();

        openModal('policy-form-template');

        // Populate customer dropdown
        if (customersData.success) {
            const customerSelect = document.getElementById('policy-customer');
            customerSelect.innerHTML = '<option value="">Select customer...</option>';
            customersData.data.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = `${customer.first_name} ${customer.last_name} (${customer.customer_number})`;
                customerSelect.appendChild(option);
            });
        }

        // Populate broker dropdown
        if (brokersData.success) {
            const brokerSelect = document.getElementById('policy-broker');
            brokerSelect.innerHTML = '<option value="">Select broker...</option>';
            brokersData.data.forEach(broker => {
                const option = document.createElement('option');
                option.value = broker.id;
                option.textContent = `${broker.first_name} ${broker.last_name} (${broker.company_name})`;
                brokerSelect.appendChild(option);
            });
        }
    } catch (error) {
        showToast(`Error loading data: ${error.message}`, 'error');
    }
}

// Enhanced Policy Management Functions
showEditPolicyModal = async function(policyId) {
    // Authentication check - only allow authenticated users to edit policies
    if (!currentUser) {
        showToast('Please login to edit policies', 'warning');
        showLoginForm();
        return;
    }

    try {
        // Load policy details
        const response = await fetch(`${API_BASE}/policies/${policyId}`);
        const data = await response.json();

        if (!data.success) {
            showToast(`Error: ${data.message}`, 'error');
            return;
        }

        const policy = data.data;

        // Create edit form modal
        const modalHtml = `
            <div class="modal-header">
                <h3 class="modal-title">Edit Policy #${policy.policy_number}</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <form class="modal-form" id="edit-policy-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-policy-type">Policy Type</label>
                        <select id="edit-policy-type" name="policy_type" required>
                            <option value="auto" ${policy.policy_type === 'auto' ? 'selected' : ''}>Auto Insurance</option>
                            <option value="home" ${policy.policy_type === 'home' ? 'selected' : ''}>Home Insurance</option>
                            <option value="life" ${policy.policy_type === 'life' ? 'selected' : ''}>Life Insurance</option>
                            <option value="renters" ${policy.policy_type === 'renters' ? 'selected' : ''}>Renters Insurance</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-product-name">Product Name</label>
                        <input type="text" id="edit-product-name" name="product_name" value="${policy.product_name}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-coverage-amount">Coverage Amount ($)</label>
                        <input type="number" id="edit-coverage-amount" name="coverage_amount" value="${policy.coverage_amount}" min="1000" step="1000" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-premium-amount">Premium Amount ($)</label>
                        <input type="number" id="edit-premium-amount" name="premium_amount" value="${policy.premium_amount}" min="100" step="50" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-deductible">Deductible ($)</label>
                        <input type="number" id="edit-deductible" name="deductible" value="${policy.deductible || ''}" min="0" step="100">
                    </div>
                    <div class="form-group">
                        <label for="edit-policy-term">Policy Term (months)</label>
                        <input type="number" id="edit-policy-term" name="policy_term" value="${policy.policy_term || 12}" min="1" max="120">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-start-date">Start Date</label>
                        <input type="date" id="edit-start-date" name="start_date" value="${policy.start_date}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-end-date">End Date</label>
                        <input type="date" id="edit-end-date" name="end_date" value="${policy.end_date}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="edit-policy-notes">Notes</label>
                    <textarea id="edit-policy-notes" name="notes" rows="3">${policy.notes || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Policy</button>
                </div>
            </form>
        `;

        document.getElementById('modal-content').innerHTML = modalHtml;
        document.getElementById('modal-overlay').style.display = 'flex';
        document.getElementById('modal-overlay').classList.add('show');

        // Add form submit handler
        document.getElementById('edit-policy-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await updatePolicy(policyId, new FormData(e.target));
        });

    } catch (error) {
        showToast(`Error loading policy: ${error.message}`, 'error');
    }
}

updatePolicy = async function(policyId, formData) {
    try {
        showToast('Updating policy...', 'loading');

        const policyData = {
            policy_type: formData.get('policy_type'),
            product_name: formData.get('product_name'),
            coverage_amount: parseFloat(formData.get('coverage_amount')),
            premium_amount: parseFloat(formData.get('premium_amount')),
            deductible: formData.get('deductible') ? parseFloat(formData.get('deductible')) : null,
            policy_term: formData.get('policy_term') ? parseInt(formData.get('policy_term')) : null,
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
            notes: formData.get('notes')
        };

        const response = await fetch(`${API_BASE}/policies/${policyId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(policyData)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Policy updated successfully', 'success');
            closeModal();
            // Refresh policies list if visible
            const dataModal = document.getElementById('data-modal');
            if (dataModal && dataModal.style.display === 'block') {
                loadPolicies();
            }
        } else {
            showToast(`Error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Network error: ${error.message}`, 'error');
    }
}

showPolicyStatusModal = async function(policyId, currentStatus) {
    // Authentication check - only allow authenticated users to change policy status
    if (!currentUser) {
        showToast('Please login to change policy status', 'warning');
        showLoginForm();
        return;
    }
    const statusOptions = [
        { value: 'submission', label: 'Submission', desc: 'Initial policy submission' },
        { value: 'quoted', label: 'Quoted', desc: 'Quote generated and sent' },
        { value: 'booked', label: 'Booked', desc: 'Policy accepted and active' },
        { value: 'declined', label: 'Declined', desc: 'Policy rejected' },
        { value: 'cancelled', label: 'Cancelled', desc: 'Policy cancelled' },
        { value: 'expired', label: 'Expired', desc: 'Policy has expired' }
    ];

    const statusOptionsHtml = statusOptions.map(option =>
        `<option value="${option.value}" ${currentStatus === option.value ? 'selected' : ''}>${option.label} - ${option.desc}</option>`
    ).join('');

    const modalHtml = `
        <div class="modal-header">
            <h3 class="modal-title">Change Policy Status</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <form class="modal-form" id="status-form">
            <div class="form-group">
                <label for="policy-status">Policy Status</label>
                <select id="policy-status" name="status" required>
                    ${statusOptionsHtml}
                </select>
            </div>
            <div class="form-group">
                <label for="status-notes">Status Notes</label>
                <textarea id="status-notes" name="notes" rows="3" placeholder="Add notes about this status change..."></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Status</button>
            </div>
        </form>
    `;

    document.getElementById('modal-content').innerHTML = modalHtml;
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-overlay').classList.add('show');

    document.getElementById('status-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updatePolicyStatus(policyId, new FormData(e.target));
    });
}

updatePolicyStatus = async function(policyId, formData) {
    try {
        showToast('Updating policy status...', 'loading');

        const statusData = {
            status: formData.get('status'),
            notes: formData.get('notes')
        };

        const response = await fetch(`${API_BASE}/policies/${policyId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(statusData)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Policy status updated successfully', 'success');
            closeModal();
            // Refresh policies list
            const dataModal = document.getElementById('data-modal');
            if (dataModal && dataModal.style.display === 'block') {
                loadPolicies();
            }
        } else {
            showToast(`Error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Network error: ${error.message}`, 'error');
    }
}

deletePolicy = async function(policyId, policyNumber) {
    // Authentication check - only allow authenticated users to delete policies
    if (!currentUser) {
        showToast('Please login to delete policies', 'warning');
        showLoginForm();
        return;
    }

    if (!confirm(`Are you sure you want to delete policy ${policyNumber}? This action cannot be undone.`)) {
        return;
    }

    try {
        showToast('Deleting policy...', 'loading');

        const response = await fetch(`${API_BASE}/policies/${policyId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showToast('Policy deleted successfully', 'success');
            // Refresh policies list
            const dataModal = document.getElementById('data-modal');
            if (dataModal && dataModal.style.display === 'block') {
                loadPolicies();
            }
        } else {
            showToast(`Error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Network error: ${error.message}`, 'error');
    }
}

toggleWorkflowGuide = function() {
    const guide = document.getElementById('policy-workflow-guide');
    if (guide.style.display === 'none') {
        guide.style.display = 'block';
    } else {
        guide.style.display = 'none';
    }
}

// Policy Search Functions
toggleAdvancedSearch = function() {
    const advancedSearch = document.getElementById('policy-advanced-search');
    const toggleButton = document.querySelector('[data-action="show-advanced"], [data-action="toggle-advanced"]');

    if (advancedSearch.style.display === 'none') {
        advancedSearch.style.display = 'block';
        toggleButton.textContent = 'Hide Advanced';
        toggleButton.setAttribute('data-action', 'toggle-advanced');
    } else {
        advancedSearch.style.display = 'none';
        toggleButton.textContent = 'Advanced Search';
        toggleButton.setAttribute('data-action', 'show-advanced');
    }
}

performAdvancedPolicySearch = async function() {
    try {
        showToast('Searching policies...', 'loading');

        // Collect search parameters
        const searchParams = {
            policy_number: document.getElementById('search-policy-number').value.trim(),
            customer_name: document.getElementById('search-customer-name').value.trim(),
            product_name: document.getElementById('search-product-name').value.trim(),
            date_from: document.getElementById('search-date-from').value,
            date_to: document.getElementById('search-date-to').value,
            coverage_min: document.getElementById('search-coverage-min').value,
            coverage_max: document.getElementById('search-coverage-max').value,
            policy_type: document.getElementById('policy-filter').value,
            status: document.getElementById('policy-status-filter').value
        };

        // Remove empty parameters
        const filteredParams = Object.fromEntries(
            Object.entries(searchParams).filter(([_, value]) => value !== '' && value !== null)
        );

        // Build query string
        const queryString = new URLSearchParams(filteredParams).toString();
        const url = queryString ? `${API_BASE}/policies?${queryString}` : `${API_BASE}/policies`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            openDataModal('Policy Search Results', data.data, 'policies');
            showToast(`Found ${data.count} policies`, 'success');

            // Log search for debugging
            console.log('Search performed with filters:', filteredParams);
        } else {
            showToast(`Search error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Search failed: ${error.message}`, 'error');
    }
}

clearPolicySearch = function() {
    // Clear all search fields
    document.getElementById('search-policy-number').value = '';
    document.getElementById('search-customer-name').value = '';
    document.getElementById('search-product-name').value = '';
    document.getElementById('search-date-from').value = '';
    document.getElementById('search-date-to').value = '';
    document.getElementById('search-coverage-min').value = '';
    document.getElementById('search-coverage-max').value = '';
    document.getElementById('policy-quick-search').value = '';

    // Reset filters
    document.getElementById('policy-filter').value = '';
    document.getElementById('policy-status-filter').value = '';

    showToast('Search filters cleared', 'info');
}

// Quick search functionality
setupQuickSearch = function() {
    const quickSearchInput = document.getElementById('policy-quick-search');
    let searchTimeout;

    quickSearchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length === 0) {
            return;
        }

        // Debounce search
        searchTimeout = setTimeout(() => {
            performQuickPolicySearch(query);
        }, 500);
    });
}

performQuickPolicySearch = async function(query) {
    try {
        showToast('Quick searching...', 'loading', 1000);

        const response = await fetch(`${API_BASE}/policies/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.success) {
            openDataModal(`Quick Search: "${query}"`, data.data, 'policies');
            showToast(`Found ${data.count} policies`, 'success');
        } else {
            showToast(`Search error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Quick search failed: ${error.message}`, 'error');
    }
}

// Customer Search Functions
toggleCustomerAdvancedSearch = function() {
    const advancedSearch = document.getElementById('customer-advanced-search');
    const toggleButton = document.querySelector('[data-action="show-customer-advanced"], [data-action="toggle-customer-advanced"]');

    if (advancedSearch.style.display === 'none') {
        advancedSearch.style.display = 'block';
        toggleButton.textContent = 'Hide Advanced';
        toggleButton.setAttribute('data-action', 'toggle-customer-advanced');

        // Load agents for dropdown
        loadAgentsForSearch();
    } else {
        advancedSearch.style.display = 'none';
        toggleButton.textContent = 'Advanced Search';
        toggleButton.setAttribute('data-action', 'show-customer-advanced');
    }
}

loadAgentsForSearch = async function() {
    try {
        const response = await fetch(`${API_BASE}/agents`);
        const data = await response.json();

        if (data.success) {
            const agentSelect = document.getElementById('search-agent');
            agentSelect.innerHTML = '<option value="">All Agents</option>';

            data.data.forEach(agent => {
                const option = document.createElement('option');
                option.value = agent.id;
                option.textContent = `${agent.first_name} ${agent.last_name}`;
                agentSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.log('Failed to load agents for search:', error);
    }
}

performAdvancedCustomerSearch = async function() {
    try {
        showToast('Searching customers...', 'loading');

        // Collect search parameters
        const searchParams = {
            customer_number: document.getElementById('search-customer-number').value.trim(),
            first_name: document.getElementById('search-first-name').value.trim(),
            last_name: document.getElementById('search-last-name').value.trim(),
            email: document.getElementById('search-email').value.trim(),
            phone: document.getElementById('search-phone').value.trim(),
            agent_id: document.getElementById('search-agent').value,
            income_min: document.getElementById('search-income-min').value,
            income_max: document.getElementById('search-income-max').value,
            age_min: document.getElementById('search-age-min').value,
            age_max: document.getElementById('search-age-max').value,
            credit_min: document.getElementById('search-credit-min').value,
            registration_from: document.getElementById('search-registration-from').value,
            customer_status: document.getElementById('customer-status-filter').value,
            customer_type: document.getElementById('customer-type-filter').value
        };

        // Remove empty parameters
        const filteredParams = Object.fromEntries(
            Object.entries(searchParams).filter(([_, value]) => value !== '' && value !== null)
        );

        // Build query string
        const queryString = new URLSearchParams(filteredParams).toString();
        const url = queryString ? `${API_BASE}/customers?${queryString}` : `${API_BASE}/customers`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            openDataModal('Customer Search Results', data.data, 'customers');
            showToast(`Found ${data.count} customers`, 'success');

            // Log search for debugging
            console.log('Customer search performed with filters:', filteredParams);
        } else {
            showToast(`Search error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Search failed: ${error.message}`, 'error');
    }
}

clearCustomerSearch = function() {
    // Clear all search fields
    document.getElementById('search-customer-number').value = '';
    document.getElementById('search-first-name').value = '';
    document.getElementById('search-last-name').value = '';
    document.getElementById('search-email').value = '';
    document.getElementById('search-phone').value = '';
    document.getElementById('search-agent').value = '';
    document.getElementById('search-income-min').value = '';
    document.getElementById('search-income-max').value = '';
    document.getElementById('search-age-min').value = '';
    document.getElementById('search-age-max').value = '';
    document.getElementById('search-credit-min').value = '';
    document.getElementById('search-registration-from').value = '';
    document.getElementById('customer-quick-search').value = '';

    // Reset filters
    document.getElementById('customer-status-filter').value = '';
    document.getElementById('customer-type-filter').value = '';

    showToast('Customer search filters cleared', 'info');
}

// Customer quick search functionality
setupCustomerQuickSearch = function() {
    const quickSearchInput = document.getElementById('customer-quick-search');
    let searchTimeout;

    if (!quickSearchInput) return;

    quickSearchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length === 0) {
            return;
        }

        // Debounce search
        searchTimeout = setTimeout(() => {
            performQuickCustomerSearch(query);
        }, 500);
    });
}

performQuickCustomerSearch = async function(query) {
    try {
        showToast('Quick searching customers...', 'loading', 1000);

        const response = await fetch(`${API_BASE}/customers/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.success) {
            openDataModal(`Customer Quick Search: "${query}"`, data.data, 'customers');
            showToast(`Found ${data.count} customers`, 'success');
        } else {
            showToast(`Search error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Customer quick search failed: ${error.message}`, 'error');
    }
}

// Claims Management
loadClaims = async function() {
    try {
        showToast('Loading claims...', 'loading', 2000);
        const response = await fetch(`${API_BASE}/claims`);
        const data = await response.json();

        if (data.success) {
            openDataModal('Claims', data.data, 'claims');
            showToast(`Loaded ${data.count} claims`, 'success');
        } else {
            showToast(`Error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Network error: ${error.message}`, 'error');
    }
}

// Claims Search Functions
toggleClaimsAdvancedSearch = function() {
    const advancedSearch = document.getElementById('claims-advanced-search');
    const toggleButton = document.querySelector('[data-action="show-claims-advanced"], [data-action="toggle-claims-advanced"]');

    if (advancedSearch && advancedSearch.style.display === 'none') {
        advancedSearch.style.display = 'block';
        if (toggleButton) {
            toggleButton.textContent = 'Hide Advanced';
            toggleButton.setAttribute('data-action', 'toggle-claims-advanced');
        }
    } else if (advancedSearch) {
        advancedSearch.style.display = 'none';
        if (toggleButton) {
            toggleButton.textContent = 'Advanced Search';
            toggleButton.setAttribute('data-action', 'show-claims-advanced');
        }
    }
}

performAdvancedClaimsSearch = async function() {
    try {
        showToast('Searching claims...', 'loading');

        // Collect search parameters
        const searchParams = {
            claim_number: document.getElementById('search-claim-number')?.value.trim(),
            customer_name: document.getElementById('search-claim-customer')?.value.trim(),
            claim_type: document.getElementById('search-claim-type')?.value,
            status: document.getElementById('claims-status-filter')?.value,
            date_from: document.getElementById('search-claim-date-from')?.value,
            date_to: document.getElementById('search-claim-date-to')?.value,
            amount_min: document.getElementById('search-claim-amount-min')?.value,
            amount_max: document.getElementById('search-claim-amount-max')?.value
        };

        // Remove empty parameters
        const filteredParams = Object.fromEntries(
            Object.entries(searchParams).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        );

        // Build query string
        const queryString = new URLSearchParams(filteredParams).toString();
        const url = queryString ? `${API_BASE}/claims?${queryString}` : `${API_BASE}/claims`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            openDataModal('Claims Search Results', data.data, 'claims');
            showToast(`Found ${data.count} claims`, 'success');
        } else {
            showToast(`Search error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Search failed: ${error.message}`, 'error');
    }
}

clearClaimsSearch = function() {
    // Clear all search fields
    const fields = [
        'search-claim-number', 'search-claim-customer', 'search-claim-type',
        'search-claim-date-from', 'search-claim-date-to', 'search-claim-amount-min',
        'search-claim-amount-max', 'claims-quick-search', 'claims-status-filter'
    ];

    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });

    showToast('Claims search filters cleared', 'info');
}

// Claims quick search functionality
setupClaimsQuickSearch = function() {
    const quickSearchInput = document.getElementById('claims-quick-search');
    let searchTimeout;

    if (!quickSearchInput) return;

    quickSearchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length === 0) {
            return;
        }

        // Debounce search
        searchTimeout = setTimeout(() => {
            performQuickClaimsSearch(query);
        }, 500);
    });
}

performQuickClaimsSearch = async function(query) {
    try {
        showToast('Quick searching claims...', 'loading', 1000);

        const response = await fetch(`${API_BASE}/claims/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.success) {
            openDataModal(`Claims Quick Search: "${query}"`, data.data, 'claims');
            showToast(`Found ${data.count} claims`, 'success');
        } else {
            showToast(`Search error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Claims quick search failed: ${error.message}`, 'error');
    }
}

// Brokers Management
loadBrokers = async function() {
    try {
        showToast('Loading brokers...', 'loading', 2000);
        const response = await fetch(`${API_BASE}/brokers`);
        const data = await response.json();

        if (data.success) {
            openDataModal('Brokers', data.data, 'brokers');
            showToast(`Loaded ${data.count} brokers`, 'success');
        } else {
            showToast(`Error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Network error: ${error.message}`, 'error');
    }
}

showBrokerForm = function() {
    // Authentication check - only allow authenticated users to create brokers
    if (!currentUser) {
        showToast('Please login to create a broker', 'warning');
        showLoginForm();
        return;
    }
    console.log('Show broker form called');
    openModal('broker-form-template');
}

// Brokers Search Functions
toggleBrokersAdvancedSearch = function() {
    const advancedSearch = document.getElementById('brokers-advanced-search');
    const toggleButton = document.querySelector('[data-action="show-brokers-advanced"], [data-action="toggle-brokers-advanced"]');

    if (advancedSearch && advancedSearch.style.display === 'none') {
        advancedSearch.style.display = 'block';
        if (toggleButton) {
            toggleButton.textContent = 'Hide Advanced';
            toggleButton.setAttribute('data-action', 'toggle-brokers-advanced');
        }
    } else if (advancedSearch) {
        advancedSearch.style.display = 'none';
        if (toggleButton) {
            toggleButton.textContent = 'Advanced Search';
            toggleButton.setAttribute('data-action', 'show-brokers-advanced');
        }
    }
}

performAdvancedBrokersSearch = async function() {
    try {
        showToast('Searching brokers...', 'loading');

        // Collect search parameters
        const searchParams = {
            broker_code: document.getElementById('search-broker-code')?.value.trim(),
            first_name: document.getElementById('search-broker-first-name')?.value.trim(),
            last_name: document.getElementById('search-broker-last-name')?.value.trim(),
            email: document.getElementById('search-broker-email')?.value.trim(),
            phone: document.getElementById('search-broker-phone')?.value.trim(),
            company_name: document.getElementById('search-broker-company')?.value.trim(),
            territory: document.getElementById('search-broker-territory')?.value.trim(),
            specialization: document.getElementById('search-broker-specialization')?.value.trim(),
            status: document.getElementById('brokers-status-filter')?.value
        };

        // Remove empty parameters
        const filteredParams = Object.fromEntries(
            Object.entries(searchParams).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        );

        // Build query string
        const queryString = new URLSearchParams(filteredParams).toString();
        const url = queryString ? `${API_BASE}/brokers?${queryString}` : `${API_BASE}/brokers`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            openDataModal('Brokers Search Results', data.data, 'brokers');
            showToast(`Found ${data.count} brokers`, 'success');
        } else {
            showToast(`Search error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Search failed: ${error.message}`, 'error');
    }
}

clearBrokersSearch = function() {
    // Clear all search fields
    const fields = [
        'search-broker-code', 'search-broker-first-name', 'search-broker-last-name',
        'search-broker-email', 'search-broker-phone', 'search-broker-company',
        'search-broker-territory', 'search-broker-specialization', 'brokers-quick-search',
        'brokers-status-filter'
    ];

    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });

    showToast('Brokers search filters cleared', 'info');
}

// Brokers quick search functionality
setupBrokersQuickSearch = function() {
    const quickSearchInput = document.getElementById('brokers-quick-search');
    let searchTimeout;

    if (!quickSearchInput) return;

    quickSearchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length === 0) {
            return;
        }

        // Debounce search
        searchTimeout = setTimeout(() => {
            performQuickBrokersSearch(query);
        }, 500);
    });
}

performQuickBrokersSearch = async function(query) {
    try {
        showToast('Quick searching brokers...', 'loading', 1000);

        const response = await fetch(`${API_BASE}/brokers/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.success) {
            openDataModal(`Brokers Quick Search: "${query}"`, data.data, 'brokers');
            showToast(`Found ${data.count} brokers`, 'success');
        } else {
            showToast(`Search error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Brokers quick search failed: ${error.message}`, 'error');
    }
}

// Broker CRUD Functions
editBroker = async function(brokerId) {
    // Authentication check - only allow authenticated users to edit brokers
    if (!currentUser) {
        showToast('Please login to edit brokers', 'warning');
        showLoginForm();
        return;
    }

    try {
        showToast('Loading broker data...', 'loading', 2000);
        const response = await fetch(`${API_BASE}/brokers/${brokerId}`);
        const data = await response.json();

        if (data.success) {
            const broker = data.data;

            // Open edit modal
            openModal('edit-broker-form-template');

            // Populate form with existing data
            document.getElementById('edit-broker-id').value = broker.id;
            document.getElementById('edit-broker-first-name').value = broker.first_name || '';
            document.getElementById('edit-broker-last-name').value = broker.last_name || '';
            document.getElementById('edit-broker-email').value = broker.email || '';
            document.getElementById('edit-broker-phone').value = broker.phone || '';
            document.getElementById('edit-broker-company').value = broker.company_name || '';
            document.getElementById('edit-broker-license').value = broker.license_number || '';
            document.getElementById('edit-broker-territory').value = broker.territory || '';
            document.getElementById('edit-broker-specialization').value = broker.specialization || '';
            document.getElementById('edit-broker-commission').value = broker.commission_rate ? (broker.commission_rate * 100) : '';
            document.getElementById('edit-broker-status').value = broker.status || 'active';

            showToast('Broker data loaded', 'success');
        } else {
            showToast(`Error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Loading error: ${error.message}`, 'error');
    }
}

deleteBroker = async function(brokerId, brokerName) {
    // Authentication check - only allow authenticated users to delete brokers
    if (!currentUser) {
        showToast('Please login to delete brokers', 'warning');
        showLoginForm();
        return;
    }

    const confirmed = confirm(`Are you sure you want to delete broker "${brokerName}"?\n\nThis action cannot be undone and may affect associated policies.`);

    if (!confirmed) return;

    try {
        showToast('Deleting broker...', 'loading', 2000);
        const response = await fetch(`${API_BASE}/brokers/${brokerId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showToast('Broker deleted successfully', 'success');
            closeDataModal();
            // Refresh broker list if it's currently displayed
            loadBrokers();
        } else {
            showToast(`Delete error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Delete error: ${error.message}`, 'error');
    }
}

showClaimForm = function() {
    if (!currentUser) {
        showToast('Please login to submit a claim', 'warning');
        showLoginForm();
        return;
    }
    openModal('claim-form-template');
    loadCustomerPolicies();
}

async function loadCustomerPolicies() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/policies?customer_id=${currentUser.id}`);
        const data = await response.json();

        const policySelect = document.getElementById('claim-policy');
        policySelect.innerHTML = '<option value="">Choose a policy...</option>';

        if (data.success && data.data) {
            data.data.forEach(policy => {
                const option = document.createElement('option');
                option.value = policy.id;
                option.textContent = `${policy.policy_number} - ${policy.product_name}`;
                policySelect.appendChild(option);
            });
        }
    } catch (error) {
        showToast(`Error loading policies: ${error.message}`, 'error');
    }
}

// Quote Calculator
showQuoteCalculator = function() {
    switchTab('quotes');
}

// Authentication
showLoginForm = function() {
    openModal('login-form-template');
}

async function handleLogin(email, password) {
    try {
        // Only validate that fields are not empty for login
        if (!email) {
            showToast('Login failed: Email is required', 'error');
            return;
        }

        if (!password) {
            showToast('Login failed: Password is required', 'error');
            return;
        }

        if (!email.includes('@')) {
            showToast('Login failed: Please enter a valid email address', 'error');
            return;
        }

        showToast('Logging in...', 'loading', 2000);
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.data.customer;
            updateUserStatus();
            showToast(`Welcome, ${currentUser.first_name}!`, 'success');
            closeModal();
        } else {
            showToast(`Login failed: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Login error: ${error.message}`, 'error');
    }
}

function logout() {
    currentUser = null;
    updateUserStatus();
    showToast('Logged out successfully', 'success');
}

function updateUserStatus() {
    const userStatus = document.getElementById('user-status');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (currentUser) {
        userStatus.textContent = `Welcome, ${currentUser.first_name}`;
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    } else {
        userStatus.textContent = 'Not logged in';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    }
}

// Underwriting Queue
loadUnderwritingQueue = async function() {
    try {
        showToast('Loading underwriting queue...', 'loading', 2000);
        const response = await fetch(`${API_BASE}/policies?underwriting_status=pending`);
        const data = await response.json();

        if (data.success) {
            openDataModal('Underwriting Queue', data.data, 'underwriting');
            showToast(`${data.count} policies pending underwriting`, 'success');
        } else {
            showToast(`Error: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Network error: ${error.message}`, 'error');
    }
}

// Data Display
function displayDataTable(data, type, container = null) {
    const targetContainer = container || document.getElementById('data-modal-content');
    targetContainer.innerHTML = '';

    if (!data || data.length === 0) {
        targetContainer.innerHTML = '<div class="empty-state">No data found</div>';
        return;
    }

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';

    const table = document.createElement('table');
    table.className = 'data-table';

    // Create header
    const headers = Object.keys(data[0]).filter(key =>
        !key.includes('password') && !key.includes('ssn')
    );
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.replace(/_/g, ' ').toUpperCase();
        headerRow.appendChild(th);
    });

    // Add Actions column for customers, brokers, and policies (at the beginning)
    if (type === 'customers' || type === 'brokers' || type === 'policies') {
        const actionsHeader = document.createElement('th');
        actionsHeader.textContent = 'ACTIONS';
        actionsHeader.style.width = type === 'policies' ? '200px' : '120px';
        headerRow.insertBefore(actionsHeader, headerRow.firstChild);
    }

    table.appendChild(headerRow);

    // Create rows
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = index % 2 === 0 ? 'even' : 'odd';

        headers.forEach(header => {
            const td = document.createElement('td');
            let value = item[header];

            // Format special values
            if (header.includes('amount') || header.includes('premium')) {
                value = value ? `$${parseFloat(value).toLocaleString()}` : '';
            } else if (header.includes('date')) {
                value = value ? new Date(value).toLocaleDateString() : '';
            } else if (header === 'status') {
                td.className = `status status-${value}`;
            }

            td.textContent = value || '';
            row.appendChild(td);
        });

        // Add action buttons for customers and policies
        if (type === 'customers') {
            const actionsTd = document.createElement('td');

            // Only show action buttons if user is authenticated
            if (currentUser) {
                // Create edit button
                const editBtn = document.createElement('button');
                editBtn.className = 'action-btn edit-btn';
                editBtn.setAttribute('data-customer-id', item.id);
                editBtn.title = 'Edit Customer';
                editBtn.textContent = 'Edit';
                editBtn.style.marginRight = '5px';

                // Create delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'action-btn delete-btn';
                deleteBtn.setAttribute('data-customer-id', item.id);
                deleteBtn.setAttribute('data-customer-name', `${item.first_name} ${item.last_name}`);
                deleteBtn.title = 'Delete Customer';
                deleteBtn.textContent = 'Delete';

                actionsTd.appendChild(editBtn);
                actionsTd.appendChild(deleteBtn);
            } else {
                actionsTd.innerHTML = '<span style="color: #999; font-style: italic;">Login required</span>';
            }
            row.insertBefore(actionsTd, row.firstChild);
        } else if (type === 'brokers') {
            const actionsTd = document.createElement('td');

            // Only show action buttons if user is authenticated
            if (currentUser) {
                // Create edit button
                const editBtn = document.createElement('button');
                editBtn.className = 'action-btn edit-btn';
                editBtn.setAttribute('data-broker-id', item.id);
                editBtn.title = 'Edit Broker';
                editBtn.textContent = 'Edit';
                editBtn.style.marginRight = '5px';

                // Create delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'action-btn delete-btn';
                deleteBtn.setAttribute('data-broker-id', item.id);
                deleteBtn.setAttribute('data-broker-name', `${item.first_name} ${item.last_name}`);
                deleteBtn.title = 'Delete Broker';
                deleteBtn.textContent = 'Delete';

                actionsTd.appendChild(editBtn);
                actionsTd.appendChild(deleteBtn);
            } else {
                actionsTd.innerHTML = '<span style="color: #999; font-style: italic;">Login required</span>';
            }
            row.insertBefore(actionsTd, row.firstChild);
        } else if (type === 'policies') {
            const actionsTd = document.createElement('td');
            actionsTd.style.display = 'flex';
            actionsTd.style.gap = '5px';
            actionsTd.style.flexWrap = 'wrap';

            // Only show action buttons if user is authenticated
            if (currentUser) {
                // Create edit button
                const editBtn = document.createElement('button');
                editBtn.className = 'action-btn edit-btn';
                editBtn.setAttribute('data-policy-id', item.id);
                editBtn.title = 'Edit Policy';
                editBtn.textContent = 'Edit';

                // Create status button
                const statusBtn = document.createElement('button');
                statusBtn.className = 'action-btn status-btn';
                statusBtn.setAttribute('data-policy-id', item.id);
                statusBtn.setAttribute('data-current-status', item.status);
                statusBtn.title = 'Change Status';
                statusBtn.textContent = 'Status';

                // Create delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'action-btn delete-btn';
                deleteBtn.setAttribute('data-policy-id', item.id);
                deleteBtn.setAttribute('data-policy-number', item.policy_number);
                deleteBtn.title = 'Delete Policy';
                deleteBtn.textContent = 'Delete';

                actionsTd.appendChild(editBtn);
                actionsTd.appendChild(statusBtn);
                actionsTd.appendChild(deleteBtn);
            } else {
                actionsTd.innerHTML = '<span style="color: #999; font-style: italic;">Login required</span>';
                actionsTd.style.display = 'block'; // Override flex display for the text
            }
            row.insertBefore(actionsTd, row.firstChild);
        }

        table.appendChild(row);
    });

    tableContainer.appendChild(table);
    targetContainer.appendChild(tableContainer);

    // Add event delegation for action buttons
    if (type === 'customers') {
        setupCustomerActionButtons(tableContainer);
    } else if (type === 'brokers') {
        setupBrokerActionButtons(tableContainer);
    } else if (type === 'policies') {
        setupPolicyActionButtons(tableContainer);
    }
}

function setupCustomerActionButtons(container) {
    container.addEventListener('click', function(e) {
        console.log('Button clicked:', e.target.classList, e.target.getAttribute('data-customer-id'));

        if (e.target.classList.contains('edit-btn')) {
            const customerId = e.target.getAttribute('data-customer-id');
            console.log('Edit button clicked for customer:', customerId);
            if (customerId) {
                editCustomer(parseInt(customerId));
            }
        } else if (e.target.classList.contains('delete-btn')) {
            const customerId = e.target.getAttribute('data-customer-id');
            const customerName = e.target.getAttribute('data-customer-name');
            console.log('Delete button clicked for customer:', customerId, customerName);
            if (customerId && customerName) {
                deleteCustomer(parseInt(customerId), customerName);
            }
        }
    });
}

function setupBrokerActionButtons(container) {
    container.addEventListener('click', function(e) {
        console.log('Broker button clicked:', e.target.classList, e.target.getAttribute('data-broker-id'));

        if (e.target.classList.contains('edit-btn')) {
            const brokerId = e.target.getAttribute('data-broker-id');
            console.log('Edit button clicked for broker:', brokerId);
            if (brokerId) {
                editBroker(parseInt(brokerId));
            }
        } else if (e.target.classList.contains('delete-btn')) {
            const brokerId = e.target.getAttribute('data-broker-id');
            const brokerName = e.target.getAttribute('data-broker-name');
            console.log('Delete button clicked for broker:', brokerId, brokerName);
            if (brokerId && brokerName) {
                deleteBroker(parseInt(brokerId), brokerName);
            }
        }
    });
}

function setupPolicyActionButtons(container) {
    container.addEventListener('click', function(e) {
        console.log('Policy button clicked:', e.target.classList, e.target.getAttribute('data-policy-id'));

        if (e.target.classList.contains('edit-btn')) {
            const policyId = e.target.getAttribute('data-policy-id');
            console.log('Edit policy button clicked for policy:', policyId);
            if (policyId) {
                showEditPolicyModal(parseInt(policyId));
            }
        } else if (e.target.classList.contains('status-btn')) {
            const policyId = e.target.getAttribute('data-policy-id');
            const currentStatus = e.target.getAttribute('data-current-status');
            console.log('Status button clicked for policy:', policyId, 'current status:', currentStatus);
            if (policyId) {
                showPolicyStatusModal(parseInt(policyId), currentStatus);
            }
        } else if (e.target.classList.contains('delete-btn')) {
            const policyId = e.target.getAttribute('data-policy-id');
            const policyNumber = e.target.getAttribute('data-policy-number');
            console.log('Delete button clicked for policy:', policyId, policyNumber);
            if (policyId && policyNumber) {
                deletePolicy(parseInt(policyId), policyNumber);
            }
        }
    });
}

// Validation Functions
function validateEmail(email) {
    if (!email) return { valid: false, message: 'Email is required' };
    if (!email.includes('@')) return { valid: false, message: 'Email must contain @ symbol' };
    if (!email.includes('.')) return { valid: false, message: 'Email must contain a domain (e.g., .com)' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { valid: false, message: 'Please enter a valid email address' };
    return { valid: true };
}

function validatePassword(password) {
    if (!password) return { valid: false, message: 'Password is required' };
    if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters long' };
    if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
    return { valid: true };
}

function validatePhone(phone) {
    if (!phone) return { valid: true }; // Phone is optional
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) return { valid: false, message: 'Phone number can only contain digits, spaces, hyphens, and parentheses' };
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 10) return { valid: false, message: 'Phone number must be exactly 10 digits' };
    return { valid: true };
}

function validateName(name, fieldName) {
    if (!name) return { valid: false, message: `${fieldName} is required` };
    if (name.length < 2) return { valid: false, message: `${fieldName} must be at least 2 characters long` };
    if (!/^[a-zA-Z\s\-']+$/.test(name)) return { valid: false, message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
    return { valid: true };
}

function validateNumber(number, fieldName, min = 0) {
    if (!number && number !== 0) return { valid: false, message: `${fieldName} is required` };
    if (isNaN(number)) return { valid: false, message: `${fieldName} must be a valid number` };
    if (number < min) return { valid: false, message: `${fieldName} must be at least ${min}` };
    return { valid: true };
}

function validateDate(date, fieldName) {
    if (!date) return { valid: false, message: `${fieldName} is required` };
    const selectedDate = new Date(date);
    const today = new Date();
    if (selectedDate >= today) return { valid: false, message: `${fieldName} must be in the past` };
    return { valid: true };
}

function showValidationPopup(message, inputElement) {
    // Remove any existing popup
    removeValidationPopup();

    const popup = document.createElement('div');
    popup.className = 'validation-popup';
    popup.textContent = message;

    // Position the popup
    const rect = inputElement.getBoundingClientRect();
    popup.style.position = 'fixed';
    popup.style.left = rect.left + 'px';
    popup.style.top = (rect.bottom + 5) + 'px';
    popup.style.zIndex = '10000';

    document.body.appendChild(popup);

    // Add red border to input
    inputElement.classList.add('validation-error');

    // Remove popup after 4 seconds
    setTimeout(() => removeValidationPopup(), 4000);
}

function removeValidationPopup() {
    const existingPopup = document.querySelector('.validation-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Remove error styling from all inputs
    document.querySelectorAll('.validation-error').forEach(input => {
        input.classList.remove('validation-error');
    });
}

// Password toggle functionality
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.parentNode.querySelector('.password-toggle-btn');

    if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.innerHTML = '🙈';
        toggleBtn.setAttribute('aria-label', 'Hide password');
    } else {
        input.type = 'password';
        toggleBtn.innerHTML = '👁️';
        toggleBtn.setAttribute('aria-label', 'Show password');
    }
}

// Enhanced validation popup function with types
function showValidationPopupWithType(message, inputElement, type = 'error') {
    // Remove any existing popup
    removeValidationPopup();

    const popup = document.createElement('div');
    popup.className = `validation-popup ${type}`;
    popup.textContent = message;

    // Position the popup
    const rect = inputElement.getBoundingClientRect();
    popup.style.position = 'fixed';
    popup.style.left = rect.left + 'px';
    popup.style.top = (rect.bottom + 5) + 'px';
    popup.style.zIndex = '10000';

    document.body.appendChild(popup);

    // Add appropriate styling to input
    inputElement.classList.remove('validation-error', 'validation-success');
    if (type === 'error') {
        inputElement.classList.add('validation-error');
    } else if (type === 'success') {
        inputElement.classList.add('validation-success');
    }

    // Add validation icon
    addValidationIcon(inputElement, type);

    // Remove popup after 4 seconds
    setTimeout(() => removeValidationPopup(), 4000);
}

// Add validation icon to input field
function addValidationIcon(inputElement, type) {
    // Remove existing icon
    const existingIcon = inputElement.parentNode.querySelector('.validation-icon');
    if (existingIcon) {
        existingIcon.remove();
    }

    // Create new icon
    const icon = document.createElement('span');
    icon.className = `validation-icon ${type}`;

    if (type === 'success') {
        icon.innerHTML = '✓';
    } else if (type === 'error') {
        icon.innerHTML = '✗';
    } else if (type === 'warning') {
        icon.innerHTML = '⚠';
    }

    // Position icon appropriately
    inputElement.parentNode.style.position = 'relative';
    inputElement.parentNode.appendChild(icon);
}

// Enhanced field validation functions
function validateEmailField(email) {
    if (!email) {
        return { valid: false, message: 'Email is required' };
    }
    if (!validateEmail(email)) {
        return { valid: false, message: 'Please enter a valid email address' };
    }
    return { valid: true, message: 'Valid email address' };
}

function validatePasswordField(password, isRequired = true) {
    if (!password && isRequired) {
        return { valid: false, message: 'Password is required' };
    }
    if (password && password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters long' };
    }
    if (password && !/\d/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true, message: password ? 'Strong password' : 'Password is optional' };
}

function validateNameField(name, fieldName = 'Name') {
    if (!name) {
        return { valid: false, message: `${fieldName} is required` };
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
        return { valid: false, message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
    }
    if (name.length < 2) {
        return { valid: false, message: `${fieldName} must be at least 2 characters long` };
    }
    return { valid: true, message: `Valid ${fieldName.toLowerCase()}` };
}

function validatePhoneField(phone) {
    if (!phone) {
        return { valid: false, message: 'Phone number is required' };
    }
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(phone)) {
        return { valid: false, message: 'Please enter a valid 10-digit phone number' };
    }
    return { valid: true, message: 'Valid phone number' };
}

function validateDateField(date, fieldName = 'Date') {
    if (!date) {
        return { valid: false, message: `${fieldName} is required` };
    }
    const inputDate = new Date(date);
    const today = new Date();
    if (inputDate > today) {
        return { valid: false, message: `${fieldName} cannot be in the future` };
    }
    return { valid: true, message: `Valid ${fieldName.toLowerCase()}` };
}

// Real-time validation setup
function setupRealTimeValidation() {
    // Email fields
    document.querySelectorAll('input[type="email"]').forEach(input => {
        input.addEventListener('blur', function() {
            const validation = validateEmailField(this.value);
            const type = validation.valid ? 'success' : 'error';
            if (!validation.valid) {
                showValidationPopupWithType(validation.message, this, type);
            } else {
                addValidationIcon(this, type);
            }
        });
    });

    // Password fields
    document.querySelectorAll('input[type="password"]').forEach(input => {
        input.addEventListener('blur', function() {
            const isRequired = this.hasAttribute('required');
            const validation = validatePasswordField(this.value, isRequired);
            const type = validation.valid ? 'success' : 'error';
            if (!validation.valid) {
                showValidationPopupWithType(validation.message, this, type);
            } else if (this.value) {
                addValidationIcon(this, type);
            }
        });
    });

    // Name fields (first name, last name)
    document.querySelectorAll('input[name="first_name"], input[name="last_name"]').forEach(input => {
        input.addEventListener('blur', function() {
            const fieldName = this.name === 'first_name' ? 'First name' : 'Last name';
            const validation = validateNameField(this.value, fieldName);
            const type = validation.valid ? 'success' : 'error';
            if (!validation.valid) {
                showValidationPopupWithType(validation.message, this, type);
            } else {
                addValidationIcon(this, type);
            }
        });
    });

    // Phone fields
    document.querySelectorAll('input[type="tel"], input[name="phone"]').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value) { // Only validate if there's a value (phone is often optional)
                const validation = validatePhoneField(this.value);
                const type = validation.valid ? 'success' : 'error';
                if (!validation.valid) {
                    showValidationPopupWithType(validation.message, this, type);
                } else {
                    addValidationIcon(this, type);
                }
            }
        });
    });

    // Date fields
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value) {
                const fieldName = this.name.includes('birth') ? 'Date of birth' : 'Date';
                const validation = validateDateField(this.value, fieldName);
                const type = validation.valid ? 'success' : 'error';
                if (!validation.valid) {
                    showValidationPopupWithType(validation.message, this, type);
                } else {
                    addValidationIcon(this, type);
                }
            }
        });
    });
}

function validateFormField(inputElement, validationFunction, ...args) {
    const validation = validationFunction(inputElement.value, ...args);
    if (!validation.valid) {
        showValidationPopup(validation.message, inputElement);
        return false;
    }
    return true;
}

// Form Handlers
function setupModalHandlers() {
    // Close modal when clicking outside
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    document.getElementById('data-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDataModal();
        }
    });

    // Header buttons
    document.getElementById('login-btn')?.addEventListener('click', showLoginForm);
    document.getElementById('logout-btn')?.addEventListener('click', logout);

    // ESC key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeDataModal();
        }
    });

    // Global click handler to remove validation popups
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.validation-popup') && !e.target.matches('input, select, textarea')) {
            removeValidationPopup();
        }
    });
}

function setupFormHandlers() {
    // Login form
    const loginForm = document.getElementById('customer-login-form');
    if (loginForm && !loginForm.hasAttribute('data-handler-added')) {
        loginForm.setAttribute('data-handler-added', 'true');
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            handleLogin(email, password);
        });
    }

    // Quote calculator
    const quoteForm = document.getElementById('quote-calculator');
    if (quoteForm && !quoteForm.hasAttribute('data-handler-added')) {
        quoteForm.setAttribute('data-handler-added', 'true');
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateQuote();
        });
    }

    // Claim form
    const claimForm = document.getElementById('submit-claim-form');
    if (claimForm && !claimForm.hasAttribute('data-handler-added')) {
        claimForm.setAttribute('data-handler-added', 'true');
        claimForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitClaim();
        });
    }

    // Customer registration
    const customerForm = document.getElementById('create-customer-form');
    if (customerForm && !customerForm.hasAttribute('data-handler-added')) {
        customerForm.setAttribute('data-handler-added', 'true');
        customerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            registerCustomer();
        });

        // Add real-time validation for customer form
        const customerEmailInput = document.getElementById('customer-email');
        const customerPasswordInput = document.getElementById('customer-password');
        const firstNameInput = document.getElementById('first-name');
        const lastNameInput = document.getElementById('last-name');
        const phoneInput = document.getElementById('phone');

        if (customerEmailInput) {
            customerEmailInput.addEventListener('blur', function() {
                validateFormField(this, validateEmail);
            });
        }

        if (customerPasswordInput) {
            customerPasswordInput.addEventListener('blur', function() {
                validateFormField(this, validatePassword);
            });
        }

        if (firstNameInput) {
            firstNameInput.addEventListener('blur', function() {
                validateFormField(this, validateName, 'First name');
            });
        }

        if (lastNameInput) {
            lastNameInput.addEventListener('blur', function() {
                validateFormField(this, validateName, 'Last name');
            });
        }

        if (phoneInput) {
            phoneInput.addEventListener('blur', function() {
                validateFormField(this, validatePhone);
            });
        }
    }

    // Broker registration
    const brokerForm = document.getElementById('create-broker-form');
    if (brokerForm && !brokerForm.hasAttribute('data-handler-added')) {
        brokerForm.setAttribute('data-handler-added', 'true');
        brokerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            registerBroker();
        });
    }

    // Broker edit
    const editBrokerForm = document.getElementById('edit-broker-form');
    if (editBrokerForm && !editBrokerForm.hasAttribute('data-handler-added')) {
        editBrokerForm.setAttribute('data-handler-added', 'true');
        editBrokerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateBroker();
        });
    }

    // Policy creation
    const policyForm = document.getElementById('create-policy-form');
    if (policyForm && !policyForm.hasAttribute('data-handler-added')) {
        policyForm.setAttribute('data-handler-added', 'true');
        policyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createPolicy();
        });
    }

    // Customer edit form
    const editCustomerForm = document.getElementById('edit-customer-form');
    if (editCustomerForm && !editCustomerForm.hasAttribute('data-handler-added')) {
        editCustomerForm.setAttribute('data-handler-added', 'true');
        editCustomerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateCustomer();
        });

        // Add real-time validation for edit customer form
        const editEmailInput = document.getElementById('edit-customer-email');
        const editPasswordInput = document.getElementById('edit-customer-password');
        const editFirstNameInput = document.getElementById('edit-first-name');
        const editLastNameInput = document.getElementById('edit-last-name');
        const editPhoneInput = document.getElementById('edit-phone');

        if (editEmailInput) {
            editEmailInput.addEventListener('blur', function() {
                validateFormField(this, validateEmail);
            });
        }

        if (editPasswordInput) {
            editPasswordInput.addEventListener('blur', function() {
                if (this.value) { // Only validate if password is provided
                    validateFormField(this, validatePassword);
                }
            });
        }

        if (editFirstNameInput) {
            editFirstNameInput.addEventListener('blur', function() {
                validateFormField(this, validateName, 'First name');
            });
        }

        if (editLastNameInput) {
            editLastNameInput.addEventListener('blur', function() {
                validateFormField(this, validateName, 'Last name');
            });
        }

        if (editPhoneInput) {
            editPhoneInput.addEventListener('blur', function() {
                validateFormField(this, validatePhone);
            });
        }
    }
}

async function calculateQuote() {
    try {
        const policyType = document.getElementById('quote-policy-type').value;
        const coverageAmount = document.getElementById('quote-coverage').value;
        const customerAge = document.getElementById('quote-age').value;

        showToast('Calculating quote...', 'loading', 2000);

        const response = await fetch(`${API_BASE}/quotes?policy_type=${policyType}&coverage_amount=${coverageAmount}&customer_age=${customerAge}`);
        const data = await response.json();

        if (data.success) {
            const resultDiv = document.getElementById('quote-result');
            resultDiv.innerHTML = `
                <div class="quote-card">
                    <h3>Your Insurance Quote</h3>
                    <div class="quote-details">
                        <div class="detail-row">
                            <span class="label">Policy Type:</span>
                            <span class="value">${data.data.policy_type.charAt(0).toUpperCase() + data.data.policy_type.slice(1)} Insurance</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Coverage Amount:</span>
                            <span class="value">$${data.data.coverage_amount.toLocaleString()}</span>
                        </div>
                        <div class="detail-row highlight">
                            <span class="label">Annual Premium:</span>
                            <span class="value premium">$${data.data.estimated_premium}/year</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Quote ID:</span>
                            <span class="value">${data.data.quote_id}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Valid Until:</span>
                            <span class="value">${new Date(data.data.valid_until).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="quote-actions">
                        <button class="action-button primary" onclick="convertQuoteToPolicy('${data.data.quote_id}')">
                            Apply for This Policy
                        </button>
                        <button class="action-button secondary" onclick="clearQuoteForm()">
                            Get Another Quote
                        </button>
                    </div>
                </div>
            `;
            resultDiv.style.display = 'block';

            // Add class to quote form to expand layout
            const quoteForm = document.querySelector('.quote-form');
            if (quoteForm) {
                quoteForm.classList.add('results-shown');
            }

            showToast('Quote calculated successfully', 'success');
        } else {
            showToast(`Quote calculation failed: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Quote error: ${error.message}`, 'error');
    }
}

async function submitClaim() {
    try {
        const formData = {
            policy_id: document.getElementById('claim-policy').value,
            customer_id: currentUser.id,
            claim_type: document.getElementById('claim-type').value,
            incident_date: document.getElementById('incident-date').value,
            claim_amount: parseFloat(document.getElementById('claim-amount').value),
            description: document.getElementById('claim-description').value,
            incident_location: document.getElementById('incident-location').value
        };

        showToast('Submitting claim...', 'loading', 2000);

        const response = await fetch(`${API_BASE}/claims`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showToast(`Claim submitted successfully. Claim #: ${data.data.claim_number}`, 'success');
            closeModal();
        } else {
            showToast(`Claim submission failed: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Claim submission error: ${error.message}`, 'error');
    }
}

async function registerCustomer() {
    try {
        const emailInput = document.getElementById('customer-email');
        const passwordInput = document.getElementById('customer-password');
        const firstNameInput = document.getElementById('first-name');
        const lastNameInput = document.getElementById('last-name');
        const dobInput = document.getElementById('date-of-birth');
        const phoneInput = document.getElementById('phone');

        // Validate all fields
        let isValid = true;

        if (!validateFormField(emailInput, validateEmail)) isValid = false;
        if (!validateFormField(passwordInput, validatePassword)) isValid = false;
        if (!validateFormField(firstNameInput, validateName, 'First name')) isValid = false;
        if (!validateFormField(lastNameInput, validateName, 'Last name')) isValid = false;
        if (dobInput.value && !validateFormField(dobInput, validateDate, 'Date of birth')) isValid = false;
        if (!validateFormField(phoneInput, validatePhone)) isValid = false;

        if (!isValid) {
            showToast('Please fix the validation errors above', 'error');
            return;
        }

        const formData = {
            email: emailInput.value,
            password: passwordInput.value,
            first_name: firstNameInput.value,
            last_name: lastNameInput.value,
            date_of_birth: dobInput.value,
            phone: phoneInput.value
        };

        showToast('Registering customer...', 'loading', 2000);

        const response = await fetch(`${API_BASE}/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showToast(`Customer registered successfully. Customer #: ${data.data.customer_number}`, 'success');
            closeModal();
            loadDashboardData(); // Refresh counts
        } else {
            showToast(`Registration failed: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Registration error: ${error.message}`, 'error');
    }
}

async function registerBroker() {
    try {
        const firstNameInput = document.getElementById('broker-first-name');
        const lastNameInput = document.getElementById('broker-last-name');
        const emailInput = document.getElementById('broker-email');
        const phoneInput = document.getElementById('broker-phone');
        const companyInput = document.getElementById('broker-company');
        const licenseInput = document.getElementById('broker-license');
        const territoryInput = document.getElementById('broker-territory');
        const specializationInput = document.getElementById('broker-specialization');
        const commissionInput = document.getElementById('broker-commission');

        // Basic validation
        if (!firstNameInput.value.trim() || !lastNameInput.value.trim() || !emailInput.value.trim() || !companyInput.value.trim()) {
            showToast('Please fill in all required fields (marked with *)', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        const formData = {
            first_name: firstNameInput.value.trim(),
            last_name: lastNameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            company_name: companyInput.value.trim(),
            license_number: licenseInput.value.trim(),
            territory: territoryInput.value.trim(),
            specialization: specializationInput.value.trim(),
            commission_rate: commissionInput.value ? (parseFloat(commissionInput.value) / 100) : 0.05
        };

        showToast('Registering broker...', 'loading', 2000);

        const response = await fetch(`${API_BASE}/brokers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showToast(`Broker registered successfully. Broker Code: ${data.data.broker_code}`, 'success');
            closeModal();
            loadDashboardData(); // Refresh counts
        } else {
            showToast(`Registration failed: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Registration error: ${error.message}`, 'error');
    }
}

async function updateBroker() {
    try {
        const brokerIdInput = document.getElementById('edit-broker-id');
        const firstNameInput = document.getElementById('edit-broker-first-name');
        const lastNameInput = document.getElementById('edit-broker-last-name');
        const emailInput = document.getElementById('edit-broker-email');
        const phoneInput = document.getElementById('edit-broker-phone');
        const companyInput = document.getElementById('edit-broker-company');
        const licenseInput = document.getElementById('edit-broker-license');
        const territoryInput = document.getElementById('edit-broker-territory');
        const specializationInput = document.getElementById('edit-broker-specialization');
        const commissionInput = document.getElementById('edit-broker-commission');
        const statusInput = document.getElementById('edit-broker-status');

        // Basic validation
        if (!firstNameInput.value.trim() || !lastNameInput.value.trim() || !emailInput.value.trim() || !companyInput.value.trim()) {
            showToast('Please fill in all required fields (marked with *)', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        const formData = {
            first_name: firstNameInput.value.trim(),
            last_name: lastNameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            company_name: companyInput.value.trim(),
            license_number: licenseInput.value.trim(),
            territory: territoryInput.value.trim(),
            specialization: specializationInput.value.trim(),
            commission_rate: commissionInput.value ? (parseFloat(commissionInput.value) / 100) : 0.05,
            status: statusInput.value
        };

        showToast('Updating broker...', 'loading', 2000);

        const response = await fetch(`${API_BASE}/brokers/${brokerIdInput.value}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Broker updated successfully', 'success');
            closeModal();
            closeDataModal();
            // Refresh broker list if it's currently displayed
            loadBrokers();
        } else {
            showToast(`Update failed: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Update error: ${error.message}`, 'error');
    }
}

async function createPolicy() {
    try {
        const brokerSelect = document.getElementById('policy-broker');
        if (!brokerSelect.value) {
            showToast('Please select a broker. Broker is required for policy creation.', 'error');
            return;
        }

        const formData = {
            customer_id: document.getElementById('policy-customer').value,
            broker_id: document.getElementById('policy-broker').value,
            policy_type: document.getElementById('policy-type').value,
            product_name: document.getElementById('policy-type').options[document.getElementById('policy-type').selectedIndex].text,
            coverage_amount: parseFloat(document.getElementById('coverage-amount').value),
            premium_amount: parseFloat(document.getElementById('premium-amount').value),
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };

        showToast('Creating policy...', 'loading', 2000);

        const response = await fetch(`${API_BASE}/policies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showToast(`Policy created successfully. Policy #: ${data.data.policy_number}`, 'success');
            closeModal();
            loadDashboardData(); // Refresh counts
        } else {
            showToast(`Policy creation failed: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Policy creation error: ${error.message}`, 'error');
    }
}

// Utility Functions
function updateCounters() {
    // Update footer counters
    if (currentUser) {
        document.getElementById('customer-counter').textContent = '1';
    }
}

exportDisplayedData = function() {
    const dataContent = document.getElementById('data-modal-content');
    if (dataContent) {
        const table = dataContent.querySelector('table');
        if (table) {
            let csvContent = '';
            const rows = table.querySelectorAll('tr');

            rows.forEach(row => {
                const cells = row.querySelectorAll('th, td');
                const rowData = Array.from(cells).map(cell =>
                    `"${cell.textContent.replace(/"/g, '""')}"`
                ).join(',');
                csvContent += rowData + '\n';
            });

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'insurance_data_export.csv';
            a.click();
            window.URL.revokeObjectURL(url);
            showToast('Data exported successfully', 'success');
        }
    }
}

clearQuoteForm = function() {
    // Clear all form fields
    document.getElementById('quote-policy-type').value = '';
    document.getElementById('quote-coverage').value = '';
    document.getElementById('quote-age').value = '';
    document.getElementById('quote-zip').value = '';

    // Hide quote result
    const resultDiv = document.getElementById('quote-result');
    if (resultDiv) {
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = '';
    }

    // Remove results-shown class from quote form
    const quoteForm = document.querySelector('.quote-form');
    if (quoteForm) {
        quoteForm.classList.remove('results-shown');
    }

    showToast('Quote form cleared', 'info');
}

convertQuoteToPolicy = function(quoteId) {
    if (!currentUser) {
        showToast('Please login to apply for a policy', 'warning');
        showLoginForm();
        return;
    }
    showToast('This feature would redirect to policy application', 'info');
}

// Customer CRUD Functions
editCustomer = async function(customerId) {
    // Authentication check - only allow authenticated users to edit customers
    if (!currentUser) {
        showToast('Please login to edit customers', 'warning');
        showLoginForm();
        return;
    }

    try {
        showToast('Loading customer data...', 'loading', 2000);
        const response = await fetch(`${API_BASE}/customers/${customerId}`);
        const data = await response.json();

        if (data.success) {
            closeDataModal(); // Close the customer list modal
            openModal('edit-customer-form-template');

            // Populate the form with customer data
            const customer = data.data;
            document.getElementById('edit-customer-id').value = customer.id;
            document.getElementById('edit-customer-email').value = customer.email || '';
            document.getElementById('edit-first-name').value = customer.first_name || '';
            document.getElementById('edit-last-name').value = customer.last_name || '';
            document.getElementById('edit-date-of-birth').value = customer.date_of_birth || '';
            document.getElementById('edit-phone').value = customer.phone || '';
            document.getElementById('edit-address').value = customer.address || '';
            document.getElementById('edit-city').value = customer.city || '';
            document.getElementById('edit-state').value = customer.state || '';
            document.getElementById('edit-zip-code').value = customer.zip_code || '';
            document.getElementById('edit-employment-status').value = customer.employment_status || '';
            document.getElementById('edit-annual-income').value = customer.annual_income || '';
        } else {
            showToast(`Error loading customer: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Error loading customer: ${error.message}`, 'error');
    }
}

async function updateCustomer() {
    try {
        const customerId = document.getElementById('edit-customer-id').value;
        const emailInput = document.getElementById('edit-customer-email');
        const passwordInput = document.getElementById('edit-customer-password');
        const firstNameInput = document.getElementById('edit-first-name');
        const lastNameInput = document.getElementById('edit-last-name');
        const dobInput = document.getElementById('edit-date-of-birth');
        const phoneInput = document.getElementById('edit-phone');

        // Validate required fields
        let isValid = true;
        if (!validateFormField(emailInput, validateEmail)) isValid = false;
        if (passwordInput.value && !validateFormField(passwordInput, validatePassword)) isValid = false;
        if (!validateFormField(firstNameInput, validateName, 'First name')) isValid = false;
        if (!validateFormField(lastNameInput, validateName, 'Last name')) isValid = false;
        if (dobInput.value && !validateFormField(dobInput, validateDate, 'Date of birth')) isValid = false;
        if (!validateFormField(phoneInput, validatePhone)) isValid = false;

        if (!isValid) {
            showToast('Please fix the validation errors above', 'error');
            return;
        }

        const updateData = {
            email: emailInput.value,
            first_name: firstNameInput.value,
            last_name: lastNameInput.value,
            date_of_birth: document.getElementById('edit-date-of-birth').value,
            phone: phoneInput.value,
            address: document.getElementById('edit-address').value,
            city: document.getElementById('edit-city').value,
            state: document.getElementById('edit-state').value,
            zip_code: document.getElementById('edit-zip-code').value,
            employment_status: document.getElementById('edit-employment-status').value,
            annual_income: document.getElementById('edit-annual-income').value
        };

        // Only include password if it was provided
        if (passwordInput.value) {
            updateData.password = passwordInput.value;
        }

        showToast('Updating customer...', 'loading', 2000);

        const response = await fetch(`${API_BASE}/admin/customers/${customerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Customer updated successfully', 'success');
            closeModal();
            loadDashboardData(); // Refresh counts
        } else {
            showToast(`Update failed: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Update error: ${error.message}`, 'error');
    }
}

deleteCustomer = async function(customerId, customerName) {
    // Authentication check - only allow authenticated users to delete customers
    if (!currentUser) {
        showToast('Please login to delete customers', 'warning');
        showLoginForm();
        return;
    }

    const confirmed = confirm(`Are you sure you want to delete customer "${customerName}"?\n\nThis action cannot be undone and will also delete all associated policies and claims.`);

    if (!confirmed) return;

    try {
        showToast('Deleting customer...', 'loading', 2000);

        const response = await fetch(`${API_BASE}/admin/customers/${customerId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showToast(`Customer "${customerName}" deleted successfully`, 'success');
            closeDataModal();
            loadDashboardData(); // Refresh counts
            // Reload customers if the modal is still open
            setTimeout(() => loadCustomers(), 500);
        } else {
            showToast(`Delete failed: ${data.message}`, 'error');
        }
    } catch (error) {
        showToast(`Delete error: ${error.message}`, 'error');
    }
}

// Database Reset Function
resetDatabase = async function() {
    // Authentication check - only allow authenticated users to reset database (admin action)
    if (!currentUser) {
        showToast('Please login to reset the database', 'warning');
        showLoginForm();
        return;
    }

    const confirmed = confirm(
        '🔄 Reset Database?\n\n' +
        'This will:\n' +
        '• Delete ALL current data\n' +
        '• Restore fresh test data\n' +
        '• Reset all customers, policies, and claims\n' +
        '• Log out current user\n\n' +
        'Are you sure you want to continue?'
    );

    if (!confirmed) return;

    try {
        showToast('🔄 Resetting database...', 'loading', 5000);

        const response = await fetch(`${API_BASE}/admin/reset-database`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            // Clear current user session
            currentUser = null;
            updateUserStatus();

            // Close any open modals
            closeModal();
            closeDataModal();

            showToast('✅ Database reset successfully! Fresh test data loaded.', 'success', 6000);

            // Refresh dashboard with new data
            setTimeout(() => {
                loadDashboardData();
                showToast('🎉 Ready for testing with fresh data!', 'success', 4000);
            }, 1000);

        } else {
            showToast(`❌ Reset failed: ${data.message}`, 'error', 8000);
        }
    } catch (error) {
        console.error('Database reset error:', error);
        showToast(`❌ Reset error: ${error.message}`, 'error', 8000);
    }
}

// Functions are now globally available through function declarations