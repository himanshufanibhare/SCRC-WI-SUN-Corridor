# Corridor Light Control Web Interface

A modern web interface for controlling CoAP-enabled relay switches via a Flask backend.

## Features

- **4 Individual Toggle Switches**: Control each relay (1-4) independently
- **Master Control**: Turn all relays on/off with a single button
- **Real-time Status**: Visual feedback showing relay states
- **Modern UI**: Responsive design with smooth animations
- **Error Handling**: User-friendly error messages and notifications

## Prerequisites

- Python 3.6+
- `coap-client-notls` command-line tool (from libcoap2-dev package)
- Flask and flask-cors Python packages

## Installation

1. Install system dependencies (Ubuntu/Debian):
   ```bash
   sudo apt-get update
   sudo apt-get install libcoap2-dev
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. Start the Flask server:
   ```bash
   python app.py
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

3. Use the toggle switches to control individual relays or use the master buttons to control all relays at once.

## Configuration

The CoAP server address and port can be modified in `app.py`:

```python
COAP_HOST = "[fd12:3456::a66d:d4ff:fefc:b292]"
COAP_PORT = "5683"
```

## API Endpoints

- `POST /api/relay/<relay_num>/<action>` - Control individual relay (action: 'on' or 'off')
- `POST /api/relay/all/<action>` - Control all relays (action: 'on' or 'off')
- `GET /api/health` - Health check endpoint

## Troubleshooting

- **coap-client-notls not found**: Install libcoap2-dev package
- **Connection errors**: Verify CoAP server is accessible and IPv6 connectivity is working
- **Web page not loading**: Ensure Flask server is running on port 5000

