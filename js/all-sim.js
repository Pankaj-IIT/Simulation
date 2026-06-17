
// From: circular-motion.html

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-5SCFHT9W3K');


// From: circular-motion.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Controls
        const radiusSlider = document.getElementById('radius');
        const omegaSlider = document.getElementById('omega');
        const alphaSlider = document.getElementById('alpha');
        const showVelocity = document.getElementById('showVelocity');
        const showAccel = document.getElementById('showAccel');
        const showPosition = document.getElementById('showPosition');
        const showTrail = document.getElementById('showTrail');
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');

        // Stats
        const statOmega = document.getElementById('statOmega');
        const statV = document.getElementById('statV');
        const statA = document.getElementById('statA');
        const statT = document.getElementById('statT');
        const statAngle = document.getElementById('statAngle');
        const statFreq = document.getElementById('statFreq');

        const scale = 60; // pixels per meter

        let sim = {
            running: false,
            angle: 0,
            omega: 3,
            alpha: 0,
            radius: 2,
            trail: [],
            time: 0
        };

        function getParams() {
            sim.radius = parseFloat(radiusSlider.value);
            sim.omega = parseFloat(omegaSlider.value);
            sim.alpha = parseFloat(alphaSlider.value);

            document.getElementById('radiusVal').textContent = sim.radius.toFixed(1) + ' m';
            document.getElementById('omegaVal').textContent = sim.omega.toFixed(1) + ' rad/s';
            document.getElementById('alphaVal').textContent = sim.alpha.toFixed(1) + ' rad/s\u00b2';

            if (!sim.running) draw();
        }

        [radiusSlider, omegaSlider, alphaSlider, showVelocity, showAccel, showPosition, showTrail].forEach(el => {
            el.addEventListener('input', getParams);
        });

        startBtn.addEventListener('click', () => {
            sim.running = !sim.running;
            startBtn.textContent = sim.running ? 'Pause' : 'Resume';
            if (sim.running) requestAnimationFrame(animate);
        });

        resetBtn.addEventListener('click', () => {
            sim.running = false;
            sim.angle = 0;
            sim.omega = parseFloat(omegaSlider.value);
            sim.alpha = parseFloat(alphaSlider.value);
            sim.trail = [];
            sim.time = 0;
            startBtn.textContent = 'Start';
            updateStats();
            draw();
        });

        function updateStats() {
            const v = sim.radius * sim.omega;
            const ac = sim.radius * sim.omega * sim.omega;
            const T = sim.omega > 0 ? (2 * Math.PI / sim.omega) : Infinity;
            const freq = sim.omega > 0 ? (sim.omega / (2 * Math.PI)) : 0;

            statOmega.textContent = sim.omega.toFixed(2) + ' rad/s';
            statV.textContent = v.toFixed(2) + ' m/s';
            statA.textContent = ac.toFixed(2) + ' m/s\u00b2';
            statT.textContent = T === Infinity ? '\u221e' : T.toFixed(2) + ' s';
            statAngle.textContent = ((sim.angle * 180 / Math.PI) % 360).toFixed(1) + '\u00b0';
            statFreq.textContent = freq.toFixed(2) + ' Hz';
        }

        function drawArrow(x1, y1, x2, y2, color, width = 2) {
            const headLen = 10;
            const angle = Math.atan2(y2 - y1, x2 - x1);

            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Background
            const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 400);
            bgGrad.addColorStop(0, '#000000');
            bgGrad.addColorStop(1, '#000000');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const r = sim.radius * scale;

            // Circle path
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Grid circles
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            for (let i = 1; i <= 5; i++) {
                ctx.beginPath();
                ctx.arc(cx, cy, i * scale, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Crosshair
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.beginPath();
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, canvas.height);
            ctx.moveTo(0, cy);
            ctx.lineTo(canvas.width, cy);
            ctx.stroke();

            // Trail
            if (showTrail.checked && sim.trail.length > 1) {
                for (let i = 1; i < sim.trail.length; i++) {
                    const alpha = i / sim.trail.length * 0.6;
                    ctx.strokeStyle = `rgba(9, 132, 227, ${alpha})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(sim.trail[i - 1].x, sim.trail[i - 1].y);
                    ctx.lineTo(sim.trail[i].x, sim.trail[i].y);
                    ctx.stroke();
                }
            }

            // Position vector
            if (showPosition.checked) {
                const bx = cx + r * Math.cos(sim.angle);
                const by = cy + r * Math.sin(sim.angle);
                drawArrow(cx, cy, bx, by, 'rgba(255,255,255,0.3)', 1);
            }

            // Ball position
            const bx = cx + r * Math.cos(sim.angle);
            const by = cy + r * Math.sin(sim.angle);

            // Velocity vector
            if (showVelocity.checked) {
                const vScale = sim.omega * 15;
                const vx = -Math.sin(sim.angle) * vScale;
                const vy = Math.cos(sim.angle) * vScale;
                drawArrow(bx, by, bx + vx, by + vy, '#ffffff', 2.5);

                // Label
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px monospace';
                ctx.fillText('v', bx + vx + 8, by + vy);
            }

            // Acceleration vector (centripetal + tangential)
            if (showAccel.checked) {
                // Centripetal (toward center)
                const ac = sim.radius * sim.omega * sim.omega;
                const acScale = Math.min(ac * 5, 100);
                const acx = cx - bx;
                const acy = cy - by;
                const acDist = Math.sqrt(acx * acx + acy * acy);
                if (acDist > 0) {
                    drawArrow(bx, by, bx + (acx / acDist) * acScale, by + (acy / acDist) * acScale, '#fdcb6e', 2.5);
                }

                // Tangential
                if (Math.abs(sim.alpha) > 0.01) {
                    const at = sim.alpha * scale * 0.5;
                    const tx = -Math.sin(sim.angle) * at;
                    const ty = Math.cos(sim.angle) * at;
                    drawArrow(bx, by, bx + tx, by + ty, '#fdcb6e', 2);

                    ctx.fillStyle = '#fdcb6e';
                    ctx.font = 'bold 10px monospace';
                    ctx.fillText('a\u2096', bx + tx + 8, by + ty);
                }

                // Label for centripetal
                if (Math.abs(sim.omega) > 0.1) {
                    ctx.fillStyle = '#fdcb6e';
                    ctx.font = 'bold 11px monospace';
                    const labelX = bx - (bx - cx) / acDist * (acScale + 15);
                    const labelY = by - (by - cy) / acDist * (acScale + 15);
                    ctx.fillText('a\u2099', labelX, labelY);
                }
            }

            // Center point
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fill();

            // Center label
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('O', cx, cy + 20);

            // Ball
            const ballGrad = ctx.createRadialGradient(bx - 3, by - 3, 0, bx, by, 10);
            ballGrad.addColorStop(0, '#ffffff');
            ballGrad.addColorStop(1, '#cccccc');
            ctx.fillStyle = ballGrad;
            ctx.beginPath();
            ctx.arc(bx, by, 10, 0, Math.PI * 2);
            ctx.fill();

            // Ball glow
            const glow = ctx.createRadialGradient(bx, by, 0, bx, by, 25);
            glow.addColorStop(0, 'rgba(255,255,255,0.3)');
            glow.addColorStop(1, 'rgba(9, 132, 227, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(bx, by, 25, 0, Math.PI * 2);
            ctx.fill();

            // Radius label
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = '11px monospace';
            const midX = cx + (bx - cx) / 2;
            const midY = cy + (by - cy) / 2;
            ctx.fillText('r=' + sim.radius + 'm', midX - 20, midY - 5);

            // Angle arc
            if (sim.angle > 0.01) {
                ctx.strokeStyle = 'rgba(253, 203, 110, 0.5)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(cx, cy, 30, 0, sim.angle);
                ctx.stroke();

                ctx.fillStyle = '#fdcb6e';
                ctx.font = '10px monospace';
                const labelAngle = sim.angle / 2;
                ctx.fillText('\u03b8', cx + 38 * Math.cos(labelAngle), cy + 38 * Math.sin(labelAngle));
            }
        }

        function animate() {
            if (!sim.running) return;

            const dt = 0.016;
            sim.time += dt;

            sim.omega += sim.alpha * dt;
            sim.angle += sim.omega * dt;

            const r = sim.radius * scale;
            const bx = cx + r * Math.cos(sim.angle);
            const by = cy + r * Math.sin(sim.angle);

            sim.trail.push({ x: bx, y: by });
            if (sim.trail.length > 200) sim.trail.shift();

            updateStats();
            draw();

            requestAnimationFrame(animate);
        }

        getParams();
        draw();
    
// From: cross-product.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');
        let sim = { time: 0, dt: 0.016 };
        const cam = { rotX: -0.45, rotY: 0.65, zoom: 1.0, targetRotX: -0.45, targetRotY: 0.65, targetZoom: 1.0 };
        let isDragging = false, lastMouse = { x: 0, y: 0 };
        let angleAnimating = false, viewRotating = false;

        const mA = document.getElementById('mA');
        const mB = document.getElementById('mB');
        const aB = document.getElementById('aB');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');

        canvas.addEventListener('mousedown', (e) => { isDragging = true; lastMouse = { x: e.clientX, y: e.clientY }; });
        canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            cam.targetRotY += (e.clientX - lastMouse.x) * 0.008;
            cam.targetRotX += (e.clientY - lastMouse.y) * 0.008;
            cam.targetRotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cam.targetRotX));
            lastMouse = { x: e.clientX, y: e.clientY };
        });
        canvas.addEventListener('mouseup', () => { isDragging = false; });
        canvas.addEventListener('mouseleave', () => { isDragging = false; });
        canvas.addEventListener('wheel', (e) => {
            cam.targetZoom *= e.deltaY > 0 ? 0.95 : 1.05;
            cam.targetZoom = Math.max(0.3, Math.min(3.0, cam.targetZoom));
            e.preventDefault();
        }, { passive: false });

        startBtn.addEventListener('click', () => {
            if (!angleAnimating) {
                angleAnimating = true;
                startBtn.disabled = true; startBtn.textContent = 'Running';
                pauseBtn.style.display = 'block';
                animateAngle();
            }
        });
        pauseBtn.addEventListener('click', () => {
            angleAnimating = !angleAnimating;
            pauseBtn.textContent = angleAnimating ? 'Pause' : 'Resume';
            if (angleAnimating) animateAngle();
        });
        resetBtn.addEventListener('click', () => {
            angleAnimating = false;
            startBtn.disabled = false; startBtn.textContent = 'Animate ?';
            pauseBtn.style.display = 'none';
            aB.value = 60;
            document.getElementById('aBVal').textContent = '60';
            updateStats(); draw();
        });

        [mA, mB, aB].forEach(el => el.addEventListener('input', () => {
            document.getElementById('mAVal').textContent = mA.value;
            document.getElementById('mBVal').textContent = mB.value;
            document.getElementById('aBVal').textContent = aB.value;
            updateStats(); draw();
        }));
        document.getElementById('showAngle').addEventListener('change', draw);
        document.getElementById('showCross').addEventListener('change', draw);
        document.getElementById('showGlow').addEventListener('change', draw);
        document.getElementById('autoRotate').addEventListener('change', () => {
            viewRotating = document.getElementById('autoRotate').checked;
            if (viewRotating) animateView();
        });

        function updateStats() {
            const A = parseFloat(mA.value);
            const B = parseFloat(mB.value);
            const theta = parseFloat(aB.value);
            const thetaRad = theta * Math.PI / 180;
            const cross = A * B * Math.sin(thetaRad);
            document.getElementById('statA').textContent = A.toFixed(1);
            document.getElementById('statB').textContent = B.toFixed(1);
            document.getElementById('statAngle').textContent = theta.toFixed(1) + '°';
            document.getElementById('statCross').textContent = cross.toFixed(2);
            document.getElementById('statSin').textContent = Math.sin(thetaRad).toFixed(3);
            document.getElementById('statDir').textContent = cross >= 0 ? '+Z' : '-Z';
        }

        function project3D(x, y, z) {
            const cosY = Math.cos(cam.rotY), sinY = Math.sin(cam.rotY);
            const px = x * cosY + z * sinY;
            const pz = -x * sinY + z * cosY;
            const cosX = Math.cos(cam.rotX), sinX = Math.sin(cam.rotX);
            const py = y * cosX - pz * sinX;
            const pz2 = y * sinX + pz * cosX;
            const scale = 40 * cam.zoom;
            return { x: canvas.width / 2 + px * scale, y: canvas.height / 2 - py * scale, z: pz2, scale: scale, depth: pz2 };
        }

        function drawArrow3D(p1, p2, color, lw) {
            if (!p1 || !p2) return;
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = color;
            ctx.lineWidth = lw;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const headLen = 12;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(p2.x, p2.y);
            ctx.lineTo(p2.x - headLen * Math.cos(angle - 0.4), p2.y - headLen * Math.sin(angle - 0.4));
            ctx.lineTo(p2.x - headLen * Math.cos(angle + 0.4), p2.y - headLen * Math.sin(angle + 0.4));
            ctx.closePath();
            ctx.fill();
            if (document.getElementById('showGlow').checked) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 10;
                ctx.strokeStyle = color;
                ctx.lineWidth = lw * 0.5;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            ctx.restore();
        }

        function drawGlow(p, r, color) {
            if (!p) return;
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r * cam.zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 0.8;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r * 0.5 * cam.zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        function drawAxes() {
            ctx.save();
            const len = 5, origin = project3D(0, 0, 0);
            if (!origin) return;
            const axes = [
                { end: project3D(len, 0, 0), label: 'X' },
                { end: project3D(0, len, 0), label: 'Y' },
                { end: project3D(0, 0, len), label: 'Z' }
            ];
            axes.forEach(a => {
                if (a.end) {
                    drawArrow3D(origin, a.end, '#ff6b6b', 2);
                    ctx.fillStyle = '#ff6b6b';
                    ctx.font = 'bold 13px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(a.label, a.end.x + (a.label === 'X' ? 12 : a.label === 'Y' ? 0 : 12), a.end.y + (a.label === 'X' ? 4 : a.label === 'Y' ? -12 : 4));
                }
            });
            ctx.restore();
        }

        function drawLabels(Ax, Ay, Az, Bx, By, Bz, Cx, Cy, Cz) {
            if (!document.getElementById('showAngle').checked) return;
            const tipA = project3D(Ax, Ay, Az);
            const tipB = project3D(Bx, By, Bz);
            const tipC = project3D(Cx, Cy, Cz);
            ctx.save();
            ctx.font = 'bold 15px monospace';
            ctx.textAlign = 'center';
            if (tipA) { ctx.fillStyle = '#00b894'; ctx.shadowColor = '#00b894'; ctx.shadowBlur = 6; ctx.fillText('A', tipA.x + 18, tipA.y - 10); ctx.shadowBlur = 0; }
            if (tipB) { ctx.fillStyle = '#e17055'; ctx.shadowColor = '#e17055'; ctx.shadowBlur = 6; ctx.fillText('B', tipB.x + 18, tipB.y - 10); ctx.shadowBlur = 0; }
            if (tipC) { ctx.fillStyle = '#fdcb6e'; ctx.shadowColor = '#fdcb6e'; ctx.shadowBlur = 8; ctx.fillText('A×B', tipC.x + 20, tipC.y - 10); ctx.shadowBlur = 0; }
            drawGlow(project3D(0, 0, 0), 6, '#fff');
            drawGlow(tipA, 8, '#00b894');
            drawGlow(tipB, 8, '#e17055');
            drawGlow(tipC, 10, '#fdcb6e');
            ctx.restore();
        }

        function draw() {
            cam.rotX += (cam.targetRotX - cam.rotX) * 0.1;
            cam.rotY += (cam.targetRotY - cam.rotY) * 0.1;
            cam.zoom += (cam.targetZoom - cam.zoom) * 0.1;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const bg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.6);
            bg.addColorStop(0, '#0a0a1a');
            bg.addColorStop(1, '#000000');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const A = parseFloat(mA.value);
            const B = parseFloat(mB.value);
            const theta = parseFloat(aB.value);
            const thetaRad = theta * Math.PI / 180;
            const crossMag = A * B * Math.sin(thetaRad);

            const Ax = A, Ay = 0, Az = 0;
            const Bx = B * Math.cos(thetaRad);
            const By = B * Math.sin(thetaRad);
            const Bz = 0;
            const Cx = 0, Cy = 0, Cz = crossMag;

            const origin = project3D(0, 0, 0);
            const tipA = project3D(Ax, Ay, Az);
            const tipB = project3D(Bx, By, Bz);
            const tipC = project3D(Cx, Cy, Cz);

            drawAxes();

            if (origin && tipA) {
                drawArrow3D(origin, tipA, '#00b894', 4);
                if (document.getElementById('showGlow').checked) {
                    ctx.save();
                    ctx.shadowColor = '#00b894';
                    ctx.shadowBlur = 12;
                    ctx.strokeStyle = 'rgba(0,184,148,0.4)';
                    ctx.lineWidth = 6;
                    ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(tipA.x, tipA.y); ctx.stroke();
                    ctx.restore();
                }
            }

            if (origin && tipB) {
                drawArrow3D(origin, tipB, '#e17055', 4);
                if (document.getElementById('showGlow').checked) {
                    ctx.save();
                    ctx.shadowColor = '#e17055';
                    ctx.shadowBlur = 12;
                    ctx.strokeStyle = 'rgba(225,112,85,0.4)';
                    ctx.lineWidth = 6;
                    ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(tipB.x, tipB.y); ctx.stroke();
                    ctx.restore();
                }
            }

            if (document.getElementById('showAngle').checked && theta > 0 && theta < 180) {
                ctx.save();
                ctx.strokeStyle = 'rgba(255,255,255,0.6)';
                ctx.lineWidth = 2;
                const arcR = Math.min(35, A * 0.25, B * 0.25);
                const arcStart = -thetaRad;
                const arcEnd = 0;
                ctx.beginPath();
                ctx.arc(origin.x, origin.y, arcR, arcStart, arcEnd);
                ctx.stroke();
                const midAngle = (arcStart + arcEnd) / 2;
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 13px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(theta.toFixed(0) + '°', origin.x + (arcR + 15) * Math.cos(midAngle), origin.y + (arcR + 15) * Math.sin(midAngle) + 4);
                ctx.restore();
            }

            if (document.getElementById('showCross').checked && Math.abs(crossMag) > 0.01) {
                if (origin && tipC) {
                    drawArrow3D(origin, tipC, '#fdcb6e', 5);
                    if (document.getElementById('showGlow').checked) {
                        ctx.save();
                        ctx.shadowColor = '#fdcb6e';
                        ctx.shadowBlur = 15;
                        ctx.strokeStyle = 'rgba(253,203,110,0.5)';
                        ctx.lineWidth = 7;
                        ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(tipC.x, tipC.y); ctx.stroke();
                        ctx.restore();
                    }

                    if (tipA && tipC) {
                        ctx.save();
                        const ms = 10;
                        const aDir = { x: tipA.x - origin.x, y: tipA.y - origin.y };
                        const cDir = { x: tipC.x - origin.x, y: tipC.y - origin.y };
                        const aLen = Math.sqrt(aDir.x * aDir.x + aDir.y * aDir.y);
                        const cLen = Math.sqrt(cDir.x * cDir.x + cDir.y * cDir.y);
                        if (aLen > 0 && cLen > 0) {
                            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                            ctx.lineWidth = 1.5;
                            ctx.beginPath();
                            ctx.moveTo(origin.x + (aDir.x / aLen) * ms, origin.y + (aDir.y / aLen) * ms);
                            ctx.lineTo(origin.x + (aDir.x / aLen) * ms + (cDir.x / cLen) * ms, origin.y + (aDir.y / aLen) * ms + (cDir.y / cLen) * ms);
                            ctx.lineTo(origin.x + (cDir.x / cLen) * ms, origin.y + (cDir.y / cLen) * ms);
                            ctx.stroke();
                        }
                        ctx.restore();
                    }
                }
            }

            if (Math.abs(crossMag) > 0.01) {
                ctx.save();
                ctx.font = 'bold 12px monospace';
                ctx.fillStyle = '#fdcb6e';
                ctx.textAlign = 'left';
                ctx.fillText('|A×B| = ' + crossMag.toFixed(2), 15, 30);
                const barW = Math.min(150, Math.abs(crossMag) * 7);
                ctx.fillStyle = 'rgba(253,203,110,0.3)';
                ctx.fillRect(15, 38, barW, 6);
                ctx.fillStyle = '#fdcb6e';
                ctx.fillRect(15, 38, barW, 6);
                ctx.restore();
            }

            drawLabels(Ax, Ay, Az, Bx, By, Bz, Cx, Cy, Cz);

            ctx.save();
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'right';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillText('A×B = |A||B|sin? = ' + A.toFixed(1) + ' × ' + B.toFixed(1) + ' × ' + Math.sin(thetaRad).toFixed(3), canvas.width - 20, 30);
            ctx.fillStyle = '#fdcb6e';
            ctx.fillText('|A×B| = ' + crossMag.toFixed(2), canvas.width - 20, 55);
            ctx.fillStyle = '#fff';
            ctx.fillText('Perpendicular to A and B', canvas.width - 20, 80);
            ctx.textAlign = 'left';
            ctx.restore();

            ctx.save();
            ctx.font = '13px monospace';
            ctx.fillStyle = '#00b894'; ctx.fillText('? A (X axis)', 15, canvas.height - 35);
            ctx.fillStyle = '#e17055'; ctx.fillText('? B (XY plane)', 15, canvas.height - 18);
            if (document.getElementById('showCross').checked && Math.abs(crossMag) > 0.01) {
                ctx.fillStyle = '#fdcb6e'; ctx.fillText('? A×B (Z axis)', canvas.width - 150, canvas.height - 18);
            }
            ctx.restore();

            updateStats();
        }

        function animateAngle() {
            if (!angleAnimating) return;
            sim.time += sim.dt;
            const newAngle = (60 + 60 * Math.sin(sim.time * 0.4)) % 181;
            aB.value = Math.round(newAngle);
            document.getElementById('aBVal').textContent = aB.value;
            updateStats(); draw();
            requestAnimationFrame(animateAngle);
        }

        function animateView() {
            if (!viewRotating) return;
            cam.targetRotY += 0.0025;
            draw();
            requestAnimationFrame(animateView);
        }

        updateStats();
        draw();
        if (document.getElementById('autoRotate').checked) {
            viewRotating = true;
            animateView();
        }
    
// From: dot-product.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');
        let sim = { running: false, paused: false, time: 0, dt: 0.016 };

        const mA = document.getElementById('mA');
        const mB = document.getElementById('mB');
        const aB = document.getElementById('aB');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');

        mA.addEventListener('input', () => { document.getElementById('mAVal').textContent = mA.value; draw(); });
        mB.addEventListener('input', () => { document.getElementById('mBVal').textContent = mB.value; draw(); });
        aB.addEventListener('input', () => { document.getElementById('aBVal').textContent = aB.value; draw(); });
        document.getElementById('showProjection').addEventListener('change', draw);
        document.getElementById('showAngle').addEventListener('change', draw);
        document.getElementById('showRect').addEventListener('change', draw);

        startBtn.addEventListener('click', () => {
            if (!sim.running) {
                sim.running = true; sim.paused = false;
                startBtn.disabled = true; startBtn.textContent = 'Running';
                pauseBtn.style.display = 'block';
                animate();
            }
        });
        pauseBtn.addEventListener('click', () => {
            sim.paused = !sim.paused;
            pauseBtn.textContent = sim.paused ? 'Resume' : 'Pause';
            if (!sim.paused) animate();
        });
        resetBtn.addEventListener('click', reset);

        function reset() {
            sim.running = false; sim.paused = false; sim.time = 0;
            startBtn.disabled = false; startBtn.textContent = 'Animate';
            pauseBtn.style.display = 'none';
            updateStats(); draw();
        }

        function updateStats() {
            const A = parseFloat(mA.value);
            const B = parseFloat(mB.value);
            const theta = parseFloat(aB.value);
            const thetaRad = theta * Math.PI / 180;
            const dot = A * B * Math.cos(thetaRad);
            const proj = A * Math.cos(thetaRad);
            document.getElementById('statA').textContent = A.toFixed(1) + ' m';
            document.getElementById('statB').textContent = B.toFixed(1) + ' m';
            document.getElementById('statAngle').textContent = theta.toFixed(1) + '°';
            document.getElementById('statDot').textContent = dot.toFixed(2);
            document.getElementById('statCos').textContent = Math.cos(thetaRad).toFixed(3);
            document.getElementById('statProj').textContent = proj.toFixed(2) + ' m';
        }

        function drawArrow(x, y, length, angleDeg, color, lw, dashed) {
            const endX = x + length * Math.cos(angleDeg * Math.PI / 180);
            const endY = y + length * Math.sin(angleDeg * Math.PI / 180);
            ctx.save();
            if (dashed) ctx.setLineDash([5, 4]);
            ctx.strokeStyle = color; ctx.lineWidth = lw;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
            ctx.setLineDash([]);
            const headLen = 14, headAngle = 25;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - headLen * Math.cos((angleDeg - headAngle) * Math.PI / 180), endY - headLen * Math.sin((angleDeg - headAngle) * Math.PI / 180));
            ctx.lineTo(endX - headLen * Math.cos((angleDeg + headAngle) * Math.PI / 180), endY - headLen * Math.sin((angleDeg + headAngle) * Math.PI / 180));
            ctx.closePath(); ctx.fill();
            ctx.restore();
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);

            const A = parseFloat(mA.value);
            const B = parseFloat(mB.value);
            const theta = parseFloat(aB.value);
            const thetaRad = theta * Math.PI / 180;
            const dot = A * B * Math.cos(thetaRad);
            const proj = A * Math.cos(thetaRad);

            const cx = canvas.width * 0.35, cy = canvas.height * 0.55;
            const scale = 28;
            const aColor = '#00b894', bColor = '#e17055', rColor = '#fdcb6e';

            const A_len = A * scale, B_len = B * scale;
            const A_angle = 0;
            const B_angle = theta;

            const Ax = cx + A_len * Math.cos(A_angle * Math.PI / 180);
            const Ay = cy + A_len * Math.sin(A_angle * Math.PI / 180);
            const Bx = cx + B_len * Math.cos(B_angle * Math.PI / 180);
            const By = cy + B_len * Math.sin(B_angle * Math.PI / 180);

            // Projection of A on B direction
            const projLen = proj * scale;
            const projX = cx + projLen * Math.cos(B_angle * Math.PI / 180);
            const projY = cy + projLen * Math.sin(B_angle * Math.PI / 180);

            // Rectangle area visualization
            if (document.getElementById('showRect').checked && Math.abs(dot) > 1) {
                ctx.fillStyle = dot > 0 ? 'rgba(0,184,148,0.08)' : 'rgba(225,112,85,0.08)';
                ctx.fillRect(cx, cy, projX - cx, By - cy);
            }

            // Projection line
            if (document.getElementById('showProjection').checked) {
                ctx.strokeStyle = 'rgba(253,203,110,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
                ctx.beginPath(); ctx.moveTo(Ax, Ay); ctx.lineTo(projX, projY); ctx.stroke();
                ctx.setLineDash([]);
                // Projection marker on B
                ctx.fillStyle = rColor;
                ctx.beginPath(); ctx.arc(projX, projY, 4, 0, Math.PI * 2); ctx.fill();
            }

            // Vectors
            drawArrow(cx, cy, A_len, A_angle, aColor, 4, false);
            drawArrow(cx, cy, B_len, B_angle, bColor, 4, false);

            // Labels
            ctx.font = 'bold 16px monospace';
            ctx.fillStyle = aColor;
            const midAx = (cx + Ax) / 2, midAy = (cy + Ay) / 2;
            ctx.fillText('A', midAx, midAy + 25);
            ctx.fillStyle = bColor;
            const midBx = (cx + Bx) / 2, midBy = (cy + By) / 2;
            ctx.fillText('B', midBx - 15, midBy - 10);

            // Angle arc
            if (document.getElementById('showAngle').checked && theta > 0) {
                const arcR = Math.min(40, A_len * 0.3, B_len * 0.3);
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(cx, cy, arcR, 0, theta * Math.PI / 180);
                ctx.stroke();
                ctx.fillStyle = '#fff'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
                ctx.fillText(theta.toFixed(0) + '°', cx + (arcR + 18) * Math.cos(theta / 2 * Math.PI / 180), cy + (arcR + 18) * Math.sin(theta / 2 * Math.PI / 180) + 5);
                ctx.textAlign = 'left';
            }

            // Projection label
            if (document.getElementById('showProjection').checked && projLen > 10) {
                ctx.fillStyle = rColor; ctx.font = 'bold 13px monospace';
                ctx.fillText('proj=' + proj.toFixed(1), projX + 8, projY - 8);
            }

            // Formula
            ctx.font = 'bold 14px monospace'; ctx.textAlign = 'right'; ctx.fillStyle = '#fff';
            ctx.fillText('A·B = |A||B|cos? = ' + A.toFixed(1) + ' × ' + B.toFixed(1) + ' × ' + Math.cos(thetaRad).toFixed(3), canvas.width - 20, 30);
            ctx.fillStyle = rColor;
            ctx.fillText('A·B = ' + dot.toFixed(2), canvas.width - 20, 55);
            ctx.fillStyle = '#fff';
            ctx.fillText('Projection of A on B = ' + proj.toFixed(2) + ' m', canvas.width - 20, 80);
            ctx.textAlign = 'left';

            // Legend
            ctx.font = '13px monospace';
            ctx.fillStyle = aColor; ctx.fillText('? A', 15, canvas.height - 35);
            ctx.fillStyle = bColor; ctx.fillText('? B', 15, canvas.height - 18);
            if (document.getElementById('showProjection').checked) {
                ctx.fillStyle = rColor; ctx.fillText('? Projection', canvas.width - 140, canvas.height - 18);
            }

            updateStats();
        }

        function animate() {
            if (!sim.running || sim.paused) return;
            sim.time += sim.dt;
            const newAngle = (60 + 60 * Math.sin(sim.time * 0.4)) % 181;
            aB.value = Math.round(newAngle);
            document.getElementById('aBVal').textContent = aB.value;
            updateStats(); draw();
            requestAnimationFrame(animate);
        }

        reset();
    
// From: electrostatics.html


// From: electrostatics.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');
        const k = 8.99e9;
        const mu = 1e-6;

        const q1Slider = document.getElementById('q1');
        const q2Slider = document.getElementById('q2');
        const sepSlider = document.getElementById('separation');
        const showField = document.getElementById('showField');
        const showEquip = document.getElementById('showEquip');
        const showVector = document.getElementById('showVector');
        const addPositive = document.getElementById('addPositive');
        const resetBtn = document.getElementById('resetBtn');

        let charges = [{ x: -1.5, y: 0, q: 5 }, { x: 1.5, y: 0, q: -5 }];
        let mouseX = -1, mouseY = -1;
        let time = 0;

        function getParams() {
            charges[0].q = parseFloat(q1Slider.value);
            charges[1].q = parseFloat(q2Slider.value);
            const sep = parseFloat(sepSlider.value);
            charges[0].x = -sep / 2;
            charges[1].x = sep / 2;

            document.getElementById('q1Val').textContent = (charges[0].q >= 0 ? '+' : '') + charges[0].q + ' \u03bcC';
            document.getElementById('q2Val').textContent = (charges[1].q >= 0 ? '+' : '') + charges[1].q + ' \u03bcC';
            document.getElementById('sepVal').textContent = sep.toFixed(1) + ' m';

            draw();
        }

        [q1Slider, q2Slider, sepSlider, showField, showEquip, showVector].forEach(el => el.addEventListener('input', getParams));
        resetBtn.addEventListener('click', () => {
            charges = [{ x: -1.5, y: 0, q: 5 }, { x: 1.5, y: 0, q: -5 }];
            q1Slider.value = 5; q2Slider.value = -5; sepSlider.value = 3;
            getParams();
        });
        addPositive.addEventListener('click', () => {
            const angle = Math.random() * Math.PI * 2;
            const dist = 1 + Math.random() * 1.5;
            charges.push({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, q: 3 + Math.random() * 5 });
            draw();
        });

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const px = (e.clientX - rect.left) * scaleX;
            const py = (e.clientY - rect.top) * scaleY;
            const metersX = (px - canvas.width / 2) / 60;
            const metersY = -(py - canvas.height / 2) / 60;

            let E = { x: 0, y: 0 };
            let V = 0;

            for (const c of charges) {
                const dx = metersX - c.x;
                const dy = metersY - c.y;
                const r2 = dx * dx + dy * dy;
                const r = Math.sqrt(r2);
                if (r > 0.2) {
                    const Emag = k * Math.abs(c.q) * mu / r2;
                    E.x += (dx / r) * Emag * (c.q > 0 ? 1 : -1);
                    E.y += (dy / r) * Emag * (c.q > 0 ? 1 : -1);
                    V += k * c.q * mu / r;
                }
            }

            const Emag = Math.sqrt(E.x * E.x + E.y * E.y);
            document.getElementById('statE').textContent = Emag.toFixed(1) + ' N/C';
            document.getElementById('statV').textContent = V.toFixed(1) + ' V';
        });

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bgGrad.addColorStop(0, '#000000');
            bgGrad.addColorStop(1, '#000000');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const scale = 60;
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // Grid
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            for (let i = -10; i <= 10; i++) {
                ctx.beginPath();
                ctx.moveTo(cx + i * scale, 0);
                ctx.lineTo(cx + i * scale, canvas.height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, cy + i * scale);
                ctx.lineTo(canvas.width, cy + i * scale);
                ctx.stroke();
            }

            // Equipotential lines
            if (showEquip.checked) {
                const resolution = 4;
                for (let px = 0; px < canvas.width; px += resolution) {
                    for (let py = 0; py < canvas.height; py += resolution) {
                        let V = 0;
                        for (const c of charges) {
                            const dx = (px - cx) / scale - c.x;
                            const dy = (py - cy) / scale - c.y;
                            const r = Math.sqrt(dx * dx + dy * dy);
                            if (r > 0.15) V += k * c.q * mu / r;
                        }
                        const VInt = Math.round(V / 5000000) * 5000000;
                        if (Math.abs(V - VInt) < 3000000) {
                            ctx.fillStyle = `rgba(108, 92, 231, ${Math.min(0.4, Math.abs(V) / 200000000)})`;
                            ctx.fillRect(px, py, resolution, resolution);
                        }
                    }
                }
            }

            // Field lines
            if (showField.checked) {
                for (const c of charges) {
                    if (c.q <= 0) continue;
                    const numLines = Math.abs(c.q) * 4;
                    for (let i = 0; i < numLines; i++) {
                        const angle = (i / numLines) * Math.PI * 2 + time * 0.005;
                        traceFieldLine(cx + c.x * scale, cy + c.y * scale, angle);
                    }
                }
            }

            // Field vectors
            if (showVector.checked) {
                for (let px = 80; px < canvas.width - 40; px += 60) {
                    for (let py = 80; py < canvas.height - 40; py += 60) {
                        const mx = (px - cx) / scale;
                        const my = -(py - cy) / scale;
                        let Ex = 0, Ey = 0;
                        for (const c of charges) {
                            const dx = mx - c.x;
                            const dy = my - c.y;
                            const r2 = dx * dx + dy * dy;
                            const r = Math.sqrt(r2);
                            if (r > 0.3) {
                                const E = k * Math.abs(c.q) * mu / r2;
                                Ex += (dx / r) * E * (c.q > 0 ? 1 : -1);
                                Ey += (dy / r) * E * (c.q > 0 ? 1 : -1);
                            }
                        }
                        const Emag = Math.sqrt(Ex * Ex + Ey * Ey);
                        if (Emag > 100) {
                            const len = Math.min(25, Emag / 500000);
                            drawArrow(px, py, px + (Ex / Emag) * len, py - (Ey / Emag) * len, 'rgba(253, 203, 110, 0.5)', 1);
                        }
                    }
                }
            }

            // Charges
            for (let i = 0; i < charges.length; i++) {
                const c = charges[i];
                const px = cx + c.x * scale;
                const py = cy + c.y * scale;
                const r = 15 + Math.abs(c.q) * 2;

                const glow = ctx.createRadialGradient(px, py, 0, px, py, r * 3);
                if (c.q > 0) {
                    glow.addColorStop(0, 'rgba(255, 107, 107, 0.3)');
                    glow.addColorStop(1, 'rgba(255, 107, 107, 0)');
                } else {
                    glow.addColorStop(0, 'rgba(255,255,255,0.3)');
                    glow.addColorStop(1, 'rgba(255,255,255,0)');
                }
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(px, py, r * 3, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = c.q > 0 ? '#ff6b6b' : '#ffffff';
                ctx.beginPath();
                ctx.arc(px, py, r, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(c.q > 0 ? '+' : '\u2212', px, py);

                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.font = '10px monospace';
                ctx.fillText(c.q.toFixed(1) + '\u03bcC', px, py + r + 14);
            }
        }

        function traceFieldLine(startX, startAngle) {
            const dt = 0.15;
            const maxSteps = 200;
            let x = startX;
            let y = canvas.height / 2;
            // recalculate from actual charge position
            const c = charges[0]; // simplified
            const cx = canvas.width / 2 + c.x * 60;
            const cy = canvas.height / 2 + c.y * 60;
            x = cx;
            y = cy;

            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);

            let angle = startAngle;
            for (let i = 0; i < maxSteps; i++) {
                const mx = (x - canvas.width / 2) / 60;
                const my = -(y - canvas.height / 2) / 60;
                let Ex = 0, Ey = 0;
                for (const ch of charges) {
                    const dx = mx - ch.x;
                    const dy = my - ch.y;
                    const r2 = dx * dx + dy * dy;
                    const r = Math.sqrt(r2);
                    if (r > 0.2) {
                        const E = k * Math.abs(ch.q) * mu / r2;
                        Ex += (dx / r) * E * (ch.q > 0 ? 1 : -1);
                        Ey += (dy / r) * E * (ch.q > 0 ? 1 : -1);
                    }
                }
                const Emag = Math.sqrt(Ex * Ex + Ey * Ey);
                if (Emag < 1) break;

                angle = Math.atan2(Ey / Emag, Ex / Emag);
                x += Math.cos(angle) * dt * 8;
                y -= Math.sin(angle) * dt * 8;

                if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) break;

                // Check if near negative charge
                let nearNeg = false;
                for (const ch of charges) {
                    if (ch.q <= 0) {
                        const dx = (x - canvas.width / 2) / 60 - ch.x;
                        const dy = -(y - canvas.height / 2) / 60 - ch.y;
                        if (Math.sqrt(dx * dx + dy * dy) < 0.3) { nearNeg = true; break; }
                    }
                }
                if (nearNeg) break;

                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        function drawArrow(x1, y1, x2, y2, color, width) {
            const headLen = 6;
            const angle = Math.atan2(y2 - y1, x2 - x1);
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        }

        function animate() {
            time++;
            draw();
            requestAnimationFrame(animate);
        }

        getParams();
        animate();
    
// From: equilibrium.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');
        let sim = { running: false, paused: false, time: 0, dt: 0.016 };

        const m1 = document.getElementById('m1');
        const m2 = document.getElementById('m2');
        const m3 = document.getElementById('m3');
        const a1 = document.getElementById('a1');
        const a2 = document.getElementById('a2');
        const a3 = document.getElementById('a3');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');

        m1.addEventListener('input', () => { document.getElementById('m1Val').textContent = m1.value; draw(); });
        m2.addEventListener('input', () => { document.getElementById('m2Val').textContent = m2.value; draw(); });
        m3.addEventListener('input', () => { document.getElementById('m3Val').textContent = m3.value; draw(); });
        a1.addEventListener('input', () => { document.getElementById('a1Val').textContent = a1.value; draw(); });
        a2.addEventListener('input', () => { document.getElementById('a2Val').textContent = a2.value; draw(); });
        a3.addEventListener('input', () => { document.getElementById('a3Val').textContent = a3.value; draw(); });
        document.getElementById('showComponents').addEventListener('change', draw);
        document.getElementById('showPolygon').addEventListener('change', draw);
        document.getElementById('showGrid').addEventListener('change', draw);

        startBtn.addEventListener('click', () => {
            if (!sim.running) {
                sim.running = true; sim.paused = false;
                startBtn.disabled = true; startBtn.textContent = 'Running';
                pauseBtn.style.display = 'block';
                animate();
            }
        });
        pauseBtn.addEventListener('click', () => {
            sim.paused = !sim.paused;
            pauseBtn.textContent = sim.paused ? 'Resume' : 'Pause';
            if (!sim.paused) animate();
        });
        resetBtn.addEventListener('click', reset);

        function reset() {
            sim.running = false; sim.paused = false; sim.time = 0;
            startBtn.disabled = false; startBtn.textContent = 'Animate';
            pauseBtn.style.display = 'none';
            updateStats(); draw();
        }

        function updateStats() {
            const m1v = parseFloat(m1.value);
            const m2v = parseFloat(m2.value);
            const m3v = parseFloat(m3.value);
            const a1r = parseFloat(a1.value) * Math.PI / 180;
            const a2r = parseFloat(a2.value) * Math.PI / 180;
            const a3r = parseFloat(a3.value) * Math.PI / 180;

            const Fx = m1v * Math.cos(a1r) + m2v * Math.cos(a2r) + m3v * Math.cos(a3r);
            const Fy = m1v * Math.sin(a1r) + m2v * Math.sin(a2r) + m3v * Math.sin(a3r);
            const R = Math.sqrt(Fx * Fx + Fy * Fy);

            document.getElementById('statFx').textContent = Fx.toFixed(1) + ' N';
            document.getElementById('statFy').textContent = Fy.toFixed(1) + ' N';
            document.getElementById('statR').textContent = R.toFixed(1) + ' N';
            document.getElementById('statF1').textContent = m1v.toFixed(1) + ' N';
            document.getElementById('statF2').textContent = m2v.toFixed(1) + ' N';
            document.getElementById('statF3').textContent = m3v.toFixed(1) + ' N';

            const indicator = document.getElementById('equilibriumIndicator');
            if (R < 0.5) {
                indicator.className = 'equilibrium-indicator yes';
                indicator.textContent = '? IN EQUILIBRIUM';
            } else {
                indicator.className = 'equilibrium-indicator no';
                indicator.textContent = '? NOT IN EQUILIBRIUM (R=' + R.toFixed(1) + ' N)';
            }
        }

        function drawArrow(x, y, length, angleDeg, color, lw, dashed) {
            if (length < 1) return;
            const endX = x + length * Math.cos(angleDeg * Math.PI / 180);
            const endY = y + length * Math.sin(angleDeg * Math.PI / 180);
            ctx.save();
            if (dashed) ctx.setLineDash([5, 4]);
            ctx.strokeStyle = color; ctx.lineWidth = lw;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
            ctx.setLineDash([]);
            const headLen = 14, headAngle = 25;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - headLen * Math.cos((angleDeg - headAngle) * Math.PI / 180), endY - headLen * Math.sin((angleDeg - headAngle) * Math.PI / 180));
            ctx.lineTo(endX - headLen * Math.cos((angleDeg + headAngle) * Math.PI / 180), endY - headLen * Math.sin((angleDeg + headAngle) * Math.PI / 180));
            ctx.closePath(); ctx.fill();
            ctx.restore();
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);

            const m1v = parseFloat(m1.value);
            const m2v = parseFloat(m2.value);
            const m3v = parseFloat(m3.value);
            const a1r = parseFloat(a1.value) * Math.PI / 180;
            const a2r = parseFloat(a2.value) * Math.PI / 180;
            const a3r = parseFloat(a3.value) * Math.PI / 180;

            const Fx = m1v * Math.cos(a1r) + m2v * Math.cos(a2r) + m3v * Math.cos(a3r);
            const Fy = m1v * Math.sin(a1r) + m2v * Math.sin(a2r) + m3v * Math.sin(a3r);
            const R = Math.sqrt(Fx * Fx + Fy * Fy);

            const cx = canvas.width / 2, cy = canvas.height / 2;
            const scale = 8;
            const f1Color = '#ff6b6b', f2Color = '#51cf66', f3Color = '#74b9ff', rColor = '#fdcb6e';

            // Grid
            if (document.getElementById('showGrid').checked) {
                ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
                for (let i = 0; i < canvas.width; i += 40) {
                    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
                }
                for (let i = 0; i < canvas.height; i += 40) {
                    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
                }
                // Axes
                ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy); ctx.stroke();
            }

            // Force vectors from origin
            const f1Len = m1v * scale, f2Len = m2v * scale, f3Len = m3v * scale;
            drawArrow(cx, cy, f1Len, parseFloat(a1.value), f1Color, 4, false);
            drawArrow(cx, cy, f2Len, parseFloat(a2.value), f2Color, 4, false);
            drawArrow(cx, cy, f3Len, parseFloat(a3.value), f3Color, 4, false);

            // Resultant
            const rLen = R * scale;
            if (rLen > 1) {
                const rAngle = Math.atan2(Fy, Fx) * 180 / Math.PI;
                drawArrow(cx, cy, rLen, rAngle, rColor, 5, true);
            }

            // Components
            if (document.getElementById('showComponents').checked) {
                for (let i = 0; i < 3; i++) {
                    const m = [m1v, m2v, m3v][i];
                    const a = [a1r, a2r, a3r][i];
                    const c = [f1Color, f2Color, f3Color][i];
                    const mag = m * scale;
                    const compX = mag * Math.cos(a);
                    const compY = mag * Math.sin(a);
                    if (Math.abs(compX) > 1) {
                        ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.globalAlpha = 0.4;
                        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + compX, cy); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(cx + compX, cy); ctx.lineTo(cx + compX, cy + compY); ctx.stroke();
                        ctx.setLineDash([]); ctx.globalAlpha = 1;
                    }
                }
            }

            // Force polygon (head-to-tail)
            if (document.getElementById('showPolygon').checked) {
                const polyCx = 120, polyCy = canvas.height - 120;
                let px = polyCx, py = polyCy;
                const polyPoints = [{ x: px, y: py }];
                for (let i = 0; i < 3; i++) {
                    const m = [m1v, m2v, m3v][i];
                    const a = [parseFloat(a1.value), parseFloat(a2.value), parseFloat(a3.value)][i] * Math.PI / 180;
                    const mag = m * scale * 0.5;
                    const nx = px + mag * Math.cos(a);
                    const ny = py + mag * Math.sin(a);
                    drawArrow(px, py, mag, [parseFloat(a1.value), parseFloat(a2.value), parseFloat(a3.value)][i], [f1Color, f2Color, f3Color][i], 3, false);
                    polyPoints.push({ x: nx, y: ny });
                    px = nx; py = ny;
                }
                // Close polygon check
                const dx = px - polyCx, dy = py - polyCy;
                const closeDist = Math.sqrt(dx * dx + dy * dy);
                if (closeDist > 5) {
                    ctx.strokeStyle = rColor; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
                    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(polyCx, polyCy); ctx.stroke();
                    ctx.setLineDash([]);
                } else {
                    ctx.strokeStyle = '#00b894'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(polyCx, polyCy); ctx.stroke();
                }
                ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
                ctx.fillText('Force Polygon', polyCx + 60, polyCy - 20);
                ctx.textAlign = 'left';
            }

            // Labels
            ctx.font = 'bold 16px monospace';
            ctx.fillStyle = f1Color;
            const f1x = cx + f1Len * Math.cos(a1r), f1y = cy + f1Len * Math.sin(a1r);
            ctx.fillText('F1', f1x + 15 * Math.cos(a1r + Math.PI / 2), f1y + 15 * Math.sin(a1r + Math.PI / 2));
            ctx.fillStyle = f2Color;
            const f2x = cx + f2Len * Math.cos(a2r), f2y = cy + f2Len * Math.sin(a2r);
            ctx.fillText('F2', f2x + 15 * Math.cos(a2r + Math.PI / 2), f2y + 15 * Math.sin(a2r + Math.PI / 2));
            ctx.fillStyle = f3Color;
            const f3x = cx + f3Len * Math.cos(a3r), f3y = cy + f3Len * Math.sin(a3r);
            ctx.fillText('F3', f3x + 15 * Math.cos(a3r + Math.PI / 2), f3y + 15 * Math.sin(a3r + Math.PI / 2));
            if (rLen > 1) {
                const rAngle = Math.atan2(Fy, Fx) * 180 / Math.PI;
                const rx = cx + rLen * Math.cos(rAngle * Math.PI / 180);
                const ry = cy + rLen * Math.sin(rAngle * Math.PI / 180);
                ctx.fillStyle = rColor;
                ctx.fillText('R', rx + 15 * Math.cos((rAngle + 90) * Math.PI / 180), ry + 15 * Math.sin((rAngle + 90) * Math.PI / 180));
            }

            // Origin dot
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();

            // Formula
            ctx.font = 'bold 13px monospace'; ctx.textAlign = 'right'; ctx.fillStyle = '#fff';
            ctx.fillText('SF? = ' + Fx.toFixed(1) + ' N', canvas.width - 20, 30);
            ctx.fillText('SF? = ' + Fy.toFixed(1) + ' N', canvas.width - 20, 50);
            ctx.fillStyle = rColor;
            ctx.fillText('|R| = ' + R.toFixed(1) + ' N', canvas.width - 20, 75);
            ctx.textAlign = 'left';

            // Legend
            ctx.font = '13px monospace';
            ctx.fillStyle = f1Color; ctx.fillText('? F1', 15, canvas.height - 35);
            ctx.fillStyle = f2Color; ctx.fillText('? F2', 15, canvas.height - 18);
            ctx.fillStyle = f3Color; ctx.fillText('? F3', canvas.width - 140, canvas.height - 35);
            if (rLen > 1) {
                ctx.fillStyle = rColor; ctx.fillText('? R (resultant)', canvas.width - 140, canvas.height - 18);
            }

            updateStats();
        }

        function animate() {
            if (!sim.running || sim.paused) return;
            sim.time += sim.dt;
            // Slowly rotate angles
            const newA1 = (parseFloat(a1.value) + 10 * Math.sin(sim.time * 0.2)) % 361;
            const newA2 = (parseFloat(a2.value) + 8 * Math.cos(sim.time * 0.25)) % 361;
            const newA3 = (parseFloat(a3.value) + 12 * Math.sin(sim.time * 0.15)) % 361;
            a1.value = Math.round(newA1);
            a2.value = Math.round(newA2);
            a3.value = Math.round(newA3);
            document.getElementById('a1Val').textContent = a1.value;
            document.getElementById('a2Val').textContent = a2.value;
            document.getElementById('a3Val').textContent = a3.value;
            updateStats(); draw();
            requestAnimationFrame(animate);
        }

        reset();
    
// From: gravitation.html


// From: gravitation.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2, cy = canvas.height / 2;
        const G = 1;

        const cmSlider = document.getElementById('centralMass');
        const pmSlider = document.getElementById('planetMass');
        const vySlider = document.getElementById('vy0');
        const vxSlider = document.getElementById('vx0');
        const trailSlider = document.getElementById('trailLen');
        const launchBtn = document.getElementById('launchBtn');
        const resetBtn = document.getElementById('resetBtn');

        let planet = { x: 0, y: 0, vx: 0, vy: 0, trail: [] };
        let running = false;
        let time = 0;

        function getParams() {
            document.getElementById('m1Val').textContent = cmSlider.value;
            document.getElementById('m2Val').textContent = pmSlider.value;
            document.getElementById('vyVal').textContent = vySlider.value;
            document.getElementById('vxVal').textContent = vxSlider.value;
            document.getElementById('trailVal').textContent = trailSlider.value;
        }
        [cmSlider, pmSlider, vySlider, vxSlider, trailSlider].forEach(el => el.addEventListener('input', getParams));

        launchBtn.addEventListener('click', () => {
            if (running) return;
            const M = parseFloat(cmSlider.value);
            const r = 150;
            planet.x = r; planet.y = 0;
            planet.vx = parseFloat(vxSlider.value);
            planet.vy = parseFloat(vySlider.value);
            planet.trail = [{ x: planet.x, y: planet.y }];
            running = true; time = 0;
            launchBtn.textContent = 'Running...'; launchBtn.disabled = true;
            requestAnimationFrame(animate);
        });

        resetBtn.addEventListener('click', () => {
            running = false; time = 0;
            planet = { x: 0, y: 0, vx: 0, vy: 0, trail: [] };
            launchBtn.textContent = 'Launch'; launchBtn.disabled = false;
            draw();
        });

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 400);
            bgGrad.addColorStop(0, '#000000'); bgGrad.addColorStop(1, '#000000');
            ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);

            const M = parseFloat(cmSlider.value);
            const m = parseFloat(pmSlider.value);
            const maxTrail = parseInt(trailSlider.value);

            // Stars
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            for (let i = 0; i < 50; i++) {
                const sx = (i * 137.5) % canvas.width;
                const sy = (i * 251.3) % canvas.height;
                ctx.beginPath(); ctx.arc(sx, sy, 0.5, 0, Math.PI * 2); ctx.fill();
            }

            // Trail
            if (planet.trail.length > 1) {
                for (let i = 1; i < planet.trail.length; i++) {
                    const alpha = i / planet.trail.length;
                    ctx.strokeStyle = `rgba(0, 184, 148, ${alpha * 0.5})`;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(cx + planet.trail[i - 1].x, cy + planet.trail[i - 1].y);
                    ctx.lineTo(cx + planet.trail[i].x, cy + planet.trail[i].y);
                    ctx.stroke();
                }
            }

            // Central body (Sun)
            const sunR = 15 + M * 0.15;
            const sunGrad = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, sunR);
            sunGrad.addColorStop(0, '#ffffff');
            sunGrad.addColorStop(0.5, '#fdcb6e');
            sunGrad.addColorStop(1, '#fdcb6e');
            ctx.fillStyle = sunGrad;
            ctx.beginPath(); ctx.arc(cx, cy, sunR, 0, Math.PI * 2); ctx.fill();

            const sunGlow = ctx.createRadialGradient(cx, cy, sunR, cx, cy, sunR * 4);
            sunGlow.addColorStop(0, 'rgba(253, 203, 110, 0.2)');
            sunGlow.addColorStop(1, 'rgba(253, 203, 110, 0)');
            ctx.fillStyle = sunGlow;
            ctx.beginPath(); ctx.arc(cx, cy, sunR * 4, 0, Math.PI * 2); ctx.fill();

            // Planet
            const px = cx + planet.x;
            const py = cy + planet.y;
            const pR = 5 + m * 1.5;

            const pGrad = ctx.createRadialGradient(px - 2, py - 2, 0, px, py, pR);
            pGrad.addColorStop(0, '#ffffff');
            pGrad.addColorStop(1, '#cccccc');
            ctx.fillStyle = pGrad;
            ctx.beginPath(); ctx.arc(px, py, pR, 0, Math.PI * 2); ctx.fill();

            // Velocity vector
            const vScale = 10;
            ctx.strokeStyle = '#fdcb6e';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + planet.vx * vScale, py + planet.vy * vScale); ctx.stroke();

            // Distance line
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
            ctx.setLineDash([]);

            const dist = Math.sqrt(planet.x * planet.x + planet.y * planet.y);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '10px monospace';
            ctx.fillText('r=' + dist.toFixed(0), (cx + px) / 2 + 5, (cy + py) / 2 - 5);
        }

        function animate() {
            if (!running) return;
            const dt = 0.05;
            time += dt;

            const M = parseFloat(cmSlider.value);
            const dx = -planet.x;
            const dy = -planet.y;
            const r2 = dx * dx + dy * dy;
            const r = Math.sqrt(r2);

            const a = G * M / r2;
            planet.vx += (a * dx / r) * dt;
            planet.vy += (a * dy / r) * dt;
            planet.x += planet.vx * dt;
            planet.y += planet.vy * dt;

            planet.trail.push({ x: planet.x, y: planet.y });
            const maxTrail = parseInt(trailSlider.value);
            if (planet.trail.length > maxTrail) planet.trail.shift();

            // Check escape
            const v2 = planet.vx * planet.vx + planet.vy * planet.vy;
            const E = 0.5 * v2 - G * M / r;
            if (r > 500 && E >= 0) {
                running = false;
                launchBtn.textContent = 'Launched!';
                document.getElementById('statType').textContent = 'Hyperbola (escaped)';
            }

            const v = Math.sqrt(v2);
            const KE = 0.5 * v2;
            const PE = -G * M / r;

            document.getElementById('statVel').textContent = v.toFixed(2);
            document.getElementById('statDist').textContent = r.toFixed(1);
            document.getElementById('statKE').textContent = KE.toFixed(2);
            document.getElementById('statPE').textContent = PE.toFixed(2);

            if (E < -0.1) document.getElementById('statType').textContent = 'Ellipse';
            else if (E < 0.1) document.getElementById('statType').textContent = 'Parabola';
            else document.getElementById('statType').textContent = 'Hyperbola';

            const a_semimajor = G * M / (2 * Math.abs(PE) + 0.001);
            document.getElementById('statPeriod').textContent = (2 * Math.PI * Math.sqrt(a_semimajor * a_semimajor * a_semimajor / (G * M))).toFixed(1) + ' s';

            draw();
            if (running) requestAnimationFrame(animate);
        }

        getParams();
        draw();
    
// From: kinematics-accelerated.html


// From: kinematics-accelerated.html

const canvas =
    document.getElementById('simCanvas');

const ctx =
    canvas.getContext('2d');

let sim = {

    running:false,
    paused:false,
    time:0,
    dt:0.016,
    trail:[]
};

const maxGraphPoints = 5000;

let graphData = {

    s:[],
    v:[],
    a:[]
};

const initVelSlider =
    document.getElementById('initVel');

const accelSlider =
    document.getElementById('accelVal');

const showST =
    document.getElementById('showST');

const showVT =
    document.getElementById('showVT');

const showAT =
    document.getElementById('showAT');

const startBtn =
    document.getElementById('startBtn');

const pauseBtn =
    document.getElementById('pauseBtn');

const resetBtn =
    document.getElementById('resetBtn');

const statTime =
    document.getElementById('statTime');

const statDisp =
    document.getElementById('statDisp');

const statVel =
    document.getElementById('statVel');

const statAcc =
    document.getElementById('statAcc');

initVelSlider.addEventListener(
    'input',
    ()=>{

        document.getElementById('uVal')
        .textContent =
            initVelSlider.value + ' m/s';

        if(!sim.running) reset();
    }
);

accelSlider.addEventListener(
    'input',
    ()=>{

        document.getElementById('accVal')
        .textContent =
            accelSlider.value + ' m/s²';

        if(!sim.running) reset();
    }
);

[showST,showVT,showAT].forEach(el=>{

    el.addEventListener(
        'change',
        ()=>draw()
    );
});

startBtn.addEventListener(
    'click',
    ()=>{

        if(!sim.running){

            sim.running = true;
            sim.paused = false;

            startBtn.disabled = true;
            startBtn.textContent = 'Running';

            pauseBtn.style.display = 'block';

            animate();
        }
    }
);

pauseBtn.addEventListener(
    'click',
    ()=>{

        sim.paused = !sim.paused;

        pauseBtn.textContent =
            sim.paused
            ? 'Resume'
            : 'Pause';

        if(!sim.paused){

            animate();
        }
    }
);

resetBtn.addEventListener(
    'click',
    reset
);

function reset(){

    sim.running = false;
    sim.paused = false;
    sim.time = 0;
    sim.trail = [];

    const u =
        parseFloat(initVelSlider.value);

    const a =
        parseFloat(accelSlider.value);

    graphData = {

        s:[
            {t:0,val:0}
        ],

        v:[
            {t:0,val:u}
        ],

        a:[
            {t:0,val:a}
        ]
    };

    startBtn.disabled = false;
    startBtn.textContent = 'Start';

    pauseBtn.style.display = 'none';
    pauseBtn.textContent = 'Pause';

    updateStats();

    draw();
}

function updateStats(){

    const u =
        parseFloat(initVelSlider.value);

    const a =
        parseFloat(accelSlider.value);

    const s =
        u*sim.time +
        0.5*a*sim.time*sim.time;

    const v =
        u + a*sim.time;

    statTime.textContent =
        sim.time.toFixed(2) + ' s';

    statDisp.textContent =
        s.toFixed(2) + ' m';

    statVel.textContent =
        v.toFixed(2) + ' m/s';

    statAcc.textContent =
        a.toFixed(2) + ' m/s²';
}

function getMotionValues(t){

    const u =
        parseFloat(initVelSlider.value);

    const a =
        parseFloat(accelSlider.value);

    return {

        s:u*t + 0.5*a*t*t,
        v:u + a*t,
        a:a
    };
}

function drawGraph(
    x,
    y,
    w,
    h,
    data,
    color,
    title,
    unit
){

    if(data.length < 2) return;

    ctx.fillStyle = '#111122';

    ctx.fillRect(x,y,w,h);

    ctx.strokeStyle =
        'rgba(255,255,255,0.15)';

    ctx.strokeRect(x,y,w,h);

    ctx.fillStyle = color;

    ctx.font =
        'bold 14px monospace';

    ctx.textAlign = 'center';

    ctx.fillText(
        title,
        x+w/2,
        y+20
    );

    const values =
        data.map(p=>p.val);

    let yMin =
        Math.min(...values);

    let yMax =
        Math.max(...values);

    if(yMin===yMax){

        yMin -= 1;
        yMax += 1;
    }

    const timeWindow = 10;

    const tMax = sim.time;

    const tMin =
        Math.max(0,tMax-timeWindow);

    const padL = 55;
    const padR = 15;
    const padT = 30;
    const padB = 40;

    const gw = w-padL-padR;
    const gh = h-padT-padB;

    ctx.strokeStyle =
        'rgba(255,255,255,0.15)';

    for(let i=0;i<=5;i++){

        const tx =
            x + padL + (gw*i/5);

        ctx.beginPath();

        ctx.moveTo(tx,y+padT);

        ctx.lineTo(tx,y+padT+gh);

        ctx.stroke();
    }

    for(let i=0;i<=4;i++){

        const ty =
            y + padT + (gh*i/4);

        ctx.beginPath();

        ctx.moveTo(x+padL,ty);

        ctx.lineTo(x+padL+gw,ty);

        ctx.stroke();
    }

    ctx.fillStyle =
        'rgba(255,255,255,0.6)';

    ctx.font =
        '10px monospace';

    for(let i=0;i<=5;i++){

        const tx =
            x + padL + (gw*i/5);

        const tVal =
            tMin + ((timeWindow*i)/5);

        ctx.fillText(
            tVal.toFixed(1),
            tx,
            y+padT+gh+15
        );
    }

    ctx.textAlign = 'right';

    for(let i=0;i<=4;i++){

        const ty =
            y + padT + (gh*i/4);

        const yVal =
            yMax -
            ((yMax-yMin)*i/4);

        ctx.fillText(
            yVal.toFixed(1),
            x+padL-5,
            ty+3
        );
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();

    let started = false;

    for(let i=0;i<data.length;i++){

        const tVal = data[i].t;
        const val = data[i].val;

        if(
            tVal < tMin ||
            tVal > tMax
        ) continue;

        const px =
            x+padL+
            ((tVal-tMin)/timeWindow)*gw;

        const py =
            y+padT+
            gh*(
                1-
                (val-yMin)/(yMax-yMin)
            );

        if(!started){

            ctx.moveTo(px,py);
            started = true;
        }
        else{

            ctx.lineTo(px,py);
        }
    }

    ctx.stroke();
}

function draw(){

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Background

    const bg =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    bg.addColorStop(0,'#000000');
    bg.addColorStop(1,'#000000');

    ctx.fillStyle = bg;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // ======================
    // PARTICLE MOTION AREA
    // ======================

    const motionAreaH =
        canvas.height*0.32;

    const trackY =
        motionAreaH*0.55;

    const trackLeft = 40;

    const trackRight =
        canvas.width-40;

    ctx.fillStyle = '#0d0d1a';

    ctx.fillRect(
        trackLeft,
        trackY-20,
        trackRight-trackLeft,
        40
    );

    ctx.strokeStyle =
        'rgba(255,255,255,0.15)';

    ctx.strokeRect(
        trackLeft,
        trackY-20,
        trackRight-trackLeft,
        40
    );

    const u =
        parseFloat(initVelSlider.value);

    const a =
        parseFloat(accelSlider.value);

    const s =
        u*sim.time +
        0.5*a*sim.time*sim.time;

    const v =
        u + a*sim.time;

    const originX =
        canvas.width/2;

    const scale = 10;

    ctx.font =
        '10px monospace';

    ctx.textAlign = 'center';

    for(let i=-30;i<=30;i+=5){

        const px =
            originX + i*scale;

        if(
            px<trackLeft ||
            px>trackRight
        ) continue;

        ctx.strokeStyle =
            'rgba(255,255,255,0.15)';

        ctx.beginPath();

        ctx.moveTo(px,trackY-20);

        ctx.lineTo(px,trackY+20);

        ctx.stroke();

        ctx.fillStyle =
            'rgba(255,255,255,0.4)';

        ctx.fillText(
            i+'m',
            px,
            trackY+35
        );
    }

    // Particle

    const particleX =
        originX + s*scale;

    const glow =
        ctx.createRadialGradient(
            particleX,
            trackY,
            0,
            particleX,
            trackY,
            25
        );

    glow.addColorStop(
        0,
        'rgba(0,184,148,0.4)'
    );

    glow.addColorStop(
        1,
        'rgba(0,184,148,0)'
    );

    ctx.fillStyle = glow;

    ctx.beginPath();

    ctx.arc(
        particleX,
        trackY,
        25,
        0,
        Math.PI*2
    );

    ctx.fill();

    ctx.fillStyle = '#ffffff';

    ctx.beginPath();

    ctx.arc(
        particleX,
        trackY,
        9,
        0,
        Math.PI*2
    );

    ctx.fill();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Velocity arrow

    const velLen =
        Math.min(
            Math.abs(v)*8,
            120
        );

    const velDir =
        v>=0 ? 1 : -1;

    ctx.strokeStyle = '#fdcb6e';

    ctx.beginPath();

    ctx.moveTo(
        particleX,
        trackY-25
    );

    ctx.lineTo(
        particleX +
        velLen*velDir,
        trackY-25
    );

    ctx.stroke();

    ctx.fillStyle = '#fdcb6e';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
        'v = ' + v.toFixed(1) + ' m/s',
        particleX,
        trackY-40
    );

    // Acceleration arrow

    const accLen =
        Math.min(
            Math.abs(a)*10,
            80
        );

    const accDir =
        a>=0 ? 1 : -1;

    ctx.strokeStyle = '#fdcb6e';

    ctx.beginPath();

    ctx.moveTo(
        particleX,
        trackY+28
    );

    ctx.lineTo(
        particleX +
        accLen*accDir,
        trackY+28
    );

    ctx.stroke();

    ctx.fillStyle = '#fdcb6e';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
        'a = ' + a.toFixed(1) + ' m/s²',
        particleX,
        trackY+45
    );

    // ======================
    // GRAPH AREA
    // ======================

    const graphTop =
        motionAreaH + 20;

    const graphAreaH =
        canvas.height -
        graphTop -
        10;

    let graphs = [];

    if(showST.checked){

        graphs.push({

            data:graphData.s,
            color:'#ffffff',
            title:'Displacement vs Time',
            unit:'m'
        });
    }

    if(showVT.checked){

        graphs.push({

            data:graphData.v,
            color:'#cccccc',
            title:'Velocity vs Time',
            unit:'m/s'
        });
    }

    if(showAT.checked){

        graphs.push({

            data:graphData.a,
            color:'#fdcb6e',
            title:'Acceleration vs Time',
            unit:'m/s²'
        });
    }

    const n = graphs.length;

    if(n===0) return;

    const margin = 15;

    let gw,gh,cols;

    if(n===1){

        cols = 1;

        gw =
            canvas.width-margin*2;

        gh =
            graphAreaH-margin*2;
    }
    else{

        cols = 2;

        gw =
            (canvas.width-margin*3)/2;

        gh =
            (graphAreaH-margin*3)/2;
    }

    for(let i=0;i<n;i++){

        const col = i%cols;

        const row =
            Math.floor(i/cols);

        const gx =
            margin +
            col*(gw+margin);

        const gy =
            graphTop +
            margin +
            row*(gh+margin);

        const g = graphs[i];

        drawGraph(
            gx,
            gy,
            gw,
            gh,
            g.data,
            g.color,
            g.title,
            g.unit
        );
    }
}

function animate(){

    if(
        !sim.running ||
        sim.paused
    ) return;

    sim.time += sim.dt;

    const vals =
        getMotionValues(sim.time);

    graphData.s.push({

        t:sim.time,
        val:vals.s
    });

    graphData.v.push({

        t:sim.time,
        val:vals.v
    });

    graphData.a.push({

        t:sim.time,
        val:vals.a
    });

    sim.trail.push(vals.s);

    updateStats();

    draw();

    requestAnimationFrame(
        animate
    );
}

reset();

// From: kinematics-uniform.html


// From: kinematics-uniform.html

const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');

let sim = {
    running:false,
    paused:false,
    time:0,
    dt:0.016
};

const maxGraphPoints = 5000;

let graphData = {
    s:[],
    v:[],
    a:[]
};

const uniformVelSlider =
    document.getElementById('uniformVel');

const showST =
    document.getElementById('showST');

const showVT =
    document.getElementById('showVT');

const showAT =
    document.getElementById('showAT');

const startBtn =
    document.getElementById('startBtn');

const pauseBtn =
    document.getElementById('pauseBtn');

const resetBtn =
    document.getElementById('resetBtn');

const statTime =
    document.getElementById('statTime');

const statDisp =
    document.getElementById('statDisp');

const statVel =
    document.getElementById('statVel');

const statAcc =
    document.getElementById('statAcc');

uniformVelSlider.addEventListener('input',()=>{

    document.getElementById('velVal').textContent =
        uniformVelSlider.value + ' m/s';

    if(!sim.running){

        reset();
    }
});

startBtn.addEventListener('click',()=>{

    if(!sim.running){

        sim.running = true;
        sim.paused = false;

        startBtn.disabled = true;
        startBtn.textContent = 'Running';

        pauseBtn.style.display = 'block';

        animate();
    }
});

pauseBtn.addEventListener('click',()=>{

    sim.paused = !sim.paused;

    pauseBtn.textContent =
        sim.paused ? 'Resume' : 'Pause';

    if(!sim.paused){

        animate();
    }
});

resetBtn.addEventListener('click', reset);

function reset(){

    sim.running = false;
    sim.paused = false;
    sim.time = 0;

    const v = parseFloat(uniformVelSlider.value);

    graphData = {

        s:[
            {t:0,val:0}
        ],

        v:[
            {t:0,val:v}
        ],

        a:[
            {t:0,val:0}
        ]
    };

    startBtn.disabled = false;
    startBtn.textContent = 'Start';

    pauseBtn.style.display = 'none';
    pauseBtn.textContent = 'Pause';

    updateStats();

    draw();
}

function updateStats(){

    const v =
        parseFloat(uniformVelSlider.value);

    const s = v * sim.time;

    statTime.textContent =
        sim.time.toFixed(2) + ' s';

    statDisp.textContent =
        s.toFixed(2) + ' m';

    statVel.textContent =
        v.toFixed(2) + ' m/s';

    statAcc.textContent =
        '0.00 m/s²';
}

function getMotionValues(t){

    const v =
        parseFloat(uniformVelSlider.value);

    return {

        s:v*t,
        v:v,
        a:0
    };
}

function drawGraph(
    x,
    y,
    w,
    h,
    data,
    color,
    title,
    unit
){

    if(data.length < 2){

        return;
    }

    ctx.fillStyle = '#111122';
    ctx.fillRect(x,y,w,h);

    ctx.strokeStyle =
        'rgba(255,255,255,0.15)';

    ctx.strokeRect(x,y,w,h);

    ctx.fillStyle = color;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';

    ctx.fillText(
        title,
        x+w/2,
        y+20
    );

    const values =
        data.map(p=>p.val);

    let yMin =
        Math.min(...values);

    let yMax =
        Math.max(...values);

    if(yMin === yMax){

        yMin -= 1;
        yMax += 1;
    }

    const timeWindow = 10;

    const tMax = sim.time;

    const tMin =
        Math.max(0,tMax-timeWindow);

    const padL = 55;
    const padR = 15;
    const padT = 30;
    const padB = 40;

    const gw = w-padL-padR;
    const gh = h-padT-padB;

    ctx.strokeStyle =
        'rgba(255,255,255,0.15)';

    ctx.lineWidth = 1;

    // Vertical grid

    for(let i=0;i<=5;i++){

        const tx =
            x+padL+(gw*i/5);

        ctx.beginPath();

        ctx.moveTo(tx,y+padT);

        ctx.lineTo(
            tx,
            y+padT+gh
        );

        ctx.stroke();
    }

    // Horizontal grid

    for(let i=0;i<=4;i++){

        const ty =
            y+padT+(gh*i/4);

        ctx.beginPath();

        ctx.moveTo(x+padL,ty);

        ctx.lineTo(
            x+padL+gw,
            ty
        );

        ctx.stroke();
    }

    // X axis labels

    ctx.fillStyle =
        'rgba(255,255,255,0.6)';

    ctx.font = '10px monospace';

    ctx.textAlign = 'center';

    for(let i=0;i<=5;i++){

        const tx =
            x+padL+(gw*i/5);

        const tVal =
            tMin + ((timeWindow*i)/5);

        ctx.fillText(
            tVal.toFixed(1),
            tx,
            y+padT+gh+15
        );
    }

    // Y axis labels

    ctx.textAlign = 'right';

    for(let i=0;i<=4;i++){

        const ty =
            y+padT+(gh*i/4);

        const yVal =
            yMax - ((yMax-yMin)*i/4);

        ctx.fillText(
            yVal.toFixed(1),
            x+padL-5,
            ty+3
        );
    }

    // Axis names

    ctx.textAlign = 'center';

    ctx.fillText(
        'Time (s)',
        x + padL + gw/2,
        y + h - 5
    );

    ctx.save();

    ctx.translate(
        x + 15,
        y + padT + gh/2
    );

    ctx.rotate(-Math.PI/2);

    ctx.fillText(
        title.split(' ')[0] + ' (' + unit + ')',
        0,
        0
    );

    ctx.restore();

    // Plot graph

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();

    let started = false;

    for(let i=0;i<data.length;i++){

        const tVal = data[i].t;
        const val = data[i].val;

        if(
            tVal < tMin ||
            tVal > tMax
        ){
            continue;
        }

        const px =
            x + padL +
            ((tVal-tMin)/timeWindow)*gw;

        const py =
            y + padT +
            gh * (
                1 -
                (val-yMin)/(yMax-yMin)
            );

        if(!started){

            ctx.moveTo(px,py);
            started = true;
        }
        else{

            ctx.lineTo(px,py);
        }
    }

    ctx.stroke();

    // Current point

    const last =
        data[data.length-1];

    const px =
        x + padL + gw;

    const py =
        y + padT +
        gh * (
            1 -
            (last.val-yMin)/(yMax-yMin)
        );

    ctx.fillStyle = color;

    ctx.beginPath();

    ctx.arc(
        px,
        py,
        5,
        0,
        Math.PI*2
    );

    ctx.fill();
}

function draw(){

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const bg =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    bg.addColorStop(0,'#000000');
    bg.addColorStop(1,'#000000');

    ctx.fillStyle = bg;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    let graphs = [];

    if(showST.checked){

        graphs.push({

            data:graphData.s,
            color:'#ffffff',
            title:'Displacement vs Time',
            unit:'m'
        });
    }

    if(showVT.checked){

        graphs.push({

            data:graphData.v,
            color:'#cccccc',
            title:'Velocity vs Time',
            unit:'m/s'
        });
    }

    if(showAT.checked){

        graphs.push({

            data:graphData.a,
            color:'#fdcb6e',
            title:'Acceleration vs Time',
            unit:'m/s²'
        });
    }

    const n = graphs.length;

    if(n===0){

        return;
    }

    const margin = 15;

    let gw,gh,cols;

    if(n===1){

        cols = 1;

        gw =
            canvas.width - margin*2;

        gh =
            canvas.height - margin*2;
    }
    else{

        cols = 2;

        gw =
            (canvas.width-margin*3)/2;

        gh =
            (canvas.height-margin*3)/2;
    }

    for(let i=0;i<n;i++){

        const col = i % cols;

        const row =
            Math.floor(i/cols);

        const gx =
            margin +
            col*(gw+margin);

        const gy =
            margin +
            row*(gh+margin);

        const g = graphs[i];

        drawGraph(
            gx,
            gy,
            gw,
            gh,
            g.data,
            g.color,
            g.title,
            g.unit
        );
    }
}

function animate(){

    if(
        !sim.running ||
        sim.paused
    ){
        return;
    }

    sim.time += sim.dt;

    const vals =
        getMotionValues(sim.time);

    graphData.s.push({

        t:sim.time,
        val:vals.s
    });

    graphData.v.push({

        t:sim.time,
        val:vals.v
    });

    graphData.a.push({

        t:sim.time,
        val:vals.a
    });

    if(graphData.s.length > maxGraphPoints)
        graphData.s.shift();

    if(graphData.v.length > maxGraphPoints)
        graphData.v.shift();

    if(graphData.a.length > maxGraphPoints)
        graphData.a.shift();

    updateStats();

    draw();

    requestAnimationFrame(animate);
}

reset();

// From: kinematics-variable.html


// From: kinematics-variable.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');

        let sim = {
            running: false,
            paused: false,
            time: 0,
            dt: 0.016
        };

        let graphData = { s: [], v: [], a: [] };
        const maxGraphPoints = 500;

        const coeffASlider = document.getElementById('coeffA');
        const coeffBSlider = document.getElementById('coeffB');
        const coeffCSlider = document.getElementById('coeffC');
        const coeffDSlider = document.getElementById('coeffD');
        const showST = document.getElementById('showST');
        const showVT = document.getElementById('showVT');
        const showAT = document.getElementById('showAT');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const statTime = document.getElementById('statTime');
        const statDisp = document.getElementById('statDisp');
        const statVel = document.getElementById('statVel');
        const statAcc = document.getElementById('statAcc');

        coeffASlider.addEventListener('input', () => {
            document.getElementById('coeffAVal').textContent = coeffASlider.value;
            if (!sim.running) reset();
        });

        coeffBSlider.addEventListener('input', () => {
            document.getElementById('coeffBVal').textContent = coeffBSlider.value;
            if (!sim.running) reset();
        });

        coeffCSlider.addEventListener('input', () => {
            document.getElementById('coeffCVal').textContent = coeffCSlider.value;
            if (!sim.running) reset();
        });

        coeffDSlider.addEventListener('input', () => {
            document.getElementById('coeffDVal').textContent = coeffDSlider.value;
            if (!sim.running) reset();
        });

        [showST, showVT, showAT].forEach(el => {
            el.addEventListener('change', () => { draw(); });
        });

        startBtn.addEventListener('click', () => {
            if (!sim.running) {
                sim.running = true;
                sim.paused = false;
                startBtn.disabled = true;
                startBtn.textContent = 'Running';
                pauseBtn.style.display = 'block';
                animate();
            }
        });

        pauseBtn.addEventListener('click', () => {
            sim.paused = !sim.paused;
            pauseBtn.textContent = sim.paused ? 'Resume' : 'Pause';
            if (!sim.paused) animate();
        });

        resetBtn.addEventListener('click', reset);

        function reset() {
            sim.running = false;
            sim.paused = false;
            sim.time = 0;

            const a = parseFloat(coeffASlider.value);
            const b = parseFloat(coeffBSlider.value);
            const c = parseFloat(coeffCSlider.value);
            const d = parseFloat(coeffDSlider.value);

            graphData = {
                s: [{t:0, val:d}],
                v: [{t:0, val:c}],
                a: [{t:0, val:2*b}]
            };

            startBtn.disabled = false;
            startBtn.textContent = 'Start';
            pauseBtn.style.display = 'none';
            pauseBtn.textContent = 'Pause';
            updateStats();
            draw();
        }

        function updateStats(){
            const a = parseFloat(coeffASlider.value);
            const b = parseFloat(coeffBSlider.value);
            const c = parseFloat(coeffCSlider.value);
            const d = parseFloat(coeffDSlider.value);
            const t = sim.time;

            const s = a*t*t*t + b*t*t + c*t + d;
            const v = 3*a*t*t + 2*b*t + c;
            const acc = 6*a*t + 2*b;

            statTime.textContent = sim.time.toFixed(2) + ' s';
            statDisp.textContent = s.toFixed(2) + ' m';
            statVel.textContent = v.toFixed(2) + ' m/s';
            statAcc.textContent = acc.toFixed(2) + ' m/s²';
        }

        function getMotionValues(t){
            const a = parseFloat(coeffASlider.value);
            const b = parseFloat(coeffBSlider.value);
            const c = parseFloat(coeffCSlider.value);
            const d = parseFloat(coeffDSlider.value);

            const s = a*t*t*t + b*t*t + c*t + d;
            const v = 3*a*t*t + 2*b*t + c;
            const acc = 6*a*t + 2*b;

            return {s, v, a:acc};
        }

        function drawGraph(x, y, w, h, data, color, title, unit){
            if(data.length < 2) return;

            ctx.fillStyle = '#111122';
            ctx.fillRect(x,y,w,h);
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.strokeRect(x,y,w,h);

            ctx.fillStyle = color;
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(title, x+w/2, y+20);

            const values = data.map(p=>p.val);
            let yMin = Math.min(...values);
            let yMax = Math.max(...values);
            if(yMin === yMax){
                yMin -= 1;
                yMax += 1;
            }

            const timeWindow = 10;
            const tMax = sim.time;
            const tMin = Math.max(0, tMax - timeWindow);

            const padL = 55;
            const padR = 15;
            const padT = 30;
            const padB = 40;
            const gw = w - padL - padR;
            const gh = h - padT - padB;

            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;

            for(let i=0; i<=5; i++){
                const tx = x + padL + (gw*i/5);
                ctx.beginPath();
                ctx.moveTo(tx, y+padT);
                ctx.lineTo(tx, y+padT+gh);
                ctx.stroke();
            }

            for(let i=0; i<=4; i++){
                const ty = y + padT + (gh*i/4);
                ctx.beginPath();
                ctx.moveTo(x+padL, ty);
                ctx.lineTo(x+padL+gw, ty);
                ctx.stroke();
            }

            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            for(let i=0; i<=5; i++){
                const tx = x + padL + (gw*i/5);
                const tVal = tMin + ((timeWindow*i)/5);
                ctx.fillText(tVal.toFixed(1), tx, y+padT+gh+15);
            }

            ctx.textAlign = 'right';
            for(let i=0; i<=4; i++){
                const ty = y + padT + (gh*i/4);
                const yVal = yMax - ((yMax-yMin)*i/4);
                ctx.fillText(yVal.toFixed(1), x+padL-5, ty+3);
            }

            ctx.textAlign = 'center';
            ctx.fillText('Time (s)', x + padL + gw/2, y + h - 5);

            ctx.save();
            ctx.translate(x + 15, y + padT + gh/2);
            ctx.rotate(-Math.PI/2);
            ctx.fillText(title.split(' ')[0] + ' (' + unit + ')', 0, 0);
            ctx.restore();

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            let started = false;

            for(let i=0; i<data.length; i++){
                const tVal = data[i].t;
                const val = data[i].val;

                if(tVal < tMin || tVal > tMax) continue;

                const px = x + padL + ((tVal - tMin)/timeWindow)*gw;
                const py = y + padT + gh * (1 - (val-yMin)/(yMax-yMin));

                if(!started){
                    ctx.moveTo(px, py);
                    started = true;
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.stroke();

            const last = data[data.length - 1];
            const px = x + padL + gw;
            const py = y + padT + gh * (1 - (last.val-yMin)/(yMax-yMin));

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI*2);
            ctx.fill();
        }

        function draw(){
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bg.addColorStop(0, '#000000');
            bg.addColorStop(1, '#000000');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let graphs = [];

            if(showST.checked){
                graphs.push({
                    data: graphData.s,
                    color: '#ffffff',
                    title: 'Displacement vs Time',
                    unit: 'm'
                });
            }

            if(showVT.checked){
                graphs.push({
                    data: graphData.v,
                    color: '#cccccc',
                    title: 'Velocity vs Time',
                    unit: 'm/s'
                });
            }

            if(showAT.checked){
                graphs.push({
                    data: graphData.a,
                    color: '#fdcb6e',
                    title: 'Acceleration vs Time',
                    unit: 'm/s²'
                });
            }

            const n = graphs.length;
            if(n === 0) return;

            const margin = 15;
            let gw, gh, cols;

            if(n === 1){
                cols = 1;
                gw = canvas.width - margin*2;
                gh = canvas.height - margin*2;
            } else {
                cols = 2;
                gw = (canvas.width - margin*3)/2;
                gh = (canvas.height - margin*3)/2;
            }

            for(let i=0; i<n; i++){
                const col = i % cols;
                const row = Math.floor(i/cols);
                const gx = margin + col*(gw+margin);
                const gy = margin + row*(gh+margin);
                const g = graphs[i];
                drawGraph(gx, gy, gw, gh, g.data, g.color, g.title, g.unit);
            }
        }

        function animate(){
            if(!sim.running || sim.paused) return;

            sim.time += sim.dt;
            const vals = getMotionValues(sim.time);

            graphData.s.push({t:sim.time, val:vals.s});
            graphData.v.push({t:sim.time, val:vals.v});
            graphData.a.push({t:sim.time, val:vals.a});

            if(graphData.s.length > maxGraphPoints) graphData.s.shift();
            if(graphData.v.length > maxGraphPoints) graphData.v.shift();
            if(graphData.a.length > maxGraphPoints) graphData.a.shift();

            updateStats();
            draw();
            requestAnimationFrame(animate);
        }

        reset();
    
// From: projectile-game.html


// From: projectile-game.html

const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');

let sim = {
    running:false,
    paused:false,
    time:0,
    dt:0.016,
    score:0,
    platformY:0,
    platformX:0,
    targetRadius:18,
    cannonY:0,
    trail:[]
};

const scale = 3;

const initHeightSlider = document.getElementById('cannonHeight');
const speedSlider = document.getElementById('projSpeed');
const angleSlider = document.getElementById('launchAngle');

const fireBtn = document.getElementById('fireBtn');
const resetBtn = document.getElementById('resetBtn');

const statG = document.getElementById('statG');
const statSpeed = document.getElementById('statSpeed');
const statAngle = document.getElementById('statAngle');
const statRange = document.getElementById('statRange');
const statTime = document.getElementById('statTime');
const statMaxH = document.getElementById('statMaxH');
const scoreVal = document.getElementById('scoreVal');
const resultFlash = document.getElementById('resultFlash');

initHeightSlider.addEventListener('input', ()=>{
    document.getElementById('cannonHVal').textContent = initHeightSlider.value + ' m';
    if(!sim.running) draw();
});

speedSlider.addEventListener('input', ()=>{
    document.getElementById('speedVal').textContent = speedSlider.value + ' m/s';
    updateTheoretical();
    if(!sim.running) draw();
});

angleSlider.addEventListener('input', ()=>{
    document.getElementById('angleVal').textContent = angleSlider.value + '°';
    updateTheoretical();
    if(!sim.running) draw();
});

fireBtn.addEventListener('click', fire);
resetBtn.addEventListener('click', reset);

function updateTheoretical(){
    const u = parseFloat(speedSlider.value);
    const theta = parseFloat(angleSlider.value) * Math.PI / 180;
    const g = 9.8;
    const range = (u*u * Math.sin(2*theta)) / g;
    const maxH = (u*u * Math.sin(theta)*Math.sin(theta)) / (2*g);
    const time = (2*u * Math.sin(theta)) / g;

    statRange.textContent = range.toFixed(1) + ' m';
    statMaxH.textContent = maxH.toFixed(1) + ' m';
    statTime.textContent = time.toFixed(1) + ' s';
}

function newTarget(){
    const groundY = canvas.height - 60;
    const minH = 100;
    const maxH = canvas.height - 200;
    sim.platformY = minH + Math.random() * (maxH - minH);
    sim.platformX = 350 + Math.random() * (canvas.width - 500);
    sim.targetRadius = 18 + Math.random() * 12;

    // Update cannon height slider to match target height
    const targetHeightM = (groundY - sim.platformY) / scale;
    initHeightSlider.max = Math.ceil(targetHeightM);
    initHeightSlider.value = Math.min(parseInt(initHeightSlider.value), Math.ceil(targetHeightM));
    document.getElementById('cannonHVal').textContent = initHeightSlider.value + ' m';
}

function fire(){
    if(sim.running) return;

    const u = parseFloat(speedSlider.value);
    const theta = parseFloat(angleSlider.value) * Math.PI / 180;
    const g = 9.8;
    const cannonH = parseFloat(initHeightSlider.value);

    sim.running = true;
    sim.paused = false;
    sim.time = 0;
    sim.trail = [];
    sim.startX = 60;
    sim.startY = canvas.height - 60 - cannonH * scale;
    sim.vx = u * Math.cos(theta);
    sim.vy = -u * Math.sin(theta);
    sim.g = g;
    sim.hit = false;
    sim.missed = false;

    fireBtn.disabled = true;
    fireBtn.textContent = 'Flying...';

    animate();
}

function reset(){
    sim.running = false;
    sim.paused = false;
    sim.time = 0;
    sim.trail = [];
    sim.score = 0;
    scoreVal.textContent = '0';
    resultFlash.classList.remove('show');

    fireBtn.disabled = false;
    fireBtn.textContent = 'Fire!';

    newTarget();
    updateTheoretical();
    draw();
}

function showResult(hit){
    resultFlash.textContent = hit ? '+5' : '-1';
    resultFlash.className = 'result-flash show ' + (hit ? 'hit' : 'miss');
    setTimeout(()=>{
        resultFlash.classList.remove('show');
    }, 800);
}

function animate(){
    if(!sim.running || sim.paused) return;

    sim.time += sim.dt;

    const u = parseFloat(speedSlider.value);
    const theta = parseFloat(angleSlider.value) * Math.PI / 180;
    const g = 9.8;

    const x = sim.startX + sim.vx * sim.time;
    const y = sim.startY + sim.vy * sim.time + 0.5 * sim.g * sim.time * sim.time;

    sim.trail.push({x, y});

    // Check collision with target
    const dx = x - sim.platformX;
    const dy = y - sim.platformY;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if(dist < sim.targetRadius + 8 && !sim.hit && !sim.missed){
        sim.hit = true;
        sim.running = false;
        sim.score += 5;
        scoreVal.textContent = sim.score;
        showResult(true);
        fireBtn.disabled = false;
        fireBtn.textContent = 'Fire Again';
        updateStats();
        draw();
        return;
    }

    // Check if ball hit ground
    const groundY = canvas.height - 60;
    if(y >= groundY && sim.time > 0.1){
        sim.missed = true;
        sim.running = false;
        sim.score -= 1;
        scoreVal.textContent = sim.score;
        showResult(false);
        fireBtn.disabled = false;
        fireBtn.textContent = 'Fire Again';
        updateStats();
        draw();
        return;
    }

    updateStats();
    draw();

    if(sim.running) requestAnimationFrame(animate);
}

function updateStats(){
    const u = parseFloat(speedSlider.value);
    const theta = parseFloat(angleSlider.value) * Math.PI / 180;
    const g = 9.8;

    const range = (u*u * Math.sin(2*theta)) / g;
    const maxH = (u*u * Math.sin(theta)*Math.sin(theta)) / (2*g);
    const time = (2*u * Math.sin(theta)) / g;

    statG.textContent = g.toFixed(1) + ' m/s²';
    statSpeed.textContent = u.toFixed(0) + ' m/s';
    statAngle.textContent = (theta * 180 / Math.PI).toFixed(0) + '°';
    statRange.textContent = range.toFixed(1) + ' m';
    statMaxH.textContent = maxH.toFixed(1) + ' m';
    statTime.textContent = time.toFixed(1) + ' s';
}

function draw(){
    ctx.fillStyle = '#000000';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const groundY = canvas.height - 60;

    // Ground
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    // Height markers on left
    ctx.fillStyle = '#fdcb6e';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';

    for(let mh = 0; mh <= 150; mh += 20){
        const my = groundY - mh * scale;
        if(my < 30) break;
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4,4]);
        ctx.beginPath();
        ctx.moveTo(60, my);
        ctx.lineTo(canvas.width-20, my);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText(mh+'m', 55, my+5);
    }

    // Draw target platform
    ctx.fillStyle = '#666666';
    ctx.fillRect(sim.platformX - 40, sim.platformY - 5, 80, 10);
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1;
    ctx.strokeRect(sim.platformX - 40, sim.platformY - 5, 80, 10);

    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sim.platformX, sim.platformY + 5);
    ctx.lineTo(sim.platformX, groundY);
    ctx.stroke();

    const glow = ctx.createRadialGradient(sim.platformX, sim.platformY, 0, sim.platformX, sim.platformY, sim.targetRadius * 2);
    glow.addColorStop(0, 'rgba(255,255,255,0.3)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sim.platformX, sim.platformY, sim.targetRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sim.platformX, sim.platformY, sim.targetRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fdcb6e';
    ctx.lineWidth = 2;
    ctx.stroke();

    const targetHeightM = (groundY - sim.platformY) / scale;
    ctx.fillStyle = '#fdcb6e';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('h=' + targetHeightM.toFixed(0) + 'm', sim.platformX, sim.platformY - sim.targetRadius - 12);

    // Draw cannon
    const theta = parseFloat(angleSlider.value) * Math.PI / 180;
    const cannonH = parseFloat(initHeightSlider.value);
    const cannonX = 60;
    const cannonBaseY = groundY;
    const cannonTopY = groundY - cannonH * scale;

    ctx.fillStyle = '#888888';
    ctx.fillRect(cannonX - 15, cannonTopY - 10, 30, cannonTopY - cannonBaseY + 10);
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 1;
    ctx.strokeRect(cannonX - 15, cannonTopY - 10, 30, cannonTopY - cannonBaseY + 10);

    ctx.save();
    ctx.translate(cannonX, cannonTopY);
    ctx.rotate(-theta);
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(0, -6, 50, 12);
    ctx.strokeStyle = '#cccccc';
    ctx.strokeRect(0, -6, 50, 12);
    ctx.restore();

    ctx.fillStyle = '#fdcb6e';
    ctx.beginPath();
    ctx.arc(cannonX, cannonTopY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Cannon height label
    ctx.fillStyle = '#fdcb6e';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('cannon h=' + cannonH + 'm', cannonX - 20, cannonTopY + 5);

    // Draw trajectory preview (dashed)
    if(!sim.running){
        const u = parseFloat(speedSlider.value);
        const g = 9.8;

        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5,5]);
        ctx.beginPath();

        let started = false;
        const totalTime = (2 * u * Math.sin(theta)) / g;

        for(let t = 0; t <= totalTime; t += 0.1){
            const px = cannonX + u * Math.cos(theta) * t;
            const py = cannonTopY - u * Math.sin(theta) * t + 0.5 * g * t * t;

            if(py > groundY) break;
            if(px > canvas.width - 20) break;

            if(!started){
                ctx.moveTo(px, py);
                started = true;
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draw fired projectile trail
    if(sim.trail.length > 1){
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sim.trail[0].x, sim.trail[0].y);
        for(let i = 1; i < sim.trail.length; i++){
            ctx.lineTo(sim.trail[i].x, sim.trail[i].y);
        }
        ctx.stroke();
    }

    // Draw fired projectile
    if(sim.running || sim.missed){
        const last = sim.trail[sim.trail.length - 1];
        if(last){
            const glow = ctx.createRadialGradient(last.x, last.y, 0, last.x, last.y, 20);
            glow.addColorStop(0, 'rgba(255,255,255,0.5)');
            glow.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(last.x, last.y, 20, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(last.x, last.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fdcb6e';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    // Draw hit effect
    if(sim.hit){
        const explodeR = 30 + sim.time * 50;
        ctx.strokeStyle = 'rgba(0,184,148,0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sim.platformX, sim.platformY, explodeR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sim.platformX, sim.platformY, explodeR * 0.6, 0, Math.PI * 2);
        ctx.stroke();
    }
}

updateTheoretical();
newTarget();
draw();

// From: projectile-motion-2d.html


// From: projectile-motion-2d.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');
        const inclineSlider = document.getElementById('incline');
        const launchSlider = document.getElementById('launch');
        const velSlider = document.getElementById('velocity');
        const gravSlider = document.getElementById('gravity');
        const launchBtn = document.getElementById('launchBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const showVectorsCheckbox = document.getElementById('showVectors');
        const launchFromTopCheckbox = document.getElementById('launchFromTop');

        let sim = { running: false, paused: false, time: 0, trail: [], maxHeight: 0, vx: 0, vy: 0 };

        function getParams() {
            document.getElementById('inclineVal').textContent = inclineSlider.value + '°';
            const incline = parseFloat(inclineSlider.value);
            const launch = parseFloat(launchSlider.value);
            const fromTop = launchFromTopCheckbox.checked;
            const displayAngle = fromTop ? (incline + launch) + '°' : launch + '°';
            document.getElementById('launchVal').textContent = displayAngle;
            document.getElementById('velVal').textContent = velSlider.value + ' m/s';
            document.getElementById('gravVal').textContent = gravSlider.value + ' m/s²';
            if (!sim.running) draw();
        }
        [inclineSlider, launchSlider, velSlider, gravSlider, showVectorsCheckbox, launchFromTopCheckbox].forEach(el => el.addEventListener('input', getParams));
        pauseBtn.addEventListener('click', togglePause);
        resetBtn.addEventListener('click', reset);

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && sim.running) {
                e.preventDefault();
                togglePause();
            }
        });

        function togglePause() {
            sim.paused = !sim.paused;
            pauseBtn.textContent = sim.paused ? 'Resume' : 'Pause';
            if (!sim.paused) animate();
        }

        function launch() {
            if (sim.running) return;
            sim.running = true;
            sim.paused = false;
            sim.time = 0;
            sim.trail = [];
            sim.maxHeight = 0;
            launchBtn.textContent = 'Running...';
            launchBtn.disabled = true;
            pauseBtn.style.display = 'inline-block';
            pauseBtn.textContent = 'Pause';
            const fromTop = launchFromTopCheckbox.checked;
            let ox = 100;
            let oy = fromTop ? 80 : canvas.height - 60;
            sim.trail.push({ x: ox, y: oy });
            requestAnimationFrame(animate);
        }

function reset() {
            sim.running = false;
            sim.paused = false;
            sim.time = 0;
            sim.trail = [];
            sim.postBounceTrail = [];
            sim.maxHeight = 0;
            sim.hitWall = false;
            launchBtn.textContent = 'Launch';
            launchBtn.disabled = false;
            pauseBtn.style.display = 'none';
            // Add initial point at origin
            const alpha = parseFloat(inclineSlider.value) * Math.PI / 180;
            const fromTop = launchFromTopCheckbox.checked;
            let ox = fromTop ? 100 : 100;
            let oy = fromTop ? 80 : canvas.height - 60;
            sim.trail.push({ x: ox, y: oy });
            draw();
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Background
            const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bgGrad.addColorStop(0, '#000000');
            bgGrad.addColorStop(1, '#000000');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const alpha = parseFloat(inclineSlider.value) * Math.PI / 180;
            const theta = parseFloat(launchSlider.value) * Math.PI / 180;
            const v0 = parseFloat(velSlider.value);
            const g = parseFloat(gravSlider.value);
            const scale = 5;
            const fromTop = launchFromTopCheckbox.checked;

            let originX, originY;
            if (fromTop) {
                originX = 100;
                originY = 80;
            } else {
                originX = 100;
                originY = canvas.height - 60;
            }

            // Draw incline
            const inclineLen = 500;
            let endX, endY;
            if (fromTop) {
                endX = originX + inclineLen * Math.cos(alpha);
                endY = originY + inclineLen * Math.sin(alpha);
            } else {
                endX = originX + inclineLen * Math.cos(alpha);
                endY = originY - inclineLen * Math.sin(alpha);
            }

            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(endX, endY);
            if (fromTop) {
                ctx.lineTo(endX + 20, canvas.height + 100);
                ctx.lineTo(originX - 20, canvas.height + 100);
            } else {
                ctx.lineTo(endX + 20, canvas.height);
                ctx.lineTo(originX - 20, canvas.height);
            }
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#444444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Incline angle arc
            ctx.strokeStyle = 'rgba(253, 203, 110, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            if (fromTop) {
                ctx.arc(originX, originY, 40, 0, alpha);
            } else {
                ctx.arc(originX, originY, 40, -alpha, 0);
            }
            ctx.stroke();
            ctx.fillStyle = '#fdcb6e';
            ctx.font = '11px monospace';
            if (fromTop) {
                ctx.fillText('a=' + (alpha * 180 / Math.PI).toFixed(0) + '°', originX + 50, originY + 25);
            } else {
                ctx.fillText('a=' + (alpha * 180 / Math.PI).toFixed(0) + '°', originX + 50, originY - 10);
            }

           // Draw trajectory
            if (sim.trail.length > 1) {
                ctx.strokeStyle = 'rgba(255,255,255,0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < sim.trail.length; i++) {
                    if (i === 0) ctx.moveTo(sim.trail[i].x, sim.trail[i].y);
                    else ctx.lineTo(sim.trail[i].x, sim.trail[i].y);
                }
                ctx.stroke();
            }

            // Preview
            if (!sim.running) {
                ctx.strokeStyle = 'rgba(253, 203, 110, 0.5)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([8, 6]);
                ctx.beginPath();
                let gAlpha, vAlpha, T, started = false;
                
if (fromTop) {
                    const relAngle = theta;
                    const vx0 = v0 * Math.cos(relAngle);
                    const vy0 = v0 * Math.sin(relAngle);
                    const T = 2 * vy0 / (g * Math.cos(alpha));
                    if (T > 0.01) {
                        for (let t = 0; t <= T; t += 0.05) {
                            const x = vx0 * t + 0.5 * g * Math.sin(alpha) * t * t;
                            const y = vy0 * t - 0.5 * g * Math.cos(alpha) * t * t;
                            const px = originX + x * Math.cos(alpha) * scale;
                            const py = originY + x * Math.sin(alpha) * scale - y * scale;
                            if (!started) { ctx.moveTo(px, py); started = true; }
                            else ctx.lineTo(px, py);
                        }
                    } else {
                        const px = originX;
                        const py = originY;
                        ctx.moveTo(px, py);
                        ctx.lineTo(px, py);
                    }
                } else {
                    gAlpha = g * Math.cos(alpha);
                    vAlpha = v0 * Math.sin(theta - alpha);
                    T = 2 * vAlpha / gAlpha;
                    for (let t = 0; t <= T + 0.1; t += 0.05) {
                        const x = v0 * Math.cos(theta - alpha) * t;
                        const y = v0 * Math.sin(theta - alpha) * t - 0.5 * gAlpha * t * t;
                        const hx = x * Math.cos(alpha) - y * Math.sin(alpha);
                        const hy = x * Math.sin(alpha) + y * Math.cos(alpha);
                        if (hy < 0) continue;
                        const px = originX + hx * scale;
                        const py = originY - hy * scale;
                        if (!started) { ctx.moveTo(px, py); started = true; }
                        else ctx.lineTo(px, py);
                    }
                }
                ctx.stroke();
                ctx.setLineDash([]);
            }

       // Ball
            if (sim.trail.length > 0) {
                const bx = sim.trail[sim.trail.length - 1].x;
                const by = sim.trail[sim.trail.length - 1].y;

                const glow = ctx.createRadialGradient(bx, by, 0, bx, by, 20);
                glow.addColorStop(0, 'rgba(255,255,255,0.3)');
                glow.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(bx, by, 10, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(bx, by, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Velocity vectors
                if (showVectorsCheckbox.checked) {
                    const vScale = 2;
                    const vx = sim.vx;
                    const vy = sim.vy;

                    // Total velocity (yellow)
                    ctx.strokeStyle = '#fdcb6e';
                    ctx.lineWidth = 2;
                    drawArrow(ctx, bx, by, bx + vx * vScale, by - vy * vScale, '#fdcb6e');

                    // Vx component (blue)
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.5;
                    drawArrow(ctx, bx, by, bx + vx * vScale, by, '#ffffff');

                    // Vy component (red)
                    ctx.strokeStyle = '#fdcb6e';
                    ctx.lineWidth = 1.5;
                    drawArrow(ctx, bx, by, bx, by - vy * vScale, '#fdcb6e');
                }
            }

            // Launch angle
            const launchLen = 50;
            let lx, ly;
            if (fromTop) {
                lx = originX + launchLen * Math.cos(theta);
                ly = originY - launchLen * Math.sin(theta);
            } else {
                lx = originX + launchLen * Math.cos(theta);
                ly = originY - launchLen * Math.sin(theta);
            }
            ctx.strokeStyle = '#fdcb6e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(lx, ly);
            ctx.stroke();
            ctx.fillStyle = '#fdcb6e';
            ctx.font = '10px monospace';
            if (fromTop) {
                ctx.fillText('?=' + (theta * 180 / Math.PI).toFixed(0) + '°', lx + 8, ly - 5);
            } else {
                ctx.fillText('?=' + (theta * 180 / Math.PI).toFixed(0) + '°', lx + 8, ly);
            }

            // Horizontal reference
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(originX + 120, originY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        function animate() {
            if (!sim.running || sim.paused) return;

            const dt = 0.016;
            sim.time += dt;

            const alpha = parseFloat(inclineSlider.value) * Math.PI / 180;
            const theta = parseFloat(launchSlider.value) * Math.PI / 180;
            const v0 = parseFloat(velSlider.value);
            const g = parseFloat(gravSlider.value);
            const scale = 5;
            const fromTop = launchFromTopCheckbox.checked;
            let originX, originY;

            if (fromTop) {
                originX = 100;
                originY = 80;
            } else {
                originX = 100;
                originY = canvas.height - 60;
            }
            let gAlpha, vAlpha, x, y, hx, hy;

            if (fromTop) {
                // Launching down the incline - angle measured from incline surface
                const vx0 = v0 * Math.cos(theta);
                const vy0 = v0 * Math.sin(theta);

                const T = 2 * vy0 / (g * Math.cos(alpha));

                const px = vx0 * sim.time + 0.5 * g * Math.sin(alpha) * sim.time * sim.time;
                const py = vy0 * sim.time - 0.5 * g * Math.cos(alpha) * sim.time * sim.time;

                // Screen coordinates (same as preview)
                const sx = originX + px * Math.cos(alpha) * scale;
                const sy = originY + px * Math.sin(alpha) * scale - py * scale;

                // Check if ball hits incline
                if (T > 0.01 && sim.time >= T) {
                    sim.running = false;
                    launchBtn.textContent = 'Launch';
                    launchBtn.disabled = false;
                    pauseBtn.style.display = 'none';
                    sim.time = T;
                    const pxFinal = vx0 * sim.time + 0.5 * g * Math.sin(alpha) * sim.time * sim.time;
                    const pyFinal = vy0 * sim.time - 0.5 * g * Math.cos(alpha) * sim.time * sim.time;
                    const sxFinal = originX + pxFinal * Math.cos(alpha) * scale;
                    const syFinal = originY + pxFinal * Math.sin(alpha) * scale - pyFinal * scale;
                    sim.trail.push({ x: sxFinal, y: syFinal });
                } else {
                    sim.trail.push({ x: sx, y: sy });
                }

                if (py > sim.maxHeight) sim.maxHeight = py;

                const vx = vx0 + g * Math.sin(alpha) * sim.time;
                const vy = vy0 - g * Math.cos(alpha) * sim.time;
                const speed = Math.sqrt(vx * vx + vy * vy);

                sim.vx = vx;
                sim.vy = vy;

                document.getElementById('statRange').textContent = px.toFixed(2) + ' m';
                document.getElementById('statTime').textContent = sim.time.toFixed(2) + ' s';
                document.getElementById('statHeight').textContent = sim.maxHeight.toFixed(2) + ' m';
                document.getElementById('statVel').textContent = speed.toFixed(2) + ' m/s';
                document.getElementById('statVx').textContent = vx.toFixed(2) + ' m/s';
                document.getElementById('statVy').textContent = vy.toFixed(2) + ' m/s';
       } else {
                // Launching up the incline (original)
                gAlpha = g * Math.cos(alpha);
                vAlpha = v0 * Math.sin(theta - alpha);
                const T = 2 * vAlpha / gAlpha;

                x = v0 * Math.cos(theta - alpha) * sim.time;
                y = v0 * Math.sin(theta - alpha) * sim.time - 0.5 * gAlpha * sim.time * sim.time;

                if (y < 0 && sim.time > 0.05) {
                    sim.running = false;
                    launchBtn.textContent = 'Launch';
                    launchBtn.disabled = false;
                    pauseBtn.style.display = 'none';
                }

                hx = x * Math.cos(alpha) - y * Math.sin(alpha);
                hy = x * Math.sin(alpha) + y * Math.cos(alpha);

                // Store screen coordinates
                const sx = originX + hx * scale;
                const sy = originY - hy * scale;

                sim.trail.push({ x: sx, y: sy });
                if (hy > sim.maxHeight) sim.maxHeight = hy;

                const vx = v0 * Math.cos(theta);
                const vy = v0 * Math.sin(theta) - g * sim.time;
                const speed = Math.sqrt(vx * vx + vy * vy);

                sim.vx = vx;
                sim.vy = vy;

                document.getElementById('statRange').textContent = hx.toFixed(2) + ' m';
                document.getElementById('statTime').textContent = sim.time.toFixed(2) + ' s';
                document.getElementById('statHeight').textContent = sim.maxHeight.toFixed(2) + ' m';
                document.getElementById('statVel').textContent = speed.toFixed(2) + ' m/s';
                document.getElementById('statVx').textContent = vx.toFixed(2) + ' m/s';
                document.getElementById('statVy').textContent = vy.toFixed(2) + ' m/s';
            }

            draw();
            if (sim.running) requestAnimationFrame(animate);
            else draw();
        }

        launchBtn.addEventListener('click', launch);
        resetBtn.addEventListener('click', reset);

        function drawArrow(ctx, x1, y1, x2, y2, color) {
            const headLen = 8;
            const angle = Math.atan2(y2 - y1, x2 - x1);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        }

        getParams();
        draw();
    
// From: projectile-motion.html


// From: projectile-motion.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');

       // Controls
        const angleSlider = document.getElementById('angle');
        const velocitySlider = document.getElementById('velocity');
        const gravitySlider = document.getElementById('gravity');
        const heightSlider = document.getElementById('launchHeight');
        const showTrailCheckbox = document.getElementById('showTrail');
        const showVectorsCheckbox = document.getElementById('showVectors');
        const enableCompareCheckbox = document.getElementById('enableCompare');
        const launchBtn = document.getElementById('launchBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');

        // Stats
        const statTime = document.getElementById('statTime');
        const statRange = document.getElementById('statRange');
        const statHeight = document.getElementById('statHeight');
        const statVelocity = document.getElementById('statVelocity');
        const statX = document.getElementById('statX');
        const statY = document.getElementById('statY');

      // Simulation state
        let sim = {
            running: false,
            paused: false,
            time: 0,
            angle: 45,
            velocity: 50,
            gravity: 9.8,
            launchHeight: 0,
            showTrail: true,
            showVectors: false,
            enableCompare: false,
            trail: [],
            maxHeight: 0,
            ball: { x: 0, y: 0, vx: 0, vy: 0 },
            scale: 5, // pixels per meter
            offsetX: 50,
            offsetY: 0
        };

        // Second projectile state
        let sim2 = {
            running: false,
            paused: false,
            time: 0,
            angle: 60,
            velocity: 45,
            trail: [],
            maxHeight: 0,
            ball: { x: 0, y: 0, vx: 0, vy: 0 }
        };

       function getParams() {
            sim.angle = parseFloat(angleSlider.value);
            sim.velocity = parseFloat(velocitySlider.value);
            sim.gravity = parseFloat(gravitySlider.value);
            sim.launchHeight = parseFloat(heightSlider.value);
            sim.showTrail = showTrailCheckbox.checked;
            sim.showVectors = showVectorsCheckbox.checked;
            sim.enableCompare = enableCompareCheckbox.checked;

            document.getElementById('angleVal').textContent = sim.angle + '°';
            document.getElementById('velocityVal').textContent = sim.velocity + ' m/s';
            document.getElementById('gravityVal').textContent = sim.gravity + ' m/s²';
            document.getElementById('heightVal').textContent = sim.launchHeight + ' m';

            if (sim.enableCompare) {
                sim2.angle = 60;
                sim2.velocity = 45;
            }

            if (!sim.running) draw();
        }

        // Event listeners
        [angleSlider, velocitySlider, gravitySlider, heightSlider, showTrailCheckbox, showVectorsCheckbox, enableCompareCheckbox].forEach(el => {
            el.addEventListener('input', getParams);
        });

        pauseBtn.addEventListener('click', togglePause);
        resetBtn.addEventListener('click', reset);

        // Spacebar to pause/resume
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && sim.running) {
                e.preventDefault();
                togglePause();
            }
        });

        function togglePause() {
            if (!sim.running) return;
            sim.paused = !sim.paused;
            sim2.paused = sim2.paused;
            pauseBtn.textContent = sim.paused ? 'Resume' : 'Pause';
            if (!sim.paused) {
                animate();
            }
        }

        function launch() {
            if (sim.running) return;
            sim.running = true;
            sim.paused = false;
            sim.time = 0;
            sim.trail = [];
            sim.maxHeight = 0;

            const rad = sim.angle * Math.PI / 180;
            sim.ball.vx = sim.velocity * Math.cos(rad);
            sim.ball.vy = sim.velocity * Math.sin(rad);
            sim.ball.x = 0;
            sim.ball.y = sim.launchHeight;

            launchBtn.textContent = 'Running...';
            launchBtn.disabled = true;
            pauseBtn.style.display = 'inline-block';
            pauseBtn.textContent = 'Pause';

            if (sim.enableCompare) {
                sim2.running = true;
                sim2.paused = false;
                sim2.time = 0;
                sim2.trail = [];
                sim2.maxHeight = 0;
                const rad2 = sim2.angle * Math.PI / 180;
                sim2.ball.vx = sim2.velocity * Math.cos(rad2);
                sim2.ball.vy = sim2.velocity * Math.sin(rad2);
                sim2.ball.x = 0;
                sim2.ball.y = sim.launchHeight;
            }
        }

        function reset() {
            sim.running = false;
            sim.paused = false;
            sim.time = 0;
            sim.trail = [];
            sim.maxHeight = 0;
            sim.ball = { x: 0, y: 0, vx: 0, vy: 0 };
            sim2.running = false;
            sim2.paused = false;
            sim2.time = 0;
            sim2.trail = [];
            sim2.maxHeight = 0;
            sim2.ball = { x: 0, y: 0, vx: 0, vy: 0 };
            launchBtn.textContent = 'Launch';
            launchBtn.disabled = false;
            pauseBtn.style.display = 'none';
            updateStats();
            draw();
        }

        function updateStats() {
            const speed = Math.sqrt(sim.ball.vx * sim.ball.vx + sim.ball.vy * sim.ball.vy);
            statTime.textContent = sim.time.toFixed(2) + ' s';
            statRange.textContent = sim.ball.x.toFixed(2) + ' m';
            statHeight.textContent = sim.maxHeight.toFixed(2) + ' m';
            statVelocity.textContent = speed.toFixed(2) + ' m/s';
            statX.textContent = sim.ball.x.toFixed(2) + ' m';
            statY.textContent = sim.ball.y.toFixed(2) + ' m';
        }

        function toCanvasX(meters) {
            return sim.offsetX + meters * sim.scale;
        }

        function toCanvasY(meters) {
            return canvas.height - sim.offsetY - meters * sim.scale;
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Background gradient
            const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bgGrad.addColorStop(0, '#000000');
            bgGrad.addColorStop(1, '#000000');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Ground
            const groundY = toCanvasY(0);
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

            // Ground line
            ctx.strokeStyle = '#444444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(canvas.width, groundY);
            ctx.stroke();

            // Grid
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            for (let m = 0; m * sim.scale + sim.offsetX < canvas.width; m += 10) {
                ctx.beginPath();
                ctx.moveTo(toCanvasX(m), 0);
                ctx.lineTo(toCanvasX(m), canvas.height);
                ctx.stroke();

                // Labels
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.font = '10px monospace';
                ctx.fillText(m + 'm', toCanvasX(m) + 3, groundY + 15);
            }

            for (let m = 0; m * sim.scale + sim.offsetY < canvas.height; m += 10) {
                ctx.beginPath();
                ctx.moveTo(0, toCanvasY(m));
                ctx.lineTo(canvas.width, toCanvasY(m));
                ctx.stroke();

                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fillText(m + 'm', 5, toCanvasY(m) - 3);
            }

            // Trajectory trail
            if (sim.showTrail && sim.trail.length > 1) {
                ctx.strokeStyle = 'rgba(255,255,255,0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < sim.trail.length; i++) {
                    const px = toCanvasX(sim.trail[i].x);
                    const py = toCanvasY(sim.trail[i].y);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();
            }

            // Second projectile trail
            if (sim.enableCompare && sim2.trail.length > 1) {
                ctx.strokeStyle = 'rgba(255,255,255,0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < sim2.trail.length; i++) {
                    const px = toCanvasX(sim2.trail[i].x);
                    const py = toCanvasY(sim2.trail[i].y);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();
            }

            // Dashed parabola preview
            if (!sim.running) {
                const rad = sim.angle * Math.PI / 180;
                const v0 = sim.velocity;
                const g = sim.gravity;
                const h0 = sim.launchHeight;

                ctx.strokeStyle = 'rgba(253, 203, 110, 0.5)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([8, 6]);
                ctx.beginPath();

                const totalTime = (v0 * Math.sin(rad) + Math.sqrt(v0 * v0 * Math.sin(rad) * Math.sin(rad) + 2 * g * h0)) / g;
                let started = false;

                for (let t = 0; t <= totalTime; t += 0.1) {
                    const x = v0 * Math.cos(rad) * t;
                    const y = h0 + v0 * Math.sin(rad) * t - 0.5 * g * t * t;
                    if (y < 0) break;
                    const px = toCanvasX(x);
                    const py = toCanvasY(y);
                    if (!started) { ctx.moveTo(px, py); started = true; }
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Velocity vectors
            if (sim.showVectors && sim.running) {
                const bx = toCanvasX(sim.ball.x);
                const by = toCanvasY(sim.ball.y);
                const vScale = 2;

                // Velocity vector
                ctx.strokeStyle = '#fdcb6e';
                ctx.lineWidth = 2;
                drawArrow(bx, by, bx + sim.ball.vx * vScale, by - sim.ball.vy * vScale, '#fdcb6e');

                // vx component
                ctx.strokeStyle = '#ffffff';
                drawArrow(bx, by, bx + sim.ball.vx * vScale, by, '#ffffff');

                // vy component
                ctx.strokeStyle = '#fdcb6e';
                drawArrow(bx, by, bx, by - sim.ball.vy * vScale, '#fdcb6e');
            }

            // Cannon
            const cannonX = toCanvasX(0);
            const cannonY = toCanvasY(sim.launchHeight);
            const rad = sim.angle * Math.PI / 180;

            ctx.save();
            ctx.translate(cannonX, cannonY);
            ctx.rotate(-rad);
            ctx.fillStyle = '#cccccc';
            ctx.fillRect(0, -5, 40, 10);
            ctx.restore();

            // Cannon base
            ctx.fillStyle = '#cccccc';
            ctx.beginPath();
            ctx.arc(cannonX, cannonY, 10, 0, Math.PI * 2);
            ctx.fill();

            // Ball
            if (sim.running || sim.time > 0) {
                const bx = toCanvasX(sim.ball.x);
                const by = toCanvasY(sim.ball.y);
                const ballSize = 6;

                // Glow
                const glow = ctx.createRadialGradient(bx, by, 0, bx, by, ballSize * 3);
                glow.addColorStop(0, 'rgba(255,255,255,0.3)');
                glow.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(bx, by, ballSize * 3, 0, Math.PI * 2);
                ctx.fill();

                // Ball
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(bx, by, ballSize, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Second projectile (compare mode)
            if (sim.enableCompare && (sim2.running || sim2.time > 0)) {
                const bx2 = toCanvasX(sim2.ball.x);
                const by2 = toCanvasY(sim2.ball.y);
                const ballSize2 = 6;

                // Glow
                const glow2 = ctx.createRadialGradient(bx2, by2, 0, bx2, by2, ballSize2 * 3);
                glow2.addColorStop(0, 'rgba(255,255,255,0.3)');
                glow2.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = glow2;
                ctx.beginPath();
                ctx.arc(bx2, by2, ballSize2 * 3, 0, Math.PI * 2);
                ctx.fill();

                // Ball
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(bx2, by2, ballSize2, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Max height marker
            if (sim.maxHeight > 0 && sim.trail.length > 0) {
                const maxPoint = sim.trail.reduce((max, p) => p.y > max.y ? p : max, sim.trail[0]);
                ctx.strokeStyle = 'rgba(253, 203, 110, 0.5)';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(0, toCanvasY(maxPoint.y));
                ctx.lineTo(canvas.width, toCanvasY(maxPoint.y));
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = '#fdcb6e';
                ctx.font = 'bold 11px monospace';
                ctx.fillText('H = ' + maxPoint.y.toFixed(1) + 'm', toCanvasX(maxPoint.x) + 10, toCanvasY(maxPoint.y) - 8);
            }
        }

        function drawArrow(x1, y1, x2, y2, color) {
            const headLen = 8;
            const angle = Math.atan2(y2 - y1, x2 - x1);

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        }

        function animate() {
            if ((!sim.running && !sim2.running) || (sim.paused && sim2.paused)) return;
            if (sim.paused || sim2.paused) return;

            const dt = 0.016;
            sim.time += dt;

            const rad = sim.angle * Math.PI / 180;
            sim.ball.x = sim.velocity * Math.cos(rad) * sim.time;
            sim.ball.y = sim.launchHeight + sim.velocity * Math.sin(rad) * sim.time - 0.5 * sim.gravity * sim.time * sim.time;

            sim.ball.vy = sim.velocity * Math.sin(rad) - sim.gravity * sim.time;

            if (sim.ball.y > sim.maxHeight) sim.maxHeight = sim.ball.y;

            sim.trail.push({ x: sim.ball.x, y: sim.ball.y });

            // Check landing
            if (sim.ball.y <= 0 && sim.time > 0.1) {
                sim.ball.y = 0;
                sim.running = false;
                sim.trail.push({ x: sim.ball.x, y: 0 });
            }

            if (!sim.running && !sim2.running) {
                launchBtn.textContent = 'Launch';
                launchBtn.disabled = false;
                pauseBtn.style.display = 'none';
            }

            // Second projectile
            if (sim.enableCompare && sim2.running && !sim2.paused) {
                sim2.time += dt;
                const rad2 = sim2.angle * Math.PI / 180;
                sim2.ball.x = sim2.velocity * Math.cos(rad2) * sim2.time;
                sim2.ball.y = sim.launchHeight + sim2.velocity * Math.sin(rad2) * sim2.time - 0.5 * sim.gravity * sim2.time * sim2.time;

                if (sim2.ball.y > sim2.maxHeight) sim2.maxHeight = sim2.ball.y;

                sim2.trail.push({ x: sim2.ball.x, y: sim2.ball.y });

                if (sim2.ball.y <= 0 && sim2.time > 0.1) {
                    sim2.ball.y = 0;
                    sim2.running = false;
                    sim2.trail.push({ x: sim2.ball.x, y: 0 });
                }

                if (!sim.running && !sim2.running) {
                    launchBtn.textContent = 'Launch';
                    launchBtn.disabled = false;
                    pauseBtn.style.display = 'none';
                }
            }

            updateStats();
            draw();

            if (sim.running || sim2.running) {
                requestAnimationFrame(animate);
            } else {
                draw();
            }
        }

        // Start animation loop on launch
        launchBtn.addEventListener('click', () => {
            if (!sim.running) {
                launch();
                requestAnimationFrame(animate);
            }
        });

        // Initial draw
        getParams();
        draw();
    
// From: projectile-target.html


// From: projectile-target.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');

        const angleSlider = document.getElementById('angle');
        const velocitySlider = document.getElementById('velocity');
        const tDistSlider = document.getElementById('tDist');
        const gravitySlider = document.getElementById('gravity');
        const fireBtn = document.getElementById('fireBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');

        const statRange = document.getElementById('statRange');
        const statTarget = document.getElementById('statTarget');
        const statResult = document.getElementById('statResult');
        const statError = document.getElementById('statError');
        const statHits = document.getElementById('statHits');
        const statAttempts = document.getElementById('statAttempts');

        let sim = { running: false, paused: false, time: 0, angle: 45, velocity: 50, trail: [], maxHeight: 0, ball: { x: 0, y: 0, vx: 0, vy: 0 } };
        let targetDist = 150;
        let gravity = 9.8;
        let hits = 0;
        let attempts = 0;
        const scale = 5;
        const offsetX = 50;
        const offsetY = 0;

        function toCanvasX(meters) { return offsetX + meters * scale; }
        function toCanvasY(meters) { return canvas.height - offsetY - meters * scale; }

        function getParams() {
            sim.angle = parseFloat(angleSlider.value);
            sim.velocity = parseFloat(velocitySlider.value);
            targetDist = parseFloat(tDistSlider.value);
            gravity = parseFloat(gravitySlider.value);

            document.getElementById('angleVal').textContent = sim.angle + '°';
            document.getElementById('velVal').textContent = sim.velocity + ' m/s';
            document.getElementById('tDistVal').textContent = targetDist + ' m';
            document.getElementById('gravityVal').textContent = gravity + ' m/s²';
            document.getElementById('statTarget').textContent = targetDist + ' m';

            if (!sim.running) draw();
        }

        [angleSlider, velocitySlider, tDistSlider, gravitySlider].forEach(el => {
            el.addEventListener('input', getParams);
        });

        pauseBtn.addEventListener('click', togglePause);
        resetBtn.addEventListener('click', reset);

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && sim.running) {
                e.preventDefault();
                togglePause();
            }
        });

        function togglePause() {
            sim.paused = !sim.paused;
            pauseBtn.textContent = sim.paused ? 'Resume' : 'Pause';
            if (!sim.paused) animate();
        }

        function fire() {
            sim.running = true;
            sim.paused = false;
            sim.time = 0;
            sim.trail = [];
            sim.maxHeight = 0;
            const rad = sim.angle * Math.PI / 180;
            sim.ball.vx = sim.velocity * Math.cos(rad);
            sim.ball.vy = sim.velocity * Math.sin(rad);
            sim.ball.x = 0;
            sim.ball.y = 0;

            fireBtn.textContent = 'Flying...';
            fireBtn.disabled = true;
            pauseBtn.style.display = 'inline-block';
            pauseBtn.textContent = 'Pause';
            statResult.textContent = '-';
            statResult.className = 'val';
            statError.textContent = '-';
        }

        function reset() {
            sim = { running: false, paused: false, time: 0, angle: sim.angle, velocity: sim.velocity, trail: [], maxHeight: 0, ball: { x: 0, y: 0, vx: 0, vy: 0 } };
            fireBtn.textContent = 'Fire!';
            fireBtn.disabled = false;
            pauseBtn.style.display = 'none';
            updateStats();
            draw();
        }

        function updateStats() {
            statRange.textContent = sim.ball.x.toFixed(2) + ' m';
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bgGrad.addColorStop(0, '#000000');
            bgGrad.addColorStop(1, '#000000');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const groundY = toCanvasY(0);
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
            ctx.strokeStyle = '#444444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(canvas.width, groundY);
            ctx.stroke();

            // Target
            const tx = toCanvasX(targetDist);
            ctx.strokeStyle = '#fdcb6e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(tx, groundY - 20, 15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(tx, groundY - 20, 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#fdcb6e';
            ctx.beginPath();
            ctx.arc(tx, groundY - 20, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Target', tx, groundY + 15);

            // Trail
            if (sim.trail.length > 1) {
                ctx.strokeStyle = 'rgba(253, 203, 110, 0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < sim.trail.length; i++) {
                    const px = toCanvasX(sim.trail[i].x);
                    const py = toCanvasY(sim.trail[i].y);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();
            }

            // Ball
            if (sim.ball.x > 0 || sim.ball.y > 0) {
                const bx = toCanvasX(sim.ball.x);
                const by = toCanvasY(sim.ball.y);
                ctx.fillStyle = '#fdcb6e';
                ctx.beginPath();
                ctx.arc(bx, by, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Cannon
            const cannonX = toCanvasX(0);
            const cannonY = toCanvasY(0);
            const rad = sim.angle * Math.PI / 180;
            ctx.save();
            ctx.translate(cannonX, cannonY);
            ctx.rotate(-rad);
            ctx.fillStyle = '#cccccc';
            ctx.fillRect(0, -5, 40, 10);
            ctx.restore();
            ctx.fillStyle = '#cccccc';
            ctx.beginPath();
            ctx.arc(cannonX, cannonY, 10, 0, Math.PI * 2);
            ctx.fill();
        }

        function animate() {
            if (!sim.running || sim.paused) return;

            const dt = 0.016;
            sim.time += dt;
            const rad = sim.angle * Math.PI / 180;
            sim.ball.x = sim.velocity * Math.cos(rad) * sim.time;
            sim.ball.y = sim.velocity * Math.sin(rad) * sim.time - 0.5 * gravity * sim.time * sim.time;

            if (sim.ball.y > sim.maxHeight) sim.maxHeight = sim.ball.y;
            sim.trail.push({ x: sim.ball.x, y: sim.ball.y });

            if (sim.ball.y <= 0 && sim.time > 0.1) {
                sim.ball.y = 0;
                sim.running = false;
                attempts++;
                const error = Math.abs(sim.ball.x - targetDist);
                const isHit = error < 5;

                if (isHit) {
                    hits++;
                    statResult.textContent = 'HIT!';
                    statResult.className = 'val hit';
                } else {
                    statResult.textContent = 'MISS';
                    statResult.className = 'val miss';
                }
                statError.textContent = error.toFixed(1) + ' m';
                statHits.textContent = hits;
                statAttempts.textContent = attempts;

                sim.trail.push({ x: sim.ball.x, y: 0 });
                fireBtn.textContent = 'Fire!';
                fireBtn.disabled = false;
                pauseBtn.style.display = 'none';
            }

            updateStats();
            draw();

            if (sim.running) {
                requestAnimationFrame(animate);
            } else {
                draw();
            }
        }

        fireBtn.addEventListener('click', () => {
            if (!sim.running) {
                fire();
                requestAnimationFrame(animate);
            }
        });

        getParams();
        draw();
    
// From: projectile-two.html


// From: projectile-two.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');

        const angle1Slider = document.getElementById('angle1');
        const velocity1Slider = document.getElementById('velocity1');
        const angle2Slider = document.getElementById('angle2');
        const velocity2Slider = document.getElementById('velocity2');
        const gravitySlider = document.getElementById('gravity');
        const launchBtn = document.getElementById('launchBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');

        const statTime1 = document.getElementById('statTime1');
        const statTime2 = document.getElementById('statTime2');
        const statRange1 = document.getElementById('statRange1');
        const statRange2 = document.getElementById('statRange2');
        const statHeight1 = document.getElementById('statHeight1');
        const statHeight2 = document.getElementById('statHeight2');

        let sim1 = { running: false, paused: false, time: 0, angle: 45, velocity: 50, trail: [], maxHeight: 0, ball: { x: 0, y: 0, vx: 0, vy: 0 } };
        let sim2 = { running: false, paused: false, time: 0, angle: 60, velocity: 45, trail: [], maxHeight: 0, ball: { x: 0, y: 0, vx: 0, vy: 0 } };
        let gravity = 9.8;
        const scale = 5;
        const offsetX = 50;
        const offsetY = 0;

        function toCanvasX(meters) { return offsetX + meters * scale; }
        function toCanvasY(meters) { return canvas.height - offsetY - meters * scale; }

        function getParams() {
            sim1.angle = parseFloat(angle1Slider.value);
            sim1.velocity = parseFloat(velocity1Slider.value);
            sim2.angle = parseFloat(angle2Slider.value);
            sim2.velocity = parseFloat(velocity2Slider.value);
            gravity = parseFloat(gravitySlider.value);

            document.getElementById('angle1Val').textContent = sim1.angle + '°';
            document.getElementById('vel1Val').textContent = sim1.velocity + ' m/s';
            document.getElementById('angle2Val').textContent = sim2.angle + '°';
            document.getElementById('vel2Val').textContent = sim2.velocity + ' m/s';
            document.getElementById('gravityVal').textContent = gravity + ' m/s²';

            if (!sim1.running && !sim2.running) draw();
        }

        [angle1Slider, velocity1Slider, angle2Slider, velocity2Slider, gravitySlider].forEach(el => {
            el.addEventListener('input', getParams);
        });

        pauseBtn.addEventListener('click', togglePause);
        resetBtn.addEventListener('click', reset);

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && (sim1.running || sim2.running)) {
                e.preventDefault();
                togglePause();
            }
        });

        function togglePause() {
            sim1.paused = !sim1.paused;
            sim2.paused = !sim2.paused;
            pauseBtn.textContent = sim1.paused ? 'Resume' : 'Pause';
            if (!sim1.paused) animate();
        }

        function launch() {
            sim1.running = true; sim1.paused = false; sim1.time = 0; sim1.trail = []; sim1.maxHeight = 0;
            const rad1 = sim1.angle * Math.PI / 180;
            sim1.ball.vx = sim1.velocity * Math.cos(rad1);
            sim1.ball.vy = sim1.velocity * Math.sin(rad1);
            sim1.ball.x = 0; sim1.ball.y = 0;

            sim2.running = true; sim2.paused = false; sim2.time = 0; sim2.trail = []; sim2.maxHeight = 0;
            const rad2 = sim2.angle * Math.PI / 180;
            sim2.ball.vx = sim2.velocity * Math.cos(rad2);
            sim2.ball.vy = sim2.velocity * Math.sin(rad2);
            sim2.ball.x = 0; sim2.ball.y = 0;

            launchBtn.textContent = 'Running...';
            launchBtn.disabled = true;
            pauseBtn.style.display = 'inline-block';
            pauseBtn.textContent = 'Pause';
        }

        function reset() {
            sim1 = { running: false, paused: false, time: 0, angle: sim1.angle, velocity: sim1.velocity, trail: [], maxHeight: 0, ball: { x: 0, y: 0, vx: 0, vy: 0 } };
            sim2 = { running: false, paused: false, time: 0, angle: sim2.angle, velocity: sim2.velocity, trail: [], maxHeight: 0, ball: { x: 0, y: 0, vx: 0, vy: 0 } };
            launchBtn.textContent = 'Launch Both';
            launchBtn.disabled = false;
            pauseBtn.style.display = 'none';
            updateStats();
            draw();
        }

        function updateStats() {
            statTime1.textContent = sim1.time.toFixed(2) + ' s';
            statTime2.textContent = sim2.time.toFixed(2) + ' s';
            statRange1.textContent = sim1.ball.x.toFixed(2) + ' m';
            statRange2.textContent = sim2.ball.x.toFixed(2) + ' m';
            statHeight1.textContent = sim1.maxHeight.toFixed(2) + ' m';
            statHeight2.textContent = sim2.maxHeight.toFixed(2) + ' m';
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bgGrad.addColorStop(0, '#000000');
            bgGrad.addColorStop(1, '#000000');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const groundY = toCanvasY(0);
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
            ctx.strokeStyle = '#444444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(canvas.width, groundY);
            ctx.stroke();

            // Trail 1
            if (sim1.trail.length > 1) {
                ctx.strokeStyle = 'rgba(255,255,255,0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < sim1.trail.length; i++) {
                    const px = toCanvasX(sim1.trail[i].x);
                    const py = toCanvasY(sim1.trail[i].y);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();
            }

            // Trail 2
            if (sim2.trail.length > 1) {
                ctx.strokeStyle = 'rgba(255,255,255,0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < sim2.trail.length; i++) {
                    const px = toCanvasX(sim2.trail[i].x);
                    const py = toCanvasY(sim2.trail[i].y);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();
            }

            // Ball 1
            if (sim1.ball.x > 0 || sim1.ball.y > 0) {
                const bx1 = toCanvasX(sim1.ball.x);
                const by1 = toCanvasY(sim1.ball.y);
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(bx1, by1, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Ball 2
            if (sim2.ball.x > 0 || sim2.ball.y > 0) {
                const bx2 = toCanvasX(sim2.ball.x);
                const by2 = toCanvasY(sim2.ball.y);
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(bx2, by2, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Cannon
            const cannonX = toCanvasX(0);
            const cannonY = toCanvasY(0);
            const rad1 = sim1.angle * Math.PI / 180;
            ctx.save();
            ctx.translate(cannonX, cannonY);
            ctx.rotate(-rad1);
            ctx.fillStyle = '#cccccc';
            ctx.fillRect(0, -5, 40, 10);
            ctx.restore();
            ctx.fillStyle = '#cccccc';
            ctx.beginPath();
            ctx.arc(cannonX, cannonY, 10, 0, Math.PI * 2);
            ctx.fill();
        }

        function animate() {
            if ((!sim1.running && !sim2.running) || (sim1.paused && sim2.paused)) return;
            if (sim1.paused || sim2.paused) return;

            const dt = 0.016;

            if (sim1.running) {
                sim1.time += dt;
                const rad1 = sim1.angle * Math.PI / 180;
                sim1.ball.x = sim1.velocity * Math.cos(rad1) * sim1.time;
                sim1.ball.y = sim1.velocity * Math.sin(rad1) * sim1.time - 0.5 * gravity * sim1.time * sim1.time;
                if (sim1.ball.y > sim1.maxHeight) sim1.maxHeight = sim1.ball.y;
                sim1.trail.push({ x: sim1.ball.x, y: sim1.ball.y });
                if (sim1.ball.y <= 0 && sim1.time > 0.1) {
                    sim1.ball.y = 0;
                    sim1.running = false;
                    sim1.trail.push({ x: sim1.ball.x, y: 0 });
                }
            }

            if (sim2.running) {
                sim2.time += dt;
                const rad2 = sim2.angle * Math.PI / 180;
                sim2.ball.x = sim2.velocity * Math.cos(rad2) * sim2.time;
                sim2.ball.y = sim2.velocity * Math.sin(rad2) * sim2.time - 0.5 * gravity * sim2.time * sim2.time;
                if (sim2.ball.y > sim2.maxHeight) sim2.maxHeight = sim2.ball.y;
                sim2.trail.push({ x: sim2.ball.x, y: sim2.ball.y });
                if (sim2.ball.y <= 0 && sim2.time > 0.1) {
                    sim2.ball.y = 0;
                    sim2.running = false;
                    sim2.trail.push({ x: sim2.ball.x, y: 0 });
                }
            }

            if (!sim1.running && !sim2.running) {
                launchBtn.textContent = 'Launch Both';
                launchBtn.disabled = false;
                pauseBtn.style.display = 'none';
            }

            updateStats();
            draw();

            if (sim1.running || sim2.running) {
                requestAnimationFrame(animate);
            } else {
                draw();
            }
        }

        launchBtn.addEventListener('click', () => {
            if (!sim1.running && !sim2.running) {
                launch();
                requestAnimationFrame(animate);
            }
        });

        getParams();
        draw();
    
// From: projectile-wall.html


// From: projectile-wall.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');
        const angleSlider = document.getElementById('angle');
        const velSlider = document.getElementById('velocity');
        const wallSlider = document.getElementById('wall');
        const wallHSlider = document.getElementById('wallH');
        const gravSlider = document.getElementById('gravity');
        const corSlider = document.getElementById('cor');
        const launchBtn = document.getElementById('launchBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');

        let sim = { running: false, paused: false, time: 0, trail: [], maxHeight: 0, vx: 0, vy: 0, hitWall: false, bounceCount: 0, postBounceTrail: [] };

        function getParams() {
            document.getElementById('angleVal').textContent = angleSlider.value + '°';
            document.getElementById('velVal').textContent = velSlider.value + ' m/s';
            document.getElementById('wallVal').textContent = wallSlider.value + ' m';
            document.getElementById('wallHVal').textContent = wallHSlider.value + ' m';
            document.getElementById('gravVal').textContent = gravSlider.value + ' m/s²';
            document.getElementById('corVal').textContent = corSlider.value;

            const cor = parseFloat(corSlider.value);
            let corType, energy;
            if (cor === 1) { corType = 'Perfectly Elastic'; energy = '100%'; }
            else if (cor === 0) { corType = 'Perfectly Inelastic'; energy = '0%'; }
            else { corType = 'Partially Elastic'; energy = (cor * cor * 100).toFixed(1) + '%'; }

            document.getElementById('corType').textContent = corType;
            document.getElementById('corEnergy').textContent = energy;

            if (!sim.running) draw();
        }
        [angleSlider, velSlider, wallSlider, wallHSlider, gravSlider, corSlider].forEach(el => el.addEventListener('input', getParams));
        pauseBtn.addEventListener('click', togglePause);
        resetBtn.addEventListener('click', reset);

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && sim.running) {
                e.preventDefault();
                togglePause();
            }
        });

        function togglePause() {
            sim.paused = !sim.paused;
            pauseBtn.textContent = sim.paused ? 'Resume' : 'Pause';
            if (!sim.paused) animate();
        }

        function launch() {
            if (sim.running) return;
            sim.running = true;
            sim.paused = false;
            sim.time = 0;
            sim.trail = [];
            sim.postBounceTrail = [];
            sim.maxHeight = 0;
            sim.hitWall = false;
            sim.bounceCount = 0;
            launchBtn.textContent = 'Running...';
            launchBtn.disabled = true;
            pauseBtn.style.display = 'inline-block';
            pauseBtn.textContent = 'Pause';
            requestAnimationFrame(animate);
        }

        function reset() {
            sim.running = false;
            sim.paused = false;
            sim.time = 0;
            sim.trail = [];
            sim.postBounceTrail = [];
            sim.maxHeight = 0;
            sim.hitWall = false;
            sim.bounceCount = 0;
            launchBtn.textContent = 'Launch';
            launchBtn.disabled = false;
            pauseBtn.style.display = 'none';
            draw();
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bgGrad.addColorStop(0, '#000000');
            bgGrad.addColorStop(1, '#000000');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const theta = parseFloat(angleSlider.value) * Math.PI / 180;
            const v0 = parseFloat(velSlider.value);
            const wallDist = parseFloat(wallSlider.value);
            const wallH = parseFloat(wallHSlider.value);
            const g = parseFloat(gravSlider.value);
            const cor = parseFloat(corSlider.value);
            const scale = 4.5;

            const originX = 80;
            const originY = canvas.height - 80;

            // Draw ground
            ctx.fillStyle = '#444444';
            ctx.fillRect(originX, originY, canvas.width - originX, canvas.height - originY);

            // Draw wall
            const wallScreenX = originX + wallDist * scale;
            const wallScreenH = wallH * scale;

            if (wallScreenX < canvas.width) {
                const wallGrad = ctx.createLinearGradient(wallScreenX, originY - wallScreenH, wallScreenX + 15, originY);
                wallGrad.addColorStop(0, '#cccccc');
                wallGrad.addColorStop(1, '#2d3436');
                ctx.fillStyle = wallGrad;
                ctx.fillRect(wallScreenX, originY - wallScreenH, 15, wallScreenH);

                ctx.fillStyle = '#b2bec3';
                ctx.fillRect(wallScreenX - 2, originY - wallScreenH, 19, 4);

                ctx.fillStyle = '#dfe6e9';
                ctx.font = '10px monospace';
                ctx.fillText('H=' + wallH + 'm', wallScreenX + 20, originY - wallScreenH / 2);
            }

            ctx.fillStyle = '#fdcb6e';
            ctx.font = '11px monospace';
            ctx.fillText('D=' + wallDist + 'm', originX + wallDist * scale / 2 - 20, originY + 20);

            // Draw trajectory preview
            ctx.strokeStyle = 'rgba(253, 203, 110, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            const T_total = 2 * v0 * Math.sin(theta) / g;
            let started = false;
            for (let t = 0; t <= T_total; t += 0.05) {
                const x = v0 * Math.cos(theta) * t;
                const y = v0 * Math.sin(theta) * t - 0.5 * g * t * t;
                const px = originX + x * scale;
                const py = originY - y * scale;
                if (!started) { ctx.moveTo(px, py); started = true; }
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw actual trajectory before wall
            if (sim.trail.length > 1) {
                ctx.strokeStyle = 'rgba(0, 184, 148, 0.8)';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                for (let i = 0; i < sim.trail.length; i++) {
                    const px = originX + sim.trail[i].x * scale;
                    const py = originY - sim.trail[i].y * scale;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();
            }

            // Draw trajectory after bounce
            if (sim.postBounceTrail.length > 1) {
                ctx.strokeStyle = 'rgba(225, 112, 85, 0.8)';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                for (let i = 0; i < sim.postBounceTrail.length; i++) {
                    const px = originX + wallDist * scale + sim.postBounceTrail[i].x * scale;
                    const py = originY - sim.postBounceTrail[i].y * scale;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();
            }

            // Draw impact point on wall
            if (sim.hitWall && sim.bounceCount > 0) {
                const impactX = originX + wallDist * scale;
                const impactY = originY - sim.postBounceTrail[0].y;

                ctx.fillStyle = '#fdcb6e';
                ctx.beginPath();
                ctx.arc(impactX, impactY, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(impactX - 5, impactY);
                ctx.lineTo(impactX + 5, impactY);
                ctx.moveTo(impactX, impactY - 5);
                ctx.lineTo(impactX, impactY + 5);
                ctx.stroke();
            }

            // Ball
            if (sim.running || sim.time > 0) {
                let trail = sim.postBounceTrail.length > 0 ? sim.postBounceTrail : sim.trail;
                const trailOffset = sim.postBounceTrail.length > 0 ? wallDist * scale : 0;
                const bx = originX + trailOffset + trail[trail.length - 1].x * scale;
                const by = originY - trail[trail.length - 1].y * scale;

                const glow = ctx.createRadialGradient(bx, by, 0, bx, by, 20);
                glow.addColorStop(0, sim.hitWall ? 'rgba(225, 112, 85, 0.4)' : 'rgba(255,255,255,0.3)');
                glow.addColorStop(1, sim.hitWall ? 'rgba(225, 112, 85, 0)' : 'rgba(255,255,255,0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(bx, by, 20, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = sim.hitWall ? '#fdcb6e' : '#ffffff';
                ctx.beginPath();
                ctx.arc(bx, by, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Velocity vectors
                const vScale = 1.5;
                const vx = sim.vx;
                const vy = sim.vy;

                ctx.strokeStyle = '#fdcb6e';
                ctx.lineWidth = 2;
                drawArrow(ctx, bx, by, bx + vx * vScale, by - vy * vScale, '#fdcb6e');

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                drawArrow(ctx, bx, by, bx + vx * vScale, by, '#ffffff');

                ctx.strokeStyle = '#fdcb6e';
                ctx.lineWidth = 1.5;
                drawArrow(ctx, bx, by, bx, by - vy * vScale, '#fdcb6e');
            }

            // Launch angle arc
            const launchLen = 40;
            const lx = originX + launchLen * Math.cos(theta);
            const ly = originY - launchLen * Math.sin(theta);
            ctx.strokeStyle = '#fdcb6e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(lx, ly);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(253, 203, 110, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(originX, originY, 30, -theta, 0);
            ctx.stroke();

            ctx.fillStyle = '#fdcb6e';
            ctx.font = '11px monospace';
            ctx.fillText('?=' + (theta * 180 / Math.PI).toFixed(0) + '°', lx + 10, ly);

            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(originX + 100, originY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

       function animate() {
            if (!sim.running || sim.paused) return;

            const dt = 0.016;
            sim.time += dt;

            const theta = parseFloat(angleSlider.value) * Math.PI / 180;
            const v0 = parseFloat(velSlider.value);
            const wallDist = parseFloat(wallSlider.value);
            const wallH = parseFloat(wallHSlider.value);
            const g = parseFloat(gravSlider.value);
            const cor = parseFloat(corSlider.value);

            if (!sim.hitWall) {
                const vx0 = v0 * Math.cos(theta);
                const vy0 = v0 * Math.sin(theta);

                const x = vx0 * sim.time;
                const y = vy0 * sim.time - 0.5 * g * sim.time * sim.time;

                // Check wall collision
                if (x >= wallDist) {
                    const hitTime = wallDist / vx0;
                    const hitY = vy0 * hitTime - 0.5 * g * hitTime * hitTime;

                    if (hitY > 0 && hitY < wallH) {
                        sim.hitWall = true;
                        sim.bounceCount++;
                        sim.bounceTime = hitTime;
                        sim.bounceX = wallDist;
                        sim.bounceY = hitY;
                        sim.bounceVx = -cor * vx0;
                        sim.bounceVy = vy0 - g * hitTime;
                        sim.postBounceTrail = [{ x: 0, y: hitY }];
                        sim.time = 0;
                        sim.maxHeight = Math.max(sim.maxHeight, hitY);
                    } else if (hitY >= wallH) {
                        const a = -0.5 * g;
                        const b = vy0;
                        const c = -wallH;
                        const disc = b * b - 4 * a * c;
                        if (disc >= 0) {
                            const t1 = (-b + Math.sqrt(disc)) / (2 * a);
                            const t2 = (-b - Math.sqrt(disc)) / (2 * a);
                            const tOver = Math.max(t1, t2);
                            const xAtOver = vx0 * tOver;

                            if (xAtOver >= wallDist) {
                                sim.hitWall = true;
                                sim.bounceCount++;
                                sim.bounceTime = tOver;
                                sim.bounceX = xAtOver;
                                sim.bounceY = wallH;
                                sim.bounceVx = -cor * vx0;
                                sim.bounceVy = vy0 - g * tOver;
                                sim.postBounceTrail = [{ x: 0, y: wallH }];
                                sim.time = 0;
                                sim.maxHeight = Math.max(sim.maxHeight, wallH);
                            }
                        }
                    }
                }

                // Check ground collision
                if (y < 0 && sim.time > 0.05) {
                    sim.running = false;
                    launchBtn.textContent = 'Launch';
                    launchBtn.disabled = false;
                    pauseBtn.style.display = 'none';
                    sim.trail.pop();
                }

                if (!sim.hitWall) {
                    sim.trail.push({ x: x, y: Math.max(0, y) });
                    if (y > sim.maxHeight) sim.maxHeight = y;

                    sim.vx = vx0;
                    sim.vy = vy0 - g * sim.time;
                }
            } else {
                // Post-bounce: retrace incoming path with reversed velocities
                const vxPost = sim.bounceVx;
                const vyPost = sim.bounceVy;

                const x = vxPost * sim.time;
                const y = sim.postBounceTrail[0].y + vyPost * sim.time - 0.5 * g * sim.time * sim.time;

                sim.postBounceTrail.push({ x: x, y: Math.max(0, y) });

                if (y < 0 && sim.time > 0.05) {
                    sim.running = false;
                    launchBtn.textContent = 'Launch';
                    launchBtn.disabled = false;
                    pauseBtn.style.display = 'none';
                    sim.postBounceTrail.pop();
                }

                sim.vx = vxPost;
                sim.vy = vyPost - g * sim.time;

                if (y > sim.maxHeight) sim.maxHeight = y;
            }

            draw();
            if (sim.running) requestAnimationFrame(animate);
            else draw();
        }

        launchBtn.addEventListener('click', launch);
        resetBtn.addEventListener('click', reset);

        function drawArrow(ctx, x1, y1, x2, y2, color) {
            const headLen = 8;
            const angle = Math.atan2(y2 - y1, x2 - x1);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        }

        getParams();
        draw();
    
// From: relative-velocity-2d.html


// From: relative-velocity-2d.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');

        let sim = {
            running: false,
            paused: false,
            time: 0,
            dt: 0.016,
            currentV1: 5,
            currentV2: 4
        };

        const p1SpeedSlider = document.getElementById('p1Speed');
        const p2SpeedSlider = document.getElementById('p2Speed');
        const angleSlider = document.getElementById('angle');
        const p1AccSlider = document.getElementById('p1Acc');
        const p2AccSlider = document.getElementById('p2Acc');
        const showOriginCheckbox = document.getElementById('showOrigin');
        const originXSlider = document.getElementById('originX');
        const originYSlider = document.getElementById('originY');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const statP1Speed = document.getElementById('statP1Speed');
        const statP2Speed = document.getElementById('statP2Speed');
        const statAngle = document.getElementById('statAngle');
        const statRelSpeed = document.getElementById('statRelSpeed');
        const statRelDir = document.getElementById('statRelDir');
        const statP1Acc = document.getElementById('statP1Acc');
        const statP2Acc = document.getElementById('statP2Acc');

        p1SpeedSlider.addEventListener('input', () => {
            document.getElementById('p1SpeedVal').textContent = p1SpeedSlider.value;
            if (!sim.running) reset();
            draw();
        });

        p2SpeedSlider.addEventListener('input', () => {
            document.getElementById('p2SpeedVal').textContent = p2SpeedSlider.value;
            if (!sim.running) reset();
            draw();
        });

        angleSlider.addEventListener('input', () => {
            document.getElementById('angleVal').textContent = angleSlider.value;
            draw();
        });

        p1AccSlider.addEventListener('input', () => {
            document.getElementById('p1AccVal').textContent = p1AccSlider.value;
            if (!sim.running) reset();
        });

        p2AccSlider.addEventListener('input', () => {
            document.getElementById('p2AccVal').textContent = p2AccSlider.value;
            if (!sim.running) reset();
        });

        showOriginCheckbox.addEventListener('change', () => {
            document.getElementById('originControls').style.display = showOriginCheckbox.checked ? 'block' : 'none';
            draw();
        });

        originXSlider.addEventListener('input', () => {
            document.getElementById('originXVal').textContent = originXSlider.value;
            draw();
        });

        originYSlider.addEventListener('input', () => {
            document.getElementById('originYVal').textContent = originYSlider.value;
            draw();
        });

        startBtn.addEventListener('click', () => {
            if (!sim.running) {
                sim.running = true;
                sim.paused = false;
                startBtn.disabled = true;
                startBtn.textContent = 'Running';
                pauseBtn.style.display = 'block';
                animate();
            }
        });

        pauseBtn.addEventListener('click', () => {
            sim.paused = !sim.paused;
            pauseBtn.textContent = sim.paused ? 'Resume' : 'Pause';
            if (!sim.paused) animate();
        });

        resetBtn.addEventListener('click', reset);

        function reset() {
            sim.running = false;
            sim.paused = false;
            sim.time = 0;
            sim.currentV1 = parseFloat(p1SpeedSlider.value);
            sim.currentV2 = parseFloat(p2SpeedSlider.value);
            startBtn.disabled = false;
            startBtn.textContent = 'Start';
            pauseBtn.style.display = 'none';
            pauseBtn.textContent = 'Pause';
            updateStats();
            draw();
        }

        function updateStats() {
            const v1 = parseFloat(p1SpeedSlider.value);
            const v2 = parseFloat(p2SpeedSlider.value);
            const thetaDeg = parseFloat(angleSlider.value);
            const thetaRad = thetaDeg * Math.PI / 180;

            const vRel = Math.sqrt(v1 * v1 + v2 * v2 - 2 * v1 * v2 * Math.cos(thetaRad));

            const vRelX = v1 - v2 * Math.cos(thetaRad);
            const vRelY = -v2 * Math.sin(thetaRad);
            const relAngle = Math.atan2(vRelY, vRelX) * 180 / Math.PI;

            const a1 = parseFloat(p1AccSlider.value);
            const a2 = parseFloat(p2AccSlider.value);

            statP1Speed.textContent = v1.toFixed(2) + ' m/s';
            statP2Speed.textContent = v2.toFixed(2) + ' m/s';
            statAngle.textContent = thetaDeg.toFixed(1) + '°';
            statRelSpeed.textContent = vRel.toFixed(2) + ' m/s';
            statRelDir.textContent = relAngle.toFixed(1) + '°';
            statP1Acc.textContent = a1.toFixed(2) + ' m/s²';
            statP2Acc.textContent = a2.toFixed(2) + ' m/s²';
        }

        function drawArrow(x, y, length, angleDeg, color, lineWidth, dashed) {
            const endX = x + length * Math.cos(angleDeg * Math.PI / 180);
            const endY = y + length * Math.sin(angleDeg * Math.PI / 180);

            ctx.save();
            if (dashed) {
                ctx.setLineDash([6, 4]);
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            const headLen = 12;
            const headAngle = 25;
            ctx.setLineDash([]);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
                endX - headLen * Math.cos((angleDeg - headAngle) * Math.PI / 180),
                endY - headLen * Math.sin((angleDeg - headAngle) * Math.PI / 180)
            );
            ctx.lineTo(
                endX - headLen * Math.cos((angleDeg + headAngle) * Math.PI / 180),
                endY - headLen * Math.sin((angleDeg + headAngle) * Math.PI / 180)
            );
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bg.addColorStop(0, '#000000');
            bg.addColorStop(1, '#000000');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const thetaDeg = parseFloat(angleSlider.value);
            const thetaRad = thetaDeg * Math.PI / 180;

            let cx, cy;
            if (showOriginCheckbox.checked) {
                cx = parseFloat(originXSlider.value);
                cy = parseFloat(originYSlider.value);
            } else {
                cx = canvas.width * 0.10;
                cy = canvas.height / 2;
            }
            const scale = 120;

            const v1 = sim.running ? sim.currentV1 : parseFloat(p1SpeedSlider.value);
            const v2 = sim.running ? sim.currentV2 : parseFloat(p2SpeedSlider.value);

            const v1Len = v1 * scale;
            const v2Len = v2 * scale;
            const eV1Len = v1Len;
            const eV2Len = v2Len;

            const p1Color = '#00b894';
            const p2Color = '#e17055';
            const relColor = '#ff4757';
            const paraColor = 'rgba(253,203,110,0.5)';

            ctx.font = 'bold 15px monospace';
            ctx.textAlign = 'center';

            if (showOriginCheckbox.checked) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('?', cx, cy);
                ctx.fillText('Origin', cx, cy + 15);
            }

            if (eV1Len > 0) {
                drawArrow(cx, cy, eV1Len, 0, p1Color, 3, false);
                ctx.font = 'bold 13px monospace';
                ctx.fillStyle = p1Color;
                ctx.textAlign = 'left';
                ctx.fillText('v1', cx + eV1Len + 10, cy - 5);
                ctx.font = '11px monospace';
                ctx.fillText(v1.toFixed(1) + ' m/s', cx + eV1Len + 10, cy + 10);
                ctx.font = 'bold 15px monospace';
                ctx.textAlign = 'center';
            }

            if (eV2Len > 0) {
                drawArrow(cx, cy, eV2Len, -thetaDeg, p2Color, 3, false);
                const labelX = cx + eV2Len * Math.cos(-thetaRad) + 10;
                const labelY = cy + eV2Len * Math.sin(-thetaRad) - 5;
                ctx.font = 'bold 13px monospace';
                ctx.fillStyle = p2Color;
                ctx.textAlign = 'left';
                ctx.fillText('v2', labelX, labelY);
                ctx.font = '11px monospace';
                ctx.fillText(v2.toFixed(1) + ' m/s', labelX, labelY + 15);
                ctx.font = 'bold 15px monospace';
                ctx.textAlign = 'center';
            }

            const v1TipX = cx + eV1Len;
            const v1TipY = cy;
            const v2TipX = cx + eV2Len * Math.cos(-thetaRad);
            const v2TipY = cy + eV2Len * Math.sin(-thetaRad);

            const vRelX = v1 - v2 * Math.cos(thetaRad);
            const vRelY = -v2 * Math.sin(thetaRad);
            const vRelMag = Math.sqrt(vRelX * vRelX + vRelY * vRelY);
            const vRelAngle = Math.atan2(vRelY, vRelX) * 180 / Math.PI;
            const vRelLen = Math.sqrt((v1TipX - v2TipX) ** 2 + (v1TipY - v2TipY) ** 2);

            if (vRelLen > 0) {
                const relAngle = Math.atan2(v1TipY - v2TipY, v1TipX - v2TipX) * 180 / Math.PI;
                drawArrow(v2TipX, v2TipY, vRelLen, relAngle, relColor, 3, true);
                const lx = (v2TipX + v1TipX) / 2 + 10;
                const ly = (v2TipY + v1TipY) / 2 - 8;
                ctx.font = 'bold 13px monospace';
                ctx.fillStyle = relColor;
                ctx.textAlign = 'left';
                ctx.fillText('v12 = v1 - v2', lx, ly);
                ctx.font = '11px monospace';
                ctx.fillText('|v12| = ' + vRelMag.toFixed(1) + ' m/s', lx, ly + 14);
                ctx.font = 'bold 15px monospace';
                ctx.textAlign = 'center';
            }

            if (eV1Len > 0 && eV2Len > 0 && thetaDeg > 0 && thetaDeg < 180) {
                ctx.strokeStyle = paraColor;
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 4]);

                ctx.beginPath();
                ctx.moveTo(v1TipX, v1TipY);
                ctx.lineTo(v2TipX, v2TipY);
                ctx.stroke();

                ctx.setLineDash([]);
            }

            if (thetaDeg > 0) {
                const arcRadius = Math.min(50, eV1Len * 0.4, eV2Len * 0.4);
                ctx.strokeStyle = '#fdcb6e';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(cx, cy, arcRadius, -thetaRad, 0);
                ctx.stroke();

                ctx.fillStyle = '#fdcb6e';
                ctx.font = 'bold 14px monospace';
                ctx.textAlign = 'center';
                const labelAngle = -thetaRad / 2;
                const labelR = arcRadius + 20;
                ctx.fillText(thetaDeg + '°', cx + labelR * Math.cos(labelAngle), cy + labelR * Math.sin(labelAngle) + 4);
            }

            ctx.font = '11px monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#00b894';
            ctx.fillText('? v1 (Particle 1)', 15, canvas.height - 35);
            ctx.fillStyle = '#e17055';
            ctx.fillText('? v2 (Particle 2)', 15, canvas.height - 18);
            ctx.fillStyle = '#ff4757';
            ctx.fillText('? v12 (Relative)', canvas.width - 140, canvas.height - 35);
            ctx.fillStyle = '#fdcb6e';
            ctx.fillText('--- Parallelogram', canvas.width - 140, canvas.height - 18);
        }

        function animate() {
            if (!sim.running || sim.paused) return;

            const a1 = parseFloat(p1AccSlider.value);
            const a2 = parseFloat(p2AccSlider.value);

            sim.currentV1 += a1 * sim.dt;
            sim.currentV2 += a2 * sim.dt;

            sim.time += sim.dt;

            updateStats();
            draw();
            requestAnimationFrame(animate);
        }

        reset();
    
// From: relative-velocity-same-dimension.html


// From: relative-velocity-same-dimension.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');

        let sim = {
            running: false,
            paused: false,
            time: 0,
            dt: 0.016
        };

        let graphData = {
            s: [], v: [], a: []
        };
        const maxGraphPoints = 500;

        const p1PosSlider = document.getElementById('p1Pos');
        const p1VelSlider = document.getElementById('p1Vel');
        const p1AccSlider = document.getElementById('p1Acc');
        const p2PosSlider = document.getElementById('p2Pos');
        const p2VelSlider = document.getElementById('p2Vel');
        const p2AccSlider = document.getElementById('p2Acc');
        const showST = document.getElementById('showST');
        const showVT = document.getElementById('showVT');
        const showAT = document.getElementById('showAT');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const statTime = document.getElementById('statTime');
        const statP1Pos = document.getElementById('statP1Pos');
        const statP2Pos = document.getElementById('statP2Pos');
        const statRelVel = document.getElementById('statRelVel');
        const statDist = document.getElementById('statDist');

        function addSliderListener(slider, valId, cb) {
            slider.addEventListener('input', () => {
                document.getElementById(valId).textContent = slider.value;
                if (!sim.running) reset();
                cb();
            });
        }

        addSliderListener(p1PosSlider, 'p1PosVal', () => {});
        addSliderListener(p1VelSlider, 'p1VelVal', () => {});
        addSliderListener(p1AccSlider, 'p1AccVal', () => {});
        addSliderListener(p2PosSlider, 'p2PosVal', () => {});
        addSliderListener(p2VelSlider, 'p2VelVal', () => {});
        addSliderListener(p2AccSlider, 'p2AccVal', () => {});

        [showST, showVT, showAT].forEach(el => {
            el.addEventListener('change', () => { draw(); });
        });

        startBtn.addEventListener('click', () => {
            if (!sim.running) {
                sim.running = true;
                sim.paused = false;
                startBtn.disabled = true;
                startBtn.textContent = 'Running';
                pauseBtn.style.display = 'block';
                animate();
            }
        });

        pauseBtn.addEventListener('click', () => {
            sim.paused = !sim.paused;
            pauseBtn.textContent = sim.paused ? 'Resume' : 'Pause';
            if (!sim.paused) animate();
        });

        resetBtn.addEventListener('click', reset);

        function reset() {
            sim.running = false;
            sim.paused = false;
            sim.time = 0;

            const x10 = parseFloat(p1PosSlider.value);
            const x20 = parseFloat(p2PosSlider.value);

            graphData = {
                s: [
                    { t: 0, p1: x10, p2: x20 },
                    { t: 0, rel: x10 - x20 }
                ],
                v: [
                    { t: 0, p1: parseFloat(p1VelSlider.value), p2: parseFloat(p2VelSlider.value) },
                    { t: 0, rel: parseFloat(p1VelSlider.value) - parseFloat(p2VelSlider.value) }
                ],
                a: [
                    { t: 0, p1: parseFloat(p1AccSlider.value), p2: parseFloat(p2AccSlider.value) }
                ]
            };

            startBtn.disabled = false;
            startBtn.textContent = 'Start';
            pauseBtn.style.display = 'none';
            pauseBtn.textContent = 'Pause';
            updateStats();
            draw();
        }

        function updateStats() {
            const x1 = getParticle1Pos(sim.time);
            const x2 = getParticle2Pos(sim.time);
            const v1 = getParticle1Vel(sim.time);
            const v2 = getParticle2Vel(sim.time);

            statTime.textContent = sim.time.toFixed(2) + ' s';
            statP1Pos.textContent = x1.toFixed(2) + ' m';
            statP2Pos.textContent = x2.toFixed(2) + ' m';
            statRelVel.textContent = (v1 - v2).toFixed(2) + ' m/s';
            statDist.textContent = Math.abs(x1 - x2).toFixed(2) + ' m';
        }

        function getParticle1Pos(t) {
            const x0 = parseFloat(p1PosSlider.value);
            const v = parseFloat(p1VelSlider.value);
            const a = parseFloat(p1AccSlider.value);
            return x0 + v * t + 0.5 * a * t * t;
        }

        function getParticle1Vel(t) {
            const v = parseFloat(p1VelSlider.value);
            const a = parseFloat(p1AccSlider.value);
            return v + a * t;
        }

        function getParticle1Acc(t) {
            return parseFloat(p1AccSlider.value);
        }

        function getParticle2Pos(t) {
            const x0 = parseFloat(p2PosSlider.value);
            const v = parseFloat(p2VelSlider.value);
            const a = parseFloat(p2AccSlider.value);
            return x0 + v * t + 0.5 * a * t * t;
        }

        function getParticle2Vel(t) {
            const v = parseFloat(p2VelSlider.value);
            const a = parseFloat(p2AccSlider.value);
            return v + a * t;
        }

        function getParticle2Acc(t) {
            return parseFloat(p2AccSlider.value);
        }

        function drawGraph(x, y, w, h, data, p1Color, p2Color, title, unit) {
            if (data.length < 2) return;

            ctx.fillStyle = '#111122';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.strokeRect(x, y, w, h);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(title, x + w / 2, y + 18);

            const p1Vals = data.map(p => p.p1);
            const p2Vals = data.map(p => p.p2);
            let yMin = Math.min(...p1Vals, ...p2Vals);
            let yMax = Math.max(...p1Vals, ...p2Vals);
            if (yMin === yMax) { yMin -= 1; yMax += 1; }

            const tMax = sim.time;
            const timeWindow = 15;
            const tMin = Math.max(0, tMax - timeWindow);

            const padL = 55;
            const padR = 15;
            const padT = 28;
            const padB = 40;
            const gw = w - padL - padR;
            const gh = h - padT - padB;

            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;

            for (let i = 0; i <= 5; i++) {
                const tx = x + padL + (gw * i / 5);
                ctx.beginPath();
                ctx.moveTo(tx, y + padT);
                ctx.lineTo(tx, y + padT + gh);
                ctx.stroke();
            }

            for (let i = 0; i <= 4; i++) {
                const ty = y + padT + (gh * i / 4);
                ctx.beginPath();
                ctx.moveTo(x + padL, ty);
                ctx.lineTo(x + padL + gw, ty);
                ctx.stroke();
            }

            ctx.fillStyle = '#ffffff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            for (let i = 0; i <= 5; i++) {
                const tx = x + padL + (gw * i / 5);
                const tVal = tMin + ((timeWindow * i) / 5);
                ctx.fillText(tVal.toFixed(1), tx, y + padT + gh + 15);
            }

            ctx.textAlign = 'right';
            for (let i = 0; i <= 4; i++) {
                const ty = y + padT + (gh * i / 4);
                const yVal = yMax - ((yMax - yMin) * i / 4);
                ctx.fillText(yVal.toFixed(1), x + padL - 5, ty + 3);
            }

            ctx.textAlign = 'center';
            ctx.fillText('Time (s)', x + padL + gw / 2, y + h - 5);

            ctx.save();
            ctx.translate(x + 15, y + padT + gh / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(title.split(' ')[0] + ' (' + unit + ')', 0, 0);
            ctx.restore();

            function drawLine(dataArr, color) {
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                let started = false;

                for (let i = 0; i < dataArr.length; i++) {
                    const tVal = dataArr[i].t;
                    const val = dataArr[i].p1 !== undefined ? dataArr[i].p1 : dataArr[i].rel;

                    if (tVal < tMin || tVal > tMax) continue;

                    const px = x + padL + ((tVal - tMin) / timeWindow) * gw;
                    const py = y + padT + gh * (1 - (val - yMin) / (yMax - yMin));

                    if (!started) {
                        ctx.moveTo(px, py);
                        started = true;
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.stroke();
            }

            drawLine(data, p1Color);
            drawLine(data, p2Color);

            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = p1Color;
            ctx.fillText('? Particle 1', x + padL + gw - 130, y + padT + 14);
            ctx.fillStyle = p2Color;
            ctx.fillText('? Particle 2', x + padL + gw - 130, y + padT + 28);

            const last = data[data.length - 1];
            const lastVal1 = last.p1;
            const lastVal2 = last.p2;

            const px = x + padL + gw;
            const py1 = y + padT + gh * (1 - (lastVal1 - yMin) / (yMax - yMin));
            const py2 = y + padT + gh * (1 - (lastVal2 - yMin) / (yMax - yMin));

            ctx.fillStyle = p1Color;
            ctx.beginPath();
            ctx.arc(px, py1, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = p2Color;
            ctx.beginPath();
            ctx.arc(px, py2, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        function drawGraphSingle(x, y, w, h, data, color, title, unit) {
            if (data.length < 2) return;

            ctx.fillStyle = '#111122';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.strokeRect(x, y, w, h);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(title, x + w / 2, y + 18);

            const p1Vals = data.map(p => p.p1);
            const p2Vals = data.map(p => p.p2);
            let yMin = Math.min(...p1Vals, ...p2Vals);
            let yMax = Math.max(...p1Vals, ...p2Vals);
            if (yMin === yMax) { yMin -= 1; yMax += 1; }

            const tMax = sim.time;
            const timeWindow = 15;
            const tMin = Math.max(0, tMax - timeWindow);

            const padL = 55;
            const padR = 15;
            const padT = 28;
            const padB = 40;
            const gw = w - padL - padR;
            const gh = h - padT - padB;

            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;

            for (let i = 0; i <= 5; i++) {
                const tx = x + padL + (gw * i / 5);
                ctx.beginPath();
                ctx.moveTo(tx, y + padT);
                ctx.lineTo(tx, y + padT + gh);
                ctx.stroke();
            }

            for (let i = 0; i <= 4; i++) {
                const ty = y + padT + (gh * i / 4);
                ctx.beginPath();
                ctx.moveTo(x + padL, ty);
                ctx.lineTo(x + padL + gw, ty);
                ctx.stroke();
            }

            ctx.fillStyle = '#ffffff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            for (let i = 0; i <= 5; i++) {
                const tx = x + padL + (gw * i / 5);
                const tVal = tMin + ((timeWindow * i) / 5);
                ctx.fillText(tVal.toFixed(1), tx, y + padT + gh + 15);
            }

            ctx.textAlign = 'right';
            for (let i = 0; i <= 4; i++) {
                const ty = y + padT + (gh * i / 4);
                const yVal = yMax - ((yMax - yMin) * i / 4);
                ctx.fillText(yVal.toFixed(1), x + padL - 5, ty + 3);
            }

            ctx.textAlign = 'center';
            ctx.fillText('Time (s)', x + padL + gw / 2, y + h - 5);

            ctx.save();
            ctx.translate(x + 15, y + padT + gh / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(title.split(' ')[0] + ' (' + unit + ')', 0, 0);
            ctx.restore();

            function drawLineForGraph(dataArr, color, key) {
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                let started = false;

                for (let i = 0; i < dataArr.length; i++) {
                    const tVal = dataArr[i].t;
                    const val = dataArr[i][key];

                    if (tVal < tMin || tVal > tMax) continue;

                    const px = x + padL + ((tVal - tMin) / timeWindow) * gw;
                    const py = y + padT + gh * (1 - (val - yMin) / (yMax - yMin));

                    if (!started) {
                        ctx.moveTo(px, py);
                        started = true;
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.stroke();
            }

            drawLineForGraph(data, color.p1, 'p1');
            drawLineForGraph(data, color.p2, 'p2');

            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = color.p1;
            ctx.fillText('? Particle 1', x + padL + gw - 130, y + padT + 14);
            ctx.fillStyle = color.p2;
            ctx.fillText('? Particle 2', x + padL + gw - 130, y + padT + 28);

            const last = data[data.length - 1];
            const px = x + padL + gw;
            const py1 = y + padT + gh * (1 - (last.p1 - yMin) / (yMax - yMin));
            const py2 = y + padT + gh * (1 - (last.p2 - yMin) / (yMax - yMin));

            ctx.fillStyle = color.p1;
            ctx.beginPath();
            ctx.arc(px, py1, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = color.p2;
            ctx.beginPath();
            ctx.arc(px, py2, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bg.addColorStop(0, '#000000');
            bg.addColorStop(1, '#000000');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const p1Color = '#00b894';
            const p2Color = '#e17055';

            const motionAreaH = canvas.height * 0.32;

            drawMotionArea(motionAreaH, p1Color, p2Color);

            const graphTop = motionAreaH + 20;
            const graphAreaH = canvas.height - graphTop - 10;

            let graphs = [];

            if (showST.checked) {
                graphs.push({
                    type: 'combined',
                    data: graphData.s,
                    title: 'Displacement vs Time',
                    unit: 'm'
                });
            }

            if (showVT.checked) {
                graphs.push({
                    type: 'combined',
                    data: graphData.v,
                    title: 'Velocity vs Time',
                    unit: 'm/s'
                });
            }

            if (showAT.checked) {
                graphs.push({
                    type: 'combined',
                    data: graphData.a,
                    title: 'Acceleration vs Time',
                    unit: 'm/s²'
                });
            }

            const n = graphs.length;
            if (n === 0) return;

            const margin = 15;
            let gw, gh, cols;

            if (n === 1) {
                cols = 1;
                gw = canvas.width - margin * 2;
                gh = graphAreaH - margin * 2;
            } else {
                cols = 2;
                gw = (canvas.width - margin * 3) / 2;
                gh = (graphAreaH - margin * 3) / 2;
            }

            for (let i = 0; i < n; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const gx = margin + col * (gw + margin);
                const gy = graphTop + margin + row * (gh + margin);
                const g = graphs[i];

                drawGraphSingle(gx, gy, gw, gh, g.data, { p1: p1Color, p2: p2Color }, g.title, g.unit);
            }
        }

        function drawMotionArea(height, p1Color, p2Color) {
            const trackY = height * 0.5;
            const trackLeft = 40;
            const trackRight = canvas.width - 40;

            ctx.fillStyle = '#0d0d1a';
            ctx.fillRect(trackLeft, trackY - 30, trackRight - trackLeft, 60);
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.strokeRect(trackLeft, trackY - 30, trackRight - trackLeft, 60);

            const x1 = getParticle1Pos(sim.time);
            const x2 = getParticle2Pos(sim.time);
            const v1 = getParticle1Vel(sim.time);
            const v2 = getParticle2Vel(sim.time);

            const originX = canvas.width / 2;
            const scale = 8;

            ctx.font = '10px monospace';
            ctx.textAlign = 'center';

            for (let i = -35; i <= 35; i += 5) {
                const px = originX + i * scale;
                if (px < trackLeft || px > trackRight) continue;

                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.beginPath();
                ctx.moveTo(px, trackY - 30);
                ctx.lineTo(px, trackY + 30);
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.fillText(i + 'm', px, trackY + 45);
            }

            const p1x = originX + x1 * scale;
            const p2x = originX + x2 * scale;

            if (p1x > trackLeft && p1x < trackRight) {
                const glow1 = ctx.createRadialGradient(p1x, trackY, 0, p1x, trackY, 20);
                glow1.addColorStop(0, 'rgba(0,184,148,0.4)');
                glow1.addColorStop(1, 'rgba(0,184,148,0)');
                ctx.fillStyle = glow1;
                ctx.beginPath();
                ctx.arc(p1x, trackY, 20, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = p1Color;
                ctx.beginPath();
                ctx.arc(p1x, trackY, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#fff';
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('P1', p1x, trackY + 4);
            }

            if (p2x > trackLeft && p2x < trackRight) {
                const glow2 = ctx.createRadialGradient(p2x, trackY, 0, p2x, trackY, 20);
                glow2.addColorStop(0, 'rgba(225,112,85,0.4)');
                glow2.addColorStop(1, 'rgba(225,112,85,0)');
                ctx.fillStyle = glow2;
                ctx.beginPath();
                ctx.arc(p2x, trackY, 20, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = p2Color;
                ctx.beginPath();
                ctx.arc(p2x, trackY, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#fff';
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('P2', p2x, trackY + 4);
            }

            const dist = x2 - x1;
            const distPx = (p2x - p1x);

            if (Math.abs(distPx) > 20) {
                ctx.strokeStyle = 'rgba(253,203,110,0.6)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(Math.max(p1x, p2x) - Math.sign(distPx) * 12, trackY - 35);
                ctx.lineTo(Math.min(p1x, p2x) + Math.sign(distPx) * 12, trackY - 35);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                const midX = (p1x + p2x) / 2;
                ctx.fillText('d = ' + Math.abs(dist).toFixed(1) + 'm', midX, trackY - 40);
            }

            const vArrowLen = Math.min(Math.abs(v1) * 6, 80);
            const vDir1 = v1 >= 0 ? 1 : -1;
            ctx.strokeStyle = p1Color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p1x, trackY - 50);
            ctx.lineTo(p1x + vArrowLen * vDir1, trackY - 50);
            ctx.stroke();
            drawArrowHead(p1x + vArrowLen * vDir1, trackY - 50, vDir1 * 180, p1Color);
            ctx.fillStyle = p1Color;
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('v1=' + v1.toFixed(1) + ' m/s', p1x, trackY - 55);

            const vArrowLen2 = Math.min(Math.abs(v2) * 6, 80);
            const vDir2 = v2 >= 0 ? 1 : -1;
            ctx.strokeStyle = p2Color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p2x, trackY + 50);
            ctx.lineTo(p2x + vArrowLen2 * vDir2, trackY + 50);
            ctx.stroke();
            drawArrowHead(p2x + vArrowLen2 * vDir2, trackY + 50, vDir2 * 180, p2Color);
            ctx.fillStyle = p2Color;
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('v2=' + v2.toFixed(1) + ' m/s', p2x, trackY + 63);
        }

        function drawArrowHead(x, y, angleDeg, color) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angleDeg * Math.PI / 180);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-8, -4);
            ctx.lineTo(-8, 4);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        function animate() {
            if (!sim.running || sim.paused) return;

            sim.time += sim.dt;

            const v1 = getParticle1Vel(sim.time);
            const v2 = getParticle2Vel(sim.time);
            const a1 = getParticle1Acc(sim.time);
            const a2 = getParticle2Acc(sim.time);
            const x1 = getParticle1Pos(sim.time);
            const x2 = getParticle2Pos(sim.time);

            graphData.s.push({ t: sim.time, p1: x1, p2: x2, rel: x1 - x2 });
            graphData.v.push({ t: sim.time, p1: v1, p2: v2, rel: v1 - v2 });
            graphData.a.push({ t: sim.time, p1: a1, p2: a2 });

            if (graphData.s.length > maxGraphPoints) graphData.s.shift();
            if (graphData.v.length > maxGraphPoints) graphData.v.shift();
            if (graphData.a.length > maxGraphPoints) graphData.a.shift();

            updateStats();
            draw();
            requestAnimationFrame(animate);
        }

        reset();
    
// From: scalar-multiplication.html


// From: scalar-multiplication.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');

        let sim = {
            running: false,
            paused: false,
            time: 0,
            dt: 0.016,
            animatingK: 2
        };

        const mA = document.getElementById('mA');
        const aA = document.getElementById('aA');
        const kSlider = document.getElementById('k');
        const originX = document.getElementById('originX');
        const originY = document.getElementById('originY');
        const showOrigin = document.getElementById('showOrigin');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const statA = document.getElementById('statA');
        const statK = document.getElementById('statK');
        const statR = document.getElementById('statR');
        const statADir = document.getElementById('statADir');
        const statRDir = document.getElementById('statRDir');
        const statType = document.getElementById('statType');

        mA.addEventListener('input', () => {
            document.getElementById('mAVal').textContent = mA.value;
            draw();
        });

        aA.addEventListener('input', () => {
            document.getElementById('aAVal').textContent = aA.value;
            draw();
        });

        kSlider.addEventListener('input', () => {
            document.getElementById('kVal').textContent = kSlider.value;
            draw();
        });

        originX.addEventListener('input', () => {
            document.getElementById('originXVal').textContent = originX.value;
            draw();
        });

        originY.addEventListener('input', () => {
            document.getElementById('originYVal').textContent = originY.value;
            draw();
        });

        showOrigin.addEventListener('change', () => {
            document.getElementById('originControls').style.display = showOrigin.checked ? 'block' : 'none';
            draw();
        });

        startBtn.addEventListener('click', () => {
            if (!sim.running) {
                sim.running = true;
                sim.paused = false;
                startBtn.disabled = true;
                startBtn.textContent = 'Running';
                pauseBtn.style.display = 'block';
                animate();
            }
        });

        pauseBtn.addEventListener('click', () => {
            sim.paused = !sim.paused;
            pauseBtn.textContent = sim.paused ? 'Resume' : 'Pause';
            if (!sim.paused) animate();
        });

        resetBtn.addEventListener('click', reset);

        function reset() {
            sim.running = false;
            sim.paused = false;
            sim.time = 0;
            sim.animatingK = parseFloat(kSlider.value);
            startBtn.disabled = false;
            startBtn.textContent = 'Animate k';
            pauseBtn.style.display = 'none';
            pauseBtn.textContent = 'Pause';
            updateStats();
            draw();
        }

        function updateStats() {
            const A = parseFloat(mA.value);
            const A_angle = parseFloat(aA.value);
            const k = sim.running ? sim.animatingK : parseFloat(kSlider.value);
            const kA_mag = Math.abs(k) * A;

            statA.textContent = A.toFixed(1) + ' m';
            statK.textContent = k.toFixed(1);
            statR.textContent = kA_mag.toFixed(1) + ' m';
            statADir.textContent = A_angle.toFixed(1) + '°';

            if (k >= 0) {
                statRDir.textContent = A_angle.toFixed(1) + '° (same)';
            } else {
                statRDir.textContent = ((A_angle + 180) % 360).toFixed(1) + '° (opposite)';
            }

            if (k > 0) {
                statType.textContent = 'Same direction';
                statType.style.color = '#00b894';
            } else if (k < 0) {
                statType.textContent = 'Opposite direction';
                statType.style.color = '#e17055';
            } else {
                statType.textContent = 'Zero vector';
                statType.style.color = '#fdcb6e';
            }
        }

        function drawArrow(x, y, length, angleDeg, color, lineWidth, dashed) {
            if (length < 1) return;
            const endX = x + length * Math.cos(angleDeg * Math.PI / 180);
            const endY = y + length * Math.sin(angleDeg * Math.PI / 180);

            ctx.save();
            if (dashed) {
                ctx.setLineDash([6, 4]);
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            const headLen = 14;
            const headAngle = 25;
            ctx.setLineDash([]);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
                endX - headLen * Math.cos((angleDeg - headAngle) * Math.PI / 180),
                endY - headLen * Math.sin((angleDeg - headAngle) * Math.PI / 180)
            );
            ctx.lineTo(
                endX - headLen * Math.cos((angleDeg + headAngle) * Math.PI / 180),
                endY - headLen * Math.sin((angleDeg + headAngle) * Math.PI / 180)
            );
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bg.addColorStop(0, '#000000');
            bg.addColorStop(1, '#000000');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const A = parseFloat(mA.value);
            const A_angle = parseFloat(aA.value);
            const k = sim.running ? sim.animatingK : parseFloat(kSlider.value);

            let cx, cy;
            if (showOrigin.checked) {
                cx = parseFloat(originX.value);
                cy = parseFloat(originY.value);
            } else {
                cx = canvas.width * 0.3;
                cy = canvas.height * 0.55;
            }

            const scale = 120;

            const p1Color = '#00b894';
            const sColor = '#74b9ff';
            const rColor = '#fdcb6e';

            ctx.font = 'bold 15px monospace';
            ctx.textAlign = 'center';

            if (showOrigin.checked) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '14px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('?', cx, cy);
                ctx.fillText('Origin', cx, cy + 18);
            }

            const A_len = A * scale;
            const kA_len = Math.abs(k) * A_len;

            const Ax = cx + A_len * Math.cos(A_angle * Math.PI / 180);
            const Ay = cy + A_len * Math.sin(A_angle * Math.PI / 180);

            const perpAngle = (A_angle + 90) * Math.PI / 180;
            const offsetY = 120;
            const kOriginX = cx + offsetY * Math.cos(perpAngle);
            const kOriginY = cy + offsetY * Math.sin(perpAngle);

            const kA_angle = k >= 0 ? A_angle : (A_angle + 180) % 360;
            const kAx = kOriginX + kA_len * Math.cos(kA_angle * Math.PI / 180);
            const kAy = kOriginY + kA_len * Math.sin(kA_angle * Math.PI / 180);

            if (A_len > 0) {
                drawArrow(cx, cy, A_len, A_angle, p1Color, 4, false);
                ctx.font = 'bold 16px monospace';
                ctx.fillStyle = p1Color;
                const midAx = (cx + Ax) / 2;
                const midAy = (cy + Ay) / 2;
                const labelOffset = 20;
                ctx.fillText('A', midAx + labelOffset * Math.cos(perpAngle), midAy + labelOffset * Math.sin(perpAngle));
                ctx.font = '13px monospace';
                ctx.fillText(A.toFixed(1) + ' m', midAx + labelOffset * Math.cos(perpAngle), midAy + labelOffset * Math.sin(perpAngle) + 18);
                ctx.font = 'bold 18px monospace';
            }

            if (kA_len > 0.5) {
                drawArrow(kOriginX, kOriginY, kA_len, kA_angle, rColor, 4, true);
                ctx.font = 'bold 16px monospace';
                ctx.fillStyle = rColor;
                const midkAx = (kOriginX + kAx) / 2;
                const midkAy = (kOriginY + kAy) / 2;
                const labelOffset = 20;
                const perpAngle2 = (kA_angle + 90) * Math.PI / 180;
                ctx.fillText('kA', midkAx + labelOffset * Math.cos(perpAngle2), midkAy + labelOffset * Math.sin(perpAngle2));
                ctx.font = '13px monospace';
                ctx.fillText('|kA| = ' + (Math.abs(k) * A).toFixed(1) + ' m', midkAx + labelOffset * Math.cos(perpAngle2), midkAy + labelOffset * Math.sin(perpAngle2) + 18);
                ctx.font = 'bold 18px monospace';
            }

            if (A_len > 0) {
                const arcR = Math.min(35, A_len * 0.25);
                if (arcR > 5) {
                    ctx.strokeStyle = p1Color;
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.arc(cx, cy, arcR, 0, A_angle * Math.PI / 180);
                    ctx.stroke();

                    ctx.fillStyle = p1Color;
                    ctx.font = 'bold 14px monospace';
                    ctx.textAlign = 'center';
                    const midA = A_angle / 2 * Math.PI / 180;
                    ctx.fillText(A_angle.toFixed(0) + '°', cx + (arcR + 18) * Math.cos(midA), cy + (arcR + 18) * Math.sin(midA) + 4);
                }
            }

            if (kA_len > 0.5 && Math.abs(k) > 0.01) {
                const arcR = Math.min(35, kA_len * 0.25);
                if (arcR > 5) {
                    ctx.strokeStyle = rColor;
                    ctx.lineWidth = 2;
                    ctx.setLineDash([3, 3]);
                    ctx.beginPath();
                    ctx.arc(kOriginX, kOriginY, arcR + 8, 0, kA_angle * Math.PI / 180);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }

            if (Math.abs(k) !== 1 && k !== 0) {
                const scaleX = Math.abs(k);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 14px monospace';
                ctx.textAlign = 'right';
                if (k > 0) {
                    ctx.fillText('k > 0 ? same direction, magnitude × ' + scaleX.toFixed(1), canvas.width - 20, 28);
                } else {
                    ctx.fillText('k < 0 ? opposite direction, magnitude × ' + scaleX.toFixed(1), canvas.width - 20, 28);
                }
            } else if (k === 0) {
                ctx.fillStyle = '#fdcb6e';
                ctx.font = 'bold 14px monospace';
                ctx.textAlign = 'right';
                ctx.fillText('k = 0 ? zero vector (no direction)', canvas.width - 20, 28);
            } else if (k === 1) {
                ctx.fillStyle = '#00b894';
                ctx.font = 'bold 14px monospace';
                ctx.textAlign = 'right';
                ctx.fillText('k = 1 ? kA = A (unchanged)', canvas.width - 20, 28);
            } else if (k === -1) {
                ctx.fillStyle = '#e17055';
                ctx.font = 'bold 14px monospace';
                ctx.textAlign = 'right';
                ctx.fillText('k = -1 ? kA = -A (reversed)', canvas.width - 20, 28);
            }

            ctx.font = '13px monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#00b894';
            ctx.fillText('? A (Original)', 15, canvas.height - 35);
            ctx.fillStyle = '#fdcb6e';
            ctx.fillText('? kA (Resultant)', 15, canvas.height - 18);
        }

        function animate() {
            if (!sim.running || sim.paused) return;

            sim.time += sim.dt;

            sim.animatingK = parseFloat(kSlider.value) + 2 * Math.sin(sim.time * 0.8);
            if (sim.animatingK < -5) sim.animatingK = -5;
            if (sim.animatingK > 5) sim.animatingK = 5;

            kSlider.value = Math.round(sim.animatingK * 2) / 2;
            document.getElementById('kVal').textContent = kSlider.value;

            updateStats();
            draw();
            requestAnimationFrame(animate);
        }

        reset();
    
// From: simple-harmonic-motion.html


// From: simple-harmonic-motion.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');

        const ampSlider = document.getElementById('amplitude');
        const freqSlider = document.getElementById('frequency');
        const massSlider = document.getElementById('mass');
        const dampSlider = document.getElementById('damping');
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');

        let sim = {
            running: false,
            time: 0,
            amplitude: 1,
            frequency: 1,
            mass: 1,
            damping: 0,
            mode: 'spring',
            phase: 0,
            graphData: [],
            maxGraphData: 400
        };

        function getParams() {
            sim.amplitude = parseFloat(ampSlider.value);
            sim.frequency = parseFloat(freqSlider.value);
            sim.mass = parseFloat(massSlider.value);
            sim.damping = parseFloat(dampSlider.value);

            document.getElementById('ampVal').textContent = sim.amplitude.toFixed(1) + ' m';
            document.getElementById('freqVal').textContent = sim.frequency.toFixed(1) + ' Hz';
            document.getElementById('massVal').textContent = sim.mass.toFixed(1) + ' kg';
            document.getElementById('dampVal').textContent = sim.damping.toFixed(2);

            if (!sim.running) draw();
        }

        [ampSlider, freqSlider, massSlider, dampSlider].forEach(el => el.addEventListener('input', getParams));

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                sim.mode = btn.dataset.mode;
                reset();
            });
        });

        startBtn.addEventListener('click', () => {
            sim.running = !sim.running;
            startBtn.textContent = sim.running ? 'Pause' : 'Resume';
            if (sim.running) requestAnimationFrame(animate);
        });

        resetBtn.addEventListener('click', reset);

        function reset() {
            sim.running = false;
            sim.time = 0;
            sim.phase = 0;
            sim.graphData = [];
            startBtn.textContent = 'Start';
            updateStats();
            draw();
        }

        function updateStats() {
            const omega = 2 * Math.PI * sim.frequency;
            const decay = Math.exp(-sim.damping * sim.time);
            const x = sim.amplitude * decay * Math.cos(omega * sim.time + sim.phase);
            const v = -sim.amplitude * decay * omega * Math.sin(omega * sim.time + sim.phase)
                      - sim.damping * sim.amplitude * decay * Math.cos(omega * sim.time + sim.phase);
            const a = -omega * omega * x;
            const k = sim.mass * omega * omega;
            const ke = 0.5 * sim.mass * v * v;
            const pe = 0.5 * k * x * x;

            document.getElementById('statX').textContent = x.toFixed(3) + ' m';
            document.getElementById('statV').textContent = v.toFixed(3) + ' m/s';
            document.getElementById('statA').textContent = a.toFixed(3) + ' m/s\u00b2';
            document.getElementById('statKE').textContent = ke.toFixed(3) + ' J';
            document.getElementById('statPE').textContent = pe.toFixed(3) + ' J';
            document.getElementById('statTE').textContent = (ke + pe).toFixed(3) + ' J';
        }

        function drawSpring(x1, y1, x2, y2, coils, width) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            const nx = dx / len;
            const ny = dy / len;
            const px = -ny;
            const py = nx;

            ctx.beginPath();
            ctx.moveTo(x1, y1);

            const segLen = len / (coils * 2);
            for (let i = 0; i < coils * 2; i++) {
                const t = (i + 0.5) / (coils * 2);
                const cx = x1 + dx * t + px * (i % 2 === 0 ? 1 : -1) * width;
                const cy = y1 + dy * t + py * (i % 2 === 0 ? 1 : -1) * width;
                ctx.lineTo(x1 + dx * (i + 1) / (coils * 2), y1 + dy * (i + 1) / (coils * 2));
            }
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bgGrad.addColorStop(0, '#000000');
            bgGrad.addColorStop(1, '#000000');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const omega = 2 * Math.PI * sim.frequency;
            const decay = Math.exp(-sim.damping * sim.time);
            const x = sim.amplitude * decay * Math.cos(omega * sim.time + sim.phase);
            const scale = 80; // pixels per meter
            const centerY = 160;
            const originX = 100;

            if (sim.mode === 'spring') {
                // Draw spring-mass system
                const wallX = 40;
                const massX = wallX + 80 + x * scale;
                const massY = centerY;
                const massSize = 20 + sim.mass * 5;

                // Wall
                ctx.fillStyle = '#cccccc';
                ctx.fillRect(wallX - 10, massY - 50, 10, 100);
                for (let i = -50; i < 50; i += 10) {
                    ctx.beginPath();
                    ctx.moveTo(wallX, massY + i);
                    ctx.lineTo(wallX + 10, massY + i + 10);
                    ctx.stroke();
                }

                // Spring
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                drawSpring(wallX, massY, massX - massSize, massY, 12, 15);

                // Mass
                const massGrad = ctx.createLinearGradient(massX - massSize, massY - massSize, massX + massSize, massY + massSize);
                massGrad.addColorStop(0, '#ffffff');
                massGrad.addColorStop(1, '#00a885');
                ctx.fillStyle = massGrad;
                ctx.fillRect(massX - massSize, massY - massSize, massSize * 2, massSize * 2);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.strokeRect(massX - massSize, massY - massSize, massSize * 2, massSize * 2);

                // Mass label
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(sim.mass.toFixed(1) + 'kg', massX, massY);

                // Equilibrium line
                const eqX = wallX + 80;
                ctx.strokeStyle = 'rgba(253, 203, 110, 0.4)';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(eqX, massY - 60);
                ctx.lineTo(eqX, massY + 60);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = 'rgba(253, 203, 110, 0.6)';
                ctx.font = '10px monospace';
                ctx.fillText('Equilibrium', eqX, massY - 65);

                // Displacement arrow
                if (Math.abs(x) > 0.01) {
                    ctx.strokeStyle = '#fdcb6e';
                    ctx.lineWidth = 2;
                    const arrowStart = Math.min(eqX, massX);
                    const arrowEnd = Math.max(eqX, massX);
                    ctx.beginPath();
                    ctx.moveTo(arrowStart, massY + massSize + 15);
                    ctx.lineTo(arrowEnd, massY + massSize + 15);
                    ctx.stroke();

                    // Arrowheads
                    const dir = x > 0 ? 1 : -1;
                    ctx.beginPath();
                    ctx.moveTo(arrowEnd, massY + massSize + 15);
                    ctx.lineTo(arrowEnd - dir * 8, massY + massSize + 10);
                    ctx.lineTo(arrowEnd - dir * 8, massY + massSize + 20);
                    ctx.closePath();
                    ctx.fillStyle = '#fdcb6e';
                    ctx.fill();

                    ctx.fillStyle = '#fdcb6e';
                    ctx.font = 'bold 11px monospace';
                    ctx.fillText('x=' + x.toFixed(2) + 'm', (eqX + massX) / 2, massY + massSize + 32);
                }

                // Draw graph below
                drawGraph(0, centerY + 80, canvas.width - 200, 200, omega, decay);

            } else {
                // Pendulum
                const pivotX = canvas.width / 2;
                const pivotY = 40;
                const length = 150 + sim.amplitude * 40;
                const angle = x / sim.amplitude * 0.5; // max 0.5 rad
                const bobX = pivotX + length * Math.sin(angle);
                const bobY = pivotY + length * Math.cos(angle);

                // Support
                ctx.fillStyle = '#cccccc';
                ctx.fillRect(pivotX - 40, pivotY - 10, 80, 10);

                // String
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(pivotX, pivotY);
                ctx.lineTo(bobX, bobY);
                ctx.stroke();

                // Pivot
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
                ctx.fill();

                // Bob
                const bobGrad = ctx.createRadialGradient(bobX - 3, bobY - 3, 0, bobX, bobY, 18);
                bobGrad.addColorStop(0, '#ffffff');
                bobGrad.addColorStop(1, '#cccccc');
                ctx.fillStyle = bobGrad;
                ctx.beginPath();
                ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
                ctx.fill();

                // Angle arc
                if (Math.abs(angle) > 0.01) {
                    ctx.strokeStyle = 'rgba(253, 203, 110, 0.5)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(pivotX, pivotY, 30, Math.PI / 2 - angle, Math.PI / 2);
                    ctx.stroke();

                    ctx.fillStyle = '#fdcb6e';
                    ctx.font = '11px monospace';
                    ctx.fillText('\u03b8=' + (angle * 180 / Math.PI).toFixed(1) + '\u00b0', pivotX + 35, pivotY + 30);
                }

                // Dashed vertical
                ctx.strokeStyle = 'rgba(255,255,255,0.15)';
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(pivotX, pivotY);
                ctx.lineTo(pivotX, pivotY + length + 20);
                ctx.stroke();
                ctx.setLineDash([]);

                // Graph
                drawGraph(0, 380, canvas.width - 200, 110, omega, decay);
            }
        }

        function drawGraph(x, y, w, h, omega, decay) {
            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = '#2d2d4a';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w, h);

            // Zero line
            const zeroY = y + h / 2;
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.beginPath();
            ctx.moveTo(x, zeroY);
            ctx.lineTo(x + w, zeroY);
            ctx.stroke();

            // Data
            if (sim.graphData.length > 1) {
                // Displacement
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < sim.graphData.length; i++) {
                    const px = x + (i / sim.maxGraphData) * w;
                    const py = zeroY - sim.graphData[i].x * 50;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();

                // Velocity
                ctx.strokeStyle = '#fdcb6e';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                for (let i = 0; i < sim.graphData.length; i++) {
                    const px = x + (i / sim.maxGraphData) * w;
                    const py = zeroY - sim.graphData[i].v * 15;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();
            }

            // Labels
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px monospace';
            ctx.fillText('x(t)', x + 5, zeroY - 50 * sim.amplitude * 50 + 12);
            ctx.fillStyle = '#fdcb6e';
            ctx.fillText('v(t)', x + 5, zeroY - 15 * 1 + 12);
        }

        function animate() {
            if (!sim.running) return;

            const dt = 0.016;
            sim.time += dt;

            const omega = 2 * Math.PI * sim.frequency;
            const decay = Math.exp(-sim.damping * sim.time);
            const x = sim.amplitude * decay * Math.cos(omega * sim.time + sim.phase);
            const v = -sim.amplitude * decay * omega * Math.sin(omega * sim.time + sim.phase);

            sim.graphData.push({ x, v });
            if (sim.graphData.length > sim.maxGraphData) sim.graphData.shift();

            updateStats();
            draw();

            requestAnimationFrame(animate);
        }

        getParams();
        draw();
    
// From: vector-addition-3d.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');

        // Camera
        let cam = { rotX: -0.4, rotY: 0.6, zoom: 1.0, targetRotX: -0.4, targetRotY: 0.6, targetZoom: 1.0 };

        // Sim state
        let sim = { running: false, paused: false, time: 0, dt: 0.016 };

        // Mouse drag rotation
        let isDragging = false;
        let lastMouse = { x: 0, y: 0 };

        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastMouse = { x: e.clientX, y: e.clientY };
        });
        canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - lastMouse.x;
            const dy = e.clientY - lastMouse.y;
            cam.targetRotY += dx * 0.008;
            cam.targetRotX += dy * 0.008;
            cam.targetRotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cam.targetRotX));
            lastMouse = { x: e.clientX, y: e.clientY };
        });
        canvas.addEventListener('mouseup', () => { isDragging = false; });
        canvas.addEventListener('mouseleave', () => { isDragging = false; });

        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            isDragging = true;
            lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            e.preventDefault();
        }, { passive: false });
        canvas.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const dx = e.touches[0].clientX - lastMouse.x;
            const dy = e.touches[0].clientY - lastMouse.y;
            cam.targetRotY += dx * 0.008;
            cam.targetRotX += dy * 0.008;
            cam.targetRotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cam.targetRotX));
            lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            e.preventDefault();
        }, { passive: false });
        canvas.addEventListener('touchend', () => { isDragging = false; });

        // Zoom
        canvas.addEventListener('wheel', (e) => {
            cam.targetZoom *= e.deltaY > 0 ? 0.95 : 1.05;
            cam.targetZoom = Math.max(0.3, Math.min(3.0, cam.targetZoom));
            e.preventDefault();
        }, { passive: false });

        const mA = document.getElementById('mA');
        const mB = document.getElementById('mB');
        const e1 = document.getElementById('e1');
        const a1 = document.getElementById('a1');
        const e2 = document.getElementById('e2');
        const a2 = document.getElementById('a2');
        const resetBtn = document.getElementById('resetBtn');

        mA.addEventListener('input', () => { document.getElementById('mAVal').textContent = mA.value; draw(); });
        mB.addEventListener('input', () => { document.getElementById('mBVal').textContent = mB.value; draw(); });
        e1.addEventListener('input', () => { document.getElementById('e1Val').textContent = e1.value; draw(); });
        a1.addEventListener('input', () => { document.getElementById('a1Val').textContent = a1.value; draw(); });
        e2.addEventListener('input', () => { document.getElementById('e2Val').textContent = e2.value; draw(); });
        a2.addEventListener('input', () => { document.getElementById('a2Val').textContent = a2.value; draw(); });
        document.getElementById('showAxes').addEventListener('change', draw);
        document.getElementById('showBox').addEventListener('change', draw);
        document.getElementById('showPlanes').addEventListener('change', draw);
        document.getElementById('showGrid').addEventListener('change', draw);
        document.getElementById('showLabels').addEventListener('change', draw);
        document.getElementById('showGlow').addEventListener('change', draw);
        document.getElementById('autoRotate').addEventListener('change', () => { sim.running = document.getElementById('autoRotate').checked; if (sim.running) animate(); });

        resetBtn.addEventListener('click', () => {
            cam.targetRotX = -0.4;
            cam.targetRotY = 0.6;
            cam.targetZoom = 1.0;
            e1.value = 30; a1.value = 0; e2.value = 45; a2.value = 90;
            document.getElementById('e1Val').textContent = '30';
            document.getElementById('a1Val').textContent = '0';
            document.getElementById('e2Val').textContent = '45';
            document.getElementById('a2Val').textContent = '90';
            updateStats(); draw();
        });

        function reset() {
            sim.running = document.getElementById('autoRotate').checked;
            updateStats(); draw();
        }

        function updateStats() {
            const mA_val = parseFloat(mA.value);
            const mB_val = parseFloat(mB.value);
            const t1 = parseFloat(e1.value) * Math.PI / 180;
            const p1 = parseFloat(a1.value) * Math.PI / 180;
            const t2 = parseFloat(e2.value) * Math.PI / 180;
            const p2 = parseFloat(a2.value) * Math.PI / 180;

            const Ax = mA_val * Math.cos(t1) * Math.cos(p1);
            const Ay = mA_val * Math.cos(t1) * Math.sin(p1);
            const Az = mA_val * Math.sin(t1);
            const Bx = mB_val * Math.cos(t2) * Math.cos(p2);
            const By = mB_val * Math.cos(t2) * Math.sin(p2);
            const Bz = mB_val * Math.sin(t2);

            const Rx = Ax + Bx, Ry = Ay + By, Rz = Az + Bz;
            const Rmag = Math.sqrt(Rx * Rx + Ry * Ry + Rz * Rz);

            document.getElementById('statA').textContent = mA_val.toFixed(1) + ' m';
            document.getElementById('statB').textContent = mB_val.toFixed(1) + ' m';
            document.getElementById('statR').textContent = Rmag.toFixed(1) + ' m';
            document.getElementById('statRx').textContent = Rx.toFixed(2) + ' m';
            document.getElementById('statRy').textContent = Ry.toFixed(2) + ' m';
            document.getElementById('statRz').textContent = Rz.toFixed(2) + ' m';
        }

        // Simple 3D projection (always visible)
        function project3D(x, y, z) {
            const cosY = Math.cos(cam.rotY), sinY = Math.sin(cam.rotY);
            const px = x * cosY + z * sinY;
            const pz = -x * sinY + z * cosY;
            const cosX = Math.cos(cam.rotX), sinX = Math.sin(cam.rotX);
            const py = y * cosX - pz * sinX;
            const pz2 = y * sinX + pz * cosX;
            const scale = 25 * cam.zoom;
            return {
                x: canvas.width / 2 + px * scale,
                y: canvas.height / 2 - py * scale,
                z: pz2,
                scale: scale,
                depth: pz2
            };
        }

        function drawArrow3D(p1, p2, color, lw, dashed, depth) {
            if (!p1 || !p2) return;
            ctx.save();
            if (dashed) ctx.setLineDash([5, 4]);

            ctx.globalAlpha = 1;

            ctx.strokeStyle = color;
            ctx.lineWidth = lw;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.setLineDash([]);

            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const headLen = 12;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(p2.x, p2.y);
            ctx.lineTo(p2.x - headLen * Math.cos(angle - 0.4), p2.y - headLen * Math.sin(angle - 0.4));
            ctx.lineTo(p2.x - headLen * Math.cos(angle + 0.4), p2.y - headLen * Math.sin(angle + 0.4));
            ctx.closePath();
            ctx.fill();

            if (document.getElementById('showGlow').checked) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 8;
                ctx.strokeStyle = color;
                ctx.lineWidth = lw * 0.5;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            ctx.restore();
        }

        function drawGlowCircle(p, radius, color) {
            if (!p) return;
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius * cam.zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 0.8;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius * 0.5 * cam.zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        function drawGrid() {
            if (!document.getElementById('showGrid').checked) return;
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 1;
            const gridSize = 5;
            const step = 0.5;
            for (let i = -gridSize; i <= gridSize; i += step) {
                const p1x = project3D(i, 0, -gridSize);
                const p2x = project3D(i, 0, gridSize);
                if (p1x && p2x) {
                    ctx.beginPath(); ctx.moveTo(p1x.x, p1x.y); ctx.lineTo(p2x.x, p2x.y); ctx.stroke();
                }
                const p1y = project3D(-gridSize, 0, i);
                const p2y = project3D(gridSize, 0, i);
                if (p1y && p2y) {
                    ctx.beginPath(); ctx.moveTo(p1y.x, p1y.y); ctx.lineTo(p2y.x, p2y.y); ctx.stroke();
                }
            }
            ctx.restore();
        }

        function drawPlanes() {
            if (!document.getElementById('showPlanes').checked) return;
            const s = 5;
            const corners = {
                xy: [project3D(-s, 0, -s), project3D(s, 0, -s), project3D(s, 0, s), project3D(-s, 0, s)],
                xz: [project3D(-s, -s, -s), project3D(s, -s, -s), project3D(s, -s, s), project3D(-s, -s, s)],
                yz: [project3D(-s, -s, 0), project3D(s, -s, 0), project3D(s, s, 0), project3D(-s, s, 0)]
            };

            ctx.save();
            ctx.globalAlpha = 0.04;
            ctx.fillStyle = '#74b9ff';
            ctx.beginPath();
            if (corners.xy[0]) { ctx.moveTo(corners.xy[0].x, corners.xy[0].y);
                corners.xy.forEach(c => ctx.lineTo(c.x, c.y)); ctx.closePath(); ctx.fill(); }
            ctx.fillStyle = '#ff6b6b';
            ctx.globalAlpha = 0.03;
            ctx.beginPath();
            if (corners.xz[0]) { ctx.moveTo(corners.xz[0].x, corners.xz[0].y);
                corners.xz.forEach(c => ctx.lineTo(c.x, c.y)); ctx.closePath(); ctx.fill(); }
            ctx.fillStyle = '#51cf66';
            ctx.globalAlpha = 0.03;
            ctx.beginPath();
            if (corners.yz[0]) { ctx.moveTo(corners.yz[0].x, corners.yz[0].y);
                corners.yz.forEach(c => ctx.lineTo(c.x, c.y)); ctx.closePath(); ctx.fill(); }
            ctx.restore();
        }

        function drawAxes() {
            if (!document.getElementById('showAxes').checked) return;
            const len = 5;
            const origin = project3D(0, 0, 0);
            const xAxis = project3D(len, 0, 0);
            const yAxis = project3D(0, len, 0);
            const zAxis = project3D(0, 0, len);

            drawArrow3D(origin, xAxis, '#ff6b6b', 2, false, xAxis ? xAxis.z : 0);
            drawArrow3D(origin, yAxis, '#51cf66', 2, false, yAxis ? yAxis.z : 0);
            drawArrow3D(origin, zAxis, '#74b9ff', 2, false, zAxis ? zAxis.z : 0);

            if (document.getElementById('showLabels').checked) {
                ctx.save();
                ctx.font = 'bold 16px monospace';
                ctx.textAlign = 'center';
                if (xAxis) { ctx.fillStyle = '#ff6b6b'; ctx.fillText('X', xAxis.x + 15, xAxis.y + 5); }
                if (yAxis) { ctx.fillStyle = '#51cf66'; ctx.fillText('Y', yAxis.x, yAxis.y - 15); }
                if (zAxis) { ctx.fillStyle = '#74b9ff'; ctx.fillText('Z', zAxis.x + 15, zAxis.y); }
                ctx.restore();
            }
        }

        function drawProjectionBox(Ax, Ay, Az, Bx, By, Bz, Rx, Ry, Rz) {
            if (!document.getElementById('showBox').checked) return;
            const origin = project3D(0, 0, 0);
            const tipA = project3D(Ax, Ay, Az);
            const tipB = project3D(Bx, By, Bz);
            const tipR = project3D(Rx, Ry, Rz);

            // A components
            const aXProj = project3D(Ax, 0, 0);
            const aYProj = project3D(0, Ay, 0);
            const aZProj = project3D(0, 0, Az);
            const aXY = project3D(Ax, Ay, 0);
            const aXZ = project3D(Ax, 0, Az);
            const aYZ = project3D(0, Ay, Az);

            ctx.save();
            ctx.strokeStyle = 'rgba(0,184,148,0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);

            if (aXProj && aXY) { ctx.beginPath(); ctx.moveTo(aXProj.x, aXProj.y); ctx.lineTo(aXY.x, aXY.y); ctx.stroke(); }
            if (aYProj && aXY) { ctx.beginPath(); ctx.moveTo(aYProj.x, aYProj.y); ctx.lineTo(aXY.x, aXY.y); ctx.stroke(); }
            if (aXProj && aXZ) { ctx.beginPath(); ctx.moveTo(aXProj.x, aXProj.y); ctx.lineTo(aXZ.x, aXZ.y); ctx.stroke(); }
            if (aZProj && aXZ) { ctx.beginPath(); ctx.moveTo(aZProj.x, aZProj.y); ctx.lineTo(aXZ.x, aXZ.y); ctx.stroke(); }
            if (aXY && tipA) { ctx.beginPath(); ctx.moveTo(aXY.x, aXY.y); ctx.lineTo(tipA.x, tipA.y); ctx.stroke(); }
            if (aXZ && tipA) { ctx.beginPath(); ctx.moveTo(aXZ.x, aXZ.y); ctx.lineTo(tipA.x, tipA.y); ctx.stroke(); }
            if (aYZ && tipA) { ctx.beginPath(); ctx.moveTo(aYZ.x, aYZ.y); ctx.lineTo(tipA.x, tipA.y); ctx.stroke(); }

            // R components
            const rXProj = project3D(Rx, 0, 0);
            const rYProj = project3D(0, Ry, 0);
            const rZProj = project3D(0, 0, Rz);
            const rXY = project3D(Rx, Ry, 0);
            const rXZ = project3D(Rx, 0, Rz);
            const rYZ = project3D(0, Ry, Rz);

            ctx.strokeStyle = 'rgba(253,203,110,0.15)';
            if (rXProj && rXY) { ctx.beginPath(); ctx.moveTo(rXProj.x, rXProj.y); ctx.lineTo(rXY.x, rXY.y); ctx.stroke(); }
            if (rYProj && rXY) { ctx.beginPath(); ctx.moveTo(rYProj.x, rYProj.y); ctx.lineTo(rXY.x, rXY.y); ctx.stroke(); }
            if (rXProj && rXZ) { ctx.beginPath(); ctx.moveTo(rXProj.x, rXProj.y); ctx.lineTo(rXZ.x, rXZ.y); ctx.stroke(); }
            if (rZProj && rXZ) { ctx.beginPath(); ctx.moveTo(rZProj.x, rZProj.y); ctx.lineTo(rXZ.x, rXZ.y); ctx.stroke(); }
            if (rXY && tipR) { ctx.beginPath(); ctx.moveTo(rXY.x, rXY.y); ctx.lineTo(tipR.x, tipR.y); ctx.stroke(); }
            if (rXZ && tipR) { ctx.beginPath(); ctx.moveTo(rXZ.x, rXZ.y); ctx.lineTo(tipR.x, tipR.y); ctx.stroke(); }
            if (rYZ && tipR) { ctx.beginPath(); ctx.moveTo(rYZ.x, rYZ.y); ctx.lineTo(tipR.x, tipR.y); ctx.stroke(); }

            ctx.setLineDash([]);
            ctx.restore();
        }

        function drawLabels(Ax, Ay, Az, Bx, By, Bz, Rx, Ry, Rz) {
            if (!document.getElementById('showLabels').checked) return;
            const origin = project3D(0, 0, 0);
            const tipA = project3D(Ax, Ay, Az);
            const tipBshifted = project3D(Ax + Bx, Ay + By, Az + Bz);
            const tipR = project3D(Rx, Ry, Rz);

            ctx.save();
            ctx.font = 'bold 15px monospace';
            ctx.textAlign = 'center';

            if (tipA) {
                ctx.fillStyle = '#00b894';
                ctx.shadowColor = '#00b894';
                ctx.shadowBlur = 6;
                ctx.fillText('A', tipA.x + 18, tipA.y - 10);
                ctx.shadowBlur = 0;
            }
            if (tipBshifted) {
                ctx.fillStyle = '#e17055';
                ctx.shadowColor = '#e17055';
                ctx.shadowBlur = 6;
                ctx.fillText('B', tipBshifted.x + 18, tipBshifted.y - 10);
                ctx.shadowBlur = 0;
            }
            if (tipR) {
                ctx.fillStyle = '#fdcb6e';
                ctx.shadowColor = '#fdcb6e';
                ctx.shadowBlur = 8;
                ctx.fillText('R=A+B', tipR.x + 20, tipR.y - 10);
                ctx.shadowBlur = 0;
            }

            // Origin dot
            if (origin) {
                drawGlowCircle(origin, 6, '#fff');
            }

            // Tip glows
            if (tipA) drawGlowCircle(tipA, 8, '#00b894');
            if (tipBshifted) drawGlowCircle(tipBshifted, 8, '#e17055');
            if (tipR) drawGlowCircle(tipR, 10, '#fdcb6e');

            ctx.restore();
        }

        function draw() {
            cam.rotX += (cam.targetRotX - cam.rotX) * 0.1;
            cam.rotY += (cam.targetRotY - cam.rotY) * 0.1;
            cam.zoom += (cam.targetZoom - cam.zoom) * 0.1;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const bg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.6);
            bg.addColorStop(0, '#0a0a1a');
            bg.addColorStop(1, '#000000');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const mA_val = parseFloat(mA.value);
            const mB_val = parseFloat(mB.value);
            const t1 = parseFloat(e1.value) * Math.PI / 180;
            const p1 = parseFloat(a1.value) * Math.PI / 180;
            const t2 = parseFloat(e2.value) * Math.PI / 180;
            const p2 = parseFloat(a2.value) * Math.PI / 180;

            const Ax = mA_val * Math.cos(t1) * Math.cos(p1);
            const Ay = mA_val * Math.cos(t1) * Math.sin(p1);
            const Az = mA_val * Math.sin(t1);
            const Bx = mB_val * Math.cos(t2) * Math.cos(p2);
            const By = mB_val * Math.cos(t2) * Math.sin(p2);
            const Bz = mB_val * Math.sin(t2);

            const Rx = Ax + Bx, Ry = Ay + By, Rz = Az + Bz;

            const origin = project3D(0, 0, 0);
            const tipA = project3D(Ax, Ay, Az);
            const tipB = project3D(Bx, By, Bz);
            const tipR = project3D(Rx, Ry, Rz);
            const tipBshifted = project3D(Ax + Bx, Ay + By, Az + Bz);

            drawPlanes();
            drawGrid();
            drawAxes();
            drawProjectionBox(Ax, Ay, Az, Bx, By, Bz, Rx, Ry, Rz);

            // Dashed line showing where B would be from origin (ghost)
            if (origin && tipB) {
                ctx.save();
                ctx.strokeStyle = 'rgba(225,112,85,0.2)';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(tipB.x, tipB.y); ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();
            }

            // Vector A: origin ? tipA
            if (origin && tipA) {
                const avgDepth = (origin.z + tipA.z) / 2;
                drawArrow3D(origin, tipA, '#00b894', 4, false, avgDepth);
                if (document.getElementById('showGlow').checked) {
                    ctx.save();
                    ctx.shadowColor = '#00b894';
                    ctx.shadowBlur = 12;
                    ctx.strokeStyle = 'rgba(0,184,148,0.4)';
                    ctx.lineWidth = 6;
                    ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(tipA.x, tipA.y); ctx.stroke();
                    ctx.restore();
                }
            }

            // Vector B: head of A ? head of B (shifted to tip of A)
            if (tipA && tipBshifted) {
                const avgDepth = (tipA.z + tipBshifted.z) / 2;
                drawArrow3D(tipA, tipBshifted, '#e17055', 4, false, avgDepth);
                if (document.getElementById('showGlow').checked) {
                    ctx.save();
                    ctx.shadowColor = '#e17055';
                    ctx.shadowBlur = 12;
                    ctx.strokeStyle = 'rgba(225,112,85,0.4)';
                    ctx.lineWidth = 6;
                    ctx.beginPath(); ctx.moveTo(tipA.x, tipA.y); ctx.lineTo(tipBshifted.x, tipBshifted.y); ctx.stroke();
                    ctx.restore();
                }
            }

            // Resultant R: origin ? tipR (which is tipA + B)
            if (origin && tipR) {
                const avgDepth = (origin.z + tipR.z) / 2;
                drawArrow3D(origin, tipR, '#fdcb6e', 5, false, avgDepth);
                if (document.getElementById('showGlow').checked) {
                    ctx.save();
                    ctx.shadowColor = '#fdcb6e';
                    ctx.shadowBlur = 15;
                    ctx.strokeStyle = 'rgba(253,203,110,0.5)';
                    ctx.lineWidth = 7;
                    ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(tipR.x, tipR.y); ctx.stroke();
                    ctx.restore();
                }
            }

            // Dashed lines: origin ? projection of tipR on XY ? tipR (for depth)
            const rXY = project3D(Rx, Ry, 0);
            if (rXY && tipR) {
                ctx.save();
                ctx.strokeStyle = 'rgba(253,203,110,0.3)';
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 3]);
                ctx.beginPath(); ctx.moveTo(rXY.x, rXY.y); ctx.lineTo(tipR.x, tipR.y); ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();
            }

            drawLabels(Ax, Ay, Az, Bx, By, Bz, Rx, Ry, Rz);

            // Connection dot at tip of A (head of A = tail of B)
            if (tipA) {
                drawGlowCircle(tipA, 6, '#00b894');
                ctx.save();
                ctx.font = 'bold 12px monospace';
                ctx.fillStyle = '#00b894';
                ctx.textAlign = 'center';
                ctx.fillText('A', tipA.x, tipA.y + 18);
                ctx.restore();
            }

            // Formula
            ctx.save();
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'right';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillText('A = (' + Ax.toFixed(1) + ', ' + Ay.toFixed(1) + ', ' + Az.toFixed(1) + ')', canvas.width - 20, 30);
            ctx.fillText('B = (' + Bx.toFixed(1) + ', ' + By.toFixed(1) + ', ' + Bz.toFixed(1) + ')', canvas.width - 20, 50);
            ctx.fillStyle = '#fdcb6e';
            ctx.fillText('R = (' + Rx.toFixed(1) + ', ' + Ry.toFixed(1) + ', ' + Rz.toFixed(1) + ')', canvas.width - 20, 75);
            const Rmag = Math.sqrt(Rx * Rx + Ry * Ry + Rz * Rz);
            ctx.fillText('|R| = ' + Rmag.toFixed(1) + ' m', canvas.width - 20, 100);
            ctx.textAlign = 'left';
            ctx.restore();

            // Legend
            ctx.save();
            ctx.font = '13px monospace';
            ctx.fillStyle = '#00b894'; ctx.fillText('? A', 15, canvas.height - 35);
            ctx.fillStyle = '#e17055'; ctx.fillText('? B', 15, canvas.height - 18);
            ctx.fillStyle = '#fdcb6e'; ctx.fillText('? R = A + B', canvas.width - 150, canvas.height - 18);
            ctx.restore();

            updateStats();
        }

        function animate() {
            if (!sim.running) return;
            sim.time += sim.dt;
            cam.targetRotY += 0.005;
            updateStats();
            draw();
            requestAnimationFrame(animate);
        }

        if (document.getElementById('autoRotate').checked) {
            sim.running = true;
            animate();
        }

        updateStats();
        draw();
    
// From: vector-addition-parallelogram.html


// From: vector-addition-parallelogram.html

const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');

const mA = document.getElementById('mA');
const mB = document.getElementById('mB');

const aA = document.getElementById('aA');
const aB = document.getElementById('aB');

const shiftX = document.getElementById('shiftX');
const shiftY = document.getElementById('shiftY');

const statA = document.getElementById('statA');
const statB = document.getElementById('statB');
const statAngle = document.getElementById('statAngle');
const statR = document.getElementById('statR');

function updateValues() {

    document.getElementById('mAVal').textContent = mA.value;
    document.getElementById('mBVal').textContent = mB.value;

    document.getElementById('aAVal').textContent = aA.value;
    document.getElementById('aBVal').textContent = aB.value;

    document.getElementById('shiftXVal').textContent = shiftX.value;
    document.getElementById('shiftYVal').textContent = shiftY.value;
}

function drawArrow(x1, y1, x2, y2, color, width=4, dashed=false){

    ctx.save();

    if(dashed){
        ctx.setLineDash([8,6]);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();

    ctx.setLineDash([]);

    const angle = Math.atan2(y2-y1,x2-x1);

    const head = 14;

    ctx.fillStyle = color;

    ctx.beginPath();

    ctx.moveTo(x2,y2);

    ctx.lineTo(
        x2 - head*Math.cos(angle - Math.PI/6),
        y2 - head*Math.sin(angle - Math.PI/6)
    );

    ctx.lineTo(
        x2 - head*Math.cos(angle + Math.PI/6),
        y2 - head*Math.sin(angle + Math.PI/6)
    );

    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function draw(){

    updateValues();

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const scale = 35;

    const A = parseFloat(mA.value);
    const B = parseFloat(mB.value);

    const angleA = parseFloat(aA.value) * Math.PI/180;
    const angleB = parseFloat(aB.value) * Math.PI/180;

    const sx = parseFloat(shiftX.value);
    const sy = parseFloat(shiftY.value);

    const originX = 260 + sx;
    const originY = 340 + sy;

    const Ax = A * scale * Math.cos(angleA);
    const Ay = A * scale * Math.sin(angleA);

    const Bx = B * scale * Math.cos(angleB);
    const By = B * scale * Math.sin(angleB);

    const O = {
        x: originX,
        y: originY
    };

    const P = {
        x: O.x + Ax,
        y: O.y + Ay
    };

    const Q = {
        x: O.x + Bx,
        y: O.y + By
    };

    const R = {
        x: O.x + Ax + Bx,
        y: O.y + Ay + By
    };

    // PARALLELOGRAM

    ctx.strokeStyle = "#fdcb6e";
    ctx.lineWidth = 2;
    ctx.setLineDash([8,5]);

    ctx.beginPath();

    ctx.moveTo(O.x,O.y);
    ctx.lineTo(P.x,P.y);
    ctx.lineTo(R.x,R.y);
    ctx.lineTo(Q.x,Q.y);

    ctx.closePath();
    ctx.stroke();

    ctx.setLineDash([]);

    // MAIN VECTORS

    drawArrow(O.x,O.y,P.x,P.y,"#00b894",4);

    drawArrow(O.x,O.y,Q.x,Q.y,"#e17055",4);

    // SHIFTED VECTORS

    const showShifted =
        document.getElementById('showShifted').checked;

    if(showShifted){

        drawArrow(
            Q.x,Q.y,
            R.x,R.y,
            "#00b894",
            3,
            true
        );

        drawArrow(
            P.x,P.y,
            R.x,R.y,
            "#e17055",
            3,
            true
        );
    }

    // RESULTANT

    drawArrow(
        O.x,O.y,
        R.x,R.y,
        "#fdcb6e",
        5
    );

    // LABELS

    ctx.font = "bold 16px monospace";

    ctx.fillStyle = "#00b894";
    ctx.fillText(
        "A",
        (O.x+P.x)/2,
        (O.y+P.y)/2 - 10
    );

    ctx.fillStyle = "#e17055";
    ctx.fillText(
        "B",
        (O.x+Q.x)/2,
        (O.y+Q.y)/2 - 10
    );

    ctx.fillStyle = "#fdcb6e";
    ctx.fillText(
        "R",
        (O.x+R.x)/2,
        (O.y+R.y)/2 - 15
    );

    // POINTS

    ctx.fillStyle = "#ffffff";

    ctx.fillText("O", O.x-20, O.y+20);
    ctx.fillText("P", P.x+10, P.y);
    ctx.fillText("Q", Q.x+10, Q.y);
    ctx.fillText("R", R.x+10, R.y);

    // ANGLE ARC

    const theta =
        Math.abs(
            parseFloat(aB.value)
            -
            parseFloat(aA.value)
        );

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        O.x,
        O.y,
        50,
        angleA,
        angleB
    );

    ctx.stroke();

    const mid = (angleA + angleB)/2;

    ctx.fillStyle = "#ffffff";
    ctx.font = "14px monospace";

    ctx.fillText(
        theta.toFixed(0) + "°",
        O.x + 65*Math.cos(mid),
        O.y + 65*Math.sin(mid)
    );

    // RESULTANT VALUE

    const resultant = Math.sqrt(
        A*A +
        B*B +
        2*A*B*Math.cos(theta*Math.PI/180)
    );

    statA.textContent = A.toFixed(1);
    statB.textContent = B.toFixed(1);

    statAngle.textContent =
        theta.toFixed(1) + "°";

    statR.textContent =
        resultant.toFixed(2);

    // FORMULA

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "right";

    ctx.fillText(
        "|R| = v(A² + B² + 2ABcos?)",
        canvas.width - 20,
        30
    );

    ctx.fillText(
        "A + B = B + A",
        canvas.width - 20,
        55
    );

    ctx.textAlign = "left";
}

mA.addEventListener('input',draw);
mB.addEventListener('input',draw);

aA.addEventListener('input',draw);
aB.addEventListener('input',draw);

shiftX.addEventListener('input',draw);
shiftY.addEventListener('input',draw);

document
.getElementById('showShifted')
.addEventListener('change',draw);

document
.getElementById('startBtn')
.addEventListener('click',draw);

document
.getElementById('resetBtn')
.addEventListener('click',()=>{

    mA.value = 5;
    mB.value = 4;

    aA.value = 0;
    aB.value = 60;

    shiftX.value = 0;
    shiftY.value = 0;

    draw();
});

draw();

// From: vector-addition-triangle.html


// From: vector-addition-triangle.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');

        let sim = {
            running: false,
            paused: false,
            time: 0,
            dt: 0.016,
            currentA: 5,
            currentB: 4
        };

        const mA = document.getElementById('mA');
        const mB = document.getElementById('mB');
        const aA = document.getElementById('aA');
        const aB = document.getElementById('aB');
        const originX = document.getElementById('originX');
        const originY = document.getElementById('originY');
        const showOrigin = document.getElementById('showOrigin');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const statA = document.getElementById('statA');
        const statB = document.getElementById('statB');
        const statAngle = document.getElementById('statAngle');
        const statR = document.getElementById('statR');
        const statAlpha = document.getElementById('statAlpha');
        const statRDir = document.getElementById('statRDir');

        mA.addEventListener('input', () => {
            document.getElementById('mAVal').textContent = mA.value;
            if (!sim.running) reset();
            draw();
        });

        mB.addEventListener('input', () => {
            document.getElementById('mBVal').textContent = mB.value;
            if (!sim.running) reset();
            draw();
        });

        aA.addEventListener('input', () => {
            document.getElementById('aAVal').textContent = aA.value;
            if (!sim.running) reset();
            draw();
        });

        aB.addEventListener('input', () => {
            document.getElementById('aBVal').textContent = aB.value;
            if (!sim.running) reset();
            draw();
        });

        originX.addEventListener('input', () => {
            document.getElementById('originXVal').textContent = originX.value;
            draw();
        });

        originY.addEventListener('input', () => {
            document.getElementById('originYVal').textContent = originY.value;
            draw();
        });

        showOrigin.addEventListener('change', () => {
            document.getElementById('originControls').style.display = showOrigin.checked ? 'block' : 'none';
            draw();
        });

        startBtn.addEventListener('click', () => {
            if (!sim.running) {
                sim.running = true;
                sim.paused = false;
                startBtn.disabled = true;
                startBtn.textContent = 'Running';
                pauseBtn.style.display = 'block';
                animate();
            }
        });

        pauseBtn.addEventListener('click', () => {
            sim.paused = !sim.paused;
            pauseBtn.textContent = sim.paused ? 'Resume' : 'Pause';
            if (!sim.paused) animate();
        });

        resetBtn.addEventListener('click', reset);

        function reset() {
            sim.running = false;
            sim.paused = false;
            sim.time = 0;
            sim.currentA = parseFloat(mA.value);
            sim.currentB = parseFloat(mB.value);
            startBtn.disabled = false;
            startBtn.textContent = 'Start';
            pauseBtn.style.display = 'none';
            pauseBtn.textContent = 'Pause';
            updateStats();
            draw();
        }

        function updateStats() {
            const thetaDeg = parseFloat(aB.value) - parseFloat(aA.value);
            const thetaRad = thetaDeg * Math.PI / 180;
            const A = sim.running ? sim.currentA : parseFloat(mA.value);
            const B = sim.running ? sim.currentB : parseFloat(mB.value);

            const R = Math.sqrt(A * A + B * B + 2 * A * B * Math.cos(thetaRad));
            const alpha = Math.atan2(B * Math.sin(thetaRad), A + B * Math.cos(thetaRad));
            const alphaDeg = alpha * 180 / Math.PI;
            const A_angle = sim.running ? (parseFloat(aA.value) + 0.05 * sim.time) % 360 : parseFloat(aA.value);
            const R_angle = A_angle + alphaDeg;

            statA.textContent = A.toFixed(1) + ' m';
            statB.textContent = B.toFixed(1) + ' m';
            statAngle.textContent = thetaDeg.toFixed(1) + '°';
            statR.textContent = R.toFixed(1) + ' m';
            statAlpha.textContent = alphaDeg.toFixed(1) + '°';
            statRDir.textContent = R_angle.toFixed(1) + '°';
        }

        function drawArrow(x, y, length, angleDeg, color, lineWidth, dashed) {
            const endX = x + length * Math.cos(angleDeg * Math.PI / 180);
            const endY = y + length * Math.sin(angleDeg * Math.PI / 180);

            ctx.save();
            if (dashed) {
                ctx.setLineDash([6, 4]);
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            const headLen = 14;
            const headAngle = 25;
            ctx.setLineDash([]);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
                endX - headLen * Math.cos((angleDeg - headAngle) * Math.PI / 180),
                endY - headLen * Math.sin((angleDeg - headAngle) * Math.PI / 180)
            );
            ctx.lineTo(
                endX - headLen * Math.cos((angleDeg + headAngle) * Math.PI / 180),
                endY - headLen * Math.sin((angleDeg + headAngle) * Math.PI / 180)
            );
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bg.addColorStop(0, '#000000');
            bg.addColorStop(1, '#000000');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const thetaDeg = parseFloat(aB.value) - parseFloat(aA.value);
            const thetaRad = thetaDeg * Math.PI / 180;

            let cx, cy;
            if (showOrigin.checked) {
                cx = parseFloat(originX.value);
                cy = parseFloat(originY.value);
            } else {
                cx = canvas.width * 0.25;
                cy = canvas.height * 0.55;
            }

            const scale = 120;

            const A = sim.running ? sim.currentA : parseFloat(mA.value);
            const B = sim.running ? sim.currentB : parseFloat(mB.value);
            const A_angle = parseFloat(aA.value);
            const B_angle = parseFloat(aB.value);

            const p1Color = '#00b894';
            const p2Color = '#e17055';
            const rColor = '#fdcb6e';

            ctx.font = 'bold 15px monospace';
            ctx.textAlign = 'center';

            if (showOrigin.checked) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '14px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('?', cx, cy);
                ctx.fillText('Origin', cx, cy + 18);
            }

            const A_len = A * scale;
            const B_len = B * scale;

            const Ax = cx + A_len * Math.cos(A_angle * Math.PI / 180);
            const Ay = cy + A_len * Math.sin(A_angle * Math.PI / 180);

            const Bx = Ax + B_len * Math.cos(B_angle * Math.PI / 180);
            const By = Ay + B_len * Math.sin(B_angle * Math.PI / 180);

            const Rx = cx + B_len * Math.cos(B_angle * Math.PI / 180);
            const Ry = cy + B_len * Math.sin(B_angle * Math.PI / 180);

            const R_len = Math.sqrt((Bx - cx) ** 2 + (By - cy) ** 2);
            const R_angle = Math.atan2(By - cy, Bx - cx) * 180 / Math.PI;

            if (A_len > 0) {
                drawArrow(cx, cy, A_len, A_angle, p1Color, 4, false);
                ctx.font = 'bold 16px monospace';
                ctx.fillStyle = p1Color;
                const midAx = (cx + Ax) / 2;
                const midAy = (cy + Ay) / 2;
                const labelOffset = 20;
                const perpAngle = (A_angle + 90) * Math.PI / 180;
                ctx.fillText('A', midAx + labelOffset * Math.cos(perpAngle), midAy + labelOffset * Math.sin(perpAngle));
                ctx.font = '13px monospace';
                ctx.fillText(A.toFixed(1) + ' m', midAx + labelOffset * Math.cos(perpAngle), midAy + labelOffset * Math.sin(perpAngle) + 18);
                ctx.font = 'bold 18px monospace';
            }

            if (B_len > 0) {
                drawArrow(Ax, Ay, B_len, B_angle, p2Color, 4, false);
                ctx.font = 'bold 16px monospace';
                ctx.fillStyle = p2Color;
                const midBx = (Ax + Bx) / 2;
                const midBy = (Ay + By) / 2;
                const labelOffset = 20;
                const perpAngle = (B_angle + 90) * Math.PI / 180;
                ctx.fillText('B', midBx + labelOffset * Math.cos(perpAngle), midBy + labelOffset * Math.sin(perpAngle));
                ctx.font = '13px monospace';
                ctx.fillText(B.toFixed(1) + ' m', midBx + labelOffset * Math.cos(perpAngle), midBy + labelOffset * Math.sin(perpAngle) + 18);
                ctx.font = 'bold 18px monospace';

                // Rectangular components of B
                const B_relAngle = B_angle - A_angle;
                const Bcos = B * Math.cos(B_relAngle * Math.PI / 180);
                const Bsin = B * Math.sin(B_relAngle * Math.PI / 180);

                const BcosLen = Bcos * scale;
                const BsinLen = Bsin * scale;

                // Bx component (along A direction)
                ctx.strokeStyle = '#74b9ff';
                ctx.lineWidth = 2.5;
                ctx.setLineDash([5, 3]);
                ctx.beginPath();
                ctx.moveTo(Ax, Ay);
                ctx.lineTo(Ax + BcosLen, Ay);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = '#74b9ff';
                ctx.font = 'bold 13px monospace';
                ctx.textAlign = 'center';
                const BcosMidX = Ax + BcosLen / 2;
                const BcosMidY = Ay;
                ctx.fillText('Bcos?', BcosMidX, Ay + 22);
                ctx.font = '12px monospace';
                ctx.fillText('(' + Bcos.toFixed(1) + ')', BcosMidX, Ay + 38);
                ctx.font = 'bold 18px monospace';

                // By component (perpendicular to A)
                ctx.strokeStyle = '#a29bfe';
                ctx.lineWidth = 2.5;
                ctx.setLineDash([5, 3]);
                ctx.beginPath();
                ctx.moveTo(Ax + BcosLen, Ay);
                ctx.lineTo(Ax + BcosLen, Ay + BsinLen);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = '#a29bfe';
                ctx.font = 'bold 13px monospace';
                ctx.textAlign = 'left';
                const BsinMidX = Ax + BcosLen + 15;
                const BsinMidY = Ay + BsinLen / 2;
                ctx.fillText('Bsin?', BsinMidX, BsinMidY - 5);
                ctx.font = '12px monospace';
                ctx.fillText('(' + Bsin.toFixed(1) + ')', BsinMidX, BsinMidY + 10);
                ctx.font = 'bold 18px monospace';

                // Right angle marker
                if (BcosLen > 10 && Math.abs(BsinLen) > 10) {
                    const markerSize = 10;
                    const dirX = BcosLen > 0 ? 1 : -1;
                    const dirY = BsinLen > 0 ? 1 : -1;
                    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(Ax + BcosLen + dirX * markerSize, Ay);
                    ctx.lineTo(Ax + BcosLen + dirX * markerSize, Ay + dirY * markerSize);
                    ctx.lineTo(Ax + BcosLen, Ay + dirY * markerSize);
                    ctx.stroke();
                }
            }

            if (R_len > 0) {
                drawArrow(cx, cy, R_len, R_angle, rColor, 4, true);
                ctx.font = 'bold 16px monospace';
                ctx.fillStyle = rColor;
                const midRx = (cx + Bx) / 2;
                const midRy = (cy + By) / 2;
                const labelOffset = 20;
                const perpAngle = (R_angle + 90) * Math.PI / 180;
                ctx.fillText('R', midRx + labelOffset * Math.cos(perpAngle), midRy + labelOffset * Math.sin(perpAngle));
                ctx.font = '13px monospace';
                ctx.fillText('|R| = ' + R_len.toFixed(1) + ' m', midRx + labelOffset * Math.cos(perpAngle), midRy + labelOffset * Math.sin(perpAngle) + 18);
                ctx.font = 'bold 18px monospace';
            }

            if (A_len > 0 && B_len > 0) {
                ctx.strokeStyle = 'rgba(253,203,110,0.3)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 4]);

                ctx.beginPath();
                ctx.moveTo(Bx, By);
                ctx.lineTo(Rx, Ry);
                ctx.stroke();

                ctx.setLineDash([]);
            }

            if (thetaDeg > 0 && thetaDeg < 360) {
                const arcRadius = Math.min(45, A_len * 0.3);
                if (arcRadius > 5) {
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    const startAngle = A_angle * Math.PI / 180;
                    const endAngle = B_angle * Math.PI / 180;
                    ctx.arc(cx, cy, arcRadius, Math.min(startAngle, endAngle), Math.max(startAngle, endAngle));
                    ctx.stroke();

                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 15px monospace';
                    ctx.textAlign = 'center';
                    const midAngle = (startAngle + endAngle) / 2;
                    ctx.fillText(thetaDeg.toFixed(0) + '°', cx + (arcRadius + 20) * Math.cos(midAngle), cy + (arcRadius + 20) * Math.sin(midAngle) + 5);
                }
            }

            const alphaRad = Math.atan2(B * Math.sin(thetaRad), A + B * Math.cos(thetaRad));
            const alphaDeg = alphaRad * 180 / Math.PI;
            if (alphaDeg > 0 && A_len > 0) {
                const arcR = Math.min(35, A_len * 0.25);
                if (arcR > 5) {
                    ctx.strokeStyle = rColor;
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.arc(cx, cy, arcR, A_angle * Math.PI / 180, R_angle * Math.PI / 180);
                    ctx.stroke();

                    ctx.fillStyle = rColor;
                    ctx.font = 'bold 14px monospace';
                    ctx.textAlign = 'center';
                    const midA = (A_angle + R_angle) / 2 * Math.PI / 180;
                    ctx.fillText('a=' + alphaDeg.toFixed(1) + '°', cx + (arcR + 20) * Math.cos(midA), cy + (arcR + 20) * Math.sin(midA) + 5);
                }
            }

            ctx.font = '13px monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#00b894';
            ctx.fillText('? A (Vector 1)', 15, canvas.height - 35);
            ctx.fillStyle = '#e17055';
            ctx.fillText('? B (Vector 2)', 15, canvas.height - 18);
            ctx.fillStyle = '#fdcb6e';
            ctx.fillText('? R = A + B (Resultant)', canvas.width - 210, canvas.height - 35);
            ctx.fillStyle = 'rgba(253,203,110,0.5)';
            ctx.fillText('--- Triangle (dotted)', canvas.width - 210, canvas.height - 18);

            // Formula display
            const A_val = A;
            const B_val = B;
            const theta_val = thetaDeg;
            const R_val = Math.sqrt(A_val * A_val + B_val * B_val + 2 * A_val * B_val * Math.cos(theta_val * Math.PI / 180));
            const Bcos_val = B_val * Math.cos(theta_val * Math.PI / 180);
            const Bsin_val = B_val * Math.sin(theta_val * Math.PI / 180);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'right';
            ctx.fillText('R? = A + Bcos? = ' + A_val.toFixed(1) + ' + ' + Bcos_val.toFixed(1) + ' = ' + (A_val + Bcos_val).toFixed(1), canvas.width - 20, 28);
            ctx.fillText('R? = Bsin? = ' + Bsin_val.toFixed(1), canvas.width - 20, 48);
            ctx.fillText('|R| = v(R?² + R?²) = ' + R_val.toFixed(1) + ' m', canvas.width - 20, 68);
        }

        function animate() {
            if (!sim.running || sim.paused) return;

            sim.time += sim.dt;

            sim.currentA = parseFloat(mA.value) + 0.5 * Math.sin(sim.time * 0.5);
            sim.currentB = parseFloat(mB.value) + 0.5 * Math.cos(sim.time * 0.7);

            updateStats();
            draw();
            requestAnimationFrame(animate);
        }

        reset();
    
// From: vector-resolution-2d.html


// From: vector-resolution-2d.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');
        const msgOverlay = document.getElementById('messageOverlay');
        const msgTitle = document.getElementById('msgTitle');
        const msgText = document.getElementById('msgText');

        let sim = {
            running: false,
            paused: false,
            time: 0,
            dt: 0.016,
            score: 0,
            level: 1,
            trail: []
        };
        const river = {
            top: 120,
            bottom: 530,
            height: 410
        };
        const boat = {
            x: 80,
            y: river.top + 120,
            vx: 0,
            vy: 0,
            radius: 14
        };


        let target = { x: 700, y: river.top + river.height / 2, radius: 22 };
        let waveOffset = 0;

        const vbSlider = document.getElementById('vb');
        const vrSlider = document.getElementById('vr');
        const angleSlider = document.getElementById('angle');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');

        vbSlider.addEventListener('input', () => {
            document.getElementById('vbVal').textContent = vbSlider.value;
            if (!sim.running) draw();
        });
        vrSlider.addEventListener('input', () => {
            document.getElementById('vrVal').textContent = vrSlider.value;
            if (!sim.running) draw();
        });
        angleSlider.addEventListener('input', () => {
            document.getElementById('angleVal').textContent = angleSlider.value;
            if (!sim.running) draw();
        });

        document.getElementById('showVectors').addEventListener('change', draw);
        document.getElementById('showComponents').addEventListener('change', draw);
        document.getElementById('showTrail').addEventListener('change', draw);
        document.getElementById('showResultant').addEventListener('change', draw);
        document.getElementById('showAngleArc').addEventListener('change', draw);

        startBtn.addEventListener('click', () => {
            if (!sim.running) {
                sim.running = true;
                sim.paused = false;
                sim.time = 0;
                sim.trail = [];
                boat.x = 80;
                boat.y = river.top + 120;
                startBtn.disabled = true;
                startBtn.textContent = 'Running';
                pauseBtn.style.display = 'block';
                animate();
            }
        });

        pauseBtn.addEventListener('click', () => {
            sim.paused = !sim.paused;
            pauseBtn.textContent = sim.paused ? 'Resume' : 'Pause';
            if (!sim.paused) animate();
        });

        resetBtn.addEventListener('click', () => {
            sim.running = false;
            sim.paused = false;
            sim.time = 0;
            sim.trail = [];
            boat.x = 80;
            boat.y = river.top + 30;
            boat.vx = 0;
            boat.vy = 0;
            startBtn.disabled = false;
            startBtn.textContent = 'Launch';
            pauseBtn.style.display = 'none';
            msgOverlay.style.display = 'none';
            generateTarget();
            updateStats();
            draw();
        });

        function generateTarget() {
            target.x = 300 + Math.random() * 500;
            target.y = river.top + 40 + Math.random() * (river.height - 80);
            target.radius = 18 + Math.random() * 10;
        }

        function getBoatVelocity() {
            const V = parseFloat(vbSlider.value);
            const theta = parseFloat(angleSlider.value) * Math.PI / 180;

            return {
                Vx: V * Math.cos(theta),
                Vy: V * Math.sin(theta)
            };
        }

        function updateStats() {
            const V = parseFloat(vbSlider.value);
            const vr = parseFloat(vrSlider.value);
            const theta = parseFloat(angleSlider.value);
            const bVel = getBoatVelocity();
            const Vresultant = Math.sqrt((bVel.Vx + vr) ** 2 + bVel.Vy ** 2);

            document.getElementById('statVb').textContent = V.toFixed(1) + ' m/s';
            document.getElementById('statVr').textContent = vr.toFixed(1) + ' m/s';
            document.getElementById('statAngle').textContent = theta.toFixed(0) + '°';
            document.getElementById('statVrResult').textContent = Vresultant.toFixed(1) + ' m/s';
            document.getElementById('statDrift').textContent = Math.abs(boat.x - 80).toFixed(1) + ' m';
            document.getElementById('statScore').textContent = sim.score;
        }

        function drawRiver() {
            // River background
            const grad = ctx.createLinearGradient(0, river.top, 0, river.bottom);
            grad.addColorStop(0, '#0a1628');
            grad.addColorStop(0.5, '#0d2137');
            grad.addColorStop(1, '#0a1628');
            ctx.fillStyle = grad;
            ctx.fillRect(0, river.top, canvas.width, river.height);

            // Banks
            ctx.fillStyle = '#2d5016';
            ctx.fillRect(0, 0, canvas.width, river.top);
            ctx.fillStyle = '#3d6b1e';
            ctx.fillRect(0, river.bottom, canvas.width, canvas.height - river.bottom);

            // Bank texture
            ctx.fillStyle = '#4a7a28';
            for (let i = 0; i < canvas.width; i += 20) {
                ctx.beginPath();
                ctx.arc(i, river.top - 5 + Math.sin(i * 0.1) * 5, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(i, river.bottom + 5 + Math.sin(i * 0.1) * 5, 8, 0, Math.PI * 2);
                ctx.fill();
            }

            // Flowing waves
            ctx.strokeStyle = 'rgba(116, 185, 255, 0.15)';
            ctx.lineWidth = 2;
            for (let y = river.top + 30; y < river.bottom; y += 40) {
                ctx.beginPath();
                for (let x = 0; x < canvas.width; x += 5) {
                    const waveY = y + Math.sin((x + waveOffset) * 0.02) * 8;
                    if (x === 0) ctx.moveTo(x, waveY);
                    else ctx.lineTo(x, waveY);
                }
                ctx.stroke();
            }
        }

        function drawArrow(x1, y1, x2, y2, color, lineWidth) {
            const headLen = 12;
            const headAngle = 25 * Math.PI / 180;
            const angle = Math.atan2(y2 - y1, x2 - x1);

            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - headLen * Math.cos(angle - headAngle), y2 - headLen * Math.sin(angle - headAngle));
            ctx.lineTo(x2 - headLen * Math.cos(angle + headAngle), y2 - headLen * Math.sin(angle + headAngle));
            ctx.closePath();
            ctx.fill();
        }

        function drawVectors(bx, by, bVel, vr) {
            if (!document.getElementById('showVectors').checked) return;

            const scale = 15;

            // Boat velocity
            const bEndX = bx + bVel.Vx * scale;
            const bEndY = by - bVel.Vy * scale;
            drawArrow(bx, by, bEndX, bEndY, '#00b894', 3);

            ctx.fillStyle = '#00b894';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Vboat', (bx + bEndX) / 2 + 15, (by + bEndY) / 2 - 10);

            // River current
            const rEndX = bx + vr * scale;
            const rEndY = by;
            drawArrow(bx, by, rEndX, rEndY, '#74b9ff', 3);

            ctx.fillStyle = '#74b9ff';
            ctx.fillText('Vriver', (bx + rEndX) / 2, by + 20);

            // Resultant
            const resX = bVel.Vx + vr;
            const resY = bVel.Vy;
            const resEndX = bx + resX * scale;
            const resEndY = by - resY * scale;

            if (document.getElementById('showResultant').checked) {
                drawArrow(bx, by, resEndX, resEndY, '#fdcb6e', 4);

                ctx.fillStyle = '#fdcb6e';
                ctx.font = 'bold 13px monospace';
                ctx.fillText('Vresultant', (bx + resEndX) / 2 + 15, (by + resEndY) / 2 + 5);
            }

            // Components
            if (document.getElementById('showComponents').checked) {
                // Dashed lines for parallelogram
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = 'rgba(0, 184, 148, 0.4)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(bEndX, bEndY);
                ctx.lineTo(resEndX, resEndY);
                ctx.stroke();

                ctx.strokeStyle = 'rgba(116, 185, 255, 0.4)';
                ctx.beginPath();
                ctx.moveTo(rEndX, rEndY);
                ctx.lineTo(resEndX, resEndY);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        function drawAngleArc(bx, by) {
            if (!document.getElementById('showAngleArc').checked) return;

            const theta = parseFloat(angleSlider.value);
            if (theta === 0) return;

            const arcRadius = 35;
            const refAngle = 0;
            const boatAngle = theta * Math.PI / 180;

            ctx.strokeStyle = '#fdcb6e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (theta > 0) {
                ctx.arc(bx, by, arcRadius, refAngle, boatAngle, true);
            } else {
                ctx.arc(bx, by, arcRadius, boatAngle, refAngle, true);
            }
            ctx.stroke();

            ctx.fillStyle = '#fdcb6e';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'left';
            const midAngle = (refAngle + boatAngle) / 2;
            ctx.fillText(Math.abs(theta).toFixed(0) + '°', bx + (arcRadius + 12) * Math.cos(midAngle), by + (arcRadius + 12) * Math.sin(midAngle) + 4);
        }

        function drawTarget() {
            // Pulsing target
            const pulse = Math.sin(sim.time * 3) * 3;

            // Outer ring
            ctx.strokeStyle = '#fdcb6e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(target.x, target.y, target.radius + pulse, 0, Math.PI * 2);
            ctx.stroke();

            // Inner circle
            ctx.fillStyle = 'rgba(253, 203, 110, 0.3)';
            ctx.beginPath();
            ctx.arc(target.x, target.y, target.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();

            // Center dot
            ctx.fillStyle = '#fdcb6e';
            ctx.beginPath();
            ctx.arc(target.x, target.y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Label
            ctx.fillStyle = '#fdcb6e';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('TARGET', target.x, target.y - target.radius - 10);
        }

        function drawBoat() {
            ctx.save();
            ctx.translate(boat.x, boat.y);

            const V = parseFloat(vbSlider.value);
            const vr = parseFloat(vrSlider.value);
            const theta = parseFloat(angleSlider.value) * Math.PI / 180;
            const resX = V * Math.cos(theta) + vr;
            const resY = -V * Math.sin(theta);
            ctx.rotate(Math.atan2(resX, -resY));

            // Boat body
            ctx.fillStyle = '#00cec9';
            ctx.beginPath();
            ctx.moveTo(0, -18);
            ctx.lineTo(-10, 12);
            ctx.lineTo(0, 8);
            ctx.lineTo(10, 12);
            ctx.closePath();
            ctx.fill();

            // Boat outline
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Cockpit
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.arc(0, -5, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // Label
            ctx.fillStyle = '#00cec9';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('BOAT', boat.x, boat.y - 25);
        }

        function drawTrail() {
            if (!document.getElementById('showTrail').checked || sim.trail.length < 2) return;

            ctx.strokeStyle = 'rgba(0, 206, 201, 0.4)';
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(sim.trail[0].x, sim.trail[0].y);
            for (let i = 1; i < sim.trail.length; i++) {
                ctx.lineTo(sim.trail[i].x, sim.trail[i].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Background
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw vectors BEFORE river so they're not covered
        const bVel = getBoatVelocity();
        const vr = parseFloat(vrSlider.value);

        // Draw river first
        drawRiver();

        // Then everything on top
        drawTrail();
        drawTarget();
        drawBoat();

        // Draw vectors ABOVE water
        if (!sim.running) {
            drawVectors(boat.x, boat.y, bVel, vr);
            drawAngleArc(boat.x, boat.y);
        }
            updateStats();
        }

        function animate() {
            if (!sim.running || sim.paused) return;

            sim.time += sim.dt;

            const bVel = getBoatVelocity();
            const vr = parseFloat(vrSlider.value);

            // Scale for simulation
            const simScale = 3;

            // Target drifts with river current
            target.x += vr * simScale;
            if (target.x > canvas.width + target.radius) {
                target.x = -target.radius;
            }

            // Actual velocity = boat + river
            boat.vx = bVel.Vx + vr;
            boat.vy = bVel.Vy;

            boat.x += boat.vx * simScale;
            boat.y -= boat.vy * simScale;

            // Trail
            sim.trail.push({ x: boat.x, y: boat.y });
            if (sim.trail.length > 500) sim.trail.shift();

            // Check if reached opposite bank / near target
            const dx = boat.x - target.x;
            const dy = boat.y - target.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= boat.radius + target.radius) {
                sim.running = false;
                pauseBtn.style.display = 'none';

                sim.score += 100 + sim.level * 20;
                sim.level++;

                msgTitle.textContent = 'Target Hit!';
                msgText.textContent = 'Score: ' + sim.score + ' XP';

                msgOverlay.style.borderColor = '#00b894';
                msgOverlay.style.display = 'block';

                startBtn.disabled = false;
                startBtn.textContent = 'Launch';

                generateTarget();
                updateStats();
                draw();
                return;
            }

            // Check if out of bounds
            if (boat.x < 0 || boat.x > canvas.width || boat.y > river.bottom) {
                sim.running = false;
                pauseBtn.style.display = 'none';
                msgTitle.textContent = 'Out of Bounds!';
                msgText.textContent = 'Boat went off the river. Reset and try again.';
                msgOverlay.style.borderColor = '#e17055';
                msgOverlay.style.display = 'block';
                startBtn.disabled = false;
                startBtn.textContent = 'Launch';
                updateStats();
                draw();
                return;
            }

            draw();
            requestAnimationFrame(animate);
        }

        // Initialize
        generateTarget();
        updateStats();
        draw();
    
// From: vector-resolution-3d.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');

        // Camera
        let cam = { rotX: -0.4, rotY: 0.6, zoom: 1.0, targetRotX: -0.4, targetRotY: 0.6, targetZoom: 1.0 };
        let isDragging = false;
        let lastMouse = { x: 0, y: 0 };

        canvas.addEventListener('mousedown', (e) => { isDragging = true; lastMouse = { x: e.clientX, y: e.clientY }; });
        canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - lastMouse.x, dy = e.clientY - lastMouse.y;
            cam.targetRotY += dx * 0.008;
            cam.targetRotX += dy * 0.008;
            cam.targetRotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cam.targetRotX));
            lastMouse = { x: e.clientX, y: e.clientY };
        });
        canvas.addEventListener('mouseup', () => { isDragging = false; });
        canvas.addEventListener('mouseleave', () => { isDragging = false; });
        canvas.addEventListener('touchstart', (e) => { isDragging = true; lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; e.preventDefault(); }, { passive: false });
        canvas.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const dx = e.touches[0].clientX - lastMouse.x, dy = e.touches[0].clientY - lastMouse.y;
            cam.targetRotY += dx * 0.008;
            cam.targetRotX += dy * 0.008;
            cam.targetRotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cam.targetRotX));
            lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            e.preventDefault();
        }, { passive: false });
        canvas.addEventListener('touchend', () => { isDragging = false; });
        canvas.addEventListener('wheel', (e) => {
            cam.targetZoom *= e.deltaY > 0 ? 0.95 : 1.05;
            cam.targetZoom = Math.max(0.3, Math.min(3.0, cam.targetZoom));
            e.preventDefault();
        }, { passive: false });

        const mV = document.getElementById('mV');
        const alphaSlider = document.getElementById('alpha');
        const betaSlider = document.getElementById('beta');
        const gammaSlider = document.getElementById('gamma');
        const resetBtn = document.getElementById('resetBtn');

        function autoCorrectGamma() {
            const alpha = parseFloat(alphaSlider.value) * Math.PI / 180;
            const beta = parseFloat(betaSlider.value) * Math.PI / 180;
            const cosAlpha2 = Math.cos(alpha) ** 2;
            const cosBeta2 = Math.cos(beta) ** 2;
            let cosGamma2 = 1 - cosAlpha2 - cosBeta2;
            cosGamma2 = Math.max(0, Math.min(1, cosGamma2));
            const gammaRad = Math.acos(Math.sqrt(cosGamma2));
            gammaSlider.value = Math.round(gammaRad * 180 / Math.PI);
            document.getElementById('gammaVal').textContent = gammaSlider.value;
        }

        mV.addEventListener('input', () => { document.getElementById('mVal').textContent = mV.value; draw(); });
        alphaSlider.addEventListener('input', () => { document.getElementById('alphaVal').textContent = alphaSlider.value; autoCorrectGamma(); draw(); });
        betaSlider.addEventListener('input', () => { document.getElementById('betaVal').textContent = betaSlider.value; autoCorrectGamma(); draw(); });
        gammaSlider.addEventListener('input', () => { document.getElementById('gammaVal').textContent = gammaSlider.value; draw(); });
        document.getElementById('showAxes').addEventListener('change', draw);
        document.getElementById('showBox').addEventListener('change', draw);
        document.getElementById('showPlanes').addEventListener('change', draw);
        document.getElementById('showGrid').addEventListener('change', draw);
        document.getElementById('showLabels').addEventListener('change', draw);
        document.getElementById('showGlow').addEventListener('change', draw);
        document.getElementById('showAngleArcs').addEventListener('change', draw);
        document.getElementById('autoRotate').addEventListener('change', () => { sim.running = document.getElementById('autoRotate').checked; if (sim.running) animate(); });

        resetBtn.addEventListener('click', () => {
            cam.targetRotX = -0.4;
            cam.targetRotY = 0.6;
            cam.targetZoom = 1.0;
            alphaSlider.value = 45;
            betaSlider.value = 60;
            document.getElementById('alphaVal').textContent = '45';
            document.getElementById('betaVal').textContent = '60';
            autoCorrectGamma();
            updateStats(); draw();
        });

        let sim = { running: false, time: 0, dt: 0.016 };

        function reset() {
            sim.running = document.getElementById('autoRotate').checked;
            updateStats(); draw();
        }

        function updateStats() {
            const mag = parseFloat(mV.value);
            const alpha = parseFloat(alphaSlider.value) * Math.PI / 180;
            const beta = parseFloat(betaSlider.value) * Math.PI / 180;
            const gamma = parseFloat(gammaSlider.value) * Math.PI / 180;
            const Vx = mag * Math.cos(alpha);
            const Vy = mag * Math.cos(beta);
            const Vz = mag * Math.cos(gamma);
            document.getElementById('statM').textContent = mag.toFixed(1) + ' m';
            document.getElementById('statX').textContent = Vx.toFixed(2) + ' m';
            document.getElementById('statY').textContent = Vy.toFixed(2) + ' m';
            document.getElementById('statZ').textContent = Vz.toFixed(2) + ' m';
            document.getElementById('statAlpha').textContent = parseFloat(alphaSlider.value).toFixed(1) + '°';
            document.getElementById('statBeta').textContent = parseFloat(betaSlider.value).toFixed(1) + '°';
            document.getElementById('statGamma').textContent = parseFloat(gammaSlider.value).toFixed(1) + '°';
        }

        // Simple 3D projection (isometric-like, always visible)
        function project3D(x, y, z) {
            const cosY = Math.cos(cam.rotY), sinY = Math.sin(cam.rotY);
            const px = x * cosY + z * sinY;
            const pz = -x * sinY + z * cosY;
            const cosX = Math.cos(cam.rotX), sinX = Math.sin(cam.rotX);
            const py = y * cosX - pz * sinX;
            const pz2 = y * sinX + pz * cosX;
            const scale = 25 * cam.zoom;
            return {
                x: canvas.width / 2 + px * scale,
                y: canvas.height / 2 - py * scale,
                z: pz2,
                scale: scale,
                depth: pz2
            };
        }

        function drawArrow3D(p1, p2, color, lw, dashed, depth) {
            if (!p1 || !p2) return;
            ctx.save();
            if (dashed) ctx.setLineDash([5, 4]);
            const alpha = Math.max(0.3, Math.min(1, 1 - (depth - 2) / 6));
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = color;
            ctx.lineWidth = lw * Math.max(0.5, depth < 4 ? 1.2 : 0.8);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.setLineDash([]);
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const headLen = 12 * Math.max(0.5, depth < 4 ? 1.2 : 0.8);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(p2.x, p2.y);
            ctx.lineTo(p2.x - headLen * Math.cos(angle - 0.4), p2.y - headLen * Math.sin(angle - 0.4));
            ctx.lineTo(p2.x - headLen * Math.cos(angle + 0.4), p2.y - headLen * Math.sin(angle + 0.4));
            ctx.closePath();
            ctx.fill();
            if (document.getElementById('showGlow').checked) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 8;
                ctx.strokeStyle = color;
                ctx.lineWidth = lw * 0.5;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            ctx.restore();
        }

        function drawGlowCircle(p, radius, color) {
            if (!p) return;
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius * cam.zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 0.8;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius * 0.5 * cam.zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        function drawGrid() {
            if (!document.getElementById('showGrid').checked) return;
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 1;
            const gridSize = 5, step = 0.5;
            for (let i = -gridSize; i <= gridSize; i += step) {
                const p1x = project3D(i, 0, -gridSize), p2x = project3D(i, 0, gridSize);
                if (p1x && p2x) { ctx.beginPath(); ctx.moveTo(p1x.x, p1x.y); ctx.lineTo(p2x.x, p2x.y); ctx.stroke(); }
                const p1y = project3D(-gridSize, 0, i), p2y = project3D(gridSize, 0, i);
                if (p1y && p2y) { ctx.beginPath(); ctx.moveTo(p1y.x, p1y.y); ctx.lineTo(p2y.x, p2y.y); ctx.stroke(); }
            }
            ctx.restore();
        }

        function drawPlanes() {
            if (!document.getElementById('showPlanes').checked) return;
            const s = 5;
            const corners = {
                xy: [project3D(-s, 0, -s), project3D(s, 0, -s), project3D(s, 0, s), project3D(-s, 0, s)],
                xz: [project3D(-s, -s, -s), project3D(s, -s, -s), project3D(s, -s, s), project3D(-s, -s, s)],
                yz: [project3D(-s, -s, 0), project3D(s, -s, 0), project3D(s, s, 0), project3D(-s, s, 0)]
            };
            ctx.save();
            ctx.globalAlpha = 0.04;
            ctx.fillStyle = '#74b9ff';
            ctx.beginPath();
            if (corners.xy[0]) { corners.xy.forEach(c => ctx.lineTo(c.x, c.y)); ctx.closePath(); ctx.fill(); }
            ctx.fillStyle = '#ff6b6b';
            ctx.globalAlpha = 0.03;
            ctx.beginPath();
            if (corners.xz[0]) { corners.xz.forEach(c => ctx.lineTo(c.x, c.y)); ctx.closePath(); ctx.fill(); }
            ctx.fillStyle = '#51cf66';
            ctx.globalAlpha = 0.03;
            ctx.beginPath();
            if (corners.yz[0]) { corners.yz.forEach(c => ctx.lineTo(c.x, c.y)); ctx.closePath(); ctx.fill(); }
            ctx.restore();
        }

        function drawAxes() {
            if (!document.getElementById('showAxes').checked) return;
            const len = 5;
            const origin = project3D(0, 0, 0);
            const xAxis = project3D(len, 0, 0);
            const yAxis = project3D(0, len, 0);
            const zAxis = project3D(0, 0, len);
            drawArrow3D(origin, xAxis, '#ff6b6b', 2, false, xAxis ? xAxis.z : 0);
            drawArrow3D(origin, yAxis, '#51cf66', 2, false, yAxis ? yAxis.z : 0);
            drawArrow3D(origin, zAxis, '#74b9ff', 2, false, zAxis ? zAxis.z : 0);
            if (document.getElementById('showLabels').checked) {
                ctx.save();
                ctx.font = 'bold 16px monospace';
                ctx.textAlign = 'center';
                if (xAxis) { ctx.fillStyle = '#ff6b6b'; ctx.fillText('X', xAxis.x + 15, xAxis.y + 5); }
                if (yAxis) { ctx.fillStyle = '#51cf66'; ctx.fillText('Y', yAxis.x, yAxis.y - 15); }
                if (zAxis) { ctx.fillStyle = '#74b9ff'; ctx.fillText('Z', zAxis.x + 15, zAxis.y); }
                ctx.restore();
            }
        }

        function drawDirectionAngleArc(origin, tip, axisTip, color, angleDeg, label) {
            if (!origin || !tip || !axisTip) return;
            if (!document.getElementById('showAngleArcs').checked) return;
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6;
            const arcRadius = 40 * cam.zoom;
            const dx = tip.x - origin.x, dy = tip.y - origin.y;
            const dax = axisTip.x - origin.x, day = axisTip.y - origin.y;
            const tipAngle = Math.atan2(dy, dx);
            const axisAngle = Math.atan2(day, dax);
            ctx.beginPath();
            if (Math.abs(tipAngle - axisAngle) > Math.PI) {
                if (tipAngle > axisAngle) {
                    ctx.arc(origin.x, origin.y, arcRadius, axisAngle, tipAngle - 2 * Math.PI);
                } else {
                    ctx.arc(origin.x, origin.y, arcRadius, tipAngle, axisAngle + 2 * Math.PI);
                }
            } else {
                ctx.arc(origin.x, origin.y, arcRadius, Math.min(tipAngle, axisAngle), Math.max(tipAngle, axisAngle));
            }
            ctx.stroke();
            const midAngle = (tipAngle + axisAngle) / 2;
            ctx.globalAlpha = 1;
            ctx.fillStyle = color;
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(label, origin.x + (arcRadius + 15) * Math.cos(midAngle), origin.y + (arcRadius + 15) * Math.sin(midAngle) + 4);
            ctx.restore();
        }

        function drawProjectionBox(Vx, Vy, Vz) {
            if (!document.getElementById('showBox').checked) return;
            const origin = project3D(0, 0, 0);
            const tip = project3D(Vx, Vy, Vz);
            const xProj = project3D(Vx, 0, 0);
            const yProj = project3D(0, Vy, 0);
            const zProj = project3D(0, 0, Vz);
            const xyTip = project3D(Vx, Vy, 0);
            const xzTip = project3D(Vx, 0, Vz);
            const yzTip = project3D(0, Vy, Vz);

            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);

            if (xProj) drawArrow3D(origin, xProj, '#ff6b6b', 2, true, xProj.z);
            if (yProj) drawArrow3D(origin, yProj, '#51cf66', 2, true, yProj.z);
            if (zProj) drawArrow3D(origin, zProj, '#74b9ff', 2, true, zProj.z);

            if (xyTip && tip) {
                ctx.strokeStyle = 'rgba(253,203,110,0.3)';
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(xyTip.x, xyTip.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
            }
            if (xzTip && tip) {
                ctx.strokeStyle = 'rgba(253,203,110,0.3)';
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(xzTip.x, xzTip.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
            }
            if (yzTip && tip) {
                ctx.strokeStyle = 'rgba(253,203,110,0.3)';
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(yzTip.x, yzTip.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
            }

            if (xProj && xyTip) {
                ctx.strokeStyle = 'rgba(0,184,148,0.2)';
                ctx.beginPath(); ctx.moveTo(xProj.x, xProj.y); ctx.lineTo(xyTip.x, xyTip.y); ctx.stroke();
            }
            if (yProj && xyTip) {
                ctx.strokeStyle = 'rgba(0,184,148,0.2)';
                ctx.beginPath(); ctx.moveTo(yProj.x, yProj.y); ctx.lineTo(xyTip.x, xyTip.y); ctx.stroke();
            }
            if (xProj && xzTip) {
                ctx.strokeStyle = 'rgba(116,185,255,0.2)';
                ctx.beginPath(); ctx.moveTo(xProj.x, xProj.y); ctx.lineTo(xzTip.x, xzTip.y); ctx.stroke();
            }
            if (zProj && xzTip) {
                ctx.strokeStyle = 'rgba(116,185,255,0.2)';
                ctx.beginPath(); ctx.moveTo(zProj.x, zProj.y); ctx.lineTo(xzTip.x, xzTip.y); ctx.stroke();
            }
            if (yProj && yzTip) {
                ctx.strokeStyle = 'rgba(81,207,102,0.2)';
                ctx.beginPath(); ctx.moveTo(yProj.x, yProj.y); ctx.lineTo(yzTip.x, yzTip.y); ctx.stroke();
            }
            if (zProj && yzTip) {
                ctx.strokeStyle = 'rgba(81,207,102,0.2)';
                ctx.beginPath(); ctx.moveTo(zProj.x, zProj.y); ctx.lineTo(yzTip.x, yzTip.y); ctx.stroke();
            }

            if (xyTip && tip) {
                ctx.strokeStyle = 'rgba(253,203,110,0.5)';
                ctx.lineWidth = 1;
                const markerSize = 8 * cam.zoom;
                ctx.beginPath();
                ctx.moveTo(xyTip.x, xyTip.y - markerSize);
                ctx.lineTo(xyTip.x + markerSize, xyTip.y - markerSize);
                ctx.lineTo(xyTip.x + markerSize, xyTip.y);
                ctx.stroke();
            }
            if (xzTip && tip) {
                ctx.strokeStyle = 'rgba(253,203,110,0.5)';
                ctx.lineWidth = 1;
                const markerSize = 8 * cam.zoom;
                ctx.beginPath();
                ctx.moveTo(xzTip.x - markerSize, xzTip.y);
                ctx.lineTo(xzTip.x - markerSize, xzTip.y + markerSize);
                ctx.lineTo(xzTip.x, xzTip.y + markerSize);
                ctx.stroke();
            }
            if (yzTip && tip) {
                ctx.strokeStyle = 'rgba(253,203,110,0.5)';
                ctx.lineWidth = 1;
                const markerSize = 8 * cam.zoom;
                ctx.beginPath();
                ctx.moveTo(yzTip.x + markerSize, yzTip.y - markerSize);
                ctx.lineTo(yzTip.x + markerSize, yzTip.y);
                ctx.lineTo(yzTip.x, yzTip.y);
                ctx.stroke();
            }

            ctx.setLineDash([]);
            ctx.restore();
        }

        function drawPerpendicularsToAxes(Vx, Vy, Vz) {
            const tip = project3D(Vx, Vy, Vz);
            const xFoot = project3D(Vx, 0, 0);
            const yFoot = project3D(0, Vy, 0);
            const zFoot = project3D(0, 0, Vz);

            ctx.save();
            ctx.setLineDash([4, 4]);

            if (tip && xFoot) {
                ctx.strokeStyle = '#ff6b6b';
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.moveTo(tip.x, tip.y);
                ctx.lineTo(xFoot.x, xFoot.y);
                ctx.stroke();
                ctx.globalAlpha = 0.8;
                ctx.lineWidth = 1.5;
                ctx.setLineDash([]);
                const ms = 6 * cam.zoom;
                ctx.beginPath();
                ctx.moveTo(xFoot.x, xFoot.y - ms);
                ctx.lineTo(xFoot.x + ms, xFoot.y - ms);
                ctx.lineTo(xFoot.x + ms, xFoot.y);
                ctx.stroke();
                ctx.font = 'bold 11px monospace';
                ctx.fillStyle = '#ff6b6b';
                ctx.textAlign = 'center';
                ctx.fillText('?', xFoot.x, xFoot.y + 18);
            }

            if (tip && yFoot) {
                ctx.strokeStyle = '#51cf66';
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.6;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(tip.x, tip.y);
                ctx.lineTo(yFoot.x, yFoot.y);
                ctx.stroke();
                ctx.globalAlpha = 0.8;
                ctx.lineWidth = 1.5;
                ctx.setLineDash([]);
                const ms = 6 * cam.zoom;
                ctx.beginPath();
                ctx.moveTo(yFoot.x - ms, yFoot.y);
                ctx.lineTo(yFoot.x - ms, yFoot.y + ms);
                ctx.lineTo(yFoot.x, yFoot.y + ms);
                ctx.stroke();
                ctx.font = 'bold 11px monospace';
                ctx.fillStyle = '#51cf66';
                ctx.textAlign = 'center';
                ctx.fillText('?', yFoot.x - 15, yFoot.y + 10);
            }

            if (tip && zFoot) {
                ctx.strokeStyle = '#74b9ff';
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.6;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(tip.x, tip.y);
                ctx.lineTo(zFoot.x, zFoot.y);
                ctx.stroke();
                ctx.globalAlpha = 0.8;
                ctx.lineWidth = 1.5;
                ctx.setLineDash([]);
                const ms = 6 * cam.zoom;
                ctx.beginPath();
                ctx.moveTo(zFoot.x, zFoot.y - ms);
                ctx.lineTo(zFoot.x + ms, zFoot.y - ms);
                ctx.lineTo(zFoot.x + ms, zFoot.y);
                ctx.stroke();
                ctx.font = 'bold 11px monospace';
                ctx.fillStyle = '#74b9ff';
                ctx.textAlign = 'center';
                ctx.fillText('?', zFoot.x + 15, zFoot.y + 5);
            }

            ctx.restore();
        }

        function drawLabels(Vx, Vy, Vz) {
            if (!document.getElementById('showLabels').checked) return;
            const origin = project3D(0, 0, 0);
            const tip = project3D(Vx, Vy, Vz);
            const xProj = project3D(Vx, 0, 0);
            const yProj = project3D(0, Vy, 0);
            const zProj = project3D(0, 0, Vz);

            ctx.save();
            ctx.font = 'bold 15px monospace';
            ctx.textAlign = 'center';

            if (tip) {
                ctx.fillStyle = '#fdcb6e';
                ctx.shadowColor = '#fdcb6e';
                ctx.shadowBlur = 6;
                ctx.fillText('V', tip.x + 18, tip.y - 10);
                ctx.shadowBlur = 0;
                const mag = parseFloat(mV.value);
                ctx.font = '12px monospace';
                ctx.fillStyle = '#fff';
                ctx.fillText('|V|=' + mag.toFixed(1), tip.x + 18, tip.y + 5);
                ctx.font = 'bold 15px monospace';
            }

            ctx.font = 'bold 13px monospace';
            if (xProj) {
                ctx.fillStyle = '#ff6b6b';
                ctx.fillText('Vx=' + Vx.toFixed(1), xProj.x, xProj.y + 18);
            }
            if (yProj) {
                ctx.fillStyle = '#51cf66';
                ctx.fillText('Vy=' + Vy.toFixed(1), yProj.x - 22, yProj.y);
            }
            if (zProj) {
                ctx.fillStyle = '#74b9ff';
                ctx.fillText('Vz=' + Vz.toFixed(1), zProj.x + 20, zProj.y);
            }

            if (origin) {
                drawGlowCircle(origin, 6, '#fff');
            }

            if (tip) {
                drawGlowCircle(tip, 10, '#fdcb6e');
            }

            ctx.restore();
        }

        function draw() {
            cam.rotX += (cam.targetRotX - cam.rotX) * 0.1;
            cam.rotY += (cam.targetRotY - cam.rotY) * 0.1;
            cam.zoom += (cam.targetZoom - cam.zoom) * 0.1;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const bg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.6);
            bg.addColorStop(0, '#0a0a1a');
            bg.addColorStop(1, '#000000');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const mag = parseFloat(mV.value);
            const alpha = parseFloat(alphaSlider.value) * Math.PI / 180;
            const beta = parseFloat(betaSlider.value) * Math.PI / 180;
            const gamma = parseFloat(gammaSlider.value) * Math.PI / 180;
            const Vx = mag * Math.cos(alpha);
            const Vy = mag * Math.cos(beta);
            const Vz = mag * Math.cos(gamma);

            const origin = project3D(0, 0, 0);
            const tip = project3D(Vx, Vy, Vz);
            const xAxisTip = project3D(mag, 0, 0);
            const yAxisTip = project3D(0, mag, 0);
            const zAxisTip = project3D(0, 0, mag);

            drawPlanes();
            drawGrid();
            drawAxes();
            drawProjectionBox(Vx, Vy, Vz);
            drawPerpendicularsToAxes(Vx, Vy, Vz);

            if (origin && tip) {
                const avgDepth = (origin.z + tip.z) / 2;
                drawArrow3D(origin, tip, '#fdcb6e', 4, false, avgDepth);
                if (document.getElementById('showGlow').checked) {
                    ctx.save();
                    ctx.shadowColor = '#fdcb6e';
                    ctx.shadowBlur = 15;
                    ctx.strokeStyle = 'rgba(253, 203, 110, 0.5)';
                    ctx.lineWidth = 6;
                    ctx.beginPath();
                    ctx.moveTo(origin.x, origin.y);
                    ctx.lineTo(tip.x, tip.y);
                    ctx.stroke();
                    ctx.restore();
                }
            }

            drawDirectionAngleArc(origin, tip, xAxisTip, '#ff6b6b', alpha, 'a');
            drawDirectionAngleArc(origin, tip, yAxisTip, '#51cf66', beta, 'ß');
            drawDirectionAngleArc(origin, tip, zAxisTip, '#74b9ff', gamma, '?');

            drawLabels(Vx, Vy, Vz);

            ctx.save();
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'right';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillText('Vx = |V|cos(a) = ' + mag.toFixed(1) + ' × cos(' + parseFloat(alphaSlider.value).toFixed(0) + '°) = ' + Vx.toFixed(2), canvas.width - 20, 30);
            ctx.fillText('Vy = |V|cos(ß) = ' + mag.toFixed(1) + ' × cos(' + parseFloat(betaSlider.value).toFixed(0) + '°) = ' + Vy.toFixed(2), canvas.width - 20, 50);
            ctx.fillText('Vz = |V|cos(?) = ' + mag.toFixed(1) + ' × cos(' + parseFloat(gammaSlider.value).toFixed(0) + '°) = ' + Vz.toFixed(2), canvas.width - 20, 70);
            ctx.fillStyle = '#fdcb6e';
            ctx.font = 'bold 15px monospace';
            ctx.fillText('|V| = ' + mag.toFixed(1) + ' m', canvas.width - 20, 95);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '12px monospace';
            const cosSum = (Math.cos(alpha)**2 + Math.cos(beta)**2 + Math.cos(gamma)**2);
            ctx.fillText('cos²a+cos²ß+cos²? = ' + cosSum.toFixed(3), canvas.width - 20, 115);
            ctx.textAlign = 'left';
            ctx.restore();

            ctx.save();
            ctx.font = '13px monospace';
            ctx.fillStyle = '#fdcb6e'; ctx.fillText('? V (main vector)', 15, canvas.height - 35);
            ctx.fillStyle = '#ff6b6b'; ctx.fillText('? Vx (along X)', 15, canvas.height - 18);
            ctx.fillStyle = '#51cf66'; ctx.fillText('? Vy (along Y)', canvas.width - 140, canvas.height - 35);
            ctx.fillStyle = '#74b9ff'; ctx.fillText('? Vz (along Z)', canvas.width - 140, canvas.height - 18);
            ctx.restore();

            updateStats();
        }

        function animate() {
            if (!sim.running) return;
            sim.time += sim.dt;
            cam.targetRotY += 0.0025;
            updateStats();
            draw();
            requestAnimationFrame(animate);
        }

        if (document.getElementById('autoRotate').checked) {
            sim.running = true;
            animate();
        }

        autoCorrectGamma();
        updateStats();
        draw();
    
// From: vector-subtraction.html

        const canvas = document.getElementById('simCanvas');
        const ctx = canvas.getContext('2d');
        let sim = { running: false, paused: false, time: 0, dt: 0.016 };

        const mA = document.getElementById('mA');
        const mB = document.getElementById('mB');
        const aA = document.getElementById('aA');
        const aB = document.getElementById('aB');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');

        mA.addEventListener('input', () => { document.getElementById('mAVal').textContent = mA.value; draw(); });
        mB.addEventListener('input', () => { document.getElementById('mBVal').textContent = mB.value; draw(); });
        aA.addEventListener('input', () => { document.getElementById('aAVal').textContent = aA.value; draw(); });
        aB.addEventListener('input', () => { document.getElementById('aBVal').textContent = aB.value; draw(); });
        document.getElementById('showNegB').addEventListener('change', draw);
        document.getElementById('showTriangle').addEventListener('change', draw);
        document.getElementById('showAngle').addEventListener('change', draw);

        startBtn.addEventListener('click', () => {
            if (!sim.running) {
                sim.running = true; sim.paused = false;
                startBtn.disabled = true; startBtn.textContent = 'Running';
                pauseBtn.style.display = 'block';
                animate();
            }
        });
        pauseBtn.addEventListener('click', () => {
            sim.paused = !sim.paused;
            pauseBtn.textContent = sim.paused ? 'Resume' : 'Pause';
            if (!sim.paused) animate();
        });
        resetBtn.addEventListener('click', reset);

        function reset() {
            sim.running = false; sim.paused = false; sim.time = 0;
            startBtn.disabled = false; startBtn.textContent = 'Animate';
            pauseBtn.style.display = 'none';
            updateStats(); draw();
        }

        function updateStats() {
            const A = parseFloat(mA.value);
            const B = parseFloat(mB.value);
            const aA_deg = parseFloat(aA.value);
            const aB_deg = parseFloat(aB.value);
            const aA_rad = aA_deg * Math.PI / 180;
            const aB_rad = aB_deg * Math.PI / 180;

            const Ax = A * Math.cos(aA_rad), Ay = A * Math.sin(aA_rad);
            const Bx = B * Math.cos(aB_rad), By = B * Math.sin(aB_rad);
            const Dx = Ax - Bx, Dy = Ay - By;
            const Dmag = Math.sqrt(Dx * Dx + Dy * Dy);
            const angleDiff = Math.abs(aB_deg - aA_deg) % 360;
            const angleDiffNorm = angleDiff > 180 ? 360 - angleDiff : angleDiff;

            document.getElementById('statA').textContent = A.toFixed(1) + ' m';
            document.getElementById('statB').textContent = B.toFixed(1) + ' m';
            document.getElementById('statD').textContent = Dmag.toFixed(1) + ' m';
            document.getElementById('statDx').textContent = Dx.toFixed(2) + ' m';
            document.getElementById('statDy').textContent = Dy.toFixed(2) + ' m';
            document.getElementById('statAngle').textContent = angleDiffNorm.toFixed(1) + '°';
        }

        function drawArrow(x, y, length, angleDeg, color, lw, dashed) {
            const endX = x + length * Math.cos(angleDeg * Math.PI / 180);
            const endY = y + length * Math.sin(angleDeg * Math.PI / 180);
            ctx.save();
            if (dashed) ctx.setLineDash([5, 4]);
            ctx.strokeStyle = color; ctx.lineWidth = lw;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
            ctx.setLineDash([]);
            const headLen = 14, headAngle = 25;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - headLen * Math.cos((angleDeg - headAngle) * Math.PI / 180), endY - headLen * Math.sin((angleDeg - headAngle) * Math.PI / 180));
            ctx.lineTo(endX - headLen * Math.cos((angleDeg + headAngle) * Math.PI / 180), endY - headLen * Math.sin((angleDeg + headAngle) * Math.PI / 180));
            ctx.closePath(); ctx.fill();
            ctx.restore();
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);

            const A = parseFloat(mA.value);
            const B = parseFloat(mB.value);
            const aA_deg = parseFloat(aA.value);
            const aB_deg = parseFloat(aB.value);
            const aA_rad = aA_deg * Math.PI / 180;
            const aB_rad = aB_deg * Math.PI / 180;

            const Ax = A * Math.cos(aA_rad), Ay = A * Math.sin(aA_rad);
            const Bx = B * Math.cos(aB_rad), By = B * Math.sin(aB_rad);
            const Dx = Ax - Bx, Dy = Ay - By;
            const Dmag = Math.sqrt(Dx * Dx + Dy * Dy);
            const D_angle = Math.atan2(Dy, Dx) * 180 / Math.PI;

            const cx = canvas.width * 0.35, cy = canvas.height * 0.55;
            const scale = 28;
            const aColor = '#00b894', bColor = '#e17055', rColor = '#fdcb6e', negBColor = '#a29bfe';

            const A_len = A * scale, B_len = B * scale;
            const negB_len = B_len;
            const negB_angle = (aB_deg + 180) % 360;
            const D_len = Dmag * scale;

            const Ax_pos = cx + A_len * Math.cos(aA_rad);
            const Ay_pos = cy + A_len * Math.sin(aA_rad);
            const Bx_pos = cx + B_len * Math.cos(aB_rad);
            const By_pos = cy + B_len * Math.sin(aB_rad);
            const negBx_pos = cx + negB_len * Math.cos(negB_angle * Math.PI / 180);
            const negBy_pos = cy + negB_len * Math.sin(negB_angle * Math.PI / 180);
            const Dx_pos = cx + D_len * Math.cos(D_angle * Math.PI / 180);
            const Dy_pos = cy + D_len * Math.sin(D_angle * Math.PI / 180);

            // Triangle (head-to-tail: A + (-B))
            if (document.getElementById('showTriangle').checked) {
                ctx.strokeStyle = 'rgba(253,203,110,0.3)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(Ax_pos, Ay_pos); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(Ax_pos, Ay_pos); ctx.lineTo(Dx_pos, Dy_pos); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(Bx_pos, By_pos); ctx.lineTo(Dx_pos, Dy_pos); ctx.stroke();
                ctx.setLineDash([]);
            }

            // -B vector
            if (document.getElementById('showNegB').checked) {
                drawArrow(cx, cy, negB_len, negB_angle, negBColor, 3, true);
                ctx.font = 'bold 14px monospace';
                ctx.fillStyle = negBColor;
                ctx.fillText('-B', (cx + negBx_pos) / 2 - 15, (cy + negBy_pos) / 2 - 10);
            }

            // Vectors A and B
            drawArrow(cx, cy, A_len, aA_deg, aColor, 4, false);
            drawArrow(cx, cy, B_len, aB_deg, bColor, 4, false);

            // Resultant D = A - B
            drawArrow(cx, cy, D_len, D_angle, rColor, 4, false);

            // Labels
            ctx.font = 'bold 16px monospace';
            ctx.fillStyle = aColor;
            ctx.fillText('A', (cx + Ax_pos) / 2, (cy + Ay_pos) / 2 + 25);
            ctx.fillStyle = bColor;
            ctx.fillText('B', (cx + Bx_pos) / 2 - 15, (cy + By_pos) / 2 - 10);
            ctx.fillStyle = rColor;
            ctx.fillText('D=A-B', (cx + Dx_pos) / 2 + 10, (cy + Dy_pos) / 2 - 10);

            // Angle between A and B
            if (document.getElementById('showAngle').checked) {
                const angleDiff = Math.abs(aB_deg - aA_deg) % 360;
                const angleDiffNorm = angleDiff > 180 ? 360 - angleDiff : angleDiff;
                if (angleDiffNorm > 0 && angleDiffNorm < 180) {
                    const arcR = Math.min(40, A_len * 0.3, B_len * 0.3);
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
                    const startAngle = Math.min(aA_deg, aB_deg) * Math.PI / 180;
                    const endAngle = Math.max(aA_deg, aB_deg) * Math.PI / 180;
                    ctx.beginPath();
                    ctx.arc(cx, cy, arcR, startAngle, endAngle);
                    ctx.stroke();
                    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
                    ctx.fillText(angleDiffNorm.toFixed(0) + '°', cx + (arcR + 18) * Math.cos((aA_deg + aB_deg) / 2 * Math.PI / 180), cy + (arcR + 18) * Math.sin((aA_deg + aB_deg) / 2 * Math.PI / 180) + 5);
                    ctx.textAlign = 'left';
                }
            }

            // Formula
            ctx.font = 'bold 14px monospace'; ctx.textAlign = 'right'; ctx.fillStyle = '#fff';
            ctx.fillText('D = A - B = (' + Ax.toFixed(1) + ' - ' + Bx.toFixed(1) + ', ' + Ay.toFixed(1) + ' - ' + By.toFixed(1) + ')', canvas.width - 20, 30);
            ctx.fillStyle = rColor;
            ctx.fillText('D = (' + Dx.toFixed(1) + ', ' + Dy.toFixed(1) + ')', canvas.width - 20, 55);
            ctx.fillStyle = '#fff';
            ctx.fillText('|A - B| = ' + Dmag.toFixed(1) + ' m', canvas.width - 20, 80);
            ctx.textAlign = 'left';

            // Legend
            ctx.font = '13px monospace';
            ctx.fillStyle = aColor; ctx.fillText('? A', 15, canvas.height - 35);
            ctx.fillStyle = bColor; ctx.fillText('? B', 15, canvas.height - 18);
            ctx.fillStyle = rColor; ctx.fillText('? D = A - B', canvas.width - 140, canvas.height - 18);
            if (document.getElementById('showNegB').checked) {
                ctx.fillStyle = negBColor; ctx.fillText('? -B', canvas.width - 140, canvas.height - 35);
            }

            updateStats();
        }

        function animate() {
            if (!sim.running || sim.paused) return;
            sim.time += sim.dt;
            const newA = (parseFloat(aA.value) + 20 * Math.sin(sim.time * 0.3)) % 361;
            const newB = (parseFloat(aB.value) + 15 * Math.cos(sim.time * 0.25)) % 361;
            aA.value = Math.round(newA);
            aB.value = Math.round(newB);
            document.getElementById('aAVal').textContent = aA.value;
            document.getElementById('aBVal').textContent = aB.value;
            updateStats(); draw();
            requestAnimationFrame(animate);
        }

        reset();
    
// From: vertical-motion.html


// From: vertical-motion.html

const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');

let sim = {
    running:false,
    paused:false,
    time:0,
    dt:0.016,
    throwType:'up'
};

const maxGraphPoints = 5000;

let graphData = {
    h:[],
    v:[],
    a:[]
};

const initHeightSlider = document.getElementById('initHeight');
const initVelSlider = document.getElementById('initVel');
const gravSlider = document.getElementById('gravVal');

const showST = document.getElementById('showST');
const showVT = document.getElementById('showVT');
const showAT = document.getElementById('showAT');

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

const statTime = document.getElementById('statTime');
const statHeight = document.getElementById('statHeight');
const statVel = document.getElementById('statVel');
const statAcc = document.getElementById('statAcc');

const throwUpBtn = document.getElementById('throwUp');
const throwDownBtn = document.getElementById('throwDown');
const throwReleaseBtn = document.getElementById('throwRelease');

throwUpBtn.addEventListener('click', ()=>setThrowType('up'));
throwDownBtn.addEventListener('click', ()=>setThrowType('down'));
throwReleaseBtn.addEventListener('click', ()=>setThrowType('release'));

function setThrowType(type){
    sim.throwType = type;

    throwUpBtn.classList.toggle('active', type==='up');
    throwDownBtn.classList.toggle('active', type==='down');
    throwReleaseBtn.classList.toggle('active', type==='release');

    if(type==='down'){
        initVelSlider.min = -60;
        initVelSlider.max = -1;
        initVelSlider.value = -30;
    } else if(type==='release'){
        initVelSlider.min = 0;
        initVelSlider.max = 0;
        initVelSlider.value = 0;
    } else {
        initVelSlider.min = 0;
        initVelSlider.max = 60;
        initVelSlider.value = 30;
    }

    document.getElementById('uVal').textContent = Math.abs(initVelSlider.value) + ' m/s';
    if(!sim.running) reset();
}

initHeightSlider.addEventListener('input', ()=>{
    document.getElementById('h0Val').textContent = initHeightSlider.value + ' m';
    if(!sim.running) reset();
});

initVelSlider.addEventListener('input', ()=>{
    const u = Math.abs(initVelSlider.value);
    document.getElementById('uVal').textContent = u + ' m/s';
    if(!sim.running) reset();
});

gravSlider.addEventListener('input', ()=>{
    document.getElementById('gVal').textContent = parseFloat(gravSlider.value).toFixed(1) + ' m/s²';
    if(!sim.running) reset();
});

[showST,showVT,showAT].forEach(el=>{
    el.addEventListener('change', ()=>draw());
});

startBtn.addEventListener('click', ()=>{
    if(!sim.running){
        sim.running = true;
        sim.paused = false;
        startBtn.disabled = true;
        startBtn.textContent = 'Running';
        pauseBtn.style.display = 'block';
        animate();
    }
});

pauseBtn.addEventListener('click', ()=>{
    sim.paused = !sim.paused;
    pauseBtn.textContent = sim.paused ? 'Resume' : 'Pause';
    if(!sim.paused) animate();
});

resetBtn.addEventListener('click', reset);

function reset(){
    sim.running = false;
    sim.paused = false;
    sim.time = 0;

    const h0 = parseFloat(initHeightSlider.value);
    const u = sim.throwType==='release' ? 0 : (sim.throwType==='down' ? -Math.abs(parseFloat(initVelSlider.value)) : parseFloat(initVelSlider.value));
    const g = parseFloat(gravSlider.value);

    graphData = {
        h:[{t:0,val:h0}],
        v:[{t:0,val:u}],
        a:[{t:0,val:-g}]
    };

    startBtn.disabled = false;
    startBtn.textContent = 'Start';
    pauseBtn.style.display = 'none';
    pauseBtn.textContent = 'Pause';

    updateStats();
    draw();
}

function updateStats(){
    const h0 = parseFloat(initHeightSlider.value);
    const u = sim.throwType==='release' ? 0 : (sim.throwType==='down' ? -Math.abs(parseFloat(initVelSlider.value)) : parseFloat(initVelSlider.value));
    const g = parseFloat(gravSlider.value);

    const v = u - g*sim.time;
    const h = h0 + u*sim.time - 0.5*g*sim.time*sim.time;

    statTime.textContent = sim.time.toFixed(2) + ' s';
    statHeight.textContent = Math.max(h,0).toFixed(2) + ' m';
    statVel.textContent = v.toFixed(2) + ' m/s';
    statAcc.textContent = (-g).toFixed(2) + ' m/s²';
}

function getMotionValues(t){
    const h0 = parseFloat(initHeightSlider.value);
    const u = sim.throwType==='release' ? 0 : (sim.throwType==='down' ? -Math.abs(parseFloat(initVelSlider.value)) : parseFloat(initVelSlider.value));
    const g = parseFloat(gravSlider.value);

    return {
        h: h0 + u*t - 0.5*g*t*t,
        v: u - g*t,
        a: -g
    };
}

function drawGraph(x, y, w, h, data, color, title, unit){
    if(data.length < 2) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(x,y,w,h);

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(x,y,w,h);

    ctx.fillStyle = '#fdcb6e';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, x+w/2, y+20);

    const values = data.map(p=>p.val);
    let yMin = Math.min(...values);
    let yMax = Math.max(...values);

    if(yMin===yMax){
        yMin -= 1;
        yMax += 1;
    }

    const timeWindow = 10;
    const tMax = sim.time;
    const tMin = Math.max(0, tMax-timeWindow);

    const padL = 55;
    const padR = 15;
    const padT = 30;
    const padB = 40;

    const gw = w-padL-padR;
    const gh = h-padT-padB;

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;

    for(let i=0;i<=5;i++){
        const tx = x + padL + (gw*i/5);
        ctx.beginPath();
        ctx.moveTo(tx,y+padT);
        ctx.lineTo(tx,y+padT+gh);
        ctx.stroke();
    }

    for(let i=0;i<=4;i++){
        const ty = y + padT + (gh*i/4);
        ctx.beginPath();
        ctx.moveTo(x+padL,ty);
        ctx.lineTo(x+padL+gw,ty);
        ctx.stroke();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';

    for(let i=0;i<=5;i++){
        const tx = x + padL + (gw*i/5);
        const tVal = tMin + ((timeWindow*i)/5);
        ctx.fillText(tVal.toFixed(1), tx, y+padT+gh+15);
    }

    ctx.textAlign = 'right';
    for(let i=0;i<=4;i++){
        const ty = y + padT + (gh*i/4);
        const yVal = yMax - ((yMax-yMin)*i/4);
        ctx.fillText(yVal.toFixed(1), x+padL-5, ty+3);
    }

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    ctx.beginPath();
    let started = false;

    for(let i=0;i<data.length;i++){
        const tVal = data[i].t;
        const val = data[i].val;

        if(tVal < tMin || tVal > tMax) continue;

        const px = x + padL + ((tVal-tMin)/timeWindow)*gw;
        const py = y + padT + gh*(1 - (val-yMin)/(yMax-yMin));

        if(!started){
            ctx.moveTo(px,py);
            started = true;
        } else {
            ctx.lineTo(px,py);
        }
    }

    ctx.stroke();

    const last = data[data.length-1];
    const px = x + padL + gw;
    const py = y + padT + gh*(1 - (last.val-yMin)/(yMax-yMin));

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI*2);
    ctx.fill();
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const h0 = parseFloat(initHeightSlider.value);
    const u = sim.throwType==='release' ? 0 : (sim.throwType==='down' ? -Math.abs(parseFloat(initVelSlider.value)) : parseFloat(initVelSlider.value));
    const g = parseFloat(gravSlider.value);

    const v = u - g*sim.time;
    const h = h0 + u*sim.time - 0.5*g*sim.time*sim.time;
    const hClamped = Math.max(h, 0);

    // Left side: full height ball animation
    const animW = canvas.width * 0.55;
    const groundY = canvas.height - 50;
    const ballX = animW * 0.35;

    // Ground
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    // Height scale
    const maxPossibleH = h0 + (u*u)/(2*g) + 10;
    const scale = (groundY - 40) / maxPossibleH;

    ctx.fillStyle = '#fdcb6e';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';

    for(let mh = 0; mh <= maxPossibleH; mh += Math.ceil(maxPossibleH/8)){
        const my = groundY - mh*scale;
        if(my < 30) break;
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4,4]);
        ctx.beginPath();
        ctx.moveTo(100, my);
        ctx.lineTo(animW-20, my);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText(mh+'m', 95, my+3);
    }

    // Initial height marker
    const h0Y = groundY - h0*scale;
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6,4]);
    ctx.beginPath();
    ctx.moveTo(80, h0Y);
    ctx.lineTo(animW-20, h0Y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#fdcb6e';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('h0='+h0+'m', 125, h0Y-5);

    // Ball position
    const ballY = groundY - hClamped*scale;
    const ballR = 14;

    // Trail
    if(sim.time > 0){
        const trailPoints = [];
        for(let t=0; t<=sim.time; t+=0.05){
            const th = h0 + u*t - 0.5*g*t*t;
            const ty = groundY - Math.max(th,0)*scale;
            trailPoints.push({x:ballX, y:ty});
        }
        if(trailPoints.length > 1){
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(trailPoints[0].x, trailPoints[0].y);
            for(let i=1;i<trailPoints.length;i++){
                ctx.lineTo(trailPoints[i].x, trailPoints[i].y);
            }
            ctx.stroke();
        }
    }

    // Ball glow
    const glow = ctx.createRadialGradient(ballX, ballY, 0, ballX, ballY, ballR*3);
    glow.addColorStop(0, 'rgba(255,255,255,0.4)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballR*3, 0, Math.PI*2);
    ctx.fill();

    // Ball
    const ballGrad = ctx.createRadialGradient(ballX-3, ballY-3, 0, ballX, ballY, ballR);
    ballGrad.addColorStop(0, '#ffffff');
    ballGrad.addColorStop(1, '#cccccc');
    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballR, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Velocity arrow
    const velLen = Math.min(Math.abs(v)*4, 100);
    const velDir = v >= 0 ? -1 : 1;
    ctx.strokeStyle = '#fdcb6e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ballX + 35, ballY);
    ctx.lineTo(ballX + 35, ballY + velLen*velDir);
    ctx.stroke();
    ctx.fillStyle = '#fdcb6e';
    ctx.beginPath();
    ctx.moveTo(ballX + 35, ballY + velLen*velDir);
    ctx.lineTo(ballX + 30, ballY + velLen*velDir - 6*velDir);
    ctx.lineTo(ballX + 40, ballY + velLen*velDir - 6*velDir);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fdcb6e';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('v='+v.toFixed(1)+'m/s', ballX + 45, ballY + (velLen*velDir)/2);

    // Acceleration arrow (always downward)
    const accLen = Math.min(g*5, 60);
    ctx.strokeStyle = '#fdcb6e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ballX - 35, ballY);
    ctx.lineTo(ballX - 35, ballY + accLen);
    ctx.stroke();
    ctx.fillStyle = '#fdcb6e';
    ctx.beginPath();
    ctx.moveTo(ballX - 35, ballY + accLen);
    ctx.lineTo(ballX - 40, ballY + accLen - 6);
    ctx.lineTo(ballX - 30, ballY + accLen - 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fdcb6e';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('a=-'+g.toFixed(1)+'m/s²', ballX - 40, ballY + accLen/2);

    // Direction label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    if(v > 0.5){
        ctx.fillText('? Up', ballX, 25);
    } else if(v < -0.5){
        ctx.fillText('? Down', ballX, 25);
    } else {
        ctx.fillText('• Max Height', ballX, 25);
    }

    // Right side: stacked graphs (vertical stack)
    const graphLeft = animW + 15;
    const graphW = canvas.width - graphLeft - 15;
    const graphTotalH = canvas.height - 60;

    let graphs = [];
    if(showST.checked){
        graphs.push({data:graphData.h, color:'#00b894', title:'Height vs Time', unit:'m'});
    }
    if(showVT.checked){
        graphs.push({data:graphData.v, color:'#0984e3', title:'Velocity vs Time', unit:'m/s'});
    }
    if(showAT.checked){
        graphs.push({data:graphData.a, color:'#e17055', title:'Acceleration vs Time', unit:'m/s²'});
    }

    const n = graphs.length;
    if(n === 0) return;

    const margin = 10;
    const graphH = (graphTotalH - margin*(n-1)) / n;

    for(let i=0;i<n;i++){
        const gy = 30 + i*(graphH + margin);
        const g = graphs[i];
        drawGraph(graphLeft, gy, graphW, graphH, g.data, g.color, g.title, g.unit);
    }
}

function animate(){
    if(!sim.running || sim.paused) return;

    sim.time += sim.dt;

    const vals = getMotionValues(sim.time);

    if(vals.h <= 0 && sim.time > sim.dt){
        vals.h = 0;
        sim.running = false;
        startBtn.disabled = false;
        startBtn.textContent = 'Restart';
        pauseBtn.style.display = 'none';
    }

    graphData.h.push({t:sim.time, val:Math.max(vals.h,0)});
    graphData.v.push({t:sim.time, val:vals.v});
    graphData.a.push({t:sim.time, val:vals.a});

    if(graphData.h.length > maxGraphPoints) graphData.h.shift();
    if(graphData.v.length > maxGraphPoints) graphData.v.shift();
    if(graphData.a.length > maxGraphPoints) graphData.a.shift();

    updateStats();
    draw();

    if(sim.running) requestAnimationFrame(animate);
}
reset();


