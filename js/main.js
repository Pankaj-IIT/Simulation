// ===== Navigation Functions =====
function showSubject(subject) {
    document.getElementById('homeSection').classList.add('hidden');
    document.getElementById('physicsSection').classList.add('hidden');
    document.getElementById('chemistrySection').classList.add('hidden');
    document.getElementById('mathsSection').classList.add('hidden');

    const section = document.getElementById(subject + 'Section');
    section.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Stop all animations first, then start only the ones for this subject
    stopAllAnimations();
    setTimeout(() => drawThumbnailsForSubject(subject), 100);

    document.getElementById('navbarBackBtn').classList.remove('visible');
}

function goHome() {
    stopAllAnimations();
    document.getElementById('homeSection').classList.remove('hidden');
    document.getElementById('physicsSection').classList.add('hidden');
    document.getElementById('chemistrySection').classList.add('hidden');
    document.getElementById('mathsSection').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.getElementById('navbarBackBtn').classList.add('visible');
}

function showSection(sectionName) {
    document.getElementById('homeSection').classList.add('hidden');
    document.getElementById('physicsSection').classList.add('hidden');
    document.getElementById('chemistrySection').classList.add('hidden');
    document.getElementById('mathsSection').classList.add('hidden');

    const section = document.getElementById(sectionName + 'Section');
    section.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    stopAllAnimations();
    setTimeout(() => drawThumbnailsForSubject(sectionName), 100);
}

function openSimulation(path) {
    window.location.href = path;
}

// ===== Thumbnail Animations =====
let thumbnailAnimations = {};
let visibleThumbnails = new Set();
function stopAllAnimations() {
    Object.values(thumbnailAnimations).forEach(id => {
        cancelAnimationFrame(id);
    });

    thumbnailAnimations = {};
    visibleThumbnails.clear();
}

function isThumbnailVisible(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return false;
    const rect = canvas.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= windowHeight &&
        rect.right <= windowWidth
    );
}

function drawThumbnailsForSubject(subject) {
    if (subject === 'physics') {
        if (isThumbnailVisible('thumbKinematics')) drawKinematicsThumbnail();
        if (isThumbnailVisible('thumbProjectile')) drawProjectileThumbnail();
        if (isThumbnailVisible('thumbCircular')) drawCircularThumbnail();
        if (isThumbnailVisible('thumbSHM')) drawSHMThumbnail();
        if (isThumbnailVisible('thumbElectrostatics')) drawElectrostaticsThumbnail();
        if (isThumbnailVisible('thumbProjectile2D')) drawProjectile2DThumbnail();
        if (isThumbnailVisible('thumbGravitation')) drawGravitationThumbnail();
        if (isThumbnailVisible('thumbVectorAdd')) drawVectorAddThumbnail();
    } else if (subject === 'chemistry') {
        if (isThumbnailVisible('thumbPeriodic')) drawPeriodicThumbnail();
        if (isThumbnailVisible('thumbEquilibrium')) drawEquilibriumThumbnail();
        if (isThumbnailVisible('thumbOrganic')) drawOrganicThumbnail();
        if (isThumbnailVisible('thumbGasLaws')) drawGasLawsThumbnail();
        if (isThumbnailVisible('thumbAcidBase')) drawAcidBaseThumbnail();
        if (isThumbnailVisible('thumbHybridization')) drawHybridizationThumbnail();
        if (isThumbnailVisible('thumbIons')) drawIonsThumbnail();
        if (isThumbnailVisible('thumbAtomic')) drawAtomicThumbnail();
        if (isThumbnailVisible('thumbCathode')) drawCathodeThumbnail();
        if (isThumbnailVisible('thumbAnode')) drawAnodeThumbnail();
        if (isThumbnailVisible('thumbMillikan')) drawMillikanThumbnail();
        if (isThumbnailVisible('thumbRutherford')) drawRutherfordThumbnail();
        if (isThumbnailVisible('thumbWave')) drawWaveThumbnail();
        if (isThumbnailVisible('thumbBlackbody')) drawBlackbodyThumbnail();
    } else if (subject === 'maths') {
        if (isThumbnailVisible('thumbQuadratic')) drawQuadraticThumbnail();
        if (isThumbnailVisible('thumbTrigonometry')) drawTrigonometryThumbnail();
        if (isThumbnailVisible('thumbDerivatives')) drawDerivativesThumbnail();
        if (isThumbnailVisible('thumbIntegrals')) drawIntegralsThumbnail();
        if (isThumbnailVisible('thumbMatrices')) drawMatricesThumbnail();
        if (isThumbnailVisible('thumbProbability')) drawProbabilityThumbnail();
    }
}

// Physics Thumbnails
function drawKinematicsThumbnail() {
    const canvas = document.getElementById('thumbKinematics');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    let x = 40;
    let dir = 1;

    function animate() {

        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        // Ground line
        ctx.strokeStyle = '#2d2d4a';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(20, 150);
        ctx.lineTo(280, 150);
        ctx.stroke();

        // Position markers
        for (let i = 40; i <= 260; i += 40) {

            ctx.strokeStyle = 'rgba(255,255,255,0.12)';

            ctx.beginPath();
            ctx.moveTo(i, 140);
            ctx.lineTo(i, 160);
            ctx.stroke();
        }

        // Ball
        ctx.fillStyle = '#0984e3';

        ctx.beginPath();
        ctx.arc(x, 150, 7, 0, Math.PI * 2);
        ctx.fill();

        // Velocity vector
        ctx.strokeStyle = '#fdcb6e';
        ctx.lineWidth = 2;

        const arrowLength = 35 * dir;

        ctx.beginPath();
        ctx.moveTo(x, 120);
        ctx.lineTo(x + arrowLength, 120);
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(x + arrowLength, 120);
        ctx.lineTo(x + arrowLength - 8 * dir, 115);
        ctx.lineTo(x + arrowLength - 8 * dir, 125);
        ctx.closePath();

        ctx.fillStyle = '#fdcb6e';
        ctx.fill();

        // Motion update
        x += dir * 2;

        if (x > 250) dir = -1;
        if (x < 50) dir = 1;

        thumbnailAnimations.kinematics =
            requestAnimationFrame(animate);
    }

    animate();
}
function drawProjectileThumbnail() {
    const canvas = document.getElementById('thumbProjectile');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        // Ground
        ctx.strokeStyle = '#2d2d4a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 180);
        ctx.lineTo(300, 180);
        ctx.stroke();

        // Projectile trajectory
        ctx.strokeStyle = '#00b894';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= t; i += 0.5) {
            const x = 30 + i * 1.2;
            const y = 170 - (3 * i - 0.05 * i * i);
            if (y > 180) break;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Ball
        if (t < 60) {
            const bx = 30 + t * 1.2;
            const by = 170 - (3 * t - 0.05 * t * t);
            ctx.fillStyle = '#00b894';
            ctx.beginPath();
            ctx.arc(bx, by, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        t += 0.3;
        if (t > 70) t = 0;
        thumbnailAnimations.projectile = requestAnimationFrame(animate);
    }
    animate();
}

function drawCircularThumbnail() {
    const canvas = document.getElementById('thumbCircular');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angle = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        const cx = 150, cy = 100, r = 60;

        // Circle path
        ctx.strokeStyle = '#2d2d4a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Radius line
        ctx.strokeStyle = '#0984e3';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
        ctx.stroke();

        // Centripetal acceleration arrow
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - 25 * Math.cos(angle), py - 25 * Math.sin(angle));
        ctx.stroke();

        // Ball
        ctx.fillStyle = '#0984e3';
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();

        // Center
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();

        angle += 0.04;
        thumbnailAnimations.circular = requestAnimationFrame(animate);
    }
    animate();
}

function drawSHMThumbnail() {
    const canvas = document.getElementById('thumbSHM');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        // Sine wave
        ctx.strokeStyle = '#00b894';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < 300; x++) {
            const y = 100 + 50 * Math.sin((x + t * 3) * 0.05);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Equilibrium line
        ctx.strokeStyle = '#2d2d4a';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, 100);
        ctx.lineTo(300, 100);
        ctx.stroke();
        ctx.setLineDash([]);

        t += 1;
        thumbnailAnimations.shm = requestAnimationFrame(animate);
    }
    animate();
}

function drawElectrostaticsThumbnail() {
    const canvas = document.getElementById('thumbElectrostatics');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        // Positive charge
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(100, 100, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', 100, 100);

        // Negative charge
        ctx.fillStyle = '#74b9ff';
        ctx.beginPath();
        ctx.arc(200, 100, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText('-', 200, 100);

        // Field lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + t * 0.01;
            ctx.beginPath();
            for (let r = 15; r < 70; r += 2) {
                const x = 100 + r * Math.cos(angle);
                const y = 100 + r * Math.sin(angle) * 0.6;
                if (r === 15) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        t += 1;
        thumbnailAnimations.electrostatics = requestAnimationFrame(animate);
    }
    animate();
}

function drawProjectile2DThumbnail() {
    const canvas = document.getElementById('thumbProjectile2D');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        // Inclined plane
        ctx.strokeStyle = '#636e72';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 180);
        ctx.lineTo(300, 100);
        ctx.stroke();

        // Projectile
        ctx.strokeStyle = '#00b894';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= t; i += 0.5) {
            const x = 20 + i * 1.5;
            const y = 170 - (4 * i - 0.04 * i * i);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        if (t < 50) {
            const bx = 20 + t * 1.5;
            const by = 170 - (4 * t - 0.04 * t * t);
            ctx.fillStyle = '#00b894';
            ctx.beginPath();
            ctx.arc(bx, by, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        t += 0.35;
        if (t > 60) t = 0;
        thumbnailAnimations.projectile2d = requestAnimationFrame(animate);
    }
    animate();
}

function drawGravitationThumbnail() {
    const canvas = document.getElementById('thumbGravitation');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        const cx = 150, cy = 100;

        // Sun
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20);
        gradient.addColorStop(0, '#ffeaa7');
        gradient.addColorStop(1, '#fdcb6e');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fill();

        // Orbit paths
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 60, 40, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, cy, 90, 55, 0.2, 0, Math.PI * 2);
        ctx.stroke();

        // Planets
        const angle1 = t * 0.03;
        const px1 = cx + 60 * Math.cos(angle1);
        const py1 = cy + 40 * Math.sin(angle1);
        ctx.fillStyle = '#74b9ff';
        ctx.beginPath();
        ctx.arc(px1, py1, 5, 0, Math.PI * 2);
        ctx.fill();

        const angle2 = t * 0.02 + 1;
        const px2 = cx + 90 * Math.cos(angle2);
        const py2 = cy + 55 * Math.sin(angle2);
        ctx.fillStyle = '#ff7675';
        ctx.beginPath();
        ctx.arc(px2, py2, 4, 0, Math.PI * 2);
        ctx.fill();

        t += 1;
        thumbnailAnimations.gravitation = requestAnimationFrame(animate);
    }
    animate();
}

function drawVerticalThumbnail() {
    const canvas = document.getElementById('thumbVertical');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        // Ground
        ctx.fillStyle = '#1a3a2a';
        ctx.fillRect(0, 170, 300, 30);
        ctx.strokeStyle = '#2d5a3a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 170);
        ctx.lineTo(300, 170);
        ctx.stroke();

        // Ball going up and down
        const h0 = 140;
        const u = 2;
        const g = 0.08;
        const y = h0 - u*t + 0.5*g*t*t;
        const vx = 150;

        // Trail
        ctx.strokeStyle = 'rgba(0,184,148,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= t; i += 0.5) {
            const ty = h0 - u*i + 0.5*g*i*i;
            if (ty > 170) break;
            if (i === 0) ctx.moveTo(vx, ty);
            else ctx.lineTo(vx, ty);
        }
        ctx.stroke();

        // Ball
        const ballY = Math.min(y, 170);
        const glow = ctx.createRadialGradient(vx, ballY, 0, vx, ballY, 18);
        glow.addColorStop(0, 'rgba(0,184,148,0.4)');
        glow.addColorStop(1, 'rgba(0,184,148,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(vx, ballY, 18, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = '#00b894';
        ctx.beginPath();
        ctx.arc(vx, ballY, 7, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Velocity arrow
        const vel = u - g*t;
        const arrowLen = Math.min(Math.abs(vel)*15, 50);
        const dir = vel >= 0 ? -1 : 1;
        ctx.strokeStyle = '#fdcb6e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(vx + 20, ballY);
        ctx.lineTo(vx + 20, ballY + arrowLen*dir);
        ctx.stroke();

        // Height markers
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'right';
        for (let mh = 20; mh <= 140; mh += 30) {
            const my = 170 - mh;
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.setLineDash([3,3]);
            ctx.beginPath();
            ctx.moveTo(100, my);
            ctx.lineTo(280, my);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillText(mh+'m', 95, my+3);
        }

        // Direction label
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        if (vel > 0.2) {
            ctx.fillText('↑ Up', 100, 20);
        } else if (vel < -0.2) {
            ctx.fillText('↓ Down', 100, 20);
        } else {
            ctx.fillText('• Max Height', 100, 20);
        }

        t += 0.5;
        if (ballY >= 170) t = 0;
        thumbnailAnimations.vertical = requestAnimationFrame(animate);
    }
    animate();
}

// Vectors Thumbnails
function drawVectorAddThumbnail() {
    const canvas = document.getElementById('thumbVectorAdd');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        const cx = 80, cy = 140;
        const v1Len = 60, v2Len = 50;
        const angle = 60 * Math.PI / 180;

        // v1
        ctx.strokeStyle = '#00b894';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + v1Len, cy);
        ctx.stroke();
        ctx.fillStyle = '#00b894';
        ctx.beginPath();
        ctx.moveTo(cx + v1Len, cy);
        ctx.lineTo(cx + v1Len - 10, cy - 5);
        ctx.lineTo(cx + v1Len - 10, cy + 5);
        ctx.closePath();
        ctx.fill();

        // v2
        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx + v1Len, cy);
        ctx.lineTo(cx + v1Len + v2Len * Math.cos(angle), cy - v2Len * Math.sin(angle));
        ctx.stroke();
        const v2TipX = cx + v1Len + v2Len * Math.cos(angle);
        const v2TipY = cy - v2Len * Math.sin(angle);
        ctx.fillStyle = '#e17055';
        ctx.beginPath();
        ctx.moveTo(v2TipX, v2TipY);
        ctx.lineTo(v2TipX - 10 * Math.cos(angle) - 5 * Math.sin(angle), v2TipY + 10 * Math.sin(angle) - 5 * Math.cos(angle));
        ctx.lineTo(v2TipX - 10 * Math.cos(angle) + 5 * Math.sin(angle), v2TipY + 10 * Math.sin(angle) + 5 * Math.cos(angle));
        ctx.closePath();
        ctx.fill();

        // Resultant
        ctx.strokeStyle = '#fdcb6e';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(v2TipX, v2TipY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#fdcb6e';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('R', (cx + v2TipX) / 2 + 15, (cy + v2TipY) / 2 - 5);

        t += 0.5;
        thumbnailAnimations.vectorAdd = requestAnimationFrame(animate);
    }
    animate();
}

function drawVectorResThumbnail() {
    const canvas = document.getElementById('thumbVectorRes');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        const cx = 150, cy = 160;
        const vLen = 80;
        const angle = 45 * Math.PI / 180 + 0.1 * Math.sin(t * 0.03);

        // Vector
        const tipX = cx + vLen * Math.cos(-angle);
        const tipY = cy + vLen * Math.sin(-angle);

        ctx.strokeStyle = '#00b894';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        // Components
        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(tipX, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = '#e17055';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Vx', (cx + tipX) / 2, cy + 15);
        ctx.fillText('Vy', tipX + 15, (cy + tipY) / 2);

        ctx.fillStyle = '#00b894';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('V', (cx + tipX) / 2 - 10, (cy + tipY) / 2 - 10);

        t += 1;
        thumbnailAnimations.vectorRes = requestAnimationFrame(animate);
    }
    animate();
}

function drawVectorDotThumbnail() {
    const canvas = document.getElementById('thumbVectorDot');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        const cx = 150, cy = 100;
        const angle = Math.PI / 4 + 0.3 * Math.sin(t * 0.02);
        const v1Len = 70, v2Len = 60;

        const v1x = cx + v1Len, v1y = cy;
        const v2x = cx + v2Len * Math.cos(-angle), v2y = cy + v2Len * Math.sin(-angle);

        // v1
        ctx.strokeStyle = '#00b894';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(v1x, v1y);
        ctx.stroke();

        // v2
        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(v2x, v2y);
        ctx.stroke();

        // Angle arc
        ctx.strokeStyle = '#fdcb6e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 25, -angle, 0);
        ctx.stroke();

        // Projection
        ctx.strokeStyle = 'rgba(253,203,110,0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        const projLen = v2Len * Math.cos(angle);
        ctx.beginPath();
        ctx.moveTo(cx + projLen * Math.cos(-angle), cy + projLen * Math.sin(-angle));
        ctx.lineTo(cx + projLen, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('A·B = |A||B|cosθ', cx, 25);

        t += 1;
        thumbnailAnimations.vectorDot = requestAnimationFrame(animate);
    }
    animate();
}

function drawVector3DThumbnail() {
    const canvas = document.getElementById('thumbVector3D');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        const cx = 150, cy = 130;

        // Axes
        ctx.strokeStyle = '#636e72';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 60, cy - 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 60, cy + 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, cy - 70);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('X', cx + 65, cy - 30);
        ctx.fillText('Y', cx + 65, cy + 15);
        ctx.fillText('Z', cx, cy - 75);

        // Vectors
        const v1x = cx + 40, v1y = cy - 40;
        const v2x = cx + 50, v2y = cy - 20;

        ctx.strokeStyle = '#00b894';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(v1x, v1y);
        ctx.stroke();

        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(v1x, v1y);
        ctx.lineTo(v2x, v2y);
        ctx.stroke();

        ctx.strokeStyle = '#fdcb6e';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(v2x, v2y);
        ctx.stroke();
        ctx.setLineDash([]);

        t += 0.5;
        thumbnailAnimations.vector3D = requestAnimationFrame(animate);
    }
    animate();
}

function drawVectorSubThumbnail() {
    const canvas = document.getElementById('thumbVectorSub');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        const cx = 100, cy = 130;
        const v1Len = 70, v2Len = 55;
        const angle = 50 * Math.PI / 180;

        // v1
        ctx.strokeStyle = '#00b894';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + v1Len, cy);
        ctx.stroke();

        // v2
        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + v2Len * Math.cos(-angle), cy - v2Len * Math.sin(angle));
        ctx.stroke();

        // v1 - v2
        const v2TipX = cx + v2Len * Math.cos(-angle);
        const v2TipY = cy - v2Len * Math.sin(angle);
        ctx.strokeStyle = '#fdcb6e';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(v2TipX, v2TipY);
        ctx.lineTo(cx + v1Len, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#fdcb6e';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('v₁ - v₂', (cx + v1Len + v2TipX) / 2 + 15, (cy + v2TipY) / 2 - 10);

        t += 0.5;
        thumbnailAnimations.vectorSub = requestAnimationFrame(animate);
    }
    animate();
}

function drawForceEquilibriumThumbnail() {
    const canvas = document.getElementById('thumbForceEquilibrium');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        const cx = 150, cy = 100;

        // Three forces
        const forces = [
            { angle: 0, len: 50, color: '#00b894' },
            { angle: 120 * Math.PI / 180, len: 45, color: '#e17055' },
            { angle: 240 * Math.PI / 180, len: 48, color: '#74b9ff' }
        ];

        forces.forEach((f, i) => {
            const fx = cx + f.len * Math.cos(f.angle + 0.1 * Math.sin(t * 0.02 + i));
            const fy = cy + f.len * Math.sin(f.angle + 0.1 * Math.sin(t * 0.02 + i));

            ctx.strokeStyle = f.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(fx, fy);
            ctx.stroke();

            ctx.fillStyle = f.color;
            ctx.beginPath();
            ctx.arc(fx, fy, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Center point
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ΣF = 0', cx, 25);

        t += 1;
        thumbnailAnimations.forceEquilibrium = requestAnimationFrame(animate);
    }
    animate();
}

// Chemistry Thumbnails
function drawPeriodicThumbnail() {
    const canvas = document.getElementById('thumbPeriodic');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#12122a';
    ctx.fillRect(0, 0, 300, 200);

    // Mini periodic table
    const colors = ['#00b894', '#0984e3', '#e17055', '#6c5ce7', '#fdcb6e', '#ff7675', '#74b9ff', '#55efc4'];
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 6; col++) {
            const x = 30 + col * 42;
            const y = 30 + row * 38;
            ctx.fillStyle = colors[(row * 6 + col) % colors.length];
            ctx.globalAlpha = 0.6;
            ctx.fillRect(x, y, 36, 32);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = '#12122a';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, 36, 32);
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String.fromCharCode(65 + (row * 6 + col) % 26), x + 18, y + 17);
        }
    }
}

function drawEquilibriumThumbnail() {
    const canvas = document.getElementById('thumbEquilibrium');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        // Bars showing reactant/product concentrations
        const barWidth = 60;
        const maxH = 120;
        const reactant = 60 + 30 * Math.sin(t * 0.05);
        const product = 60 - 30 * Math.sin(t * 0.05);

        // Reactant bar
        ctx.fillStyle = '#0984e3';
        ctx.fillRect(60, 150 - reactant, barWidth, reactant);
        ctx.fillStyle = '#fff';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Reactants', 90, 175);

        // Product bar
        ctx.fillStyle = '#00b894';
        ctx.fillRect(180, 150 - product, barWidth, product);
        ctx.fillStyle = '#fff';
        ctx.fillText('Products', 210, 175);

        // Arrow
        ctx.strokeStyle = '#636e72';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(130, 100);
        ctx.lineTo(170, 100);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fillText('<=>', 150, 95);

        t += 1;
        thumbnailAnimations.equilibrium = requestAnimationFrame(animate);
    }
    animate();
}

function drawOrganicThumbnail() {
    const canvas = document.getElementById('thumbOrganic');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#12122a';
    ctx.fillRect(0, 0, 300, 200);

    // Benzene ring
    const cx = 150, cy = 100, r = 40;
    ctx.strokeStyle = '#0984e3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Double bonds
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
        const r1 = r - 8;
        const r2 = r + 8;
        const x1 = cx + r1 * Math.cos(angle - 0.2);
        const y1 = cy + r1 * Math.sin(angle - 0.2);
        const x2 = cx + r1 * Math.cos(angle + 0.2);
        const y2 = cy + r1 * Math.sin(angle + 0.2);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Electron arrows
    ctx.strokeStyle = '#fdcb6e';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2 + 0.3;
        const r1 = r + 15;
        const x = cx + r1 * Math.cos(angle);
        const y = cy + r1 * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawGasLawsThumbnail() {
    const canvas = document.getElementById('thumbGasLaws');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        // Container
        ctx.strokeStyle = '#636e72';
        ctx.lineWidth = 2;
        ctx.strokeRect(80, 40, 140, 120);

        // Particles
        ctx.fillStyle = '#0984e3';
        for (let i = 0; i < 15; i++) {
            const seed = i * 137.508;
            const x = 85 + ((seed + t * (1 + (i % 3))) % 130);
            const y = 45 + ((seed * 1.3 + t * (0.5 + (i % 2))) % 110);
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PV = nRT', 150, 190);

        t += 1;
        thumbnailAnimations.gasLaws = requestAnimationFrame(animate);
    }
    animate();
}

function drawAcidBaseThumbnail() {
    const canvas = document.getElementById('thumbAcidBase');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        // pH curve
        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < 280; x++) {
            const vol = x / 280 * 50;
            let ph;
            if (vol < 1) ph = 1;
            else if (vol < 24) ph = 1 + (vol - 1) * 0.1;
            else if (vol < 26) ph = 3.5 + (vol - 24) * 8;
            else if (vol < 49) ph = 20 + (vol - 26) * 0.3;
            else ph = 27 + (vol - 49) * 0.1;
            const y = 170 - (ph / 14) * 140;
            if (x === 0) ctx.moveTo(10 + x, y);
            else ctx.lineTo(10 + x, y);
        }
        ctx.stroke();

        // Axes
        ctx.strokeStyle = '#636e72';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(10, 175);
        ctx.lineTo(290, 175);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Volume (mL)', 150, 195);
        ctx.save();
        ctx.translate(15, 100);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('pH', 0, 0);
        ctx.restore();

        t += 1;
        thumbnailAnimations.acidBase = requestAnimationFrame(animate);
    }
    animate();
}

function drawHybridizationThumbnail() {
    const canvas = document.getElementById('thumbHybridization');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        const cx = 150, cy = 100;

        // sp3 orbitals
        ctx.strokeStyle = '#6c5ce7';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + t * 0.02;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + 50 * Math.cos(angle), cy + 50 * Math.sin(angle));
            ctx.stroke();

            // Orbital lobe
            ctx.fillStyle = 'rgba(108, 92, 231, 0.4)';
            ctx.beginPath();
            ctx.ellipse(
                cx + 55 * Math.cos(angle),
                cy + 55 * Math.sin(angle),
                12, 8, angle, 0, Math.PI * 2
            );
            ctx.fill();
        }

        // Center atom
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();

        t += 1;
        thumbnailAnimations.hybridization = requestAnimationFrame(animate);
    }
    animate();
}

function drawIonsThumbnail() {
    const canvas = document.getElementById('thumbIons');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        const cx = 150, cy = 100;

        // Metal atom (left) - losing electron
        const metalX = 90;
        const metalY = cy;
        const metalR = 30;

        // Metal nucleus
        ctx.fillStyle = '#00b894';
        ctx.beginPath();
        ctx.arc(metalX, metalY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Na', metalX, metalY);

        // Metal electron shells
        ctx.strokeStyle = 'rgba(0,184,148,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(metalX, metalY, metalR, 0, Math.PI * 2);
        ctx.stroke();

        // Electrons on metal
        for (let i = 0; i < 1; i++) {
            const angle = (i / 1) * Math.PI * 2 - Math.PI / 2 + t * 0.03;
            const ex = metalX + metalR * Math.cos(angle);
            const ey = metalY + metalR * Math.sin(angle);
            ctx.fillStyle = '#74b9ff';
            ctx.beginPath();
            ctx.arc(ex, ey, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Non-metal atom (right) - gaining electron
        const nonmetalX = 210;
        const nonmetalY = cy;
        const nonmetalR = 30;

        // Non-metal nucleus
        ctx.fillStyle = '#e17055';
        ctx.beginPath();
        ctx.arc(nonmetalX, nonmetalY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Cl', nonmetalX, nonmetalY);

        // Non-metal electron shells
        ctx.strokeStyle = 'rgba(225,112,85,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(nonmetalX, nonmetalY, nonmetalR, 0, Math.PI * 2);
        ctx.stroke();

        // Electrons on non-metal (7)
        for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI * 2 - Math.PI / 2 + t * 0.03;
            const ex = nonmetalX + nonmetalR * Math.cos(angle);
            const ey = nonmetalY + nonmetalR * Math.sin(angle);
            ctx.fillStyle = '#74b9ff';
            ctx.beginPath();
            ctx.arc(ex, ey, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Animated electron transfer
        const transferProgress = (Math.sin(t * 0.02) + 1) / 2;
        const startX = metalX + metalR;
        const endX = nonmetalX - nonmetalR;
        const ex = startX + (endX - startX) * transferProgress;
        const ey = cy + Math.sin(transferProgress * Math.PI * 4) * 20;

        ctx.fillStyle = '#74b9ff';
        ctx.beginPath();
        ctx.arc(ex, ey, 5, 0, Math.PI * 2);
        ctx.fill();

        // Transfer arrow
        ctx.strokeStyle = 'rgba(116,185,255,0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(startX, cy - 25);
        ctx.lineTo(endX, cy - 25);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow head
        ctx.fillStyle = 'rgba(116,185,255,0.5)';
        ctx.beginPath();
        ctx.moveTo(endX - 5, cy - 30);
        ctx.lineTo(endX, cy - 25);
        ctx.lineTo(endX - 5, cy - 20);
        ctx.closePath();
        ctx.fill();

        // Labels
        ctx.fillStyle = '#00b894';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('Na', metalX, metalY + metalR + 15);
        ctx.fillStyle = '#e17055';
        ctx.fillText('Cl', nonmetalX, nonmetalY + nonmetalR + 15);

        // Result text
        ctx.fillStyle = '#fdcb6e';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Na⁺  +  Cl⁻  →  NaCl', cx, 185);

        t += 1;
        thumbnailAnimations.ions = requestAnimationFrame(animate);
    }
    animate();
}

function drawAtomicThumbnail() {
    const canvas = document.getElementById('thumbAtomic');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        const cx = 150, cy = 100;

        // Nucleus
        const nucleusGrad = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, 15);
        nucleusGrad.addColorStop(0, '#ff8888');
        nucleusGrad.addColorStop(1, '#cc3333');
        ctx.fillStyle = nucleusGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('6p', cx, cy - 4);
        ctx.fillText('6n', cx, cy + 5);

        // Shells
        const shellRadii = [35, 58, 80];
        const shellElectrons = [
            { count: 2, r: 35, color: '#ff6b6b' },
            { count: 4, r: 58, color: '#74b9ff' }
        ];

        for (let s = 0; s < shellRadii.length; s++) {
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(cx, cy, shellRadii[s], 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Electrons
        for (let s = 0; s < shellElectrons.length; s++) {
            const se = shellElectrons[s];
            for (let e = 0; e < se.count; e++) {
                const angle = (e / se.count) * Math.PI * 2 + t * (0.02 / (s + 1));
                const ex = cx + se.r * Math.cos(angle);
                const ey = cy + se.r * Math.sin(angle);

                ctx.fillStyle = se.color;
                ctx.beginPath();
                ctx.arc(ex, ey, 4, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#000';
                ctx.font = 'bold 5px Arial';
                ctx.textBaseline = 'middle';
                ctx.fillText('-', ex, ey);
            }
        }

        // C/L label
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('C', cx, cy + 20);

        t += 1;
        thumbnailAnimations.atomic = requestAnimationFrame(animate);
    }
    animate();
}

// Maths Thumbnails
function drawQuadraticThumbnail() {
    const canvas = document.getElementById('thumbQuadratic');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        // Grid
        ctx.strokeStyle = '#1e1e3a';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < 300; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 200);
            ctx.stroke();
        }
        for (let y = 0; y < 200; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(300, y);
            ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = '#636e72';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 100);
        ctx.lineTo(300, 100);
        ctx.moveTo(150, 0);
        ctx.lineTo(150, 200);
        ctx.stroke();

        // Parabola
        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < 300; x++) {
            const xv = (x - 150) / 30;
            const yv = 0.3 * xv * xv - 2 + 0.5 * Math.sin(t * 0.05);
            const y = 100 - yv * 30;
            if (y < 0 || y > 200) continue;
            if (x === 0 || Math.abs(((x - 1) - 150) / 30) ** 2 * 0.3 - 2 + 0.5 * Math.sin((t - 1) * 0.05) - yv > 10)
                ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        t += 1;
        thumbnailAnimations.quadratic = requestAnimationFrame(animate);
    }
    animate();
}

function drawTrigonometryThumbnail() {
    const canvas = document.getElementById('thumbTrigonometry');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        // Sine wave
        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < 300; x++) {
            const y = 100 + 60 * Math.sin((x + t * 2) * 0.04);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Cosine wave
        ctx.strokeStyle = '#74b9ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < 300; x++) {
            const y = 100 + 60 * Math.cos((x + t * 2) * 0.04);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Equilibrium
        ctx.strokeStyle = '#2d2d4a';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, 100);
        ctx.lineTo(300, 100);
        ctx.stroke();
        ctx.setLineDash([]);

        t += 1;
        thumbnailAnimations.trigonometry = requestAnimationFrame(animate);
    }
    animate();
}

function drawDerivativesThumbnail() {
    const canvas = document.getElementById('thumbDerivatives');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        // Function curve
        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < 300; x++) {
            const xv = (x - 150) / 40;
            const y = 100 - (0.1 * xv * xv * xv - 0.5 * xv) * 50;
            if (y < 0 || y > 200) continue;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Moving tangent line
        const tx = 50 + (t % 200);
        const txv = (tx - 150) / 40;
        const ty = 100 - (0.1 * txv * txv * txv - 0.5 * txv) * 50;
        const slope = (0.3 * txv * txv - 0.5) * 50 / 40;

        ctx.strokeStyle = '#00b894';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tx - 60, ty + 60 * slope);
        ctx.lineTo(tx + 60, ty - 60 * slope);
        ctx.stroke();

        // Point
        ctx.fillStyle = '#00b894';
        ctx.beginPath();
        ctx.arc(tx, ty, 5, 0, Math.PI * 2);
        ctx.fill();

        t += 1;
        thumbnailAnimations.derivatives = requestAnimationFrame(animate);
    }
    animate();
}

function drawIntegralsThumbnail() {
    const canvas = document.getElementById('thumbIntegrals');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;
    let partitions = 5;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        // Function
        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 30; x < 270; x++) {
            const xv = (x - 30) / 240 * 4 - 2;
            const y = 100 - (0.15 * xv * xv * xv + 0.3 * xv) * 40;
            if (x === 30) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Riemann sum rectangles
        const pw = 240 / partitions;
        for (let i = 0; i < partitions; i++) {
            const xv = (30 + i * pw - 30) / 240 * 4 - 2;
            const yv = 0.15 * xv * xv * xv + 0.3 * xv;
            const y = 100 - yv * 40;
            const h = Math.abs(100 - y);
            ctx.fillStyle = `rgba(108, 92, 231, ${0.2 + 0.15 * Math.sin(t * 0.1 + i)})`;
            ctx.fillRect(30 + i * pw, Math.min(100, y), pw - 1, h || 1);
        }

        if (t % 120 === 0 && t > 0) {
            partitions = partitions >= 20 ? 5 : partitions + 3;
        }

        t += 1;
        thumbnailAnimations.integrals = requestAnimationFrame(animate);
    }
    animate();
}

function drawMatricesThumbnail() {
    const canvas = document.getElementById('thumbMatrices');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        const cx = 150, cy = 100;
        const angle = t * 0.02;

        // Grid lines
        ctx.strokeStyle = '#2d2d4a';
        ctx.lineWidth = 0.5;

        // Original grid (faint)
        ctx.globalAlpha = 0.3;
        for (let i = -5; i <= 5; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + i * 20, 0);
            ctx.lineTo(cx + i * 20, 200);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, cy + i * 20);
            ctx.lineTo(300, cy + i * 20);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Transformed grid
        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 1;
        for (let i = -5; i <= 5; i++) {
            ctx.beginPath();
            for (let j = -8; j <= 8; j++) {
                const x = j * 20;
                const y = i * 20;
                const rx = x * Math.cos(angle) - y * 0.5 * Math.sin(angle);
                const ry = x * 0.5 * Math.sin(angle) + y * Math.cos(angle);
                if (j === -8) ctx.moveTo(cx + rx, cy + ry);
                else ctx.lineTo(cx + rx, cy + ry);
            }
            ctx.stroke();
        }

        t += 1;
        thumbnailAnimations.matrices = requestAnimationFrame(animate);
    }
    animate();
}

function drawProbabilityThumbnail() {
    const canvas = document.getElementById('thumbProbability');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;
    let data = [];

    for (let i = 0; i < 30; i++) {
        data.push(0);
    }

    function animate() {
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, 300, 200);

        // Add random data point
        const mean = 15;
        const stddev = 4;
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const val = Math.max(0, Math.min(29, Math.round(mean + z * stddev)));
        data[val] += 2;

        // Shift
        if (data.length > 30) data.shift();

        // Bars
        const maxVal = Math.max(...data, 1);
        const barW = 240 / 30;
        for (let i = 0; i < 30; i++) {
            const h = (data[i] / maxVal) * 140;
            const hue = 200 + (i / 30) * 60;
            ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.7)`;
            ctx.fillRect(30 + i * barW, 180 - h, barW - 2, h);
        }

        // Normal curve overlay
        ctx.strokeStyle = '#fdcb6e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 30; i++) {
            const x = (i - 15) / 4;
            const y = Math.exp(-0.5 * x * x);
            const px = 30 + i * barW;
            const py = 180 - y * 140;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        t += 1;
        thumbnailAnimations.probability = requestAnimationFrame(animate);
    }
    animate();
}

// ===== Initialize thumbnails on load =====
document.addEventListener('DOMContentLoaded', () => {
    // Start animations for all subjects (IntersectionObserver will pause non-visible ones)
    drawThumbnailsForSubject('physics');
    drawThumbnailsForSubject('chemistry');
    drawThumbnailsForSubject('maths');

    // Check for hash to show specific section
    const hash = window.location.hash.replace('#', '');
    if (hash && ['physics', 'chemistry', 'maths'].includes(hash)) {
        showSection(hash);
    }

    // Intersection Observer for pausing/resuming animations based on viewport visibility
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const canvasId = entry.target.id;
            if (!canvasId) return;

            if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
                // Canvas is visible - start animation if not already running
                if (!thumbnailAnimations[canvasId]) {
                    // Find and start the corresponding animation function
                    const animMap = {
                        'thumbKinematics': drawKinematicsThumbnail,
                        'thumbProjectile': drawProjectileThumbnail,
                        'thumbCircular': drawCircularThumbnail,
                        'thumbSHM': drawSHMThumbnail,
                        'thumbElectrostatics': drawElectrostaticsThumbnail,
                        'thumbProjectile2D': drawProjectile2DThumbnail,
                        'thumbGravitation': drawGravitationThumbnail,
                        'thumbVertical': drawVerticalThumbnail,
                        'thumbPeriodic': drawPeriodicThumbnail,
                        'thumbEquilibrium': drawEquilibriumThumbnail,
                        'thumbOrganic': drawOrganicThumbnail,
                        'thumbGasLaws': drawGasLawsThumbnail,
                        'thumbAcidBase': drawAcidBaseThumbnail,
                        'thumbHybridization': drawHybridizationThumbnail,
                        'thumbQuadratic': drawQuadraticThumbnail,
                        'thumbTrigonometry': drawTrigonometryThumbnail,
                        'thumbDerivatives': drawDerivativesThumbnail,
                        'thumbIntegrals': drawIntegralsThumbnail,
                        'thumbMatrices': drawMatricesThumbnail,
                        'thumbProbability': drawProbabilityThumbnail,
                        'thumbVectorAdd': drawVectorAddThumbnail,
                        'thumbIons': drawIonsThumbnail,
                        'thumbAtomic': drawAtomicThumbnail
                    };
                    if (animMap[canvasId]) {
                        animMap[canvasId]();
                    }
                }
            } else {
                // Canvas is NOT visible - pause animation
                if (thumbnailAnimations[canvasId]) {
                    cancelAnimationFrame(thumbnailAnimations[canvasId]);
                    delete thumbnailAnimations[canvasId];
                }
            }
        });
    }, observerOptions);

    // Observe all thumbnail canvases
    document.querySelectorAll('.sim-thumbnail canvas').forEach(canvas => {
        animationObserver.observe(canvas);
    });
});

// ===== Cleanup on navigation =====
window.addEventListener('beforeunload', () => {
    Object.values(thumbnailAnimations).forEach(id => cancelAnimationFrame(id));
});

// ===== Fullscreen on simulation pages =====
(function(){
    if(document.querySelector('.navbar-sim')){
        const navbar = document.querySelector('.navbar-sim');
        const btn = document.createElement('button');
        btn.className = 'fs-btn';
        btn.id = 'fsBtn';
        btn.textContent = '⛶ Fullscreen';
        btn.onclick = function(){
            if(!document.fullscreenElement){
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        };
        navbar.appendChild(btn);

        document.addEventListener('fullscreenchange', function(){
            const b = document.getElementById('fsBtn');
            if(b){
                b.textContent = document.fullscreenElement ? '⛶ Exit Fullscreen' : '⛶ Fullscreen';
            }
        });

        document.documentElement.requestFullscreen().catch(function(){});
    }
})();
