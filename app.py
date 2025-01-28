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
        # Fetch the GetCapabilities XML
        response = requests.get(url)
        response.raise_for_status()
        xml_content = response.text

        # Parse the XML
        root = ET.fromstring(xml_content)
        namespaces = {'wms': 'http://www.opengis.net/wms'}  # Namespace for WMS

        # Extract layer names
        layer_names = []
        for layer in root.findall('.//wms:Layer', namespaces):
            name_element = layer.find('wms:Name', namespaces)
            if name_element is not None:
                layer_names.append(name_element.text)  # Add layer name to the list

        # Return the layer names as a JSON response
        return jsonify(layer_names)

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500
    except ET.ParseError as e:
        return jsonify({'error': f'Error parsing XML: {str(e)}'}), 500

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500
    except ET.ParseError as e:
        return jsonify({'error': f'Error parsing XML: {str(e)}'}), 500



if __name__ == '__main__':
    app.run(debug=True, port=8083, host="0.0.0.0" )
