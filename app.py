from flask import Flask, render_template, session, redirect, url_for, g, request
from database import get_db, close_db
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
from forms import LoginForm, RegistrationForm
from functools import wraps



app = Flask(__name__)
app.teardown_appcontext(close_db)
app.config["SECRET_KEY"] = "jordansPw"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

#############
# server side 
##############

@app.before_request
def logged_in_user():
    g.user = session.get("user_id", None)

def login_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if g.user is None:
            return redirect(url_for("login", next=request.url))
        return view(*args, **kwargs)
    return wrapped_view


#################
# login/register
#################

@app.route("/registration", methods=["GET", "POST"])
def registration():
    form = RegistrationForm()
    if form.validate_on_submit():
        user_id = form.user_id.data
        password = form.password.data
        db = get_db()

        user_in_db = db.execute("SELECT * FROM users WHERE user_id = ?;", (user_id,)).fetchone()
        if user_in_db:
            form.user_id.errors.append("User ID already exists! Please choose a different one.")
        else:
            hashed_password = generate_password_hash(password)
            db.execute("INSERT INTO users (user_id, password) VALUES (?, ?);", (user_id, hashed_password))
            db.commit()
            return redirect(url_for("login"))
    return render_template("register.html", form=form)

@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user_id = form.user_id.data
        password = form.password.data
        db = get_db()

        # check if the user exists
        user_in_db = db.execute("SELECT * FROM users WHERE user_id = ?;", (user_id,)).fetchone()
        if user_in_db is None:
            form.user_id.errors.append("No such user name!")
        elif not check_password_hash(user_in_db["password"], password):
            form.password.errors.append("Incorrect password!")
        else:
            # log the user in
            session.clear()
            session["user_id"] = user_id
            session.modified = True
            next_page = request.args.get("next")

            if not next_page:
                next_page = url_for("index")
            return redirect(next_page)
    return render_template("login.html", form=form)

@app.route("/logout")
@login_required
def logout():
    session.clear()
    session.modified = True 
    return redirect( url_for("index"))

###########
# basics
############

@app.route("/")
@login_required
def index():
    return render_template("menu.html")

@app.route('/game')
@login_required
def game():
    user = g.user
    is_admin = user == "admin"  # Check if the username is "admin"
    return render_template('game.html', user=user, is_admin=is_admin)

@app.route('/references')
@login_required
def references():
    return render_template("references.html")

############
# user 
############
@app.route('/user')
@login_required
def user():
    db = get_db()
    user_id = session.get("user_id")
    user_data = db.execute("SELECT * FROM users WHERE user_id = ?;", (user_id,)).fetchone()
    return render_template("profile.html", user=user_data)

@app.before_request
def logged_in_user():
    g.user = session.get("user_id", None)

##############
# store score
##############
@app.route('/leaderboard')
@login_required
def leaderboard():
    db = get_db()
    leaderboard_data = db.execute(
        "SELECT user_id, level FROM leaderboards ORDER BY level DESC LIMIT 10;"
    ).fetchall()
    return render_template("leaderboard.html", leaderboard=leaderboard_data)

@app.route('/store_score', methods=['POST'])
@login_required
def store_level():
    level = request.form.get('level')  # Get the level from the request
    user_id = g.user

    if level is None or user_id is None:
        return "fail", 400

    try:
        level = int(level)
        db = get_db()

        # Insert or update the level for the user
        existing_entry = db.execute(
            "SELECT * FROM leaderboards WHERE user_id = ?;", (user_id,)
        ).fetchone()

        if existing_entry:
            # Update the level if the new level is higher
            if level > existing_entry["level"]:
                db.execute(
                    "UPDATE leaderboards SET level = ? WHERE user_id = ?;",
                    (level, user_id)
                )
        else:
            # Insert a new entry if none exists
            db.execute(
                "INSERT INTO leaderboards (user_id, level) VALUES (?, ?);",
                (user_id, level)
            )

        db.commit()
        return "success", 200

    except ValueError:
        return "fail", 400
    except Exception as e:
        print(f"Database error: {e}")
        return "fail", 500
    

@app.route('/game_over')
@login_required
def game_over():
    level = request.args.get('level', 0)
    user = g.user
    return render_template('game_over.html', level=level, user=user)


if __name__ == "__main__":
    app.run(debug=True)