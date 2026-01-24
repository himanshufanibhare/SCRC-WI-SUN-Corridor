# Wi-SUN Corridor Streetlight - ZG28 LED Control System

## Project Overview

This project implements a Wi-SUN FAN (Field Area Network) based smart streetlight control system using the **Silicon Labs EFR32ZG28B312F1024IM48** wireless SoC on the **BRD2705A (ZG28) development board**. The system provides remote LED/Relay control via CoAP protocol over Wi-SUN mesh network, making it ideal for smart city streetlight applications with centralized monitoring and control.

## Hardware Configuration

### Main Components

- **MCU**: EFR32ZG28B312F1024IM48 (ZG28)
  - ARM Cortex-M33 core
  - 1024 KB Flash, 256 KB RAM
  - Sub-GHz radio with up to +20 dBm output power
  
- **Development Board**: BRD2705A (ZG28 Radio Board)
  - Integrated antenna for Sub-GHz operation
  - USB interface for programming and debugging
  - UART console via VCOM
  
- **Radio Configuration**: 
  - Sub-GHz Wi-SUN FAN 1.0/1.1 and HAN compliant
  - Frequency hopping spread spectrum (FHSS)
  - Supports regional domains (FCC, ETSI, etc.)

### LED/Relay Pin Configuration

The system uses 5 GPIO pins from **Port C** for controlling LEDs or external relays:

| Component | GPIO Port | GPIO Pin | Physical Pin | Function | Active State |
|-----------|-----------|----------|--------------|----------|--------------|
| **LED0 / RELAY1** | Port C | Pin 1 | PC1 | Streetlight Control 1 | Active HIGH |
| **LED1 / RELAY2** | Port C | Pin 2 | PC2 | Streetlight Control 2 | Active HIGH |
| **LED2 / RELAY3** | Port C | Pin 3 | PC3 | Streetlight Control 3 | Active HIGH |
| **LED3 / RELAY4** | Port C | Pin 4 | PC4 | Streetlight Control 4 | Active HIGH |
| **LED4** | Port C | Pin 9 | PC9 | Wi-SUN Connection Status | Active HIGH |

**Note**: LED0-LED3 are mapped as RELAY1-RELAY4 in the software for streetlight control applications.

### Hardware Connection Diagram

```
┌─────────────────────────────────────────────────────────────┐
│           EFR32ZG28B312 (BRD2705A Board)                    │
│                                                               │
│   ┌──────────────────────────────────────────────┐          │
│   │                                                │          │
│   │     PC1 (LED0/RELAY1) ──────────┬────► Relay Module 1   │
│   │                                  │                       │
│   │     PC2 (LED1/RELAY2) ──────────┼────► Relay Module 2   │
│   │                                  │                       │
│   │     PC3 (LED2/RELAY3) ──────────┼────► Relay Module 3   │
│   │                                  │                       │
│   │     PC4 (LED3/RELAY4) ──────────┼────► Relay Module 4   │
│   │                                  │                       │
│   │     PC9 (LED4) ─────────────────┴────► Status LED       │
│   │                                                │          │
│   │                                                │          │
│   │     Sub-GHz Radio ◄──────► Wi-SUN Network    │          │
│   │                                                │          │
│   │     UART/USB ◄──────────► PC (Console/Debug) │          │
│   │                                                │          │
│   └──────────────────────────────────────────────┘          │
│                                                               │
└─────────────────────────────────────────────────────────────┘

External Connections:
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Relay      │      │  Streetlight │      │   Power      │
│   Module     │─────►│   Driver     │─────►│   Supply     │─────► AC Lights
│   (PC1-PC4)  │      │   Circuit    │      │   (AC/DC)    │
└──────────────┘      └──────────────┘      └──────────────┘
```

### Relay Module Interface

For controlling AC streetlights, connect GPIO pins to relay modules:

- **Recommended**: 5V relay modules with optocoupler isolation
- **Current Drive**: Use transistor driver if GPIO current is insufficient
- **Protection**: Add flyback diodes for relay coil protection
- **Isolation**: Optocoupler isolation between MCU and high-voltage circuits

**Example Connection (Single Relay):**
```
EFR32ZG28                 Relay Module              AC Load
┌─────────┐              ┌──────────┐           ┌──────────┐
│         │              │          │           │          │
│  PC1 ───┼──► VCC      │ Relay    │           │  Street  │
│         │              │ Coil     ├───────────┤  Light   │
│  GND ───┼──► GND      │          │           │          │
│         │              │          │           │          │
│         │              │  NO/NC   │           │          │
└─────────┘              └──────────┘           └──────────┘
```

### Power Supply

- **USB Power**: 5V via USB (development/testing)
- **External Power**: 3.3V regulated supply for production deployment
- **Relay Power**: Separate 5V/12V supply for relay modules (isolated from MCU)


## Key Features

### 1. **Wi-SUN Mesh Network Connectivity**
- Full Wi-SUN FAN 1.0, FAN 1.1, and HAN profile support
- Automatic network joining and parent discovery
- Self-healing mesh topology
- Long-range Sub-GHz communication
- IPv6 addressing with DHCP

### 2. **Remote LED/Relay Control via CoAP**
The system provides 8 CoAP endpoints for controlling 4 independent streetlight circuits:

#### Relay Control Endpoints

| CoAP URI | Method | Function | GPIO Pin | Response |
|----------|--------|----------|----------|----------|
| `/relay1on` | GET/POST | Turn ON Relay 1 | PC1 | `{"Message": "RELAY1 ON!"}` |
| `/relay1off` | GET/POST | Turn OFF Relay 1 | PC1 | `{"Message": "RELAY1 OFF!"}` |
| `/relay2on` | GET/POST | Turn ON Relay 2 | PC2 | `{"Message": "RELAY2 ON!"}` |
| `/relay2off` | GET/POST | Turn OFF Relay 2 | PC2 | `{"Message": "RELAY2 OFF!"}` |
| `/relay3on` | GET/POST | Turn ON Relay 3 | PC3 | `{"Message": "RELAY3 ON!"}` |
| `/relay3off` | GET/POST | Turn OFF Relay 3 | PC3 | `{"Message": "RELAY3 OFF!"}` |
| `/relay4on` | GET/POST | Turn ON Relay 4 | PC4 | `{"Message": "RELAY4 ON!"}` |
| `/relay4off` | GET/POST | Turn OFF Relay 4 | PC4 | `{"Message": "RELAY4 OFF!"}` |

**Usage Example:**
```bash
# Turn on streetlight 1
coap-client -m get coap://[device-ipv6]:5683/relay1on

# Turn off streetlight 2
coap-client -m get coap://[device-ipv6]:5683/relay2off

# Control all lights
coap-client -m get coap://[device-ipv6]:5683/relay1on
coap-client -m get coap://[device-ipv6]:5683/relay2on
coap-client -m get coap://[device-ipv6]:5683/relay3on
coap-client -m get coap://[device-ipv6]:5683/relay4on
```

### 3. **Network Status Indicator**
- **LED4 (PC9)**: Automatically turns ON when device successfully connects to Wi-SUN network
- Provides instant visual feedback of network connectivity
- OFF state indicates disconnection or joining in progress

### 4. **Initial State Configuration**
- All relays initialize to ON state at startup
- Can be modified in `app_coap_resources_init()` function
- Ensures known state on power-up/reset


## Software Architecture

### Core Modules

1. **`main.c`** - Application entry point and system initialization
2. **`app.c/h`** - Main application logic and Wi-SUN event handling
3. **`app_init.c/h`** - Application initialization routines
4. **`app_coap.c/h`** - CoAP server with relay control handlers
5. **`app_check_neighbors.c/h`** - Network neighbor management
6. **`app_timestamp.c/h`** - Timestamp utilities for logging
7. **`app_rtt_traces.c/h`** - RTT debug output utilities

### LED/Relay Control Implementation

The relay control is implemented in `app_coap.c` with the following key functions:

```c
// Relay 1 Control (LED0 / PC1)
coap_callback_relay1on()   // Turn ON relay 1
coap_callback_relay1off()  // Turn OFF relay 1

// Relay 2 Control (LED1 / PC2)
coap_callback_relay2on()   // Turn ON relay 2
coap_callback_relay2off()  // Turn OFF relay 2

// Relay 3 Control (LED2 / PC3)
coap_callback_relay3on()   // Turn ON relay 3
coap_callback_relay3off()  // Turn OFF relay 3

// Relay 4 Control (LED3 / PC4)
coap_callback_relay4on()   // Turn ON relay 4
coap_callback_relay4off()  // Turn OFF relay 4
```

### GPIO Control Functions

```c
sl_simple_led_turn_on(sl_led_led0.context);   // GPIO HIGH
sl_simple_led_turn_off(sl_led_led0.context);  // GPIO LOW
sl_simple_led_get_state(sl_led_led0.context); // Read current state
```

### Dependencies

- **Silicon Labs Simplicity SDK**: 2025.6.2
- **RTOS**: Micrium OS Kernel
- **Network Stack**: Wi-SUN Stack with CoAP support
- **Security**: mbedTLS with PSA Crypto
- **Storage**: NVM3 (Non-Volatile Memory)
- **Console**: iostream with UART/EUSART VCOM

## Configuration

### Key Configuration Options

```c
// CoAP Configuration
SL_WISUN_COAP_RESOURCE_HND_MAX_RESOURCES = 30U

// OTA DFU
SL_WISUN_OTA_DFU_AUTO_INSTALL_ENABLED = 0U

// UART Console
SL_BOARD_ENABLE_VCOM = 1
SL_IOSTREAM_EUSART_VCOM_CONVERT_BY_DEFAULT_LF_TO_CRLF = 1

// PTI (Packet Trace Interface)
SL_RAIL_UTIL_PTI_BAUD_RATE_HZ = 3200000
```

### Radio Configuration
- **Profile**: Single PHY Wi-SUN
- **Supported Profiles**: FAN 1.0, FAN 1.1, HAN
- **PA Selection**: Sub-GHz with EFF support (if available)
- **Max TX Power**: 20 dBm (with EFF)
- **Duty Cycle**: 100%


## Building the Project

### Prerequisites
1. **Simplicity Studio 5** (SV5)
2. **Simplicity SDK 2025.6.2** or later
3. **GNU ARM Toolchain v12.2.1** or compatible
4. **SEGGER J-Link** debugger (integrated with BRD2705A)

### Build Steps
1. Open Simplicity Studio 5
2. Import the project using the `.slcp` file
3. Select the target device: **EFR32ZG28B312F1024IM48**
4. Select the target board: **BRD2705A**
5. Build the project: **Project → Build Project**
6. Flash to device: **Run → Debug** or use **Flash Programmer**

### Configuration Files
- `config/sl_simple_led_led0_config.h` - LED0/Relay1 GPIO configuration
- `config/sl_simple_led_led1_config.h` - LED1/Relay2 GPIO configuration
- `config/sl_simple_led_led2_config.h` - LED2/Relay3 GPIO configuration
- `config/sl_simple_led_led3_config.h` - LED3/Relay4 GPIO configuration
- `config/sl_simple_led_led4_config.h` - LED4 status indicator configuration

## Usage

### Initial Setup
1. Connect the ZG28 board to your PC via USB
2. Flash the firmware to the device
3. Open a serial terminal (115200 baud, 8N1) to view console output
4. The device will automatically attempt to join the Wi-SUN network
5. Once connected, **LED4** will turn ON
6. All relays (LED0-LED3) will initialize to ON state

### Console Output
The application provides detailed logging:
```
Wi-SUN network joining...
Join state: SELECT_PAN
Join state: AUTHENTICATE
Join state: ACQUIRE_PAN_CONFIG
Join state: CONFIGURE_ROUTING
Join state: OPERATIONAL
[Connected to Wi-SUN network]
Device IPv6: fd00:7283:7e00:0:202:f7ff:fe00:xxxx
30/30 CoAP resources added to CoAP Resource handler
```

### Controlling Streetlights via CoAP

#### Using libcoap Command-Line Client

```bash
# Get device IPv6 address from console output
DEVICE_IP="fd00:7283:7e00:0:202:f7ff:fe00:xxxx"

# Control individual streetlights
coap-client -m get "coap://[$DEVICE_IP]:5683/relay1on"
coap-client -m get "coap://[$DEVICE_IP]:5683/relay1off"

coap-client -m get "coap://[$DEVICE_IP]:5683/relay2on"
coap-client -m get "coap://[$DEVICE_IP]:5683/relay2off"

coap-client -m get "coap://[$DEVICE_IP]:5683/relay3on"
coap-client -m get "coap://[$DEVICE_IP]:5683/relay3off"

coap-client -m get "coap://[$DEVICE_IP]:5683/relay4on"
coap-client -m get "coap://[$DEVICE_IP]:5683/relay4off"
```

#### Using Python CoAP Client

```python
from aiocoap import *

async def control_streetlight(ipv6_address, relay_num, state):
    """
    Control streetlight relay
    relay_num: 1-4
    state: 'on' or 'off'
    """
    uri = f'coap://[{ipv6_address}]:5683/relay{relay_num}{state}'
    protocol = await Context.create_client_context()
    request = Message(code=GET, uri=uri)
    
    try:
        response = await protocol.request(request).response
        print(f'Response: {response.payload.decode()}')
    except Exception as e:
        print(f'Failed: {e}')

# Example usage
import asyncio
asyncio.run(control_streetlight('fd00:7283:7e00:0:202:f7ff:fe00:xxxx', 1, 'on'))
```

#### Using Web-Based CoAP Client (Copper)

1. Install Copper (Cu) CoAP browser extension
2. Enter CoAP URI: `coap://[device-ipv6]:5683/`
3. Discover available resources
4. Click on `/relay1on`, `/relay1off`, etc. to control

### LED Indicators During Operation
- **LED4 ON**: Successfully connected to Wi-SUN network
- **LED4 OFF**: Disconnected or joining network
- **LED0-LED3**: Reflect relay states (ON/OFF based on CoAP commands)


## Network Integration

### Wi-SUN Network Requirements
1. **Border Router**: A Wi-SUN border router must be configured and operational
2. **Network Parameters**: Match network name, regulatory domain, and security settings
3. **IPv6 Configuration**: The device obtains a global IPv6 address via DHCP
4. **Firewall**: Ensure CoAP port 5683 is accessible from control center

### Network Topology for Streetlight System
```
                   Internet/Cloud
                         ↕
              ┌──────────────────┐
              │  Border Router   │
              │   (Root Node)    │
              └──────────────────┘
                       ↕
           ┌───────────┴───────────┐
           ↕                       ↕
    ┌─────────────┐         ┌─────────────┐
    │  Router 1   │←─────→  │  Router 2   │
    │ (Repeater)  │         │ (Repeater)  │
    └─────────────┘         └─────────────┘
           ↕                       ↕
      ┌────┴────┐             ┌────┴────┐
      ↕         ↕             ↕         ↕
  ┌───────┐ ┌───────┐    ┌───────┐ ┌───────┐
  │Street │ │Street │    │Street │ │Street │
  │Light1 │ │Light2 │    │Light3 │ │Light4 │
  │(This) │ │       │    │       │ │       │
  └───────┘ └───────┘    └───────┘ └───────┘
```

### Control Center Integration

For centralized streetlight management, integrate with:
- **SCADA Systems**: Use CoAP-to-MQTT bridge
- **IoT Platforms**: AWS IoT, Azure IoT, Google Cloud IoT
- **Custom Dashboard**: Web interface with CoAP client library

## Customization

### Modifying Initial Relay States

Edit `app_coap.c` in the `app_coap_resources_init()` function:

```c
// Current: All relays ON at startup
sl_simple_led_turn_on(sl_led_led0.context);  // Relay 1 ON
sl_simple_led_turn_on(sl_led_led1.context);  // Relay 2 ON
sl_simple_led_turn_on(sl_led_led2.context);  // Relay 3 ON
sl_simple_led_turn_on(sl_led_led3.context);  // Relay 4 ON

// Change to: All relays OFF at startup
sl_simple_led_turn_off(sl_led_led0.context);  // Relay 1 OFF
sl_simple_led_turn_off(sl_led_led1.context);  // Relay 2 OFF
sl_simple_led_turn_off(sl_led_led2.context);  // Relay 3 OFF
sl_simple_led_turn_off(sl_led_led3.context);  // Relay 4 OFF
```

### Adding Relay State Query Endpoints

Uncomment the following sections in `app_coap.c` to enable state query:

```c
// Uncomment these blocks (around line 1073-1104)
coap_resource.data.uri_path = "/relay1state";
coap_resource.auto_response = coap_callback_relay1state;
// ... (repeat for relay2state, relay3state, relay4state)
```

This enables:
- `/relay1state` - Returns current state of Relay 1
- `/relay2state` - Returns current state of Relay 2
- `/relay3state` - Returns current state of Relay 3
- `/relay4state` - Returns current state of Relay 4

### Changing GPIO Pins

To use different GPIO pins, modify the config files:

**File**: `config/sl_simple_led_led0_config.h`
```c
#define SL_SIMPLE_LED_LED0_PORT    SL_GPIO_PORT_C  // Change port
#define SL_SIMPLE_LED_LED0_PIN     1               // Change pin number
```

Repeat for LED1-LED4 configuration files.

### Adding Scheduling Logic

Implement time-based control by adding a timer:

```c
// In app.c - Add timer callback
void schedule_callback(void) {
    uint32_t current_hour = get_current_hour(); // Implement time sync
    
    if (current_hour >= 18 || current_hour < 6) {
        // Turn on lights at night (6 PM - 6 AM)
        sl_simple_led_turn_on(sl_led_led0.context);
        sl_simple_led_turn_on(sl_led_led1.context);
    } else {
        // Turn off lights during day
        sl_simple_led_turn_off(sl_led_led0.context);
        sl_simple_led_turn_off(sl_led_led1.context);
    }
}
```


## Troubleshooting

### Device Won't Join Network
- **Check Border Router**: Verify border router is operational and broadcasting
- **Network Credentials**: Ensure network name and security keys match
- **Regulatory Domain**: Verify frequency band settings match region
- **Antenna**: Check antenna connection on BRD2705A board
- **Console Logs**: Review join state transitions for specific errors

### CoAP Commands Not Working
- **IPv6 Address**: Verify device IPv6 address from console output
- **Network Reachability**: Ping the device: `ping6 [device-ipv6]`
- **Firewall**: Check firewall rules allow UDP port 5683
- **CoAP Client**: Test with different clients (libcoap, Copper, Python)
- **Syntax**: Ensure proper IPv6 format: `coap://[ipv6]:5683/relay1on`

### LED4 Not Turning On
- **Connection Status**: Check console for "OPERATIONAL" join state
- **GPIO Configuration**: Verify PC9 configuration in config files
- **Code Check**: Ensure LED4 control code in `app.c` is not commented out

### Relays Not Responding
- **GPIO Pins**: Verify PC1-PC4 are correctly configured
- **Hardware**: Check relay module connections and power supply
- **Driver Circuit**: Ensure sufficient current drive for relay coils
- **Test LED**: Connect LED instead of relay to verify GPIO toggling

### Console Output Issues
- **Baud Rate**: Set terminal to 115200, 8N1, no flow control
- **USB Driver**: Install Silicon Labs USB-to-UART driver
- **Port Selection**: Use correct COM port for BRD2705A VCOM

## Performance Specifications

### Network Performance
- **Range**: Up to 1-2 km line-of-sight (Sub-GHz)
- **Data Rate**: 50-300 kbps (depends on PHY configuration)
- **Latency**: 100-500 ms typical for CoAP command response
- **Network Capacity**: Supports 100+ nodes per network

### Power Consumption
- **Active (TX at 20 dBm)**: ~100-150 mA
- **Active (RX)**: ~30-50 mA
- **Idle (Network Connected)**: ~10-20 mA
- **Deep Sleep**: <10 µA (requires code modification)

### Relay Specifications
- **GPIO Output**: 3.3V logic level
- **Drive Current**: Limited by GPIO (8-10 mA typical)
- **Recommendation**: Use relay module with driver transistor
- **Switching Frequency**: Not intended for PWM (DC control only)

## Application Scenarios

### Street Lighting Control
- Deploy multiple nodes along streets
- Central control via CoAP commands
- Schedule-based automation
- Energy consumption monitoring

### Parking Lot Lighting
- Zone-based control (4 relays per node)
- Motion sensor integration possible
- Fault detection and reporting

### Industrial Lighting
- Factory/warehouse lighting control
- Integration with building management systems
- Emergency lighting override capability

### Smart City Integration
- Part of larger IoT infrastructure
- Integration with traffic management
- Adaptive lighting based on conditions


## Development Notes

### Code Quality
This is **EXPERIMENTAL QUALITY** code:
- Not formally tested for production environments
- Provided as-is for development and evaluation purposes
- Use as reference for building production applications
- Requires additional testing and hardening for commercial deployment

### Memory Configuration
- **Flash Usage**: ~500-600 KB (depends on configuration)
- **RAM Usage**: ~100-150 KB (stack + heap)
- **NVM3**: Default configuration for persistent storage
- **CoAP Resources**: Maximum 30 resources configured

### Important Implementation Notes
1. **Relay Control Logic**: Uses inverted logic (turn_off = ON, turn_on = OFF) due to hardware design
2. **Active HIGH**: All LEDs configured for active HIGH operation
3. **Blocking Operations**: CoAP handlers execute in callback context
4. **Thread Safety**: Use RTOS primitives for shared resource access

## Security Considerations

### Network Security
- Wi-SUN uses IEEE 802.15.4 security (AES-128)
- Certificate-based authentication supported
- Network key management via border router
- Secure key storage in flash memory

### Application Security
- CoAP over DTLS not implemented (can be added)
- No authentication on CoAP endpoints (open access)
- Recommendation: Implement CoAP token verification
- Use network-level security (firewall, VPN)

### Secure Deployment Checklist
- [ ] Change default network credentials
- [ ] Enable CoAP DTLS if available
- [ ] Implement access control lists
- [ ] Regular firmware updates via OTA
- [ ] Monitor for unauthorized access attempts
- [ ] Physical security of hardware


## License

**SPDX-License-Identifier**: Zlib

Copyright 2023 Silicon Laboratories Inc. www.silabs.com

This software is provided 'as-is', without any express or implied warranty. See source files for complete license text.

## Bill of Materials (BOM)

### Development Setup
| Item | Part Number | Quantity | Purpose |
|------|-------------|----------|---------|
| ZG28 Radio Board | BRD2705A | 1 | Main MCU board |
| USB Cable | Micro USB | 1 | Programming & power |
| 5V Relay Module | Generic 4-channel | 1 | Streetlight switching |
| Jumper Wires | Female-Female | 10+ | GPIO connections |

### Production Deployment (per node)
| Item | Specification | Quantity | Purpose |
|------|---------------|----------|---------|
| EFR32ZG28 Module | Custom or certified module | 1 | Wireless SoC |
| Relay Module | 5V/12V 4-channel optocoupled | 1 | Load switching |
| Power Supply | 5V/3.3V regulated | 1 | System power |
| Antenna | Sub-GHz external | 1 | RF transmission |
| Enclosure | IP65 rated weatherproof | 1 | Protection |
| Connectors | Phoenix/terminal blocks | 1 set | Wiring |

## References

- [Wi-SUN Alliance](https://wi-sun.org/)
- [Silicon Labs Wi-SUN Documentation](https://www.silabs.com/wireless/wi-sun)
- [EFR32ZG28 Product Page](https://www.silabs.com/wireless/z-wave/efr32zg28-series-2-socs)
- [BRD2705A User Guide](https://www.silabs.com/documents/public/user-guides/)
- [Simplicity Studio 5](https://www.silabs.com/developers/simplicity-studio)
- [CoAP RFC 7252](https://tools.ietf.org/html/rfc7252)
- [libcoap Library](https://libcoap.net/)

## Support

For technical support and questions:
- [Silicon Labs Community Forum](https://community.silabs.com/)
- [Silicon Labs Support Portal](https://www.silabs.com/support)
- GitHub Issues (if applicable)

---

**Project**: scrc_streetlight  
**Version**: 1.0.0  
**SDK Version**: Simplicity SDK 2025.6.2  
**Board**: BRD2705A (ZG28)  
**Chip**: EFR32ZG28B312F1024IM48  
**Category**: Wi-SUN Smart Streetlight Control  
**Last Updated**: January 2026
