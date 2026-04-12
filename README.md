# Monilla-Form-Blocks

Monilla one-page website upgraded into a dynamic ordering system with authentication, cart, checkout, and order history.

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
│   ├── me.php
│   ├── products.php
│   ├── cart.php
│   ├── checkout.php
│   └── orders.php
├── database/
│   ├── precast.sql
│   └── migrations/
│       ├── 001_create_users.sql
│       └── 002_create_commerce_tables.sql
└── storage/
	└── logs/
```

## Setup steps (PHP + MySQL)

1. Copy `.env.example` to `.env`.
2. Edit `.env` with your own MySQL credentials.
3. Create database/tables by importing `database/precast.sql` in phpMyAdmin or MySQL CLI.
4. If your DB already exists, run `database/migrations/002_create_commerce_tables.sql`.
5. Run `database/migrations/003_add_user_role.sql` to add role/admin support to existing users tables.
6. Promote one account to admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

7. Serve this project with Apache/XAMPP/WAMP so PHP endpoints run.
8. Open `index.html` from your local server URL.

Example local URL:

```text
http://localhost/Monilla-Form-Blocks/login.html
```

## Backend endpoints

- `POST backend/signup.php`
- `POST backend/login.php`
- `POST backend/logout.php`
- `GET backend/me.php`
- `GET backend/admin/users.php` (admin only)
- `GET backend/products.php`
- `GET|POST|PATCH|DELETE backend/cart.php`
- `POST backend/checkout.php`
- `GET backend/orders.php`

## Implemented dynamic modules

- Account registration and login session
- Product listing with database-backed prices
- Add to cart, quantity updates, remove item
- Checkout and order creation
- Order history display for logged-in users

## Notes

- `index.html` is the storefront + ordering interface.
- `login.html` and `signup.html` are separate auth pages.
- Passwords are stored hashed using `password_hash()`.