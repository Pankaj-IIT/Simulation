// ===== Reusable Object Drawing Library =====
// Draw objects using canvas - no images needed!
// Usage: Include this script, then call drawObject(ctx, x, y, scale, options)

const ObjectLibrary = {
    // Draw a cartoon person/man
    drawMan: function(ctx, x, y, scale = 1, options = {}) {
        const s = scale;
        const headY = y - 18 * s;
        const bodyTop = y - 10 * s;
        const bodyBottom = y + 2 * s;
        
        // Default colors
        const skinColor = options.skinColor || '#ffcc00';
        const shirtColor = options.shirtColor || '#ff6600';
        const pantsColor = options.pantsColor || '#3366cc';
        const hairColor = options.hairColor || '#333333';
        
        // Head
        ctx.fillStyle = skinColor;
        ctx.strokeStyle = '#cc9900';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.arc(x, headY, 8 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Hair
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.arc(x, headY - 3 * s, 8 * s, Math.PI, 2 * Math.PI);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x - 3 * s, headY - 1 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.arc(x + 3 * s, headY - 1 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.arc(x, headY + 2 * s, 4 * s, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        // Body (torso)
        ctx.strokeStyle = shirtColor;
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.moveTo(x, bodyTop);
        ctx.lineTo(x, bodyBottom);
        ctx.stroke();
        
        // Arms
        const armAngle = options.armAngle || 0; // -PI/2 to PI/2
        ctx.strokeStyle = skinColor;
        ctx.lineWidth = 2.5 * s;
        ctx.beginPath();
        ctx.moveTo(x - 10 * s * Math.cos(armAngle), bodyTop + 4 * s - 10 * s * Math.sin(armAngle));
        ctx.lineTo(x, bodyTop);
        ctx.lineTo(x + 10 * s * Math.cos(armAngle), bodyTop + 4 * s - 10 * s * Math.sin(armAngle));
        ctx.stroke();
        
        // Legs
        ctx.strokeStyle = pantsColor;
        ctx.lineWidth = 2.5 * s;
        ctx.beginPath();
        ctx.moveTo(x - 8 * s, bodyBottom);
        ctx.lineTo(x, bodyBottom);
        ctx.lineTo(x + 8 * s, bodyBottom);
        ctx.stroke();
        
        // Shoes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - 8 * s, bodyBottom + 2 * s, 3 * s, 0, Math.PI * 2);
        ctx.arc(x + 8 * s, bodyBottom + 2 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();
        
        // Name label
        if (options.label) {
            ctx.fillStyle = options.labelColor || '#000';
            ctx.font = `bold ${10 * s}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(options.label, x, y + 20 * s);
        }
    },
    
    // Draw a beaker/flask
    drawBeaker: function(ctx, x, y, scale = 1, options = {}) {
        const s = scale;
        const width = 30 * s;
        const height = 50 * s;
        const neckWidth = 12 * s;
        const neckHeight = 15 * s;
        
        // Beaker body
        ctx.fillStyle = 'rgba(200, 230, 255, 0.3)';
        ctx.strokeStyle = '#6699cc';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(x - width/2, y);
        ctx.lineTo(x - width/2, y - height + neckHeight);
        ctx.lineTo(x - neckWidth/2, y - height);
        ctx.lineTo(x + neckWidth/2, y - height);
        ctx.lineTo(x + width/2, y - height + neckHeight);
        ctx.lineTo(x + width/2, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Liquid inside
        const liquidLevel = options.liquidLevel || 0.7;
        const liquidColor = options.liquidColor || '#4488ff';
        ctx.fillStyle = liquidColor;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(x - width/2 + 2*s, y - (height - neckHeight) * liquidLevel);
        ctx.lineTo(x - width/2 + 2*s, y - 2*s);
        ctx.lineTo(x + width/2 - 2*s, y - 2*s);
        ctx.lineTo(x + width/2 - 2*s, y - (height - neckHeight) * liquidLevel);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Measurement lines
        ctx.strokeStyle = '#6699cc';
        ctx.lineWidth = 1 * s;
        for (let i = 1; i <= 4; i++) {
            const ly = y - (height - neckHeight) * (i / 5);
            ctx.beginPath();
            ctx.moveTo(x + width/2 - 3*s, ly);
            ctx.lineTo(x + width/2, ly);
            ctx.stroke();
        }
        
        // Label
        if (options.label) {
            ctx.fillStyle = options.labelColor || '#000';
            ctx.font = `bold ${10 * s}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(options.label, x, y + 15 * s);
        }
    },
    
    // Draw a test tube
    drawTestTube: function(ctx, x, y, scale = 1, options = {}) {
        const s = scale;
        const width = 10 * s;
        const height = 60 * s;
        
        // Test tube body
        ctx.fillStyle = 'rgba(200, 230, 255, 0.3)';
        ctx.strokeStyle = '#6699cc';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(x - width/2, y - height);
        ctx.lineTo(x - width/2, y - 10 * s);
        ctx.arc(x, y - 10 * s, width/2, Math.PI, 0, false);
        ctx.lineTo(x + width/2, y - height);
        ctx.stroke();
        ctx.fill();
        
        // Liquid
        const liquidLevel = options.liquidLevel || 0.5;
        const liquidColor = options.liquidColor || '#44ff44';
        ctx.fillStyle = liquidColor;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(x - width/2 + 1*s, y - height + (height - 10*s) * (1 - liquidLevel));
        ctx.lineTo(x - width/2 + 1*s, y - 8*s);
        ctx.arc(x, y - 8*s, width/2 - 1*s, 0, Math.PI, false);
        ctx.lineTo(x + width/2 - 1*s, y - height + (height - 10*s) * (1 - liquidLevel));
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Cap
        ctx.fillStyle = '#cc6600';
        ctx.fillRect(x - width/2 - 2*s, y - height - 5*s, width + 4*s, 5*s);
        
        // Label
        if (options.label) {
            ctx.fillStyle = options.labelColor || '#000';
            ctx.font = `bold ${10 * s}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(options.label, x, y + 15 * s);
        }
    },
    
    // Draw a pipette/dropper
    drawPipette: function(ctx, x, y, scale = 1, options = {}) {
        const s = scale;
        const angle = options.angle || 0; // rotation angle
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // Bulb (top)
        ctx.fillStyle = options.bulbColor || '#ff6666';
        ctx.beginPath();
        ctx.arc(0, -30 * s, 8 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cc3333';
        ctx.lineWidth = 2 * s;
        ctx.stroke();
        
        // Tube
        ctx.fillStyle = 'rgba(200, 230, 255, 0.5)';
        ctx.strokeStyle = '#6699cc';
        ctx.lineWidth = 2 * s;
        ctx.fillRect(-4 * s, -22 * s, 8 * s, 50 * s);
        ctx.strokeRect(-4 * s, -22 * s, 8 * s, 50 * s);
        
        // Liquid in tube
        const liquidLevel = options.liquidLevel || 0.6;
        const liquidColor = options.liquidColor || '#4488ff';
        ctx.fillStyle = liquidColor;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(-3 * s, -22 * s + (50 * s) * (1 - liquidLevel), 6 * s, (50 * s) * liquidLevel);
        ctx.globalAlpha = 1;
        
        // Tip
        ctx.fillStyle = 'rgba(200, 230, 255, 0.5)';
        ctx.strokeStyle = '#6699cc';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(-4 * s, 28 * s);
        ctx.lineTo(-2 * s, 40 * s);
        ctx.lineTo(2 * s, 40 * s);
        ctx.lineTo(4 * s, 28 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Droplet
        if (options.dripping) {
            ctx.fillStyle = liquidColor;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(0, 45 * s, 3 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        ctx.restore();
        
        // Label (outside rotation)
        if (options.label) {
            ctx.fillStyle = options.labelColor || '#000';
            ctx.font = `bold ${10 * s}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(options.label, x, y + 55 * s);
        }
    },
    
    // Draw an atom
    drawAtom: function(ctx, x, y, scale = 1, options = {}) {
        const s = scale;
        const numOrbits = options.orbits || 3;
        const orbitRadius = 35 * s;
        
        // Draw orbits
        ctx.strokeStyle = 'rgba(150, 150, 255, 0.4)';
        ctx.lineWidth = 1.5 * s;
        for (let i = 0; i < numOrbits; i++) {
            ctx.beginPath();
            ctx.ellipse(x, y, orbitRadius, orbitRadius * 0.4, (i * Math.PI) / numOrbits, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw nucleus
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(x, y, 8 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cc0000';
        ctx.lineWidth = 2 * s;
        ctx.stroke();
        
        // Nucleus label
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${8 * s}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('N', x, y + 3 * s);
        
        // Draw electrons
        const electronColor = options.electronColor || '#4488ff';
        for (let i = 0; i < numOrbits; i++) {
            const angle = (i * Math.PI * 2) / numOrbits + (options.rotation || 0);
            const ex = x + orbitRadius * Math.cos(angle);
            const ey = y + orbitRadius * 0.4 * Math.sin(angle);
            
            ctx.fillStyle = electronColor;
            ctx.beginPath();
            ctx.arc(ex, ey, 4 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2266cc';
            ctx.lineWidth = 1.5 * s;
            ctx.stroke();
        }
        
        // Label
        if (options.label) {
            ctx.fillStyle = options.labelColor || '#000';
            ctx.font = `bold ${10 * s}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(options.label, x, y + orbitRadius + 20 * s);
        }
    },
    
    // Draw a book
    drawBook: function(ctx, x, y, scale = 1, options = {}) {
        const s = scale;
        const width = 40 * s;
        const height = 30 * s;
        const thickness = 8 * s;
        
        // Book cover (back)
        ctx.fillStyle = options.coverColor || '#8B4513';
        ctx.fillRect(x - width/2 - thickness/2, y - height/2 - thickness/2, width + thickness, height + thickness);
        
        // Pages
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - width/2 + thickness/2, y - height/2 + thickness/2, width - thickness, height - thickness);
        
        // Book spine
        ctx.strokeStyle = options.coverColor || '#8B4513';
        ctx.lineWidth = 2 * s;
        ctx.strokeRect(x - width/2 - thickness/2, y - height/2 - thickness/2, width + thickness, height + thickness);
        
        // Title on cover
        ctx.fillStyle = '#ffd700';
        ctx.font = `bold ${8 * s}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(options.title || 'Book', x, y + 3 * s);
        
        // Label
        if (options.label) {
            ctx.fillStyle = options.labelColor || '#000';
            ctx.font = `bold ${10 * s}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(options.label, x, y + height/2 + 20 * s);
        }
    },
    
    // Draw a ball/sphere
    drawBall: function(ctx, x, y, scale = 1, options = {}) {
        const s = scale;
        const radius = options.radius || 15 * s;
        
        // Ball gradient
        const grad = ctx.createRadialGradient(x - radius/3, y - radius/3, radius/4, x, y, radius);
        grad.addColorStop(0, options.lightColor || '#ff8888');
        grad.addColorStop(1, options.ballColor || '#ff4444');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = options.borderColor || '#cc0000';
        ctx.lineWidth = 2 * s;
        ctx.stroke();
        
        // Shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(x - radius/3, y - radius/3, radius/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Label
        if (options.label) {
            ctx.fillStyle = options.labelColor || '#000';
            ctx.font = `bold ${10 * s}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(options.label, x, y + radius + 15 * s);
        }
    },
    
    // Draw an arrow (for velocity/force vectors)
    drawArrow: function(ctx, x1, y1, x2, y2, scale = 1, options = {}) {
        const s = scale;
        const headLength = 10 * s;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        // Line
        ctx.strokeStyle = options.color || '#ff4444';
        ctx.lineWidth = options.lineWidth || 3 * s;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Arrowhead
        ctx.fillStyle = options.color || '#ff4444';
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI/6), y2 - headLength * Math.sin(angle - Math.PI/6));
        ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI/6), y2 - headLength * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fill();
        
        // Label
        if (options.label) {
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            ctx.fillStyle = options.labelColor || '#000';
            ctx.font = `bold ${11 * s}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(options.label, midX + (options.labelOffsetX || 0), midY + (options.labelOffsetY || -10));
        }
    },
    
    // Draw a box/rectangle (for blocks, containers)
    drawBox: function(ctx, x, y, width, height, scale = 1, options = {}) {
        const s = scale;
        const w = width * s;
        const h = height * s;
        
        // Box fill
        ctx.fillStyle = options.fillColor || 'rgba(150, 150, 150, 0.3)';
        ctx.fillRect(x - w/2, y - h/2, w, h);
        
        // Box border
        ctx.strokeStyle = options.borderColor || '#666';
        ctx.lineWidth = 2 * s;
        ctx.strokeRect(x - w/2, y - h/2, w, h);
        
        // Label
        if (options.label) {
            ctx.fillStyle = options.labelColor || '#000';
            ctx.font = `bold ${12 * s}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(options.label, x, y + 4 * s);
        }
    },
    
    // Draw a water drop
    drawWaterDrop: function(ctx, x, y, scale = 1, options = {}) {
        const s = scale;
        const size = options.size || 10 * s;
        
        ctx.fillStyle = options.color || '#4488ff';
        ctx.globalAlpha = options.alpha || 0.7;
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.quadraticCurveTo(x + size, y, x, y + size);
        ctx.quadraticCurveTo(x - size, y, x, y - size);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(x - size/4, y - size/4, size/5, 0, Math.PI * 2);
        ctx.fill();
    },
    
    // Draw a sun
    drawSun: function(ctx, x, y, scale = 1, options = {}) {
        const s = scale;
        const radius = options.radius || 20 * s;
        const rays = options.rays || 8;
        
        // Rays
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 3 * s;
        for (let i = 0; i < rays; i++) {
            const angle = (i * Math.PI * 2) / rays;
            ctx.beginPath();
            ctx.moveTo(x + (radius + 5*s) * Math.cos(angle), y + (radius + 5*s) * Math.sin(angle));
            ctx.lineTo(x + (radius + 15*s) * Math.cos(angle), y + (radius + 15*s) * Math.sin(angle));
            ctx.stroke();
        }
        
        // Sun body
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, '#ffff88');
        grad.addColorStop(1, '#ffcc00');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ff9900';
        ctx.lineWidth = 2 * s;
        ctx.stroke();
    },
    
    // Draw a tree
    drawTree: function(ctx, x, y, scale = 1, options = {}) {
        const s = scale;
        const trunkWidth = 12 * s;
        const trunkHeight = 40 * s;
        const canopyRadius = 25 * s;
        
        // Trunk
        ctx.fillStyle = options.trunkColor || '#8B4513';
        ctx.fillRect(x - trunkWidth/2, y - trunkHeight, trunkWidth, trunkHeight);
        
        // Canopy (circle)
        ctx.fillStyle = options.leafColor || '#228B22';
        ctx.beginPath();
        ctx.arc(x, y - trunkHeight - canopyRadius/2, canopyRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#1a6b1a';
        ctx.lineWidth = 2 * s;
        ctx.stroke();
        
        // Highlight
        ctx.fillStyle = 'rgba(100, 200, 100, 0.5)';
        ctx.beginPath();
        ctx.arc(x - canopyRadius/3, y - trunkHeight - canopyRadius/3, canopyRadius/3, 0, Math.PI * 2);
        ctx.fill();
    }
};
