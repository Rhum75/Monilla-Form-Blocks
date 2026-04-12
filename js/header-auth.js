(function () {
    'use strict';

    function getInitials(name) {
        if (!name) return '?';
        var parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    document.addEventListener('DOMContentLoaded', async function () {
        var userBtn = document.getElementById('headerUserBtn');
        var dropdown = document.getElementById('headerUserDropdown');
        var userWrap = document.getElementById('headerUserWrap');
        var logoutBtn = document.getElementById('headerLogoutBtn');

        if (!userBtn) return;

        // Determine base path for backend calls (works on both index.html and profile.html)
        var base = '';
        var path = window.location.pathname;
        if (path.indexOf('/admin/') !== -1) {
            base = '../';
        }

        // Check authentication state
        var user = null;
        try {
            var res = await fetch(base + 'backend/me.php', {
                credentials: 'same-origin',
                cache: 'no-store'
            });
            var data = await res.json();
            if (data.authenticated && data.user) {
                user = data.user;
            }
        } catch (e) {
            // Network error — treat as logged out
        }

        if (user) {
            // Show initials avatar
            var initials = getInitials(user.name);
            userBtn.innerHTML = '<span class="header-user-avatar">' + initials + '</span>';
            userBtn.setAttribute('aria-label', 'Account menu for ' + user.name);

            // Add admin shortcut for admin accounts.
            if (dropdown && String(user.role || '').toLowerCase() === 'admin') {
                var adminHref = base + 'admin/users.html';
                var existingAdminLink = dropdown.querySelector('a[data-admin-link="true"]');

                if (!existingAdminLink) {
                    var adminLink = document.createElement('a');
                    adminLink.className = 'header-dropdown-item';
                    adminLink.href = adminHref;
                    adminLink.setAttribute('data-admin-link', 'true');
                    adminLink.textContent = 'Admin Users';

                    if (logoutBtn && logoutBtn.parentNode === dropdown) {
                        dropdown.insertBefore(adminLink, logoutBtn);
                    } else {
                        dropdown.appendChild(adminLink);
                    }
                }
            }

            // Toggle dropdown on click
            userBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                dropdown.classList.toggle('hidden');
            });

            // Logout
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async function () {
                    try {
                        await fetch(base + 'backend/logout.php', { method: 'POST', credentials: 'same-origin' });
                    } catch (e) { }
                    window.location.href = base + 'login.html';
                });
            }
        } else {
            // Not logged in — user icon acts as a login link
            userBtn.setAttribute('aria-label', 'Sign in');
            userBtn.addEventListener('click', function () {
                window.location.href = base + 'login.html';
            });

            // Hide dropdown option when not logged in
            if (dropdown) dropdown.classList.add('hidden');
        }

        // Close dropdown on outside click
        document.addEventListener('click', function (e) {
            if (dropdown && userWrap && !userWrap.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        // Close dropdown on Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && dropdown) {
                dropdown.classList.add('hidden');
            }
        });
    });
})();
