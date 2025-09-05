from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    # For hosting, do NOT use debug=True; Dont use. Render sets its own environment
    app.run(host="0.0.0.0", port=5000)
