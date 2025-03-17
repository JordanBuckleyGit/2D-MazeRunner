from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, PasswordField
from wtforms.validators import InputRequired, EqualTo

class RegistrationForm(FlaskForm):
    user_id = StringField("User id:",
                    validators=[InputRequired()])
    password = PasswordField("Password:",
                    validators=[InputRequired()])
    password2 = PasswordField("Repeat Password:",
                    validators=[InputRequired(),
                                EqualTo("password")])
    submit = SubmitField("Submit")

class LoginForm(FlaskForm):
    user_id = StringField("User id:",
                    validators=[InputRequired()])
    password = PasswordField("Password:",
                    validators=[InputRequired()])
    submit = SubmitField("Submit")