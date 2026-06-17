const fs = require('fs');
const path = require('path');

// Read JSON files
const dataDir = path.join(__dirname, 'data');
const jsFile = path.join(__dirname, 'js', 'sim-common.js');

const subjects = ['physics', 'chemistry', 'maths'];
const allData = {};

for (const subject of subjects) {
    const jsonPath = path.join(dataDir, `${subject}-sims.json`);
    if (fs.existsSync(jsonPath)) {
        allData[subject] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    }
}

// Build the data section
let dataLines = [];
for (const subject of subjects) {
    if (allData[subject]) {
        dataLines.push(`        ${subject}: {`);
        const sims = allData[subject];
        const simItems = Object.entries(sims);
        simItems.forEach(([filename, sim], i) => {
            const simJson = JSON.stringify(sim);
            const comma = i < simItems.length - 1 ? ',' : '';
            dataLines.push(`            "${filename}": ${simJson}${comma}`);
        });
        dataLines.push('        },');
    }
}

const dataSection = dataLines.join('\n');

// Build JS content - use String.fromCharCode(39) to avoid apostrophe issues
const jsHeader = `// ===== Fullscreen for all simulation pages =====
(function(){
    if(document.querySelector('.navbar-sim')){
        var navbar = document.querySelector('.navbar-sim');

        var btn = document.createElement('button');
        btn.className = 'fs-btn';
        btn.id = 'fsBtn';
        btn.textContent = '⛶ Fullscreen';
        btn.onclick = function(){
            if(!document.fullscreenElement){
                document.documentElement.requestFullscreen().catch(function(){});
            } else {
                document.exitFullscreen();
            }
        };
        navbar.appendChild(btn);

        document.addEventListener('fullscreenchange', function(){
            var b = document.getElementById('fsBtn');
            if(b){
                b.textContent = document.fullscreenElement ? '⛶ Exit Fullscreen' : '⛶ Fullscreen';
            }
        });

        document.documentElement.requestFullscreen().catch(function(){});
    }
})();

// ===== Info Button & Modal for all simulation pages =====
(function(){
    var SIM_DATA = {
`;

const jsFooter = `    };
    
    var path = window.location.pathname;
    var subject = "";
    var simName = "";
    
    if (path.indexOf("/physics/") !== -1) {
        subject = "physics";
        simName = path.split("/").pop();
    } else if (path.indexOf("/chemistry/") !== -1) {
        subject = "chemistry";
        simName = path.split("/").pop();
    } else if (path.indexOf("/maths/") !== -1) {
        subject = "maths";
        simName = path.split("/").pop();
    }
    
    if (!subject || !simName) return;
    
    // Load KaTeX for math rendering
    var katexCSS = document.createElement("link");
    katexCSS.rel = "stylesheet";
    katexCSS.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(katexCSS);
    
    var katexJS = document.createElement("script");
    katexJS.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    var modalRef = null;
    katexJS.onload = function() {
        var autoRenderJS = document.createElement("script");
        autoRenderJS.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js";
        autoRenderJS.onload = function() {
            if (typeof renderMathInElement === "function" && modalRef) {
                renderMathInElement(modalRef, {
                    delimiters: [
                        {left: "$$", right: "$$", display: true},
                        {left: "$", right: "$", display: false}
                    ]
                });
            }
        };
        autoRenderJS.onerror = function() {
            console.error("Failed to load KaTeX auto-render");
        };
        document.head.appendChild(autoRenderJS);
    };
    katexJS.onerror = function() {
        console.error("Failed to load KaTeX");
    };
    document.head.appendChild(katexJS);
    
    var infoBtn = document.createElement("button");
    infoBtn.className = "info-btn";
    infoBtn.id = "infoBtn";
    infoBtn.textContent = "\\ud83d\\udcd6";
    infoBtn.title = "What You" + String.fromCharCode(39) + "ll Learn";
    
    var navbar = document.querySelector(".navbar-sim");
    if (navbar) {
        var fsBtn = document.getElementById("fsBtn");
        if (fsBtn) {
            navbar.insertBefore(infoBtn, fsBtn.nextSibling);
        } else {
            navbar.appendChild(infoBtn);
        }
    }
    
    var modalHTML = "<div class=" + '"modal-overlay"' + " id=" + '"infoModal"' + ">" +
        "<div class=" + '"modal-content"' + ">" +
        "<h2 id=" + '"modalTitle"' + ">What You" + String.fromCharCode(39) + "ll Learn</h2>" +
        "<ul class=" + '"learn-list"' + " id=" + '"modalList"' + "></ul>" +
        "<button class=" + '"modal-close"' + " id=" + '"modalClose"' + ">Close</button>" +
        "</div></div>";
    
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    modalRef = document.getElementById("infoModal");
    
    infoBtn.addEventListener("click", function() {
        var modal = document.getElementById("infoModal");
        var modalTitle = document.getElementById("modalTitle");
        var modalList = document.getElementById("modalList");
        var sim = SIM_DATA[subject][simName];
        
        if (sim) {
            modalTitle.textContent = sim.title || "What You" + String.fromCharCode(39) + "ll Learn";
            modalList.innerHTML = "";
            (sim.learn || []).forEach(function(item) {
                var li = document.createElement("li");
                li.className = "learn-item";
                li.setAttribute("data-content", item);
                li.innerHTML = item;
                modalList.appendChild(li);
            });
            modal.classList.add("active");
            // Render KaTeX after content is set
            if (typeof renderMathInElement === "function") {
                renderMathInElement(modal, {
                    delimiters: [
                        {left: "$$", right: "$$", display: true},
                        {left: "$", right: "$", display: false}
                    ]
                });
            }
        } else {
            modalTitle.textContent = "Information";
            modalList.innerHTML = "<li>Content not available for this simulation</li>";
            modal.classList.add("active");
        }
    });
    
    var modalClose = document.getElementById("modalClose");
    if (modalClose) {
        modalClose.addEventListener("click", function() {
            document.getElementById("infoModal").classList.remove("active");
        });
    }
    
    var modal = document.getElementById("infoModal");
    if (modal) {
        modal.addEventListener("click", function(e) {
            if (e.target === modal) {
                modal.classList.remove("active");
            }
        });
    }
    
    // Auto-show modal on page load
    if (modal) {
        var sim = SIM_DATA[subject][simName];
        if (sim) {
            var modalTitle = document.getElementById("modalTitle");
            var modalList = document.getElementById("modalList");
            modalTitle.textContent = sim.title || "What You" + String.fromCharCode(39) + "ll Learn";
            modalList.innerHTML = "";
            (sim.learn || []).forEach(function(item) {
                var li = document.createElement("li");
                li.className = "learn-item";
                li.setAttribute("data-content", item);
                li.innerHTML = item;
                modalList.appendChild(li);
            });
            modal.classList.add("active");
        } else {
            modalTitle.textContent = "Information";
            modalList.innerHTML = "<li>Content not available for this simulation</li>";
            modal.classList.add("active");
        }
        // Render KaTeX after content is set - wait for KaTeX to load
        function waitForKatex() {
            if (typeof renderMathInElement === "function") {
                renderMathInElement(modal, {
                    delimiters: [
                        {left: "$$", right: "$$", display: true},
                        {left: "$", right: "$", display: false}
                    ]
                });
            } else {
                setTimeout(waitForKatex, 100);
            }
        }
        waitForKatex();
    }
})();
`;

const jsContent = jsHeader + dataSection + '\n' + jsFooter;

// Write to JS file
fs.writeFileSync(jsFile, jsContent, 'utf-8');

console.log(`Updated ${jsFile}`);
console.log(`Subjects: ${subjects.join(', ')}`);
subjects.forEach(subject => {
    if (allData[subject]) {
        console.log(`  ${subject}: ${Object.keys(allData[subject]).length} simulations`);
    }
});
