# Monilla-Form-Blocks

Monilla one-page website with starter authentication pages and PHP + MySQL backend files for sign up and login.

## Current clean structure

```text
Monilla-Form-Blocks/
├── index.html
├── login.html
├── signup.html
├── style.css
├── auth.css
├── README.md
├── .env.example
├── .gitignore
├── images/
├── videos/
├── js/
│   ├── script.js
│   ├── auth.js
│   └── validation.js
├── backend/
│   ├── config.php
│   ├── db.php
│   ├── utils.php
│   ├── signup.php
│   ├── login.php
│   ├── logout.php
│   └── me.php
├── database/
│   ├── precast.sql
│   └── migrations/
│       └── 001_create_users.sql
└── storage/
	└── logs/
```

## Setup steps (PHP + MySQL)

1. Copy `.env.example` to `.env`.
2. Edit `.env` with your own MySQL credentials.
3. Create database/tables by importing `database/precast.sql` in phpMyAdmin or MySQL CLI.
4. Serve this project with Apache/XAMPP/WAMP so PHP endpoints run.
5. Open `login.html` or `signup.html` from your local server URL.

Example local URL:

```text
http://localhost/Monilla-Form-Blocks/login.html
```

## Auth endpoints

- `POST backend/signup.php`
- `POST backend/login.php`
- `POST backend/logout.php`
- `GET backend/me.php`

## Notes

- Keep `index.html` as your single-page main website.
- `login.html` and `signup.html` are separate auth pages.
- Passwords are stored hashed using `password_hash()`.