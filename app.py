from flask import Flask, render_template
import folium

app = Flask(__name__)

@app.route('/')
def index():
    # Create a Folium map centered at a specific location
    my_map = folium.Map(location=[latitude=48.8566, longitude=2.3522], zoom_start=12)

    # Add an OpenStreetMap tile layer to the map
    folium.TileLayer('openstreetmap').add_to(my_map)

    # Save the map as an HTML file or render it in the Flask template
    map_html = my_map._repr_html_()

    return render_template('index.html', map_html=map_html)