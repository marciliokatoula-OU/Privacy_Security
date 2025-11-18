import os
import sqlite3
import string
import secrets
from functools import wraps
from flask import (
	Flask,
	request,
	render_template,
	redirect,
	url_for,
	session,
	jsonify,
	g,
	abort,
)
from werkzeug.security import generate_password_hash, check_password_hash


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "app.db")

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET", "dev-secret-change-me")
app.config["DATABASE"] = DB_PATH


def get_db():
	if "db" not in g:
		g.db = sqlite3.connect(app.config["DATABASE"], detect_types=sqlite3.PARSE_DECLTYPES)
		g.db.row_factory = sqlite3.Row
	return g.db


@app.teardown_appcontext
def close_db(exception=None):
	db = g.pop("db", None)
	if db is not None:
		db.close()


def init_db():
	db = get_db()
	db.executescript(
		"""
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS passwords (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			site TEXT NOT NULL,
			login TEXT,
			password TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		);
		"""
	)
	db.commit()


@app.before_request
def ensure_db():
	# Initialize database if missing
	if not os.path.exists(app.config["DATABASE"]):
		# Ensure directory exists
		os.makedirs(os.path.dirname(app.config["DATABASE"]), exist_ok=True)
		init_db()


def login_required(view):
	@wraps(view)
	def wrapped(*args, **kwargs):
		if not session.get("user_id"):
			return redirect(url_for("login"))
		return view(*args, **kwargs)

	return wrapped


@app.route("/")
def index():
	if session.get("user_id"):
		return redirect(url_for("dashboard"))
	return redirect(url_for("login"))


@app.route("/register", methods=["GET", "POST"])
def register():
	if request.method == "POST":
		username = request.form.get("username", "").strip()
		password = request.form.get("password", "")
		if not username or not password:
			return render_template("register.html", error="Username and password required")

		db = get_db()
		try:
			db.execute(
				"INSERT INTO users (username, password_hash) VALUES (?, ?)",
				(username, generate_password_hash(password)),
			)
			db.commit()
		except sqlite3.IntegrityError:
			return render_template("register.html", error="Username already taken")

		return redirect(url_for("login"))

	return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
	if request.method == "POST":
		username = request.form.get("username", "").strip()
		password = request.form.get("password", "")
		db = get_db()
		user = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
		if not user or not check_password_hash(user["password_hash"], password):
			return render_template("login.html", error="Invalid credentials")

		session.clear()
		session["user_id"] = user["id"]
		session["username"] = user["username"]
		return redirect(url_for("dashboard"))

	return render_template("login.html")


@app.route("/logout", methods=["POST"]) 
def logout():
	session.clear()
	return redirect(url_for("login"))


@app.route("/dashboard")
@login_required
def dashboard():
	return render_template("dashboard.html", username=session.get("username"))


# API: Generate password
@app.get("/api/generate")
@login_required
def api_generate():
	try:
		length = int(request.args.get("length", 12))
	except ValueError:
		return jsonify({"error": "Invalid length"}), 400
	length = max(4, min(64, length))

	alphabet = string.ascii_letters + string.digits + string.punctuation
	# Ensure at least one of each category where possible
	choices = [
		secrets.choice(string.ascii_lowercase),
		secrets.choice(string.ascii_uppercase),
		secrets.choice(string.digits),
		secrets.choice(string.punctuation),
	]
	choices += [secrets.choice(alphabet) for _ in range(max(0, length - 4))]
	secrets.SystemRandom().shuffle(choices)
	password = "".join(choices)[:length]
	return jsonify({"password": password})


# API: Passwords CRUD
@app.get("/api/passwords")
@login_required
def list_passwords():
	db = get_db()
	rows = db.execute(
		"SELECT id, site, login, password, created_at FROM passwords WHERE user_id = ? ORDER BY created_at DESC",
		(session["user_id"],),
	).fetchall()
	return jsonify([dict(row) for row in rows])


@app.post("/api/passwords")
@login_required
def create_password():
	data = request.get_json(force=True, silent=True) or {}
	site = (data.get("site") or "").strip()
	login_value = (data.get("username") or data.get("login") or "").strip()
	pwd = (data.get("password") or "").strip()
	if not site or not pwd:
		return jsonify({"error": "'site' and 'password' are required"}), 400
	db = get_db()
	db.execute(
		"INSERT INTO passwords (user_id, site, login, password) VALUES (?, ?, ?, ?)",
		(session["user_id"], site, login_value, pwd),
	)
	db.commit()
	return jsonify({"status": "ok"}), 201


@app.delete("/api/passwords/<int:pwd_id>")
@login_required
def delete_password(pwd_id: int):
	db = get_db()
	res = db.execute(
		"DELETE FROM passwords WHERE id = ? AND user_id = ?",
		(pwd_id, session["user_id"]),
	)
	db.commit()
	if res.rowcount == 0:
		return jsonify({"error": "Not found"}), 404
	return jsonify({"status": "deleted"})


if __name__ == "__main__":
	# Ensure DB exists before starting
	if not os.path.exists(DB_PATH):
		os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
		with app.app_context():
			init_db()
	app.run(debug=True)

