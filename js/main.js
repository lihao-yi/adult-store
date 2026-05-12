(function() {
    'use strict';

    // ========== 年龄验证（出生日期计算） ==========
    (function() {
        const gate = document.getElementById('ageGate');
        if (!gate) return;
        const yearSel = document.getElementById('birthYear');
        const monthSel = document.getElementById('birthMonth');
        const daySel = document.getElementById('birthDay');
        const verifyBtn = document.getElementById('ageVerifyBtn');
        const errorEl = document.getElementById('ageError');

        const currentYear = new Date().getFullYear();
        for (let y = currentYear - 10; y >= currentYear - 100; y--) {
            yearSel.add(new Option(y, y));
        }
        for (let m = 1; m <= 12; m++) {
            monthSel.add(new Option(m, m));
        }
        function populateDays() {
            const y = parseInt(yearSel.value, 10);
            const m = parseInt(monthSel.value, 10);
            const days = new Date(y, m, 0).getDate();
            daySel.innerHTML = '';
            for (let d = 1; d <= days; d++) {
                daySel.add(new Option(d, d));
            }
        }
        yearSel.value = currentYear - 25;
        monthSel.value = 6;
        populateDays();
        yearSel.addEventListener('change', populateDays);
        monthSel.addEventListener('change', populateDays);

        function isAdult(y, m, d) {
            const birth = new Date(y, m - 1, d);
            if (birth.getFullYear() !== y || birth.getMonth() !== m - 1 || birth.getDate() !== d) return false;
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
            return age >= 18;
        }

        verifyBtn.addEventListener('click', () => {
            const y = parseInt(yearSel.value, 10);
            const m = parseInt(monthSel.value, 10);
            const d = parseInt(daySel.value, 10);
            if (isNaN(y) || isNaN(m) || isNaN(d)) {
                errorEl.textContent = '请选择完整的出生日期。';
                return;
            }
            if (!isAdult(y, m, d)) {
                errorEl.textContent = '您未满18周岁，无法访问本网站。';
                return;
            }
            gate.style.display = 'none';
        });
    })();

    // ========== 商品数据与分类 ==========
    let products = [];
    let currentMain = '全部';
    let currentSub = '全部';
    const carouselTimers = {};

    function clearTimers() {
        Object.values(carouselTimers).forEach(clearInterval);
        for (let k in carouselTimers) delete carouselTimers[k];
    }

    function switchImage(card, idx) {
        const imgs = card.querySelectorAll('.card-images img');
        const dots = card.querySelectorAll('.dots .dot');
        if (!imgs.length) return;
        if (idx < 0) idx = imgs.length - 1;
        if (idx >= imgs.length) idx = 0;
        imgs.forEach(i => i.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        imgs[idx].classList.add('active');
        if (dots[idx]) dots[idx].classList.add('active');
        card.dataset.currentIndex = idx;
    }

    function startAuto(card, pid) {
        if (carouselTimers[pid]) clearInterval(carouselTimers[pid]);
        const total = card.querySelectorAll('.card-images img').length;
        if (total <= 1) return;
        carouselTimers[pid] = setInterval(() => {
            const cur = parseInt(card.dataset.currentIndex, 10) || 0;
            switchImage(card, (cur + 1) % total);
        }, 6000);
    }

    function resetAuto(card, pid) {
        if (carouselTimers[pid]) { clearInterval(carouselTimers[pid]); delete carouselTimers[pid]; }
        startAuto(card, pid);
    }

    function renderMainFilters() {
        const bar = document.getElementById('mainFilterBar');
        const cats = ['全部', ...new Set(products.map(p => p.mainCategory))];
        bar.innerHTML = cats.map(c => `<button class="filter-btn${c === currentMain ? ' active' : ''}" data-main="${c}">${c}</button>`).join('');
    }

    function renderSubFilters() {
        const bar = document.getElementById('subFilterBar');
        let subs = [];
        if (currentMain === '全部') {
            subs = ['全部', ...new Set(products.map(p => p.subCategory))];
        } else {
            subs = ['全部', ...new Set(products.filter(p => p.mainCategory === currentMain).map(p => p.subCategory))];
        }
        if (subs.length <= 1) {
            bar.style.display = 'none';
            currentSub = '全部';
            return;
        }
        bar.style.display = 'flex';
        if (!subs.includes(currentSub)) currentSub = '全部';
        bar.innerHTML = subs.map(c => `<button class="filter-btn${c === currentSub ? ' active' : ''}" data-sub="${c}">${c}</button>`).join('');
    }

    function renderProducts() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        clearTimers();
        let filtered = products;
        if (currentMain !== '全部') filtered = filtered.filter(p => p.mainCategory === currentMain);
        if (currentSub !== '全部') filtered = filtered.filter(p => p.subCategory === currentSub);

        grid.style.opacity = '0';
        setTimeout(() => {
            grid.innerHTML = filtered.map(p => `
                <div class="product-card" data-product-id="${p.id || 0}" data-current-index="0">
                    <div class="card-images">
                        <button class="prev-btn"><i class="fa-solid fa-chevron-left"></i></button>
                        ${p.images.map((src, i) => `<img src="${src}" alt="${p.name}" class="${i === 0 ? 'active' : ''}" loading="lazy" onerror="this.style.opacity='0';">`).join('')}
                        <button class="next-btn"><i class="fa-solid fa-chevron-right"></i></button>
                        <div class="dots">${p.images.map((_, i) => `<span class="dot${i === 0 ? ' active' : ''}"></span>`).join('')}</div>
                    </div>
                    <div class="card-info">
                        <div class="card-categories">
                            <span class="cat-tag cat-main">${p.mainCategory}</span>
                            <span class="cat-tag cat-sub">${p.subCategory}</span>
                        </div>
                        <h3>${p.name}</h3>
                        <p class="desc">${p.description}</p>
                        <div class="price-row">
                            <span class="current-price">¥${p.price}</span>
                            ${p.originalPrice ? `<span class="original-price">¥${p.originalPrice}</span>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');

            grid.querySelectorAll('.product-card').forEach(card => {
                startAuto(card, parseInt(card.dataset.productId, 10));
            });
            grid.style.opacity = '1';
        }, 200);
    }

    function initFilters() {
        document.getElementById('mainFilterBar').addEventListener('click', e => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            currentMain = btn.dataset.main;
            renderMainFilters();
            currentSub = '全部';
            renderSubFilters();
            renderProducts();
            btn.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        });
        document.getElementById('subFilterBar').addEventListener('click', e => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            currentSub = btn.dataset.sub;
            renderSubFilters();
            renderProducts();
            btn.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        });
    }

    function initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const img = document.getElementById('lightboxImg');
        if (!lightbox || !img) return;
        document.getElementById('productGrid').addEventListener('click', e => {
            const targetImg = e.target.closest('.card-images img.active');
            if (!targetImg) return;
            img.src = targetImg.src;
            lightbox.classList.add('show');
        });
        document.getElementById('lightboxClose').addEventListener('click', () => lightbox.classList.remove('show'));
        lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('show'); });
    }

    function initCarouselClicks() {
        document.getElementById('productGrid').addEventListener('click', e => {
            const card = e.target.closest('.product-card');
            if (!card) return;
            const pid = parseInt(card.dataset.productId, 10);
            const total = card.querySelectorAll('.card-images img').length;
            const cur = parseInt(card.dataset.currentIndex, 10) || 0;
            if (e.target.closest('.prev-btn')) {
                switchImage(card, cur - 1 < 0 ? total - 1 : cur - 1);
                resetAuto(card, pid);
            } else if (e.target.closest('.next-btn')) {
                switchImage(card, (cur + 1) % total);
                resetAuto(card, pid);
            } else if (e.target.closest('.dot')) {
                const dots = Array.from(card.querySelectorAll('.dots .dot'));
                const idx = dots.indexOf(e.target.closest('.dot'));
                if (idx >= 0) { switchImage(card, idx); resetAuto(card, pid); }
            }
        });
    }

    function initCopy() {
        const btn = document.getElementById('copyBtn');
        const txt = document.getElementById('wechatIdText');
        const toast = document.getElementById('copyToast');
        if (!btn || !txt) return;
        const labelSpan = btn.querySelector('.copy-btn-text');
        const original = labelSpan ? labelSpan.textContent : '复制';
        let timer;
        btn.addEventListener('click', () => {
            const id = txt.textContent.trim();
            const succeed = () => {
                btn.classList.add('copied');
                if (labelSpan) labelSpan.textContent = '已复制';
                toast.classList.add('show');
                clearTimeout(timer);
                timer = setTimeout(() => {
                    btn.classList.remove('copied');
                    if (labelSpan) labelSpan.textContent = original;
                    toast.classList.remove('show');
                }, 2000);
            };
            if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(id).then(succeed).catch(() => fallback(id, succeed));
            } else fallback(id, succeed);
        });
        function fallback(text, cb) {
            const ta = document.createElement('textarea');
            ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); cb(); } catch (e) {}
            document.body.removeChild(ta);
        }
    }

    function initPage() {
        if (document.getElementById('productGrid')) {
            fetch('data/products.json')
                .then(r => { if (!r.ok) throw new Error('加载失败'); return r.json(); })
                .then(data => {
                    products = data.map((p, i) => ({ ...p, id: p.id || i + 1 }));
                    renderMainFilters();
                    renderSubFilters();
                    renderProducts();
                    initFilters();
                    initCarouselClicks();
                    initLightbox();
                })
                .catch(() => {
                    document.getElementById('productGrid').innerHTML = '<p style="color:#9E9E9E;text-align:center;padding:40px;">商品数据加载失败，请稍后重试</p>';
                });
        }
        if (document.getElementById('copyBtn')) initCopy();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPage);
    else initPage();
})();