(function () {
    'use strict';

    function showError(text) {
        var el = document.getElementById('usersError');
        if (!el) return;
        el.hidden = false;
        el.textContent = text;
    }

    function formatDate(raw) {
        if (!raw) return '-';
        var date = new Date(String(raw).replace(' ', 'T'));
        if (Number.isNaN(date.getTime())) return String(raw);
        return new Intl.DateTimeFormat('en-PH', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    }

    async function ensureAdmin() {
        var me = await fetch('../backend/me.php', { credentials: 'same-origin' });
        var payload = await me.json();

        if (!payload.authenticated || !payload.user) {
            window.location.href = 'login.html';
            return false;
        }

        var role = String(payload.user.role || 'user').toLowerCase();
        if (role !== 'admin') {
            showError('This account is not admin.');
            return false;
        }

        return true;
    }

    async function loadUsers() {
        var meta = document.getElementById('usersMeta');
        var tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        var response = await fetch('../backend/admin/users.php', {
            credentials: 'same-origin'
        });

        if (!response.ok) {
            showError('Failed to load users.');
            tbody.innerHTML = '<tr><td colspan="5">-</td></tr>';
            return;
        }

        var payload = await response.json();
        var users = Array.isArray(payload.users) ? payload.users : [];

        if (meta) {
            meta.textContent = 'Total users: ' + users.length;
        }

        if (!users.length) {
            tbody.innerHTML = '<tr><td colspan="5">No users found.</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(function (u) {
            var role = String(u.role || 'user').toLowerCase();
            var safeRole = role === 'admin' ? 'admin' : 'user';
            return [
                '<tr>',
                '<td>' + (u.id || '-') + '</td>',
                '<td>' + (u.full_name || '-') + '</td>',
                '<td>' + (u.email || '-') + '</td>',
                '<td><span class="role-pill ' + safeRole + '">' + safeRole.toUpperCase() + '</span></td>',
                '<td>' + formatDate(u.created_at) + '</td>',
                '</tr>'
            ].join('');
        }).join('');
    }

    document.addEventListener('DOMContentLoaded', async function () {
        try {
            var ok = await ensureAdmin();
            if (!ok) return;
            await loadUsers();
        } catch (err) {
            showError('Unable to load page right now.');
        }
    });
})();
