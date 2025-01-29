import requests
import xml.etree.ElementTree as ET
from flask import Flask, request, jsonify, render_template
app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/get-workspaces', methods=['GET'])
def get_workspaces():
    url = 'http://wfas.firenet.gov/geoserver/rest/workspaces.json'
    username = 'admin'
    password = 'OR97045'

    response = requests.get(url, auth=(username, password))

    # Check if the request was successful
    if response.status_code == 200:
    # Parse and print the workspaces
        workspaces = response.json().get("workspaces", {}).get("workspace", [])
        workspace_names = [ws["name"] for ws in workspaces]
        print("Available Workspaces:", workspace_names)
        return jsonify(workspace_names)

@app.route('/get-layers', methods=['GET'])
def get_layers():
    workspace = request.args.get('workspace')
    url = f'https://wfas.firenet.gov/geoserver/{workspace}/ows?service=WMS&version=1.3.0&request=GetCapabilities'

    try:
        response = requests.get(url)
        response.raise_for_status()

        root = ET.fromstring(response.text)
        namespaces = {'wms': 'http://www.opengis.net/wms'}

        # Extract layer names using list comprehension
        layer_names = [layer.find('wms:Name', namespaces).text 
                       for layer in root.findall('.//wms:Layer', namespaces) 
                       if layer.find('wms:Name', namespaces) is not None]

        return jsonify(layer_names)

    except (requests.RequestException, ET.ParseError) as e:
        return jsonify({'error': str(e)}), 500




if __name__ == '__main__':
    app.run(debug=True, port=8083, host="0.0.0.0" )
