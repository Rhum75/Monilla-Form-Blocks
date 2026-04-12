(function () {
    'use strict';

    function setText(id, value) {
        var el = document.getElementById(id);
        if (!el) return;
        el.textContent = String(value);
    }

    function showError(message) {
        var errorEl = document.getElementById('adminDashboardError');
        if (!errorEl) return;
        errorEl.hidden = false;
        errorEl.textContent = message;
    }

    function formatMoney(value) {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(Number(value) || 0);
    }

    function formatDate(rawValue) {
        if (!rawValue) return '-';
        var parsed = new Date(String(rawValue).replace(' ', 'T'));
        if (Number.isNaN(parsed.getTime())) return String(rawValue);

        return new Intl.DateTimeFormat('en-PH', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(parsed);
    }

    async function requireAdminSession() {
        var response = await fetch('../backend/me.php', { credentials: 'same-origin' });
        var payload = await response.json();

        if (!payload.authenticated || !payload.user) {
            window.location.href = 'login.html';
            return null;
        }

        var role = String(payload.user.role || 'user').toLowerCase();
        if (role !== 'admin') {
            showError('This account is not authorized to view the admin dashboard.');
            return null;
        }

        return payload.user;
    }

    async function loadStats() {
        var response = await fetch('../backend/admin/stats.php', {
            credentials: 'same-origin'
        });

        if (response.status === 401) {
            window.location.href = 'login.html';
            return;
        }

        if (response.status === 403) {
            showError('Admin access required.');
            return;
        }

        if (!response.ok) {
            showError('Could not load dashboard statistics.');
            return;
        }

        var payload = await response.json();
        var users = payload.users || {};
        var orders = payload.orders || {};

        setText('statTotalUsers', users.total || 0);
        setText('statNewUsersToday', users.newToday || 0);
        setText('statTotalOrders', orders.total || 0);
        setText('statPendingOrders', orders.pending || 0);
        setText('statOrderValue', formatMoney(orders.totalValue || 0));
    }

    async function loadRecentUsers() {
        var tbody = document.getElementById('recentUsersBody');
        if (!tbody) return;

        var response = await fetch('../backend/admin/users.php', {
            credentials: 'same-origin'
        });

        if (!response.ok) {
            tbody.innerHTML = '<tr><td colspan="5">Failed to load users.</td></tr>';
            return;
        }

        var payload = await response.json();
        var users = Array.isArray(payload.users) ? payload.users.slice(0, 6) : [];

        if (!users.length) {
            tbody.innerHTML = '<tr><td colspan="5">No users found.</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(function (user) {
            var role = String(user.role || 'user').toLowerCase();
            var safeRole = role === 'admin' ? 'admin' : 'user';
            return [
                '<tr>',
                '<td>' + (user.id || '-') + '</td>',
                '<td>' + (user.full_name || '-') + '</td>',
                '<td>' + (user.email || '-') + '</td>',
                '<td><span class="admin-role-pill ' + safeRole + '">' + safeRole.toUpperCase() + '</span></td>',
                '<td>' + formatDate(user.created_at) + '</td>',
                '</tr>'
            ].join('');
        }).join('');
    }

    async function logout() {
        try {
            await fetch('../backend/logout.php', {
                method: 'POST',
                credentials: 'same-origin'
            });
        } catch (err) {
            // ignore
        }
        window.location.href = 'login.html';
    }

    document.addEventListener('DOMContentLoaded', async function () {
        var logoutBtn = document.getElementById('adminLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }

        var user = null;
        try {
            user = await requireAdminSession();
        } catch (err) {
            showError('Unable to verify session.');
            return;
        }

        if (!user) return;

        setText('adminIdentityPill', user.name || 'Admin');

        try {
            await Promise.all([loadStats(), loadRecentUsers()]);
        } catch (err) {
            showError('Error loading dashboard data.');
        }
    });
})();
