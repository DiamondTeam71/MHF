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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

auth.onAuthStateChanged(async user => {
    if(!user){
        window.location.href = "UserLogin.html";
        return;
    }

    const userRef = db.ref("users/"+user.uid);
    let snap = await userRef.once("value");
    let d = snap.val();

    if(d?.banned){
        alert('আপনি BAN হয়েছেন! লগইন বা রেজিস্ট্রেশন সম্ভব নয়।');
        await auth.signOut();
        window.location.href = "UserLogin.html";
        return;
    }

    if(!d){
        d = {email:user.email, username:"New User", dob:"Not Set", gender:"Not Set", phone:"Not Set", MainBalance:0};
        await userRef.set(d);
    }

db.ref("users").orderByChild("referredBy").equalTo(user.uid).on("value", snap => {
    const data = snap.val() || {};
    document.getElementById("TotalRef").innerText = Object.keys(data).length;
});
    document.getElementById("pEmail").innerText = d.email ?? "Not Set";
    document.getElementById("pUsername").innerText = d.username ?? "Not Set";
    document.getElementById("pUid").innerText = user.uid;
    document.getElementById("pDob").innerText = d.dob ?? "Not Set";
    document.getElementById("pGender").innerText = d.gender ?? "Not Set";
    document.getElementById("pPhone").innerText = d.phone ?? "Not Set";

    const profilePic = d.profilePic ?? "assets/images/logo.png";
    document.getElementById("profilePic").src = profilePic;

    const balanceSpan = document.getElementById("pBalance");
    const userBalanceRef = db.ref("users/"+user.uid+"/MainBalance");
    userBalanceRef.on("value", snap => {
        const bal = snap.val() ?? 0;
        balanceSpan.dataset.hiddenBalance = bal;

        if(balanceSpan.classList.contains("fa-eye-slash")) return;

        balanceSpan.innerText = bal + " TK";
    });
});

function toggleBalance(icon){
    const balanceSpan = document.getElementById("pBalance");
    if(icon.classList.contains("fa-eye")){
        balanceSpan.innerText = "**** TK";
        icon.classList.replace("fa-eye","fa-eye-slash");
    } else {
        balanceSpan.innerText = (balanceSpan.dataset.hiddenBalance ?? 0) + " TK";
        icon.classList.replace("fa-eye-slash","fa-eye");
    }
}

function togglePassword(id, icon){
    const input = document.getElementById(id);
    if(input.type === "password"){
        input.type = "text";
        icon.classList.replace("fa-eye","fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash","fa-eye");
    }
}

async function saveChanges(){
    const user = auth.currentUser;
    if(!user) return;

    const newUsername = document.getElementById("newUsername").value.trim();
    const newDob = document.getElementById("newDob").value;
    const newGender = document.getElementById("newGender").value;
    const newPhone = document.getElementById("newPhone").value.trim();
    const newProfilePic = document.getElementById("newProfilePicURL").value.trim();
    const oldPass = document.getElementById("oldPassword").value;
    const newPass = document.getElementById("newPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    if(!oldPass){
        showToast("Enter your password to confirm changes!");
        return;
    }

    try{
        const cred = firebase.auth.EmailAuthProvider.credential(user.email, oldPass);
        await user.reauthenticateWithCredential(cred);
    } catch(e){
        showToast("Wrong password! Changes not saved.");
        return;
    }

    if(newPass || confirm){
        if(newPass !== confirm){
            showToast("Password mismatch!");
            return;
        }
        try{
            await user.updatePassword(newPass);
            showToast("Password updated successfully!");
        } catch(e){
            showToast("Failed to update password!");
            return;
        }
    }

    const updates = {};
    if(newUsername){
        const usernameSnap = await db.ref("users").orderByChild("username").equalTo(newUsername).once("value");
        if(usernameSnap.exists()){showToast("Username already taken!"); return;}
        updates.username = newUsername;
    }
    if(newPhone){
        const phoneSnap = await db.ref("users").orderByChild("phone").equalTo(newPhone).once("value");
        if(phoneSnap.exists()){showToast("Phone number already used!"); return;}
        updates.phone = newPhone;
    }
    if(newDob) updates.dob = newDob;
    if(newGender) updates.gender = newGender;
    if(newProfilePic) updates.profilePic = newProfilePic;

    if(Object.keys(updates).length > 0){
        await db.ref("users/"+user.uid).update(updates);
    }

    if(newProfilePic) document.getElementById("profilePic").src = newProfilePic;
    if(newUsername) document.getElementById("pUsername").innerText = newUsername;
    if(newDob) document.getElementById("pDob").innerText = newDob;
    if(newGender) document.getElementById("pGender").innerText = newGender;
    if(newPhone) document.getElementById("pPhone").innerText = newPhone;

    showToast("Profile updated successfully!");
    closeEditModal();
}

async function submitWithdraw(){
    const method = document.getElementById("withdrawMethod").value;
    const account = document.getElementById("withdrawUserAccount").value.trim();
    const amount = parseFloat(document.getElementById("withdrawAmount").value);
    const password = document.getElementById("withdrawPassword").value;

    if(!method || !account || !amount || !password){
        showToast("Fill all fields!");
        return;
    }
    if(amount < 200 || amount > 20000){
        showToast("Withdrawal amount must be between 200 - 20,000 TK!");
        return;
    }

    const user = auth.currentUser;
    if(!user) return;

    try{
        const cred = firebase.auth.EmailAuthProvider.credential(user.email, password);
        await user.reauthenticateWithCredential(cred);
    } catch(e){
        showToast("Wrong password!");
        return;
    }

    const userBalRef = db.ref("users/"+user.uid+"/MainBalance");
    let balanceSnap = await userBalRef.once("value");
    let balance = balanceSnap.val() ?? 0;

    if(amount > balance){
        showToast("Insufficient balance!");
        return;
    }

    const now = new Date();
    const formattedTime = now.toLocaleString('en-BD', { hour12: true });

    await userBalRef.set(balance - amount);

    const withdrawRef = db.ref("withdrawals").push();
    await withdrawRef.set({
        uid: user.uid,
        method,
        account,
        amount,
        status: "pending",
        time: formattedTime
    });

    showToast("Withdrawal submitted! Amount deducted. Admin approval pending.");
    closeWithdrawModal();
}

async function adminApproveWithdraw(withdrawId){
    const withdrawRef = db.ref("withdrawals/"+withdrawId);
    await withdrawRef.update({status:"approved"});
}

async function adminRejectWithdraw(withdrawId){
    const withdrawRef = db.ref("withdrawals/"+withdrawId);
    const snap = await withdrawRef.once("value");
    if(!snap.exists()) return;
    const data = snap.val();

    const userBalRef = db.ref("users/"+data.uid+"/MainBalance");
    const balanceSnap = await userBalRef.once("value");
    const currentBalance = balanceSnap.val() ?? 0;

    await userBalRef.set(currentBalance + data.amount);
    await withdrawRef.update({status:"rejected"});
}

function openEditModal(){document.getElementById("editModal").style.display="flex";}
function closeEditModal(){document.getElementById("editModal").style.display="none";}
function openWithdrawModal(){document.getElementById("withdrawModal").style.display="flex";}
function closeWithdrawModal(){document.getElementById("withdrawModal").style.display="none";}
function logoutUser(){auth.signOut().then(()=>window.location.href="UserLogin.html");}
function gotoHome(){window.location.href="index.html";}
function copyUid(){navigator.clipboard.writeText(document.getElementById("pUid").innerText);showToast("UID copied!");}
function copyAdminAccount(){navigator.clipboard.writeText(document.getElementById("adminAccount").value);showToast("Admin Account copied!");}

window.onclick = e => {
    if(e.target == document.getElementById("editModal")) closeEditModal();
    if(e.target == document.getElementById("withdrawModal")) closeWithdrawModal();
}

function showToast(msg){
    const t = document.createElement("div");
    t.className = "toast";
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(()=>{t.remove();},2500);
}

function openTransectionModal(){
    document.getElementById("transectionModal").style.display = "flex";
    loadUserTransactions();
}
function closeTransectionModal(){
    document.getElementById("transectionModal").style.display = "none";
}

async function loadUserTransactions(){
    const ul = document.getElementById("transectionList");
    ul.innerHTML = '<li style="padding:10px;text-align:center;">Loading...</li>';
    const user = auth.currentUser;
    if(!user) return;

    const snap = await db.ref("withdrawals").orderByChild("uid").equalTo(user.uid).once("value");
    const data = snap.val();
    if(!data){
        ul.innerHTML = '<li style="padding:10px;text-align:center;">No transactions found.</li>';
        return;
    }

    let html = "";
    Object.values(data).sort((a,b)=>new Date(b.time)-new Date(a.time)).forEach(tx=>{
        let color = tx.status === "approved" ? "green" : tx.status === "rejected" ? "red" : "orange";
        html += `
        <li style="border:1px solid #000;border-radius:37px;margin-bottom:12px;padding:12px;background:#f9f9f9;">
            <div><strong>Time:</strong> ${tx.time}</div>
            <div><strong>Method:</strong> ${tx.method}</div>
            <div><strong>Account:</strong> ${tx.account}</div>
            <div><strong>Amount:</strong> ${tx.amount} TK</div>
            <div><strong>Status:</strong> <span style="color:${color};font-weight:bold;">${tx.status}</span></div>
        </li>`;
    });
    ul.innerHTML = html;
}

window.addEventListener('click', e => {
    if(e.target == document.getElementById("transectionModal")) closeTransectionModal();
});
