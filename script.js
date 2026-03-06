/**
 * Bhujon Kang Architects - Global Script
 * 통합 기능: 언어 유지, 보안, 슬라이더 제어, 검색 및 렌더링
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. 언어 설정 초기화 (localStorage 확인)
    const savedLang = localStorage.getItem('site-lang');
    if (savedLang === 'kor') {
        document.body.classList.add("kor-mode");
        updateLangUI(true);
    } else {
        document.body.classList.remove("kor-mode");
        updateLangUI(false);
    }

    // 2. [Main Swiper] Index 페이지 프로젝트 슬라이더
    if (document.querySelector(".mainSwiper")) {
        var mainSwiper = new Swiper(".mainSwiper", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            spaceBetween: 0, 
            loop: true,
            speed: 800,
            keyboard: { enabled: true },
            coverflowEffect: {
                rotate: 0, stretch: 0, depth: 200, modifier: 1, slideShadows: false,
            },
            autoplay: { delay: 5000, disableOnInteraction: false },
        });
    }

    // 3. [News Swiper] Index 페이지 뉴스 슬라이더
    if (document.querySelector(".newsSwiper")) {
        var newsSwiper = new Swiper(".newsSwiper", {
            slidesPerView: "auto", 
            spaceBetween: 10, 
            centeredSlides: true, 
            loop: true,
            speed: 800,
            autoplay: { delay: 6000, disableOnInteraction: false },
        });
    }

    // 4. 전역 보안 설정 (드래그, 복사, 우클릭 방지)
    // 우클릭 방지
    document.addEventListener('contextmenu', e => e.preventDefault());
    // 드래그 시작 방지
    document.addEventListener('dragstart', e => e.preventDefault());
    // 복사 단축키 차단 (C, V, U, S)
    document.addEventListener('keydown', function(e) {
        const isCmd = e.ctrlKey || e.metaKey;
        if (isCmd && ['c', 'v', 'u', 's'].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }
        if (e.key === 'F12') e.preventDefault(); // 개발자 도구 차단
    });
});

/**
 * 언어 전환 기능 (localStorage 연동)
 */
function toggleLanguage() {
    const isKorMode = document.body.classList.toggle("kor-mode");
    
    // 상태 저장
    localStorage.setItem('site-lang', isKorMode ? 'kor' : 'eng');
    
    // UI 업데이트 (버튼 텍스트 및 검색창)
    updateLangUI(isKorMode);
}

function updateLangUI(isKor) {
    const headerBtn = document.getElementById("header-lang-btn");
    const searchInput = document.getElementById("search-input");
    const pSearchInput = document.getElementById("p-search-input");
    const nSearchInput = document.getElementById("n-search-input");
    
    if (headerBtn) {
        headerBtn.innerText = isKor ? "EN" : "한글";
    }
    if (searchInput) {
        searchInput.placeholder = isKor ? "검색" : "Search";
    }
    if (pSearchInput) {
        pSearchInput.placeholder = isKor ? "프로젝트 검색..." : "Search Projects...";
    }
    if (nSearchInput) {
        nSearchInput.placeholder = isKor ? "뉴스 검색..." : "Search News...";
    }
}

/**
 * 메뉴 제어 기능
 */
function toggleMenu() {
    const menu = document.getElementById("fullscreen-menu");
    if (menu) menu.classList.toggle("active");
}

/**
 * 메뉴 내 통합 검색 로직
 */
function handleMenuSearch() {
    const input = document.getElementById('search-input');
    const resultBox = document.getElementById('menu-search-results');
    if (!input || !resultBox) return;

    const val = input.value.toLowerCase().trim();
    resultBox.innerHTML = '';
    if (val.length < 1) return;

    // 프로젝트 데이터 검색
    if (typeof projectData !== 'undefined') {
        Object.keys(projectData).forEach(key => {
            const p = projectData[key];
            if (p.title.en.toLowerCase().includes(val) || p.title.ko.includes(val)) {
                createResultItem(resultBox, p.title, p.subtitle, `view.html?id=${key}`);
            }
        });
    }

    // 뉴스 데이터 검색
    if (typeof newsData !== 'undefined') {
        Object.keys(newsData).forEach(key => {
            const n = newsData[key];
            if (n.title.en.toLowerCase().includes(val) || n.title.ko.includes(val)) {
                createResultItem(resultBox, n.title, n.subtitle, `view_news.html?id=${key}`);
            }
        });
    }

    if (resultBox.children.length === 0) {
        resultBox.innerHTML = `<div style="text-align:center; color:#999; padding:20px; font-size:14px;">No results found</div>`;
    }

    //  사람 데이터 검색
    if (typeof PeopleData !== 'undefined') {
        Object.keys(PeopleData).forEach(key => {
            const n = PeopleData[key];
            if (n.title.en.toLowerCase().includes(val) || n.title.ko.includes(val)) {
                createResultItem(resultBox, n.title, n.subtitle, `view_news.html?id=${key}`);
            }
        });
    }

    //  아카이브 데이터 검색
    if (typeof ArchiveData !== 'undefined') {
        Object.keys(ArchiveData).forEach(key => {
            const n = ArchiveData[key];
            if (n.title.en.toLowerCase().includes(val) || n.title.ko.includes(val)) {
                createResultItem(resultBox, n.title, n.subtitle, `view_news.html?id=${key}`);
            }
        });
    }

    if (resultBox.children.length === 0) {
        resultBox.innerHTML = `<div style="text-align:center; color:#999; padding:20px; font-size:14px;">No results found</div>`;
    }
    
}

function createResultItem(container, titleObj, subObj, link) {
    const item = document.createElement('a');
    item.href = link;
    item.className = 'menu-result-item';
    item.onclick = function() { toggleMenu(); };
    item.innerHTML = `
        <span class="menu-result-title"><span class="ko">${titleObj.ko}</span><span class="en">${titleObj.en}</span></span>
        <span class="menu-result-sub"><span class="ko">${subObj.ko}</span><span class="en">${subObj.en}</span></span>
    `;
    container.appendChild(item);
}

/**
 * Projects & News 페이지 렌더링 로직
 */
let currentView = 'grid'; 
function renderProjects(viewType, filterText = "") {
    const container = document.getElementById('project-list-container');
    if (!container) return; 
    currentView = viewType;
    container.innerHTML = ""; 
    container.className = viewType === 'grid' ? 'project-grid' : 'project-list';
    const btns = document.querySelectorAll('.view-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    if(viewType === 'grid' && btns[0]) btns[0].classList.add('active');
    else if(btns[1]) btns[1].classList.add('active');
    if (typeof projectData === 'undefined') return;
    const projects = Object.keys(projectData).map(key => ({ id: key, ...projectData[key] }));
    projects.forEach((p) => {
        const searchText = filterText.toLowerCase();
        if (p.title.en.toLowerCase().includes(searchText) || p.title.ko.includes(searchText)) {
            const item = document.createElement('a');
            item.href = `view.html?id=${p.id}`;
            item.className = viewType === 'grid' ? 'grid-item' : 'list-item';
            item.setAttribute('data-aos', 'fade-up');
            if (viewType === 'grid') {
                item.innerHTML = `
                    <div style="overflow:hidden;"><img src="${p.images[0]}" alt="${p.title.en}"></div>
                    <div class="grid-info">
                        <div class="grid-title"><span class="ko">${p.title.ko}</span><span class="en">${p.title.en}</span></div>
                        <div class="grid-sub"><span class="ko">${p.subtitle.ko}</span><span class="en">${p.subtitle.en}</span></div>
                        <div class="grid-meta-row"><span class="grid-year">${p.year}</span></div>
                    </div>`;
            } else {
                item.innerHTML = `
                    <div class="list-col list-title"><span class="ko">${p.title.ko}</span><span class="en">${p.title.en}</span></div>
                    <div class="list-col list-sub"><span class="ko">${p.subtitle.ko}</span><span class="en">${p.subtitle.en}</span></div>
                    <div class="list-col list-status"><span class="ko">${p.status ? p.status.ko : ''}</span><span class="en">${p.status ? p.status.en : ''}</span></div>
                    <div class="list-col list-year">${p.year}</div>
                    <div class="list-col list-func"><span class="ko">${p.func ? p.func.ko : ''}</span><span class="en">${p.func ? p.func.en : ''}</span></div>`;
            }
            container.appendChild(item);
        }
    });
    if(typeof AOS !== 'undefined') setTimeout(() => { AOS.refresh(); }, 100);
}

// 뷰 타입 및 필터 핸들러
function setProjectView(viewType) {
    const searchInput = document.getElementById('p-search-input');
    renderProjects(viewType, searchInput ? searchInput.value : "");
}

function filterProjects() {
    const searchInput = document.getElementById('p-search-input');
    renderProjects(currentView, searchInput ? searchInput.value : "");
}