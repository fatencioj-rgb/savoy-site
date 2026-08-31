// ═══════════════════════════════════════════════════════════════════
// Savoy FOH — Page Guard
// ═══════════════════════════════════════════════════════════════════
// Include this script on protected pages AFTER auth.js
// It will redirect unauthenticated users back to index.html

(function() {
  // Hide page content until auth is confirmed
  document.documentElement.style.opacity = '0';
  document.documentElement.style.transition = 'opacity 0.3s ease';

  auth.onAuthStateChanged(function(user) {
    if (user) {
      // Guest users can only access training.html and winelist.html
      var isGuest = user.email && user.email.startsWith('guest');
      var page = window.location.pathname.split('/').pop() || 'index.html';
      var guestAllowed = ['training.html', 'winelist.html', 'index.html'];
      if (isGuest && guestAllowed.indexOf(page) < 0) {
        window.location.href = 'training.html';
        return;
      }

      // User is authenticated — show page
      document.documentElement.style.opacity = '1';
      logAccess(user, 'page_view');

      // Add logout button to top-bar if it exists
      var topBar = document.querySelector('.top-bar');
      if (topBar) {
        var logoutLink = document.createElement('a');
        logoutLink.textContent = 'Logout';
        logoutLink.href = '#';
        logoutLink.style.cssText = 'color:#b89650;text-decoration:none;font-size:11px;letter-spacing:1px;text-transform:uppercase;opacity:0.7;cursor:pointer';
        logoutLink.addEventListener('click', function(e) {
          e.preventDefault();
          savoyLogout().then(function() {
            window.location.href = 'index.html';
          });
        });
        var emptySpan = topBar.querySelector('span:last-child');
        if (emptySpan && !emptySpan.textContent.trim()) {
          topBar.replaceChild(logoutLink, emptySpan);
        }
      }
    } else {
      // Not authenticated — redirect to login
      window.location.href = 'index.html';
    }
  });
})();
