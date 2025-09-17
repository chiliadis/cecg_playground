// Simple working version
console.log('App loading...');

// Basic functions
function showUserForm() {
    console.log('showUserForm called');
    alert('Show User Form - Working!');
    const forms = document.getElementById('forms-section');
    const userForm = document.getElementById('user-form');
    if (forms) forms.style.display = 'block';
    if (userForm) userForm.style.display = 'block';
}

function loadUsers() {
    console.log('loadUsers called');
    alert('Load Users - Working!');
}

function testLogin() {
    console.log('testLogin called');
    alert('Test Login - Working!');
}

function debugTest() {
    console.log('debugTest called');
    alert('Debug Test - JavaScript is working!');
}

// Make functions global
window.showUserForm = showUserForm;
window.loadUsers = loadUsers;
window.testLogin = testLogin;
window.debugTest = debugTest;

console.log('App loaded successfully');