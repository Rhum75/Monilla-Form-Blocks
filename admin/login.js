(function () {
    'use strict';

    function setMessage(text, type) {
        var el = document.getElementById('adminLoginMessage');
        if (!el) return;

        el.textContent = text || '';
        el.classList.remove('is-error', 'is-success');
        if (type) {
            el.classList.add(type);
        }
    }

    async function forceLogout() {
        try {
            await fetch('../backend/logout.php', {
                method: 'POST',
                credentials: 'same-origin'
            });
        } catch (err) {
            // Ignore errors; redirect still handled by caller.
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        var emailEl = document.getElementById('adminEmail');
        var passEl = document.getElementById('adminPassword');
        var submitBtn = document.getElementById('adminLoginBtn');
        if (!emailEl || !passEl || !submitBtn) return;

        var email = emailEl.value.trim();
        var password = passEl.value;

        if (!email || !password) {
            setMessage('Please enter email and password.', 'is-error');
            return;
        }

        submitBtn.disabled = true;
        setMessage('Signing in...', null);

        try {
            var response = await fetch('../backend/login.php', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    identity: email,
                    password: password
                })
            });

            var payload = {};
            try {
                payload = await response.json();
            } catch (jsonErr) {
                payload = { message: 'Invalid server response.' };
            }

            if (!response.ok) {
                setMessage(payload.message || 'Login failed.', 'is-error');
                submitBtn.disabled = false;
                return;
            }

            var role = String((payload.user && payload.user.role) || 'user').toLowerCase();
            if (role !== 'admin') {
                await forceLogout();
                setMessage('This account is not an admin.', 'is-error');
                submitBtn.disabled = false;
                return;
            }

            setMessage('Login successful. Redirecting...', 'is-success');
            window.location.href = 'dashboard.html';
        } catch (err) {
            setMessage('Network error. Open this page via Apache URL, e.g. http://localhost/Monilla-Form-Blocks/admin/login.html', 'is-error');
            submitBtn.disabled = false;
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var form = document.getElementById('adminLoginForm');
        if (!form) return;

        form.addEventListener('submit', handleSubmit);
    });
})();
