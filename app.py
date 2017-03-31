from flask import Flask, render_template, request, session, redirect, url_for

#import utils

app = Flask(__name__)

#root, two behaviors:
#    if logged in: redirects you to your feed
#    if not logged in: displays log in/register page
@app.route("/")
def home_page():
    return render_template("finished.html")

if __name__ == "__main__":
    app.debug = True
    app.run()
