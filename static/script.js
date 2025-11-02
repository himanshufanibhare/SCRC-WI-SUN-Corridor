const API_BASE = '/api';

// Relay states (track locally)
const relayStates = {
    1: false,
    2: false,
    3: false,
    4: false
};

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Update relay status display
 */
function updateRelayStatus(relayNum, isOn) {
    const checkbox = document.getElementById(`relay${relayNum}`);
    const status = document.getElementById(`status${relayNum}`);

    if (checkbox && status) {
        checkbox.checked = isOn;
        relayStates[relayNum] = isOn;
        status.textContent = isOn ? 'ON' : 'OFF';
        status.className = `status ${isOn ? 'on' : 'off'}`;
    }
}

/**
 * Toggle individual relay
 */
async function toggleRelay(relayNum) {
    const checkbox = document.getElementById(`relay${relayNum}`);
    const isOn = checkbox.checked;
    const action = isOn ? 'on' : 'off';

    // Disable checkbox while processing
    checkbox.disabled = true;
    const status = document.getElementById(`status${relayNum}`);
    if (status) {
        status.classList.add('loading');
    }

    try {
        const response = await fetch(`${API_BASE}/relay/${relayNum}/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            updateRelayStatus(relayNum, isOn);
            showNotification(`Relay ${relayNum} turned ${action.toUpperCase()}`, 'success');
        } else {
            // Revert checkbox if command failed
            checkbox.checked = !isOn;
            showNotification(`Failed to control Relay ${relayNum}: ${data.error || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        // Revert checkbox on error
        checkbox.checked = !isOn;
        showNotification(`Error controlling Relay ${relayNum}: ${error.message}`, 'error');
    } finally {
        checkbox.disabled = false;
        if (status) {
            status.classList.remove('loading');
        }
    }
}

/**
 * Control all relays at once
 */
async function controlAll(action) {
    const buttons = document.querySelectorAll('.btn');
    const masterStatus = document.getElementById('master-status');

    // Disable all buttons during operation
    buttons.forEach(btn => btn.disabled = true);

    if (masterStatus) {
        masterStatus.textContent = `Turning all relays ${action.toUpperCase()}...`;
        masterStatus.classList.add('loading');
    }

    try {
        const response = await fetch(`${API_BASE}/relay/all/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            // Update all relay states
            const isOn = action === 'on';
            for (let i = 1; i <= 4; i++) {
                updateRelayStatus(i, isOn);
            }

            if (masterStatus) {
                masterStatus.textContent = `All relays turned ${action.toUpperCase()}`;
                masterStatus.className = 'master-status';
            }

            showNotification(`All relays turned ${action.toUpperCase()}`, 'success');
        } else {
            const errorMsg = Object.values(data.results || {})
                .map(r => r.error)
                .filter(e => e)
                .join(', ') || 'Unknown error';

            if (masterStatus) {
                masterStatus.textContent = `Failed: ${errorMsg}`;
                masterStatus.className = 'master-status';
            }

            showNotification(`Failed to control all relays: ${errorMsg}`, 'error');
        }
    } catch (error) {
        if (masterStatus) {
            masterStatus.textContent = `Error: ${error.message}`;
            masterStatus.className = 'master-status';
        }
        showNotification(`Error controlling relays: ${error.message}`, 'error');
    } finally {
        buttons.forEach(btn => btn.disabled = false);
        if (masterStatus) {
            masterStatus.classList.remove('loading');
        }
    }
}

/**
 * Check server health on load
 */
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
            console.log('Server is ready');
        } else {
            showNotification('Server connection issue', 'error');
        }
    } catch (error) {
        showNotification('Cannot connect to server. Make sure Flask is running.', 'error');
    }
    // Start node status checks
    checkNodeStatus();
    setInterval(checkNodeStatus, 5000);
});

/**
 * Ping node to update status pill
 */
async function checkNodeStatus() {
    const pill = document.getElementById('node-status');
    if (!pill) return;
    try {
        const res = await fetch(`${API_BASE}/ping`);
        const data = await res.json();
        if (data.online) {
            pill.textContent = 'Online';
            pill.className = 'status-pill online';
        } else {
            pill.textContent = 'Offline';
            pill.className = 'status-pill offline';
        }
    } catch (e) {
        pill.textContent = 'Offline';
        pill.className = 'status-pill offline';
    }
}

