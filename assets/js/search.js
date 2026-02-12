import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";


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
      .slice(0, 30);
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

