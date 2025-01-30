import requests
import xml.etree.ElementTree as ET
from flask import Flask, request, jsonify, render_template
app = Flask(__name__)

# Define correct namespaces for different services
Service_Namespaces = {
    'WMS': {
        'namespace': 'http://www.opengis.net/wms',
        'layer_xpath': './/ns:Layer',
        'name_xpath': 'ns:Name'
    },
    'WFS': {
        'namespace': 'http://www.opengis.net/wfs/2.0',
        'layer_xpath': './/ns:FeatureType',
        'name_xpath': 'ns:Name'
    },
    'WCS': {
        'namespace': 'http://www.opengis.net/wcs/2.0',
        'layer_xpath': './/ns:CoverageSummary',
        'name_xpath': 'ns:CoverageId'
    }
}

# Define version mapping
service_versions = {
    'WMS': '1.3.0',
    'WFS': '2.0.0',
    'WCS': '2.0.1'
}


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
    service = request.args.get('service')
    workspace = request.args.get('workspace')
    version = service_versions.get(service)
    print(version)
    url = f'https://wfas.firenet.gov/geoserver/{workspace}/ows?service={service}&version={version}&request=GetCapabilities'

    try:
        response = requests.get(url)
        response.raise_for_status()

        root = ET.fromstring(response.text)
        service_data = Service_Namespaces[service]
        namespaces = {'ns': service_data['namespace']}


        layer_names = [layer.find(service_data['name_xpath'], namespaces).text 
        for layer in root.findall(service_data['layer_xpath'], namespaces) 
        if layer.find(service_data['name_xpath'], namespaces) is not None]
        return jsonify(layer_names)

    except (requests.RequestException, ET.ParseError) as e:
        return jsonify({'error': str(e)}), 500
    




if __name__ == '__main__':
    app.run(debug=True, port=8083, host="0.0.0.0" )
