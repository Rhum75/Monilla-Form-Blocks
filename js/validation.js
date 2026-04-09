function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

function validateSignupPayload(payload) {
  if (!payload.name || !payload.email || !payload.password || !payload.confirmPassword) {
    return { ok: false, message: 'Please complete all fields.' };
  }

  if (!isValidEmail(payload.email)) {
    return { ok: false, message: 'Please enter a valid email address.' };
  }

  if (payload.password.length < 8) {
    return { ok: false, message: 'Password must be at least 8 characters.' };
  }

  if (payload.password !== payload.confirmPassword) {
    return { ok: false, message: 'Passwords do not match.' };
  }

  return { ok: true };
}

function validateLoginPayload(payload) {
  if (!payload.identity || !payload.password) {
    return { ok: false, message: 'Please enter your email and password.' };
  }

  return { ok: true };
}
