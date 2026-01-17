from flask import Flask, render_template, request, redirect, session
import sqlite3
import random
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)
app.secret_key = 'clave_secreta_segura'


DB = 'database.db'


def get_db():
return sqlite3.connect(DB)


@app.before_first_request
def init_db():
db = get_db()
db.execute('''CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
account_number TEXT UNIQUE,
email TEXT UNIQUE,
password TEXT,
tokens INTEGER DEFAULT 100
)''')
db.execute('''CREATE TABLE IF NOT EXISTS transfers (
id INTEGER PRIMARY KEY AUTOINCREMENT,
sender TEXT,
receiver TEXT,
amount INTEGER
)''')
db.commit()




def generate_account():
db = get_db()
while True:
acc = str(random.randint(10**9, 10**10 - 1))
cur = db.execute('SELECT id FROM users WHERE account_number = ?', (acc,))
if not cur.fetchone():
return acc


@app.route('/', methods=['GET', 'POST'])
def login():
if request.method == 'POST':
email = request.form['email']
password = request.form['password']
db = get_db()
cur = db.execute('SELECT id, password FROM users WHERE email = ?', (email,))
user = cur.fetchone()
if user and check_password_hash(user[1], password):
session['user_id'] = user[0]
return redirect('/dashboard')
return render_template('login.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
if request.method == 'POST':
email = request.form['email']
password = generate_password_hash(request.form['password'])
acc = generate_account()
db = get_db()
db.execute('INSERT INTO users (email, password, account_number) VALUES (?, ?, ?)',
(email, password, acc))
db.commit()
return redirect('/')
return render_template('register.html')


@app.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
if 'user_id' not in session:
return redirect('/')
db = get_db()
user = db.execute('SELECT account_number, tokens FROM users WHERE id = ?',
(session['user_id'],)).fetchone()
app.run(debug=True)
