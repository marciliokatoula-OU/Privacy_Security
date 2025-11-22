# Password Generator & Vault

This is a minimal Flask app that lets you:
- Create an account and sign in
- Generate secure passwords with a chosen length
- Store passwords with an associated site and optional login
- View and delete your stored passwords

Data is stored locally in a SQLite database file `app.db`.

## Setup (Windows PowerShell)

1) Create and activate a virtual environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2) Install dependencies

```powershell
pip install -r requirements.txt
```

3) Run the app

```powershell
python app.py
```

Open http://127.0.0.1:5000/ in your browser.

## Notes
- This example stores saved passwords as plain text in the database for simplicity. For production use, add encryption at rest (e.g., per-user key derived from a master password) and secrets management.
- Set an environment variable `FLASK_SECRET` to override the default dev secret.
- The UI has two tabs: Generator and Passwords. Use the Passwords tab to add entries and manage your vault.
