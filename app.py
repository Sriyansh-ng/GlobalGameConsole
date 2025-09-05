from flask import Flask, render_template

app = Flask(__name__)

# Route for Snake Game
@app.route("/")
def snake_game():
    return render_template("index.html")

if __name__ == "__main__":
    # Run on port 5001 to avoid conflicts with other Flask apps
    app.run(debug=True, port=5001)
