document.addEventListener('DOMContentLoaded', function () {

  const contactBtnEl = document.querySelector('.contact-btn');
  const contactMenuEl = document.querySelector('.contact-menu');
  contactBtnEl.addEventListener('click', e => {
    e.stopPropagation();
    contactMenuEl.classList.toggle('active');
  });
  document.addEventListener('click', e => {
    if (!contactMenuEl.contains(e.target)) contactMenuEl.classList.remove('active');
  });

  const track = document.querySelector('.slider-track');
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  let currentIndex = 0;
  let startX = 0;
  let isDragging = false;
  let slideInterval;

  function updateSlide() {
    track.style.transition = 'transform 0.5s ease';
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentIndex].classList.add('active');
  }

  function startAutoSlide() {
    slideInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlide();
    }, 3000);
  }

  function stopAutoSlide() {
    clearInterval(slideInterval);
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      currentIndex = idx;
      updateSlide();
      stopAutoSlide();
      startAutoSlide();
    });
  });

  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    isDragging = true;
    track.style.transition = 'none';
  });
  track.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const moveX = e.touches[0].clientX - startX;
    track.style.transform = `translateX(${-currentIndex * 100 + moveX / slides[0].clientWidth * 100}%)`;
  });
  track.addEventListener('touchend', e => {
    if (!isDragging) return;
    isDragging = false;
    const diff = e.changedTouches[0].clientX - startX;
    if (diff > 50) currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    else if (diff < -50) currentIndex = (currentIndex + 1) % slides.length;
    updateSlide();
    stopAutoSlide();
    startAutoSlide();
  });

  updateSlide();
  startAutoSlide();

  const popupMenuEl = document.getElementById('profile-popup');
  const bnBtn = document.getElementById('bn-btn');
  const enBtn = document.getElementById('en-btn');
  const profileBtn = document.getElementById('profile-btn');

  function setActiveBtn(activeBtn) {
    bnBtn.classList.remove('active');
    enBtn.classList.remove('active');
    activeBtn.classList.add('active');
  }

  bnBtn.addEventListener('click', e => {
    e.preventDefault();
    setActiveBtn(bnBtn);
    popupMenuEl.style.display = 'none';
    window.location.href = '#';
  });

  enBtn.addEventListener('click', e => {
    e.preventDefault();
    setActiveBtn(enBtn);
    popupMenuEl.style.display = 'none';
    window.location.href = 'https://translate.google.com/translate?sl=auto&tl=en&u=' + encodeURIComponent(window.location.href);
  });

  profileBtn.addEventListener('click', e => {
    e.preventDefault();
    popupMenuEl.style.display = popupMenuEl.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', e => {
    if (!popupMenuEl.contains(e.target) && !profileBtn.contains(e.target)) popupMenuEl.style.display = 'none';
  });

  const navbarLinks = [
    { id: "fclb-db", href: "UserProfileDashboard.html" },
    { id: "news-btn", href: "X-TEAM_Blog.html" }
    
  ];

  navbarLinks.forEach(link => {
    const el = document.getElementById(link.id);
    if(el){
      el.addEventListener('click', e => { e.preventDefault(); openFullscreen(link.href); });
    }
  });

const games = [
  { 
    name: "জিমেইল!", 
    file: "Gmail1stDial71.html", 
    icon: "fa-envelope", 
    image: "assets/images/Gmail.png",
    keyword: "gmail"  // সার্চ কীওয়ার্ড
  }
];

const container = document.querySelector('.game-types');
container.innerHTML = games.map(game => `
  <a href="#" class="game-card" id="${game.keyword}" data-game="${game.file}">
    <div class="card-image" style="background-image:url('${game.image}')"></div>
    <div class="card-text"><i class="fas ${game.icon}" style="margin-right:8px;"></i>${game.name}</div>
  </a>
`).join('');

document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('click', e => { 
    e.preventDefault(); 
    openFullscreen(card.dataset.game); 
  });
});

const input = document.getElementById("searchInput");
const suggestionBox = document.getElementById("suggestions");

input.addEventListener("input", () => {
    const text = input.value;
    suggestionBox.innerHTML = "";

    if(!text){
        suggestionBox.style.display = "none";
        return;
    }

    const match = games.filter(g => g.keyword.toLowerCase().includes(text.toLowerCase()) || g.name.includes(text));

    if(match.length === 0){
        suggestionBox.style.display = "none";
        return;
    }

    suggestionBox.style.display = "block";

    match.forEach(game => {
        const div = document.createElement("div");
        div.innerText = game.name;

        div.addEventListener("click", () => {
            input.value = game.name;
            suggestionBox.style.display = "none";

            const targetCard = document.getElementById(game.keyword);
            targetCard.scrollIntoView({ behavior:"smooth", block:"center" });

            targetCard.style.transform = "scale(0.97)";
            setTimeout(()=> targetCard.style.transform = "scale(1)", 200);
        });

        suggestionBox.appendChild(div);
    });
});

  function showToast(message, duration = 2500) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 500);
    }, duration);
  }

  async function openFullscreen(url){
    const gameFullScreen = document.getElementById('gameFullScreen');
    const gameFrame = document.getElementById('gameFrame');
    if(!navigator.onLine){
      gameFrame.src='';
      gameFullScreen.style.display='block';
      document.body.style.overflow='hidden';
      return;
    }
    try{
      const res = await fetch(url);
      if(!res.ok) throw new Error();
      gameFrame.src = url;
      gameFullScreen.style.display='block';
      document.body.style.overflow='hidden';
    }catch(e){
      showToast('Coming Soon...!');
    }
  }

  window.closeGame = function(){
    const gameFullScreen = document.getElementById('gameFullScreen');
    const gameFrame = document.getElementById('gameFrame');
    gameFullScreen.style.display='none';
    gameFrame.src='';
    document.body.style.overflow='auto';
  }

  const style = document.createElement('style');
  style.textContent = `
.toast-message {
  position: fixed;
  bottom: 40px;
  left: 50%;
  font-weight: bold;
  transform: translateX(-50%) translateY(20px);
  background: black;
  color: #fff;
  padding: 12px 24px;
  border-radius: 27px;
  font-family: "Poppins", sans-serif;
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  opacity: 0;
  transition: all 0.5s ease;
  z-index: 9999;
}

.toast-message.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
  `;
  document.head.appendChild(style);

});

