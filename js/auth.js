(function () {
    var signupForm = document.getElementById('signupForm');
    var loginForm = document.getElementById('loginForm');

    function setFormMessage(form, text, type) {
        var target = form.querySelector('.form-message');
        if (!target) {
            return;
        }

        target.textContent = text;
        target.classList.remove('success', 'error');
        if (type) {
            target.classList.add(type);
        }
    }

    async function sendJson(url, body) {
        var response = await fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        var data = {};
        try {
            data = await response.json();
        } catch (_error) {
            data = { message: 'Invalid server response.' };
        }

        return { ok: response.ok, data: data };
    }

    document.querySelectorAll('.eye-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var input = btn.closest('.input-row')?.querySelector('input[type="password"], input[type="text"]');
            if (!input) {
                return;
            }
            var isPassword = input.getAttribute('type') === 'password';
            input.setAttribute('type', isPassword ? 'text' : 'password');
            btn.classList.toggle('is-visible', isPassword);
            btn.setAttribute(
                'aria-label',
                isPassword ? (btn.dataset.hideLabel || 'Hide password') : (btn.dataset.showLabel || 'Show password')
            );
        });
    });

    if (signupForm) {
        signupForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            var payload = {
                name: document.getElementById('signupName')?.value.trim(),
                email: document.getElementById('signupEmail')?.value.trim(),
                password: document.getElementById('signupPassword')?.value || '',
                confirmPassword: document.getElementById('signupConfirmPassword')?.value || ''
            };

            var check = validateSignupPayload(payload);
            if (!check.ok) {
                setFormMessage(signupForm, check.message, 'error');
                return;
            }

            setFormMessage(signupForm, 'Creating account...', null);
            var result = await sendJson('backend/signup.php', payload);

            if (!result.ok) {
                setFormMessage(signupForm, result.data.message || 'Sign up failed.', 'error');
                return;
            }

            setFormMessage(signupForm, result.data.message || 'Account created.', 'success');
            signupForm.reset();
            setTimeout(function () {
                window.location.href = 'login.html';
            }, 1000);
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            var payload = {
                identity: document.getElementById('loginIdentity')?.value.trim(),
                password: document.getElementById('loginPassword')?.value || ''
            };

            var check = validateLoginPayload(payload);
            if (!check.ok) {
                setFormMessage(loginForm, check.message, 'error');
                return;
            }

            setFormMessage(loginForm, 'Signing in...', null);
            var result = await sendJson('backend/login.php', payload);

            if (!result.ok) {
                setFormMessage(loginForm, result.data.message || 'Login failed.', 'error');
                return;
            }

            setFormMessage(loginForm, result.data.message || 'Login successful.', 'success');
            setTimeout(function () {
                window.location.href = 'index.html';
            }, 800);
        });
    }
})();
