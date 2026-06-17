// ===== Responsive Mode Detection =====

function getAvailableSimulations() {
    const sims = [];
    const seen = new Set();
    
    // Collect from dropdowns
    const selects = document.querySelectorAll('.sim-dropdown');
    selects.forEach(select => {
        for (let i = 0; i < select.options.length; i++) {
            const val = select.options[i].value;
            if (val && !seen.has(val)) {
                sims.push(val);
                seen.add(val);
            }
        }
    });
    
    // Collect from onclick handlers
    const simCards = document.querySelectorAll('.sim-card');
    simCards.forEach(card => {
        const onclick = card.getAttribute('onclick');
        if (onclick && onclick.includes('openSimulation(')) {
            const match = onclick.match(/openSimulation\(['"]([^'"]+)['"]\)/);
            if (match && match[1] && !seen.has(match[1])) {
                sims.push(match[1]);
                seen.add(match[1]);
            }
        }
    });
    
    return sims;
}

function detectMode() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    const orientation = window.matchMedia('(orientation: portrait)').matches;
    
    if (width < 768 && orientation && aspect < 0.75) {
        return 'shorts';
    } else if (width < 768) {
        return 'mobile';
    }
    return 'desktop';
}

function redirectShorts() {
    const sims = getAvailableSimulations();
    if (sims.length === 0) return;
    
    const simsParam = encodeURIComponent(sims.join(','));
    window.location.href = `shorts.html?sims=${simsParam}`;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Shorts mode is NOT auto-triggered - user must click the Shorts button
    // The shorts.html page is accessible via: shorts.html or ?shorts=1 param
});

// Export for use in main.js
window.detectMode = detectMode;
window.redirectShorts = redirectShorts;
