let isFeedPaused = false;
let currentFilter = 'ALL';
let stolenKB = 0;
let blockedKB = 0;

// 1. Keylogger Simulation
function trackKeystrokes() {
    const inputVal = document.getElementById('userInput').value;
    const capturedDisplay = document.getElementById('capturedData');
    const keyCount = document.getElementById('keyCount');
    const isEncrypted = document.getElementById('toggleKeyEncrypt').checked;

    keyCount.innerText = inputVal.length;

    if (inputVal.trim() === '') {
        capturedDisplay.innerText = 'Captured data will appear here...';
        return;
    }

    if (isEncrypted) {
        capturedDisplay.innerText = inputVal.split('').map(() => '*').join('');
        capturedDisplay.className = 'captured-text success-text';
        updateMetrics(0, 0.1);
    } else {
        capturedDisplay.innerText = inputVal;
        capturedDisplay.className = 'captured-text danger-text';
        updateMetrics(0.1, 0);
    }
}

// 2. Clipboard Hijacker Simulation
function copyToClipboard() {
    const textToCopy = document.getElementById('clipInput').value;
    const clipLog = document.getElementById('clipLog');
    const isNetIsolated = document.getElementById('toggleNetIso').checked;

    navigator.clipboard.writeText(textToCopy);

    if (isNetIsolated) {
        clipLog.innerText = `[BLOCKED BY DEFENSE] Copy detected, but network transfer isolated.`;
        clipLog.className = 'captured-text success-text';
        updateMetrics(0, 0.5);
    } else {
        clipLog.innerText = `[HIJACKED]: ${textToCopy}`;
        clipLog.className = 'captured-text danger-text';
        updateMetrics(0.5, 0);
        addTelemetryLog('PRIVACY', 'CLIPBOARD HIJACK: Sensitive data copied to attacker memory', 'ALERT');
    }
}

// 3. Live Telemetry Stream Handler
const sampleLogs = [
    { type: 'PRIVACY', msg: 'Browser session cookies & saved passwords exfiltrated.', status: 'ALERT' },
    { type: 'EXFILTRATION', msg: 'Background HTTP POST to malicious server [185.220.101.5].', status: 'ALERT' },
    { type: 'ALERT', msg: 'Attacker stealth obfuscation enabled on port 443.', status: 'WARN' },
    { type: 'PRIVACY', msg: 'System clipboard data scanned for crypto wallet address.', status: 'ALERT' },
    { type: 'EXFILTRATION', msg: 'Keystroke log file payload transmission (4.2 KB).', status: 'ALERT' }
];

function addTelemetryLog(type, msg, status) {
    if (isFeedPaused) return;

    const feed = document.getElementById('telemetryFeed');
    const isNetIsolated = document.getElementById('toggleNetIso').checked;
    const now = new Date().toTimeString().split(' ')[0];

    if (currentFilter !== 'ALL' && currentFilter !== type) return;

    const logDiv = document.createElement('div');
    logDiv.className = 'log-item';

    if (isNetIsolated && type === 'EXFILTRATION') {
        logDiv.innerHTML = `<span class="time">[${now}]</span> <span class="success-text">[BLOCKED] ${msg}</span>`;
        updateMetrics(0, 0.4);
    } else {
        const colorClass = status === 'ALERT' ? 'danger-text' : 'warning-text';
        logDiv.innerHTML = `<span class="time">[${now}]</span> <span class="${colorClass}">[${type}] ${msg}</span>`;
        updateMetrics(0.4, 0);
    }

    feed.prepend(logDiv);

    if (feed.children.length > 20) {
        feed.removeChild(feed.lastChild);
    }
}

// Auto telemetry updates
setInterval(() => {
    const randomLog = sampleLogs[Math.floor(Math.random() * sampleLogs.length)];
    addTelemetryLog(randomLog.type, randomLog.msg, randomLog.status);
}, 3500);

// 4. Log Filters and Feed Control
function filterLogs(category) {
    currentFilter = category;
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function togglePauseFeed() {
    isFeedPaused = !isFeedPaused;
    const btn = document.getElementById('pauseBtn');
    btn.innerText = isFeedPaused ? 'Resume Feed' : 'Pause Feed';
    btn.style.background = isFeedPaused ? '#ef4444' : '#334155';
}

// 5. Data Metrics Updater
function updateMetrics(stolen, blocked) {
    stolenKB += stolen;
    blockedKB += blocked;
    document.getElementById('stolenMetrics').innerText = stolenKB.toFixed(2) + ' KB';
    document.getElementById('blockedMetrics').innerText = blockedKB.toFixed(2) + ' KB';
}

// 6. Security Switches and Risk Score Calculator
function updateSecuritySettings() {
    const keyEnc = document.getElementById('toggleKeyEncrypt').checked;
    const camLock = document.getElementById('toggleCamLock').checked;
    const netIso = document.getElementById('toggleNetIso').checked;

    let risk = 85;
    let activeThreatsCount = 3;

    if (keyEnc) { risk -= 25; activeThreatsCount--; }
    if (camLock) {
        risk -= 25;
        activeThreatsCount--;
        document.getElementById('camBadge').innerText = 'BLOCKED';
        document.getElementById('camBadge').className = 'badge badge-success';
    } else {
        document.getElementById('camBadge').innerText = 'CAPTURING';
        document.getElementById('camBadge').className = 'badge badge-danger';
    }

    if (netIso) { risk -= 35; activeThreatsCount--; }

    const riskScoreEl = document.getElementById('riskScore');
    const systemStateText = document.getElementById('systemStateText');

    riskScoreEl.innerText = risk;
    document.getElementById('activeThreats').innerText = Math.max(0, activeThreatsCount);

    if (risk <= 20) {
        systemStateText.innerText = 'SECURE';
        systemStateText.className = 'value success-text';
    } else if (risk <= 50) {
        systemStateText.innerText = 'MODERATE RISK';
        systemStateText.className = 'value warning-text';
    } else {
        systemStateText.innerText = 'THREAT ELEVATED';
        systemStateText.className = 'value danger-text';
    }

    trackKeystrokes();
}

// 7. Export Audit Report (JSON Download)
function exportAuditReport() {
    const reportData = {
        project: "SpyTrack Analytics Audit Report",
        timestamp: new Date().toISOString(),
        metrics: {
            stolenKB: stolenKB.toFixed(2),
            blockedKB: blockedKB.toFixed(2),
            vulnerabilityIndex: document.getElementById('riskScore').innerText
        },
        securityControls: {
            antiKeyloggerEncryption: document.getElementById('toggleKeyEncrypt').checked,
            camMicHardwareLock: document.getElementById('toggleCamLock').checked,
            isolateExfiltrationNetwork: document.getElementById('toggleNetIso').checked
        }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SpyTrack_Audit_Report_${Date.now()}.json`;
    a.click();
}