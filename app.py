from flask import Flask, render_template, request, session, redirect, url_for
from utils import parser
import json

app = Flask(__name__)

@app.route("/")
def home_page():
    return render_template("finished.html")

@app.route("/getData")
def getData():
    year = request.args.get("year")
    return json.dumps( parser.get_data_by_year(year) )



if __name__ == "__main__":
    app.debug = True
    app.run()
