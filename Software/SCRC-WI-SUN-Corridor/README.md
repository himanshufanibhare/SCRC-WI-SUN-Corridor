# 💡 Corridor Light Control Web Interface

A modern, production-ready web application for controlling CoAP-enabled relay switches in corridor lighting systems. Built with Flask backend and vanilla JavaScript frontend, featuring real-time device monitoring, parallel command execution, and systemd service integration for 24/7 operation.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
  - [Development Mode](#development-mode)
  - [Production Mode (Systemd Service)](#production-mode-systemd-service)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Technical Details](#-technical-details)
- [Troubleshooting](#-troubleshooting)
- [Security Considerations](#-security-considerations)
- [Contributing](#-contributing)
- [Developer](#-developer)

---

## 🚀 Features

### Core Functionality
- **4 Individual Relay Controls**: Toggle each relay (1-4) independently with visual feedback
- **Master Control**: Simultaneous control of all 4 relays with a single button press
- **Real-time Node Status**: Live connectivity monitoring with ping-based health checks
- **Parallel Command Execution**: Multi-threaded relay control for faster response times
- **Error Handling**: Comprehensive error reporting and user-friendly notifications

### User Interface
- **Modern Responsive Design**: Mobile-first approach that works on all screen sizes
- **Smooth Animations**: CSS transitions for toggle switches and status indicators
- **Visual Status Feedback**: Color-coded status pills (Online/Offline, ON/OFF)
- **Toast Notifications**: Non-intrusive feedback for all operations
- **Loading States**: Clear visual indication during command execution

### Production Features
- **Systemd Integration**: Run as a persistent Linux service with auto-restart
- **CORS Support**: Cross-Origin Resource Sharing enabled for flexible deployment
- **IPv6 Support**: Full support for IPv6 CoAP devices
- **Health Monitoring**: Built-in endpoints for service health checks
- **Logging**: Structured logging via systemd journal

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Web Browser   │
│   (Frontend)    │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│  Flask Server   │
│  (Backend API)  │
│   Port 5000     │
└────────┬────────┘
         │ CoAP over IPv6
         │
┌────────▼────────┐
│  CoAP Device    │
│  (Relay Switch) │
│  4 Relay Outputs│
└─────────────────┘
```

**Technology Stack:**
- **Backend**: Flask 3.0.0 (Python 3.6+)
- **CoAP Client**: libcoap2 (`coap-client-notls`)
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Service Management**: systemd
- **Communication**: REST API (Backend) + CoAP (Device)

---

## 📦 Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu/Debian recommended)
- **Python**: Version 3.6 or higher
- **Network**: IPv6 connectivity to CoAP devices
- **Privileges**: sudo access for systemd service installation

### Software Dependencies
- `libcoap2-dev` - CoAP client library and tools
- `python3-pip` - Python package manager
- `systemd` - Service management (included in most Linux distros)

---

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/himanshufanibhare/SCRC-WI-SUN-Corridor.git
cd SCRC-WI-SUN-Corridor
```

### 2. Install System Dependencies
```bash
# Update package lists
sudo apt-get update

# Install CoAP client tools
sudo apt-get install -y libcoap2-dev

# Verify installation
which coap-client-notls
```

### 3. Set Up Python Virtual Environment (Recommended)
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 4. Verify Installation
```bash
# Check Flask installation
python3 -c "import flask; print(f'Flask {flask.__version__}')"

# Check CoAP client
coap-client-notls --version
```

---

## ⚙️ Configuration

### CoAP Device Configuration

Edit `app.py` to configure your CoAP device connection:

```python
# Line 14-15 in app.py
COAP_HOST = "[fd12:3456::a66d:d4ff:fefc:b292]"  # IPv6 address with brackets
COAP_PORT = "5683"                               # Default CoAP port
```

**Finding Your CoAP Device Address:**
```bash
# Discover IPv6 devices on local network
ping6 -c 2 ff02::1%eth0

# Or check your device documentation
```

### Network Configuration

**Firewall Rules** (if applicable):
```bash
# Allow incoming connections on port 5000
sudo ufw allow 5000/tcp

# Verify CoAP device reachability
ping6 -c 4 fd12:3456::a66d:d4ff:fefc:b292
```

### Service Configuration

For systemd service deployment, edit `corridor-light.service`:

```ini
[Service]
WorkingDirectory=/home/wisun/scrc_corridor_light      # Update path
ExecStart=/home/wisun/scrc_corridor_light/venv/bin/python /home/wisun/scrc_corridor_light/app.py
User=wisun                                              # Update username
```

---

## 🎯 Usage

### Development Mode

**Quick Start:**
```bash
# Activate virtual environment (if using)
source venv/bin/activate

# Run Flask development server
python3 app.py
```

**Output:**
```
Starting CoAP Relay Control Server...
CoAP Server: coap://[fd12:3456::a66d:d4ff:fefc:b292]:5683
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.1.100:5000
```

**Access the Web Interface:**
- Local: http://localhost:5000
- Network: http://YOUR_SERVER_IP:5000

### Production Mode (Systemd Service)

**Installation:**
```bash
# Copy service file
sudo cp corridor-light.service /etc/systemd/system/

# Reload systemd daemon
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable corridor-light

# Start service
sudo systemctl start corridor-light
```

**Service Management Commands:**
```bash
# Check status
sudo systemctl status corridor-light

# View logs (last 50 lines)
sudo journalctl -u corridor-light -n 50

# Follow logs in real-time
sudo journalctl -u corridor-light -f

# Restart service
sudo systemctl restart corridor-light

# Stop service
sudo systemctl stop corridor-light

# Disable auto-start
sudo systemctl disable corridor-light

# Remove service
sudo systemctl stop corridor-light
sudo systemctl disable corridor-light
sudo rm /etc/systemd/system/corridor-light.service
sudo systemctl daemon-reload
```

**Monitoring Service Health:**
```bash
# Check if service is active
systemctl is-active corridor-light

# Check if service is enabled
systemctl is-enabled corridor-light

# View service uptime
systemctl show corridor-light --property=ActiveEnterTimestamp
```

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Control Individual Relay
```http
POST /api/relay/<relay_num>/<action>
```

**Parameters:**
- `relay_num` (int): Relay number (1-4)
- `action` (string): Action to perform (`on` or `off`)

**Response:**
```json
{
  "success": true,
  "output": "v:1\n",
  "error": ""
}
```

**Example:**
```bash
# Turn on relay 1
curl -X POST http://localhost:5000/api/relay/1/on

# Turn off relay 3
curl -X POST http://localhost:5000/api/relay/3/off
```

**Error Response:**
```json
{
  "success": false,
  "error": "Relay number must be between 1 and 4"
}
```

#### 2. Control All Relays
```http
POST /api/relay/all/<action>
```

**Parameters:**
- `action` (string): Action to perform (`on` or `off`)

**Response:**
```json
{
  "success": true,
  "results": {
    "1": {"success": true, "output": "v:1\n", "error": ""},
    "2": {"success": true, "output": "v:1\n", "error": ""},
    "3": {"success": true, "output": "v:1\n", "error": ""},
    "4": {"success": true, "output": "v:1\n", "error": ""}
  }
}
```

**Example:**
```bash
# Turn on all relays
curl -X POST http://localhost:5000/api/relay/all/on

# Turn off all relays
curl -X POST http://localhost:5000/api/relay/all/off
```

#### 3. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok"
}
```

**Example:**
```bash
curl http://localhost:5000/api/health
```

#### 4. Ping CoAP Device
```http
GET /api/ping
```

**Response:**
```json
{
  "online": true,
  "rtt_ms": 2.45,
  "error": null
}
```

**Example:**
```bash
curl http://localhost:5000/api/ping
```

**Offline Response:**
```json
{
  "online": false,
  "rtt_ms": null,
  "error": "Ping timed out"
}
```

### CoAP Endpoints (Device Level)

The Flask server translates REST calls to CoAP commands:

| Relay | ON Command | OFF Command |
|-------|-----------|-------------|
| 1 | `coap://[HOST]:5683/relay1on` | `coap://[HOST]:5683/relay1off` |
| 2 | `coap://[HOST]:5683/relay2on` | `coap://[HOST]:5683/relay2off` |
| 3 | `coap://[HOST]:5683/relay3on` | `coap://[HOST]:5683/relay3off` |
| 4 | `coap://[HOST]:5683/relay4on` | `coap://[HOST]:5683/relay4off` |

---

## 📁 Project Structure

```
scrc_corridor_light/
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
├── corridor-light.service      # Systemd service configuration
├── README.md                   # This file
├── SERVICE_README.md           # Service-specific documentation
├── static/                     # Frontend files
│   ├── index.html             # Main HTML page
│   ├── script.js              # JavaScript logic
│   └── style.css              # Styling
└── venv/                       # Python virtual environment (created during setup)
```

### File Descriptions

**Backend:**
- `app.py` (152 lines)
  - Flask server implementation
  - CoAP command execution via subprocess
  - RESTful API endpoints
  - Multi-threaded relay control
  - IPv6 ping functionality
  - CORS configuration

**Frontend:**
- `index.html` (100 lines)
  - Responsive layout with CSS Grid
  - 4 relay cards with toggle switches
  - Master control buttons
  - Status indicators and notifications
  - Developer attribution footer

- `script.js` (190 lines)
  - Async API communication
  - Relay state management
  - Real-time status updates
  - Error handling and user feedback
  - 5-second ping interval for node status

- `style.css`
  - Modern UI design
  - Smooth animations and transitions
  - Responsive breakpoints
  - Color-coded status indicators

**Configuration:**
- `requirements.txt`
  - Flask==3.0.0
  - flask-cors==4.0.0

- `corridor-light.service`
  - Systemd unit file
  - Auto-restart on failure
  - Journal logging
  - Network dependency

---

## 🔍 Technical Details

### CoAP Communication

**Protocol**: Constrained Application Protocol (CoAP)
- Designed for IoT and constrained devices
- UDP-based (lightweight, low overhead)
- RESTful architecture similar to HTTP
- Port 5683 (standard CoAP port)

**Command Execution Flow:**
```python
def execute_coap_command(endpoint):
    url = f"coap://{COAP_HOST}:{COAP_PORT}/{endpoint}"
    result = subprocess.run(
        ["coap-client-notls", "-m", "get", url],
        capture_output=True,
        text=True,
        timeout=5
    )
```

### Multi-threaded Relay Control

For the "All ON/OFF" feature, commands are executed in parallel:

```python
threads = []
for i in range(1, 5):
    thread = threading.Thread(target=execute_and_store, args=(i,))
    thread.start()
    threads.append(thread)

# Wait for completion
for thread in threads:
    thread.join()
```

**Benefits:**
- 4x faster than sequential execution
- Simultaneous relay switching
- Better user experience

### IPv6 Ping Implementation

Real-time device monitoring using ICMPv6:

```python
def ping_host(host: str):
    addr = _strip_ipv6_brackets(host)
    result = subprocess.run(
        ["ping", "-6", "-c", "1", "-W", "1", addr],
        capture_output=True,
        text=True,
        timeout=3
    )
```

**Features:**
- Automatic bracket stripping for IPv6 addresses
- RTT (Round-Trip Time) parsing
- 1-second timeout for fast response
- Frontend polls every 5 seconds

### Security Features

1. **Input Validation**: Relay numbers (1-4) and actions (on/off) are validated
2. **CORS Configuration**: Configurable cross-origin access
3. **Timeout Protection**: 5-second timeout on CoAP commands
4. **Error Isolation**: Individual relay failures don't affect others
5. **No Authentication**: ⚠️ Add authentication for production deployments

---

## 🐛 Troubleshooting

### Common Issues

#### 1. CoAP Client Not Found
**Error**: `coap-client-notls not found. Please install libcoap2-dev`

**Solution**:
```bash
sudo apt-get update
sudo apt-get install libcoap2-dev
which coap-client-notls  # Verify installation
```

#### 2. Connection Timeout
**Error**: `Command timed out`

**Causes & Solutions**:
```bash
# Check IPv6 connectivity
ping6 -c 4 fd12:3456::a66d:d4ff:fefc:b292

# Check CoAP device is powered on
# Verify network interface
ip -6 addr show

# Test CoAP command directly
coap-client-notls -m get "coap://[fd12:3456::a66d:d4ff:fefc:b292]:5683/relay1on"
```

#### 3. Port Already in Use
**Error**: `Address already in use`

**Solution**:
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill the process
sudo kill -9 <PID>

# Or use a different port in app.py
app.run(host='0.0.0.0', port=5001, debug=True)
```

#### 4. Permission Denied (Systemd)
**Error**: `Failed to start corridor-light.service: Access denied`

**Solution**:
```bash
# Use sudo for systemd commands
sudo systemctl start corridor-light

# Check file permissions
ls -l /etc/systemd/system/corridor-light.service

# Fix if needed
sudo chmod 644 /etc/systemd/system/corridor-light.service
```

#### 5. Service Fails to Start
**Diagnosis**:
```bash
# Check detailed status
sudo systemctl status corridor-light -l

# View recent logs
sudo journalctl -u corridor-light -n 100 --no-pager

# Test manual execution
cd /home/wisun/scrc_corridor_light
source venv/bin/activate
python3 app.py
```

#### 6. Web Page Not Loading
**Checks**:
```bash
# Verify server is running
curl http://localhost:5000/api/health

# Check firewall
sudo ufw status
sudo ufw allow 5000/tcp

# Test from another device
curl http://SERVER_IP:5000/api/health
```

#### 7. Node Status Always Offline
**Solution**:
```bash
# Test ping directly
ping6 -c 2 fd12:3456::a66d:d4ff:fefc:b292

# Check API response
curl http://localhost:5000/api/ping

# Verify CoAP host in app.py is correct
grep COAP_HOST app.py
```

### Debug Mode

Enable detailed logging:

```python
# In app.py, line 151
app.run(host='0.0.0.0', port=5000, debug=True)
```

### Browser Console

For frontend issues, check browser console:
- Press F12 to open Developer Tools
- Check Console tab for JavaScript errors
- Check Network tab for failed API calls

---

## 🔒 Security Considerations

### Current Security Posture
⚠️ **This application is designed for internal/trusted networks**

**Implemented:**
- Input validation (relay numbers, actions)
- Timeout protection (prevents hanging)
- Error handling (no sensitive data leakage)
- CORS configuration

**NOT Implemented:**
- Authentication/Authorization
- HTTPS/TLS encryption
- Rate limiting
- Session management
- CSRF protection

### Recommended for Production

1. **Add Authentication**:
```python
from flask_httpauth import HTTPBasicAuth
auth = HTTPBasicAuth()

@auth.verify_password
def verify_password(username, password):
    # Implement proper authentication
    pass

@app.route('/api/relay/<int:relay_num>/<action>', methods=['POST'])
@auth.login_required
def control_relay(relay_num, action):
    # ... existing code
```

2. **Enable HTTPS**:
```bash
# Use reverse proxy (nginx/apache)
# Or use Flask with SSL context
app.run(ssl_context=('cert.pem', 'key.pem'))
```

3. **Add Rate Limiting**:
```python
from flask_limiter import Limiter

limiter = Limiter(app, key_func=get_remote_address)

@limiter.limit("10 per minute")
@app.route('/api/relay/<int:relay_num>/<action>', methods=['POST'])
def control_relay(relay_num, action):
    # ... existing code
```

4. **Network Isolation**:
- Deploy on isolated VLAN
- Use firewall rules to restrict access
- Consider VPN for remote access

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup
```bash
git clone https://github.com/himanshufanibhare/SCRC-WI-SUN-Corridor.git
cd SCRC-WI-SUN-Corridor
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Code Style
- Python: Follow PEP 8
- JavaScript: Use ES6+ features
- Comments: Document complex logic

---

## 👨‍💻 Developer

**Himanshu Fanibhare**

- Portfolio: [https://himanshu-portfolio-beryl.vercel.app/](https://himanshu-portfolio-beryl.vercel.app/)
- GitHub: [@himanshufanibhare](https://github.com/himanshufanibhare)
- Repository: [SCRC-WI-SUN-Corridor](https://github.com/himanshufanibhare/SCRC-WI-SUN-Corridor)

---

## 📄 License

This project is part of the SCRC Wi-SUN Corridor implementation.

---

## 🙏 Acknowledgments

- **Flask**: Micro web framework for Python
- **libcoap**: C-Implementation of CoAP
- **Wi-SUN Alliance**: Wireless standards for IoT networks
- **SCRC**: Smart Connected Ready Community initiative

---

## 📚 Additional Resources

### Documentation
- [Flask Documentation](https://flask.palletsprojects.com/)
- [CoAP RFC 7252](https://tools.ietf.org/html/rfc7252)
- [systemd Service Documentation](https://www.freedesktop.org/software/systemd/man/systemd.service.html)

### Related Projects
- [Wi-SUN FAN](https://wi-sun.org/)
- [libcoap](https://libcoap.net/)
- [CoAP Technology](https://coap.technology/)

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅

