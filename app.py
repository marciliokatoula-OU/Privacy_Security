#Password generator 
#Generate password /generate
#save to database /save

#Password generator 
#Generate password /generate
#save to database /save

from flask import Flask, request, render_template, redirect
import sqlite3

app = Flask(__name__)

# Show home page
@app.route("/")
def index():
    return render_template("home.html")

# Show create account page
@app.route("/create")
def create():
    return render_template("account.html")

# Connect to your database
def get_db():
    conn = sqlite3.connect("password_manager.db")
    conn.row_factory = sqlite3.Row
    return conn

# Creates accounts and handles if the account is not created
@app.route("/create_account", methods=["POST"])
def create_account():
    email = request.form["email"]
    password = request.form["password"]

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            (email, password)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return "Email already exists!"
    
    conn.close()
    return render_template("success.html")


@app.route("/login", methods=["POST"])
def login():
    email = request.form["email"]
    password = request.form["password"]

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE email = ? AND password = ?", (email, password))
    user = cur.fetchone()

    conn.close()

    if user:
        # Login successful go to password manager page
        return redirect("/manager")
    else:
        return "Invalid email or password"

# Manager page
@app.route("/manager")
def manager():
    user_id = 1  

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM vault WHERE user_id = ?", (user_id,))
    passwords = cur.fetchall()

    conn.close()

    return render_template("manager.html", passwords=passwords)


@app.route("/new")
def new_account_page():
    return render_template("newaccount.html")

@app.route("/save_password", methods=["POST"])
def save_password():
    app_name = request.form["app_name"]
    app_username = request.form["app_username"]
    app_password = request.form["app_password"]

    user_id = 1  # temporary until sessions

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO vault (user_id, app_name, app_password) VALUES (?, ?, ?)",
        (user_id, app_name, app_password)
    )

    conn.commit()
    conn.close()

    return redirect("/manager")

if __name__ == "__main__":
    app.run(debug=True)
