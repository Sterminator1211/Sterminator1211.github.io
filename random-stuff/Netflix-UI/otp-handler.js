// otp-handler.js
let enteredOtp = "";
let generatedOtp = null;
let selectedPlanRef = null;

const TEM_EMAIL = "{{TEMADDRESS}}";   // GitHub secret placeholder

function generateRandomOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtp(otp) {
    if (!TEM_EMAIL || TEM_EMAIL.includes("{{TEMADDRESS}}")) {
        alert("TEMADDRESS not configured.");
        return false;
    }

    try {
        const res = await fetch('/api/send-otp', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ otp, to: TEM_EMAIL })
        });

        return res.ok;
    } catch (e) {
        console.error(e);
        alert("Could not send code.");
        return false;
    }
}

// === OTP UI Functions (same as before) ===
function showOtpPage(plan) {
    selectedPlanRef = plan;
    document.getElementById('phone-page').style.display = 'none';
    document.getElementById('otp-page').style.display = 'block';
    
    document.getElementById('otp-plan-name').textContent = `${plan.name} — ${plan.price}`;
    document.getElementById('otp-plan-details').innerHTML = `${plan.resolution}<br>${plan.features.join('<br>')}`;
    
    enteredOtp = "";
    generatedOtp = generateRandomOtp();
    
    sendOtp(generatedOtp).then(success => {
        if (success) {
            document.getElementById('otp-instruction').innerHTML = `Enter the 6-digit code sent to <strong>${TEM_EMAIL}</strong>`;
        }
    });
    
    renderOtpKeypad();
    updateOtpDisplay();
}

function renderOtpKeypad() {
    const keypad = document.getElementById('otp-keypad');
    keypad.innerHTML = '';
    for (let i = 0; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.className = 'key-btn';
        btn.textContent = i;
        btn.onclick = () => addOtpDigit(i);
        keypad.appendChild(btn);
    }
    const backBtn = document.createElement('button');
    backBtn.className = 'key-btn';
    backBtn.textContent = '⌫';
    backBtn.style.gridColumn = 'span 2';
    backBtn.onclick = backspaceOtp;
    keypad.appendChild(backBtn);
}

function addOtpDigit(digit) {
    if (enteredOtp.length < 6) enteredOtp += digit;
    updateOtpDisplay();
}

function backspaceOtp() {
    enteredOtp = enteredOtp.slice(0, -1);
    updateOtpDisplay();
}

function updateOtpDisplay() {
    document.getElementById('otp-display').textContent = enteredOtp.padEnd(6, '_');
    document.getElementById('verify-btn').disabled = enteredOtp.length < 6;
}

function verifyOtp() {
    if (enteredOtp === generatedOtp) {
        alert(`✅ Success!\nPlan: ${selectedPlanRef.name}`);
    } else {
        alert("❌ Wrong code");
        enteredOtp = "";
        updateOtpDisplay();
    }
}

function resendOtp() {
    if (!selectedPlanRef) return;
    enteredOtp = "";
    generatedOtp = generateRandomOtp();
    sendOtp(generatedOtp);
}

window.continueToOtp = () => window.selectedPlan && showOtpPage(window.selectedPlan);
window.renderOtpKeypad = renderOtpKeypad;
