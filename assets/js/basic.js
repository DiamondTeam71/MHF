import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB77ruQ-FxUvMAYHsUOipYB4lAQKaavCN0",
  authDomain: "ludooclubofficial.firebaseapp.com",
  databaseURL: "https://ludooclubofficial-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ludooclubofficial",
  storageBucket: "ludooclubofficial.firebasestorage.app",
  messagingSenderId: "141984102700",
  appId: "1:141984102700:web:37f719e81ae32df69ed489",
  measurementId: "G-PHTVR2KP9E"
};


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const realTime = document.getElementById("realTime");
let timer = null;

const countdownRef = ref(db, "settings/countdown");
onValue(countdownRef, (snap) => {
  const data = snap.val();
  if (!data) {
    realTime.innerHTML = `<i class="fa-solid fa-hourglass-start"></i> এখনো, কোনো সময় সেট করা হয়নি`;
    return;
  }
  const start = new Date(data.start_time).getTime();
  const hours = data.duration_hours;
  if (!start || !hours || hours <= 0) {
    realTime.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> কাউন্টডাউন পাওয়া যায়নি`;
    return;
  }
  startCountdown(start, hours);
});

function startCountdown(startTime, durationHours) {
  if (timer) clearInterval(timer);
  const end = startTime + durationHours * 3600 * 1000;
  timer = setInterval(() => {
    const diff = end - Date.now();
    if (diff <= 0) {
      clearInterval(timer);
      realTime.innerHTML = `<i class="fa-solid fa-party-popper"></i> এই মুহুর্তে, সবার পাঠানো সেক্টর রিসিভ করা হবে!`;
      return;
    }
    const t = Math.floor(diff / 1000);
    const hh = String(Math.floor(t / 3600)).padStart(2, "0");
    const mm = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
    const ss = String(t % 60).padStart(2, "0");
    realTime.innerHTML = `<i class="fa-solid fa-clock"></i> ${hh}:${mm}:${ss}`;
  }, 1000);
}

const bestSellersBtn = document.getElementById('rewards-btn');
const modal = document.getElementById('bestSellersModal');
const closeBtn = document.getElementById('closeBestSellers');
const tableBody = document.querySelector('#bestSellersTable tbody');

bestSellersBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  modal.style.display = 'block';
  tableBody.innerHTML = `<tr><td colspan="3">⏳ ডেটা লোড হচ্ছে...</td></tr>`;
  try {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    const users = snapshot.val() || {};
    const sortedUsers = Object.entries(users)
      .map(([id, data]) => ({
        username: data.username || "Unknown",
        balance: parseFloat(data.TwitterBalance || data.balance || 0)
      }))
      .filter(u => !isNaN(u.balance))
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 10000000000);
    if (sortedUsers.length > 0) {
      tableBody.innerHTML = sortedUsers.map((user, index) => {
        let rankText;
        if (index === 0) rankText = "🥇 1st";
        else if (index === 1) rankText = "🥈 2nd";
        else if (index === 2) rankText = "🥉 3rd";
        else rankText = `${index + 1}th`; 
        return `
          <tr>
            <td>${rankText}</td>
            <td>${user.username}</td>
            <td>${user.balance.toLocaleString()} ৳</td>
          </tr>
        `;
      }).join('');
    } else {
      tableBody.innerHTML = `<tr><td colspan="3">😔 কোনো ইউজার পাওয়া যায়নি</td></tr>`;
    }
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = `<tr><td colspan="3">⚠️ ডেটা লোডে সমস্যা!</td></tr>`;
  }
});

closeBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});
