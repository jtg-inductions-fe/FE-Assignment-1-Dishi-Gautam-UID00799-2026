const API_URL =
    'https://gist.githubusercontent.com/ameer-wajid-ali/1f29ebee4295cede36f8d74b45e576df/raw/122966c9a123861249f173911d8d93a76dc06d7a/';
const DEFAULT_VALIDITY_DAYS = 7;

let allDeals = [];
let wonDeals = [];
let currentWheelDeals = [];
let isSpinning = false;
let currentRotation = 0;
let lastWonIndex = -1;

const modal = document.getElementById('spin-modal');
const overlay = modal?.querySelector('.spin-modal__overlay');
const closeBtn = modal?.querySelector('.spin-modal__close');
const loadingView = document.getElementById('spin-loading');
const wheelView = document.getElementById('spin-wheel-view');
const dealsView = document.getElementById('spin-deals-view');
const wheelEl = document.getElementById('spin-wheel');
const spinBtn = document.getElementById('spin-btn');
const resultEl = document.getElementById('spin-result');
const viewDealsBtn = document.getElementById('view-deals-btn');
const dealsBadge = document.getElementById('deals-badge');
const dealsList = document.getElementById('deals-list');
const backToWheelBtn = document.getElementById('back-to-wheel-btn');
const modalTitle = document.getElementById('spin-modal-title');
const modalSubtitle = document.getElementById('spin-modal-subtitle');

export async function openModal() {
    if (!modal) return;
    modal.classList.add('spin-modal--open');
    modal.removeAttribute('inert');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    if (allDeals.length === 0) {
        showView('loading');
        await fetchDeals();
    }

    setupWheelView();
}

export function closeModal() {
    if (!modal) return;
    if (document.activeElement && modal.contains(document.activeElement)) {
        document.activeElement.blur();
    }
    modal.classList.remove('spin-modal--open');
    modal.setAttribute('inert', '');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
}

function showView(viewName) {
    if (loadingView)
        loadingView.style.display = viewName === 'loading' ? 'flex' : 'none';
    if (wheelView)
        wheelView.style.display = viewName === 'wheel' ? 'block' : 'none';
    if (dealsView)
        dealsView.style.display = viewName === 'deals' ? 'block' : 'none';

    if (modalTitle) {
        modalTitle.textContent =
            viewName === 'deals' ? 'Unlocked Deals' : 'Spin & Win!';
    }
    if (modalSubtitle) {
        modalSubtitle.textContent =
            viewName === 'deals'
                ? "All the deals you've unlocked yet!"
                : 'Tap the center of the wheel to spin';
    }
}

async function fetchDeals() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        const now = Date.now();
        allDeals = data.map((deal) => {
            const validDays = deal.validFor ?? DEFAULT_VALIDITY_DAYS;
            const expiryDate = new Date(now + validDays * 24 * 60 * 60 * 1000);
            return {
                ...deal,
                validFor: validDays,
                expiryDate,
            };
        });
    } catch {
        allDeals = [];
    }
}

function replaceWonSegment(index) {
    const wonCodes = new Set(wonDeals.map((d) => d.promoCode));
    const activeWheelCodes = new Set(
        currentWheelDeals.filter((d) => !d.isLoss).map((d) => d.promoCode),
    );

    const unusedDeals = allDeals.filter(
        (d) => !wonCodes.has(d.promoCode) && !activeWheelCodes.has(d.promoCode),
    );

    if (unusedDeals.length > 0) {
        const nextDeal =
            unusedDeals[Math.floor(Math.random() * unusedDeals.length)];
        currentWheelDeals[index] = nextDeal;
    } else {
        currentWheelDeals[index] = {
            isLoss: true,
            label: 'Better Luck Next Time',
        };
    }
}

function setupWheelView() {
    showView('wheel');

    const wonCodes = new Set(wonDeals.map((d) => d.promoCode));
    const availableDeals = allDeals.filter((d) => !wonCodes.has(d.promoCode));

    if (currentWheelDeals.length === 0) {
        const shuffled = [...availableDeals].sort(() => Math.random() - 0.5);
        currentWheelDeals = [];

        for (let i = 0; i < 4; i++) {
            if (i < shuffled.length) {
                currentWheelDeals.push(shuffled[i]);
            } else {
                currentWheelDeals.push({
                    isLoss: true,
                    label: 'Better Luck Next Time',
                });
            }
        }
    } else if (lastWonIndex !== -1) {
        replaceWonSegment(lastWonIndex);
        lastWonIndex = -1;
    }

    renderWheelSegments();
    checkSpinStatus();
    updateDealsBadge();
}

function checkSpinStatus() {
    const wonCodes = new Set(wonDeals.map((d) => d.promoCode));
    const availableDeals = allDeals.filter((d) => !wonCodes.has(d.promoCode));

    if (allDeals.length > 0 && availableDeals.length === 0) {
        const hasRealDealsOnWheel = currentWheelDeals.some((d) => !d.isLoss);
        if (!hasRealDealsOnWheel) {
            if (spinBtn) spinBtn.disabled = true;
            if (resultEl) {
                resultEl.style.display = 'block';
                resultEl.innerHTML =
                    '<p class="spin-modal__result-title">You have unlocked all available deals!</p>';
            }
            return;
        }
    }

    if (spinBtn && !isSpinning) spinBtn.disabled = false;
}

function formatLabelText(text) {
    if (!text) return '';
    const words = text.trim().split(' ');
    if (words.length <= 1) return text;
    if (words.length === 2) {
        return `${words[0]}<br>${words[1]}`;
    }
    if (words.length === 3) {
        return `${words[0]} ${words[1]}<br>${words[2]}`;
    }
    if (words.length === 4) {
        return `${words[0]} ${words[1]}<br>${words[2]} ${words[3]}`;
    }
    const mid = Math.ceil(words.length / 2);
    return `${words.slice(0, mid).join(' ')}<br>${words.slice(mid).join(' ')}`;
}

function renderWheelSegments() {
    if (!wheelEl) return;
    wheelEl.innerHTML = '';

    const line1 = document.createElement('div');
    line1.className = 'spin-modal__wheel-line spin-modal__wheel-line--1';
    wheelEl.appendChild(line1);

    const line2 = document.createElement('div');
    line2.className = 'spin-modal__wheel-line spin-modal__wheel-line--2';
    wheelEl.appendChild(line2);

    const isMobile = window.innerWidth <= 768;
    const translateY = isMobile ? -56 : -62;

    currentWheelDeals.forEach((deal, index) => {
        const label = document.createElement('div');
        label.className = 'spin-modal__segment-label';
        label.innerHTML = formatLabelText(deal.label);

        const angle = index * 90 + 45;
        label.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(${translateY}px)`;

        wheelEl.appendChild(label);
    });
}

function handleSpin() {
    if (isSpinning || currentWheelDeals.length === 0) return;

    if (lastWonIndex !== -1) {
        replaceWonSegment(lastWonIndex);
        lastWonIndex = -1;
        renderWheelSegments();
    }

    if (resultEl) resultEl.style.display = 'none';

    const wonCodes = new Set(wonDeals.map((d) => d.promoCode));
    const availableDeals = allDeals.filter((d) => !wonCodes.has(d.promoCode));
    const hasRealDealsOnWheel = currentWheelDeals.some((d) => !d.isLoss);

    if (
        allDeals.length > 0 &&
        availableDeals.length === 0 &&
        !hasRealDealsOnWheel
    ) {
        if (spinBtn) spinBtn.disabled = true;
        if (resultEl) {
            resultEl.style.display = 'block';
            resultEl.innerHTML =
                '<p class="spin-modal__result-title">You have unlocked all available deals!</p>';
        }
        return;
    }

    isSpinning = true;
    if (spinBtn) spinBtn.disabled = true;

    const winIndex = Math.floor(Math.random() * currentWheelDeals.length);

    const segmentCenterAngle = winIndex * 90 + 45;
    const targetAngle = (360 - segmentCenterAngle) % 360;

    const extraSpins = 5 * 360;
    const currentMod = currentRotation % 360;
    currentRotation += extraSpins + ((targetAngle - currentMod + 360) % 360);

    if (wheelEl) {
        wheelEl.style.transform = `rotate(${currentRotation}deg)`;

        const onTransitionEnd = () => {
            wheelEl.removeEventListener('transitionend', onTransitionEnd);
            isSpinning = false;
            onSpinComplete(winIndex);
        };
        wheelEl.addEventListener('transitionend', onTransitionEnd);
    }
}

function onSpinComplete(winIndex) {
    const winningItem = currentWheelDeals[winIndex];

    if (winningItem.isLoss) {
        showLossResult();
        lastWonIndex = -1;
    } else {
        wonDeals.push(winningItem);
        showWinResult(winningItem);
        lastWonIndex = winIndex;
    }

    updateDealsBadge();
    checkSpinStatus();
}

function showWinResult(deal) {
    if (!resultEl) return;
    resultEl.style.display = 'block';

    const daysLeft = Math.ceil(
        (deal.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    const expiryText = daysLeft > 0 ? `Expires in ${daysLeft}d` : 'Expired';

    resultEl.innerHTML = `
        <p class="spin-modal__result-title">You won!</p>
        <div class="spin-modal__result-card">
            <div class="spin-modal__result-info">
                <div class="spin-modal__result-name">${deal.label}</div>
                <div class="spin-modal__result-expiry">${expiryText}</div>
            </div>
            <div class="spin-modal__result-action">
                <span class="spin-modal__promo-code">${deal.promoCode}</span>
                <button class="spin-modal__copy-btn" type="button" data-code="${deal.promoCode}" aria-label="Copy promo code">
                    <img src="/assets/svgs/copy.svg" alt="copy" aria-hidden="true" />
                </button>
            </div>
        </div>
    `;

    const copyBtn = resultEl.querySelector('.spin-modal__copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () =>
            copyToClipboard(deal.promoCode, copyBtn),
        );
    }
}

function showLossResult() {
    if (!resultEl) return;
    resultEl.style.display = 'block';

    resultEl.innerHTML = `
        <div style="text-align: center; padding: 4px 0;">
            <p class="spin-modal__result-title" style="margin-bottom: 4px; color: #5d50c6;">Better Luck Next Time! 🍀</p>
            <p style="font-size: 13px; color: #666; margin: 0;">Don't give up! Spin again to win exciting deals.</p>
        </div>
    `;
}

function updateDealsBadge() {
    const count = wonDeals.length;
    if (dealsBadge) dealsBadge.textContent = count;
    if (viewDealsBtn) viewDealsBtn.style.display = count > 0 ? 'flex' : 'none';
}

function renderDealsList() {
    if (!dealsList) return;
    dealsList.innerHTML = '';

    const sorted = [...wonDeals].sort(
        (a, b) => a.expiryDate.getTime() - b.expiryDate.getTime(),
    );

    sorted.forEach((deal) => {
        const now = Date.now();
        const diffMs = deal.expiryDate.getTime() - now;
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const isExpired = daysLeft <= 0;
        const expiryText = isExpired
            ? 'Deal expired'
            : `Expires in ${daysLeft}d`;

        const li = document.createElement('li');
        li.className = `spin-modal__deal-item ${isExpired ? 'spin-modal__deal-item--expired' : ''}`;

        li.innerHTML = `
            <div class="spin-modal__deal-info">
                <span class="spin-modal__deal-title">${deal.label}</span>
                <span class="spin-modal__deal-expiry">${expiryText}</span>
            </div>
            <div class="spin-modal__deal-action">
                <span class="spin-modal__promo-code">${deal.promoCode}</span>
                <button class="spin-modal__copy-btn" type="button" ${isExpired ? 'disabled' : ''} data-code="${deal.promoCode}" aria-label="Copy promo code">
                    <img src="/assets/svgs/copy.svg" alt="" aria-hidden="true" />
                </button>
            </div>
        `;

        const copyBtn = li.querySelector('.spin-modal__copy-btn');
        if (copyBtn && !isExpired) {
            copyBtn.addEventListener('click', () =>
                copyToClipboard(deal.promoCode, copyBtn),
            );
        }

        dealsList.appendChild(li);
    });
}

function copyToClipboard(code, button) {
    const doShowTooltip = () => {
        let tooltip = button.querySelector('.spin-modal__tooltip');
        if (!tooltip) {
            tooltip = document.createElement('span');
            tooltip.className = 'spin-modal__tooltip';
            tooltip.textContent = 'Copied!';
            button.appendChild(tooltip);
        }

        button.classList.add('spin-modal__copy-btn--copied');

        requestAnimationFrame(() => {
            tooltip.classList.add('spin-modal__tooltip--visible');
        });

        clearTimeout(button._tooltipTimeout);
        button._tooltipTimeout = setTimeout(() => {
            tooltip.classList.remove('spin-modal__tooltip--visible');
            button.classList.remove('spin-modal__copy-btn--copied');
        }, 1500);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
            .writeText(code)
            .then(doShowTooltip)
            .catch(() => {
                fallbackCopyText(code);
                doShowTooltip();
            });
    } else {
        fallbackCopyText(code);
        doShowTooltip();
    }
}

function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
    } catch {
        // Fallback copy failed
    }
    document.body.removeChild(textArea);
}

export function initSpinWheel() {
    document.addEventListener('click', (e) => {
        const specialDealsLink = e.target.closest('a[href="/special-deals"]');
        if (specialDealsLink) {
            e.preventDefault();
            openModal();
        }
    });

    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (
            e.key === 'Escape' &&
            modal?.classList.contains('spin-modal--open')
        ) {
            closeModal();
        }
    });

    spinBtn?.addEventListener('click', () => {
        handleSpin();
    });

    viewDealsBtn?.addEventListener('click', () => {
        renderDealsList();
        showView('deals');
    });

    backToWheelBtn?.addEventListener('click', () => {
        setupWheelView();
    });
}

initSpinWheel();
