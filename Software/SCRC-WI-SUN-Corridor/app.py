#!/usr/bin/env python3
"""
Flask server for controlling CoAP relays
"""
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import subprocess
import threading

app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS for cross-origin requests

# CoAP server configuration
COAP_HOST = "[fd12:3456::a66d:d4ff:fefc:b292]"
COAP_PORT = "5683"

def execute_coap_command(endpoint):
    """Execute a CoAP command using coap-client-notls"""
    try:
        url = f"coap://{COAP_HOST}:{COAP_PORT}/{endpoint}"
        result = subprocess.run(
            ["coap-client-notls", "-m", "get", url],
            capture_output=True,
            text=True,
            timeout=5
        )
        return {
            "success": result.returncode == 0,
            "output": result.stdout,
            "error": result.stderr
        }
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Command timed out"}
    except FileNotFoundError:
        return {"success": False, "error": "coap-client-notls not found. Please install libcoap2-dev"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def _strip_ipv6_brackets(host: str) -> str:
    """Return IPv6 host without square brackets."""
    if host.startswith("[") and host.endswith("]"):
        return host[1:-1]
    return host

def ping_host(host: str):
    """Ping an IPv6 host once and return reachability and optional RTT in ms."""
    addr = _strip_ipv6_brackets(host)
    try:
        # Use IPv6 ping; -c 1 one packet, -W 1 timeout 1s (Linux ping)
        result = subprocess.run(
            ["ping", "-6", "-c", "1", "-W", "1", addr],
            capture_output=True,
            text=True,
            timeout=3
        )
        success = result.returncode == 0
        rtt_ms = None
        if success and result.stdout:
            # Try to parse time=XX ms from the reply line
            for line in result.stdout.splitlines():
                if " time=" in line:
                    try:
                        rtt_ms = float(line.split(" time=")[-1].split(" ")[0])
                    except Exception:
                        rtt_ms = None
                    break
        return {"success": success, "rtt_ms": rtt_ms, "output": result.stdout, "error": result.stderr}
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Ping timed out"}
    except FileNotFoundError:
        return {"success": False, "error": "ping not found"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.route('/api/relay/<int:relay_num>/<action>', methods=['POST'])
def control_relay(relay_num, action):
    """Control a single relay (on/off)"""
    if relay_num < 1 or relay_num > 4:
        return jsonify({"success": False, "error": "Relay number must be between 1 and 4"}), 400
    
    if action not in ['on', 'off']:
        return jsonify({"success": False, "error": "Action must be 'on' or 'off'"}), 400
    
    endpoint = f"relay{relay_num}{action}"
    result = execute_coap_command(endpoint)
    
    status_code = 200 if result["success"] else 500
    return jsonify(result), status_code

@app.route('/api/relay/all/<action>', methods=['POST'])
def control_all_relays(action):
    """Control all relays at once (on/off)"""
    if action not in ['on', 'off']:
        return jsonify({"success": False, "error": "Action must be 'on' or 'off'"}), 400
    
    # Execute all commands in parallel for faster response
    threads = []
    results = {}
    
    def execute_and_store(relay_num):
        endpoint = f"relay{relay_num}{action}"
        results[relay_num] = execute_coap_command(endpoint)
    
    for i in range(1, 5):
        thread = threading.Thread(target=execute_and_store, args=(i,))
        thread.start()
        threads.append(thread)
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join()
    
    # Check if all succeeded
    all_success = all(r["success"] for r in results.values())
    
    return jsonify({
        "success": all_success,
        "results": results
    }), 200 if all_success else 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok"}), 200

@app.route('/api/ping', methods=['GET'])
def api_ping():
    """Ping the configured CoAP host and report online/offline."""
    result = ping_host(COAP_HOST)
    status_code = 200 if result.get("success") else 503
    return jsonify({
        "online": bool(result.get("success")),
        "rtt_ms": result.get("rtt_ms"),
        "error": result.get("error")
    }), status_code

@app.route('/')
def index():
    """Serve the main web interface"""
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files (CSS, JS)"""
    return send_from_directory('static', path)

if __name__ == '__main__':
    print(f"Starting CoAP Relay Control Server...")
    print(f"CoAP Server: coap://{COAP_HOST}:{COAP_PORT}")
    app.run(host='0.0.0.0', port=5000, debug=True)

