
// Updated login with 'Remember me', multiple user support, and admin panel

const USERS = [
  { username: "alice", password: "btc123", btc: 0.543, usdt: 1200 },
  { username: "bob", password: "usdt456", btc: 1.234, usdt: 3200 },
  { username: "admin", password: "admin", btc: 0, usdt: 0 } // ← diesen Eintrag hinzufügen
];

let currentUser = null;

function showAdminPanel() {
  const container = document.createElement("div");
  container.style = "position:fixed;top:60px;right:20px;background:#fff;padding:15px;border-radius:6px;max-width:300px;z-index:999;font-size:0.9rem;color:#000;box-shadow:0 4px 20px rgba(0,0,0,0.3)";

  const form = document.createElement("form");
  form.innerHTML = `
    <strong>Neuen Benutzer hinzufügen</strong><br><br>
    <input type='text' id='new-username' placeholder='Username' required style='width:100%;margin-bottom:10px;padding:6px;'>
    <input type='password' id='new-password' placeholder='Password' required style='width:100%;margin-bottom:10px;padding:6px;'>
    <input type='number' id='new-btc' placeholder='BTC' min='0' step='0.0001' style='width:100%;margin-bottom:10px;padding:6px;'>
    <input type='number' id='new-usdt' placeholder='USDT' min='0' step='0.01' style='width:100%;margin-bottom:10px;padding:6px;'>
    <button type='submit' style='padding:6px 12px;background:#28c76f;border:none;color:white;border-radius:4px;'>Add User</button>
  `;

  form.onsubmit = e => {
    e.preventDefault();
    const u = document.getElementById("new-username").value.trim();
    const p = document.getElementById("new-password").value.trim();
    const b = parseFloat(document.getElementById("new-btc").value);
    const usd = parseFloat(document.getElementById("new-usdt").value);
    if (!u || !p || isNaN(b) || isNaN(usd)) return alert("Please fill all fields correctly.");
    USERS.push({ username: u, password: p, btc: b, usdt: usd });
    alert("User added successfully.");
    document.body.removeChild(container);
  };

  container.appendChild(form);
  document.body.appendChild(container);
}

window.onload = () => {
  const savedUser = localStorage.getItem("savedUser");
  const savedPass = localStorage.getItem("savedPass");

  if (!sessionStorage.getItem("loggedIn") && !(savedUser && savedPass)) {
    document.body.innerHTML = `
      <div style='display:flex;justify-content:center;align-items:center;height:100vh;background:var(--bg);color:var(--text)'>
        <div style='background:var(--card);padding:40px;border-radius:8px;text-align:center;width:300px'>
          <h2>Login</h2>
          <input id='login-user' type='text' placeholder='Username' style='width:100%;padding:10px;margin:10px 0;border-radius:5px;border:none;'>
          <input id='login-pass' type='password' placeholder='Password' style='width:100%;padding:10px;margin:10px 0;border-radius:5px;border:none;'>
          <label style='display:flex;align-items:center;gap:8px;font-size:0.85rem;margin:10px 0;'>
            <input type='checkbox' id='remember-me'> Remember me
          </label>
          <button onclick='login()' style='padding:10px 20px;background:var(--accent);border:none;border-radius:5px;color:white;cursor:pointer;'>Login</button>
          <button onclick='clearSavedLogin()' style='margin-top:10px;background:none;border:none;color:var(--accent);cursor:pointer;font-size:0.8rem;'>Remove saved login</button>
        </div>
      </div>`;
  } else {
    const user = USERS.find(u => u.username === savedUser && u.password === savedPass);
    if (user) {
      currentUser = user;
      sessionStorage.setItem("loggedIn", "true");
      showSection('wallet');
      fetchPrices();
      renderChart();
      if (currentUser.username === "admin") showAdminPanel();
    }
  }
};

function login() {
  const userInput = document.getElementById("login-user").value;
  const passInput = document.getElementById("login-pass").value;
  const remember = document.getElementById("remember-me")?.checked;

  const user = USERS.find(u => u.username === userInput && u.password === passInput);
  if (user) {
    currentUser = user;
    if (remember) {
      localStorage.setItem("savedUser", user.username);
      localStorage.setItem("savedPass", user.password);
    }
    sessionStorage.setItem("loggedIn", "true");
    location.reload();
  } else {
    alert("Incorrect credentials");
  }
}

function clearSavedLogin() {
  localStorage.removeItem("savedUser");
  localStorage.removeItem("savedPass");
  alert("Saved login removed");
}

async function fetchPrices() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether&vs_currencies=usd");
    const data = await res.json();
    const btcValue = (currentUser.btc * data.bitcoin.usd).toFixed(2);
    const usdtValue = (currentUser.usdt * data.tether.usd).toFixed(2);
    document.getElementById("btc-balance").innerText = `${currentUser.btc} BTC ($${btcValue})`;
    document.getElementById("usdt-balance").innerText = `${currentUser.usdt} USDT ($${usdtValue})`;
  } catch (e) {
    document.getElementById("btc-balance").innerText = `${currentUser.btc} BTC (N/A)`;
    document.getElementById("usdt-balance").innerText = `${currentUser.usdt} USDT (N/A)`;
  }
}
