// ===== Fullscreen for all simulation pages =====
(function(){
    const isShortsMode = new URLSearchParams(window.location.search).get('shorts') === '1';
    
    if(!isShortsMode && document.querySelector('.navbar-sim')){
        var navbar = document.querySelector('.navbar-sim');

        var btn = document.createElement('button');
        btn.className = 'fs-btn';
        btn.id = 'fsBtn';
        btn.textContent = '⛶';
        btn.title = 'Fullscreen';
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
                b.title = document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen';
            }
        });

        document.documentElement.requestFullscreen().catch(function(){});

        // Mobile: shorten back button text
        var backBtn = navbar.querySelector('.back-btn');
        if (backBtn) {
            backBtn.setAttribute('data-full-text', backBtn.textContent);
            if (window.innerWidth < 768) {
                backBtn.textContent = '← Back';
            }
        }
        window.addEventListener('resize', function(){
            if (backBtn && backBtn.getAttribute('data-full-text')) {
                backBtn.textContent = window.innerWidth < 768 ? '← Back' : backBtn.getAttribute('data-full-text');
            }
        });

        // Mobile: reorganize controls into rows by type, max 3 per row
        if (window.innerWidth < 768) {
            setTimeout(function(){
                var panel = document.querySelector('.controls-panel');
                if (!panel) return;
                
                var h3 = panel.querySelector('h3');
                var allDivs = Array.from(panel.querySelectorAll(':scope > div'));
                
                var sliders = [];
                var checkboxes = [];
                var buttons = [];
                var other = [];
                
                allDivs.forEach(function(div) {
                    if (div.querySelector('input[type="range"]')) {
                        sliders.push(div);
                    } else if (div.querySelector('input[type="checkbox"]')) {
                        checkboxes.push(div);
                    } else if (div.classList.contains('sim-buttons')) {
                        buttons.push(div);
                    } else {
                        other.push(div);
                    }
                });
                
                panel.innerHTML = '';
                
                if (h3) {
                    panel.appendChild(h3);
                }
                
                other.forEach(function(div) {
                    panel.appendChild(div);
                });
                
                function makeRow(items) {
                    if (items.length === 0) return;
                    var row = document.createElement('div');
                    row.style.cssText = 'display:flex;flex-direction:row;flex-wrap:wrap;gap:0.8rem;margin-bottom:0.5rem;width:100%;';
                    
                    items.forEach(function(item) {
                        item.style.cssText = 'display:inline-block;margin:0;flex-shrink:0;width:calc(33.333% - 0.5rem);min-width:120px;';
                        var label = item.querySelector('label');
                        if (label) {
                            label.style.cssText = 'display:block;font-size:0.7rem;white-space:nowrap;margin-bottom:2px;';
                        }
                        var input = item.querySelector('input[type="range"]');
                        if (input) {
                            input.style.cssText = 'width:100%;height:5px;display:block;';
                        }
                        var cb = item.querySelector('input[type="checkbox"]');
                        if (cb) {
                            cb.style.cssText = 'margin-right:0.3rem;display:inline;vertical-align:middle;';
                            label.style.cssText = 'display:inline-flex;align-items:center;font-size:0.7rem;white-space:nowrap;';
                        }
                        row.appendChild(item);
                    });
                    
                    panel.appendChild(row);
                }
                
                makeRow(sliders);
                makeRow(checkboxes);
                
                if (buttons.length > 0) {
                    var btnRow = document.createElement('div');
                    btnRow.style.cssText = 'display:flex;flex-direction:row;flex-wrap:wrap;gap:0.4rem;margin-bottom:0.5rem;width:100%;';
                    
                    buttons.forEach(function(btnDiv) {
                        btnDiv.style.cssText = 'display:inline-flex;margin:0;flex-shrink:0;width:calc(50% - 0.2rem);';
                        var btns = btnDiv.querySelectorAll('.sim-btn');
                        btns.forEach(function(b) {
                            b.style.cssText = 'flex:1;font-size:0.75rem;padding:0.5rem;white-space:nowrap;display:block;';
                        });
                        btnRow.appendChild(btnDiv);
                    });
                    
                    panel.appendChild(btnRow);
                }
            }, 200);
        }
    }
})();

// ===== Info Button & Modal for all simulation pages =====
(function(){
    var SIM_DATA = {
        physics: {
            "arjuns-arrow.html": {"title":"Arjuns Arrow - Projectile Motion","learn":["Understanding projectile motion and trajectory","How launch angle affects distance and height","The role of initial velocity in projectile motion","Gravity's effect on projectile path","Calculating range and maximum height","Optimal launch angle for maximum range (45 degrees)"]},
            "circular-motion.html": {"title":"Circular Motion","learn":["Uniform circular motion and centripetal acceleration","Relationship between velocity, radius, and period","Why direction changes even at constant speed","Centripetal force and its sources","Angular velocity and its relationship to linear velocity","Real-world examples: planets, satellites, and rotating objects"]},
            "cross-product.html": {"title":"Cross Product of Vectors","learn":["Definition and formula for cross product","Right-hand rule for determining direction","Magnitude equals area of parallelogram","Cross product is perpendicular to both input vectors","Applications in torque and angular momentum","When cross product equals zero (parallel vectors)"]},
            "dot-product.html": {"title":"Dot Product of Vectors","learn":["Definition and formula for dot product","Geometric interpretation: projection of one vector onto another","Dot product equals zero for perpendicular vectors","Using dot product to find angle between vectors","Applications in work and energy calculations","Component-wise calculation method"]},
            "electrostatics.html": {"title":"Electrostatics - Coulomb's Law","learn":["Coulomb's Law: force between charged particles","How distance affects electric force (inverse square law)","Like charges repel, opposite charges attract","Electric field concept and visualization","Superposition principle for multiple charges","Comparing electric force to gravitational force"]},
            "equilibrium.html": {"title":"Forces in Equilibrium","learn":["Conditions for static equilibrium","Net force must equal zero","Resolving forces into components","Free body diagrams and force analysis","Tension in strings and cables","Real-world applications: bridges, cranes, and structures"]},
            "gravitation.html": {"title":"Universal Gravitation","learn":["Newton's Law of Universal Gravitation","How gravitational force depends on mass and distance","Inverse square law for gravity","Gravitational field strength and acceleration due to gravity","Why astronauts float in orbit (free fall)","Relationship between weight and mass"]},
            "kinematics-accelerated.html": {"title":"Accelerated Motion","learn":["Understanding acceleration and its effects","Velocity-time and position-time relationships","How constant acceleration changes motion","Graphical interpretation of accelerated motion","Real-world examples: cars, elevators, and falling objects","Distinguishing speed from velocity in accelerated motion"]},
            "kinematics-uniform.html": {"title":"Uniform Motion","learn":["Constant velocity and uniform motion","Distance, displacement, speed, and velocity","Position-time graphs and their interpretation","Calculating average speed and velocity","Relative motion between objects","Real-world examples: cars on highway, trains, and planes"]},
            "kinematics-variable.html": {"title":"Variable Acceleration","learn":["Motion with changing acceleration","Introduction to calculus in kinematics","Position, velocity, and acceleration functions","Finding velocity from acceleration function","Finding position from velocity function","Real-world examples: rockets and roller coasters"]},
            "projectile-game.html": {"title":"Projectile Game","learn":["Interactive projectile motion simulation","How angle and velocity affect projectile path","Predicting where the projectile will land","Effect of gravity on projectile trajectory","Trial and error to hit a target","Understanding the parabolic path of projectiles"]},
            "projectile-motion-2d.html": {"title":"2D Projectile Motion","learn":["Breaking projectile motion into horizontal and vertical components","Horizontal motion: constant velocity","Vertical motion: constant acceleration due to gravity","Independence of horizontal and vertical motions","Calculating range, height, and time of flight","Parabolic trajectory and its mathematical description"]},
            "projectile-motion.html": {"title":"Projectile Motion","learn":["Understanding projectile motion and trajectory","How launch angle affects distance and height","The role of initial velocity in projectile motion","Gravity's effect on projectile path","Calculating range and maximum height","Optimal launch angle for maximum range (45 degrees)"]},
            "projectile-target.html": {"title":"Projectile Target Practice","learn":["Aiming a projectile to hit a specific target","How angle and velocity determine landing position","Adjusting parameters to improve accuracy","Understanding the relationship between angle and range","Effect of initial height on projectile motion","Problem-solving through simulation and experimentation"]},
            "projectile-two.html": {"title":"Two Projectile Comparison","learn":["Comparing two projectiles launched simultaneously","How different angles affect trajectories","Which projectile lands first and why","Effect of different initial velocities","Comparing range and maximum height","Understanding symmetry in projectile motion"]},
            "projectile-wall.html": {"title":"Projectile Over Wall","learn":["Calculating if projectile clears an obstacle","Minimum velocity needed to clear a wall","Effect of launch angle on clearing obstacles","Finding the trajectory that just grazes the top","Real-world applications: artillery and sports","Understanding clearance and safety margins"]},
            "relative-velocity-2d.html": {"title":"Relative Velocity in 2D","learn":["Understanding relative velocity in two dimensions","How to calculate velocity of one object from another's frame","Vector subtraction for relative velocity","River crossing problems and boat navigation","Wind and airplane velocity problems","Visualizing relative motion with vector diagrams"]},
            "relative-velocity-same-dimension.html": {"title":"Relative Velocity - Same Dimension","learn":["Relative velocity in one dimension","Objects moving in same direction","Objects moving in opposite directions","Calculating closing speed and separation speed","Real-world examples: cars on highway, trains","Understanding reference frames"]},
            "scalar-multiplication.html": {"title":"Scalar Multiplication of Vectors","learn":["What is scalar multiplication of vectors","How multiplying by a positive scalar changes magnitude","Effect of negative scalars on direction","Scaling vectors for real-world applications","Relationship between scalar multiplication and vector addition","Visualizing scaled vectors"]},
            "simple-harmonic-motion.html": {"title":"Simple Harmonic Motion","learn":["Understanding oscillatory motion","Spring-mass system and Hooke's Law","Period, frequency, and amplitude","Restoring force and equilibrium position","Energy transformation in SHM","Real-world examples: pendulums, guitar strings, and springs"]},
            "vector-addition-3d.html": {"title":"Vector Addition in 3D","learn":["Adding vectors in three dimensions","Component-wise addition in 3D space","Finding resultant vector magnitude and direction","Visualizing 3D vector addition","Applications in navigation and physics","Extending 2D concepts to 3D"]},
            "vector-addition-parallelogram.html": {"title":"Vector Addition - Parallelogram Method","learn":["Parallelogram rule for vector addition","Geometric interpretation of adding vectors","Finding resultant vector using parallelogram","Why the diagonal represents the sum","Applications in force analysis","Relationship to triangle method"]},
            "vector-addition-triangle.html": {"title":"Vector Addition - Triangle Method","learn":["Triangle rule for vector addition","Head-to-tail method of adding vectors","Finding resultant vector using triangle","Order doesn't matter (commutative property)","Visualizing vector sums geometrically","Applications in navigation and physics"]},
            "vector-resolution-2d.html": {"title":"Vector Resolution in 2D","learn":["Breaking a vector into x and y components","Using trigonometry to find components","Reconstructing vector from components","Why resolution is useful in physics","Applications in force analysis and projectile motion","Relationship between magnitude, angle, and components"]},
            "vector-resolution-3d.html": {"title":"Vector Resolution in 3D","learn":["Breaking a vector into x, y, and z components","Direction cosines in 3D space","Unit vector notation for components","Reconstructing vector from 3D components","Applications in engineering and physics","Extending 2D resolution to 3D"]},
            "vector-subtraction.html": {"title":"Vector Subtraction","learn":["Subtracting vectors: adding the negative","Geometric interpretation of vector subtraction","Finding difference between two vectors","Relationship to relative velocity","Component-wise subtraction method","Applications in physics and engineering"]},
            "vertical-motion.html": {"title":"Vertical Motion","learn":["Objects moving straight up and down","Effect of gravity on vertical motion","Time to reach maximum height","Velocity at the top of the trajectory","Time of flight for upward and downward motion","Real-world examples: throwing a ball, elevator motion"]},
            "platform-coin-sim.html": {"title":"Platform & Coin Simulator","learn":["Relative motion in accelerating frames","How platform acceleration affects coin motion","Initial velocity effect on coin trajectory","Coin thrown up, down, or released","Relative acceleration = g + a","Coin position = ut + ½(g+a)t²","Upward platform accel makes coin hit faster","Downward platform accel makes coin hit slower","Positive initial velocity throws coin up","Negative initial velocity throws coin down","Zero acceleration = normal gravity case","Real-world: elevator, rocket, free fall"]},
            "river-man-problem.html": {"title":"River Man Problem","learn":["Relative velocity in two dimensions","Man crossing a flowing river","River velocity affects downstream drift","Man's velocity components: vₓ = vₘ cos θ, vᵧ = vₘ sin θ","Resultant velocity: v⃗ = √(vₓ² + vᵧ²)","Time to cross: t = d / vᵧ (depends only on perpendicular component)","Drift distance: D = (vᵣ + vₘ cos θ) × t","Shortest time path: θ = 90° (straight across)","Shortest path: aim upstream to cancel drift","Angle for shortest path: cos θ = -vᵣ/vₘ","Real-world: swimming across river, boat crossing stream"]}
        },
        chemistry: {
            "acid-base.html": {"title":"Acid-Base Chemistry","learn":["Understanding pH and its scale","Strong acids vs weak acids","Strong bases vs weak bases","How concentration affects pH","Neutralization reactions","Acid-base indicators and color changes","Titration curves and equivalence point"]},
            "atomic-structure.html": {"title":"Atomic Structure","learn":["Bohr's model postulates and quantization of angular momentum","Protons, neutrons, and electrons in an atom","Nucleus and electron shells (Bohr model)","Electron configuration across shells","K, L, M, N shell capacities (2, 8, 18, 32)","Atomic number vs mass number","Ions: cations and anions","How electron configuration determines chemical properties","Angular momentum quantization: $mvr = \\frac{nh}{2\\pi}$ where n = 1, 2, 3, ...","Frequency of photon: $\\nu = \\frac{\\Delta E}{h} = \\frac{13.6 \\text{ eV}}{h}\\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)$, n₂ > n₁ for emission, n₂ < n₁ for absorption","Wavelength (Rydberg): $\\frac{1}{\\lambda} = R\\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)$ where R = 1.097 × 10⁷ m⁻¹","Radius of nth orbit: $r_n = \\frac{n^2h^2}{4\\pi^2mke^2} = n^2 \\times 0.529 \\text{ \\AA} = n^2a_0$","Velocity in nth orbit: $v_n = \\frac{2\\pi ke^2}{nh} = \\frac{2.18 \\times 10^6}{n} \\text{ m/s}$","Time period: $T_n = \\frac{2\\pi r_n}{v_n} = \\frac{n^3h^3}{4\\pi^2mk^2e^4}$","Kinetic energy: $KE = \\frac{ke^2}{2r_n} = \\frac{13.6}{n^2} \\text{ eV}$","Potential energy: $PE = -\\frac{ke^2}{r_n} = -\\frac{27.2}{n^2} \\text{ eV}$","Total energy: $E = -\\frac{ke^2}{2r_n} = -\\frac{13.6}{n^2} \\text{ eV}$","Key relations: $KE = -\\frac{1}{2}PE$, $|E| = KE$, $PE = 2E$"]},
            "anode-rays.html": {"title":"Anode Rays & Properties","learn":["Discovery of anode rays (canal rays) by Goldstein","Positive charge of anode rays","Variable e/m ratio depending on gas","Difference between cathode and anode rays","Passage through perforated cathode","Proton as the lightest positive ion","How different gases produce different ions"]},
            "blackbody-radiation.html": {"title":"Blackbody Radiation","learn":["What is a blackbody radiator","Intensity vs wavelength curves at different temperatures","Wien's displacement law: λmax × T = 2.898 × 10⁻³ m·K","Stefan-Boltzmann law: I = σT⁴","How peak wavelength shifts with temperature","Color of hot objects: red → yellow → white → blue","UV, visible, and IR regions of blackbody spectrum","Classical wave theory predicts infinite energy at short wavelengths","Planck's quantum hypothesis: E = nhν (energy quantized)","Planck's law: I(λ,T) = 2hc²/λ⁵ × 1/(e^(hc/λkT) - 1)","Blackbody radiation proves light has particle nature","Energy comes in discrete packets (quanta), not continuous waves","Foundation for quantum mechanics and photon concept"]},
            "electromagnetic-radiation.html": {"title":"Electromagnetic Radiation","learn":["Nature of electromagnetic waves","Electric and magnetic fields oscillate perpendicular to each other","EM waves need no medium - travel in vacuum","Speed of light: c = 3 × 10⁸ m/s","Wave equation: c = λν","Electromagnetic spectrum: radio → microwave → IR → visible → UV → X-ray → gamma","Energy of photon: E = hν = hc/λ","Maxwell's prediction and Hertz's confirmation"]},
            "photoelectric-effect.html": {"title":"Photoelectric Effect","learn":["Emission of electrons when light hits metal surface","Threshold frequency: ν₀ below which no emission occurs","Kinetic energy of photoelectrons: KE = hν - φ = h(ν - ν₀)","Work function: φ = hν₀","Stopping potential: eV₀ = hν - φ","Photocurrent proportional to intensity","Instantaneous emission - no time lag","Wave theory failure: intensity doesn't affect KE","Einstein's photon explanation: light as quanta"]},
            "planck-quantum-dual-nature.html": {"title":"Planck Quantum and Dual Nature","learn":["Planck's quantum hypothesis: E = nhν","Energy is quantized in multiples of hν","Planck's constant: h = 6.626 × 10⁻³⁴ J·s","Photoelectric effect evidence for particle nature","Diffraction/interference evidence for wave nature","De Broglie wavelength: λ = h/p = h/mv","Compton effect: Δλ = (h/mₑc)(1 - cos θ)","Wave-particle duality: matter and light have both properties","Einstein's photoelectric equation: hν = φ + ½mv²","De Broglie relation: λ = h/mv = h/√(2mKE)"]},
            "spectrum.html": {"title":"Spectrum","learn":["Emission and absorption spectra","Continuous vs line spectra","Hydrogen spectral series","Lyman series (UV): 1/n₁², n₁ = 1","Balmer series (visible): 1/n₁², n₁ = 2","Paschen series (IR): n₁ = 3","Brackett series (IR): n₁ = 4","Pfund series (IR): n₁ = 5","Rydberg formula: 1/λ = R(1/n₁² - 1/n₂²)","Spectral lines correspond to electron transitions"]},
            "rydberg-equation.html": {"title":"Rydberg Equation","learn":["Rydberg formula for hydrogen spectrum","1/λ = R(1/n₁² - 1/n₂²)","Rydberg constant: R = 1.097 × 10⁷ m⁻¹","n₁ < n₂ for emission, n₁ > n₂ for absorption","Lyman series: n₁ = 1, n₂ = 2,3,4,...","Balmer series: n₁ = 2, n₂ = 3,4,5,...","Paschen series: n₁ = 3, n₂ = 4,5,6,...","Limit of series: when n₂ → ∞, 1/λ = R/n₁²","Energy of photon: E = hc/λ = 13.6(1/n₁² - 1/n₂²) eV","Connection to Bohr model energy levels"]},
            "zeeman-stark-effect.html": {"title":"Zeeman and Stark Effect","learn":["Zeeman effect: splitting of spectral lines in magnetic field","Normal Zeeman effect: triplet splitting","Anomalous Zeeman effect: more complex splitting","Energy shift: ΔE = μB·B = mℓ·(eℏ/2m)·B","Magnetic quantum number: mℓ = -ℓ, -(ℓ-1), ..., ℓ","Stark effect: splitting in electric field","Electric field causes energy level splitting","Both effects prove quantization of angular momentum","Applications in astronomy and plasma physics"]},
            "heisenberg-uncertainty.html": {"title":"Heisenberg Uncertainty Principle","learn":["Position-momentum uncertainty: Δx·Δp ≥ ℏ/2","Energy-time uncertainty: ΔE·Δt ≥ ℏ/2","Reduced Planck constant: ℏ = h/2π = 1.055 × 10⁻³⁴ J·s","Cannot simultaneously know exact position and momentum","Not a measurement limitation - fundamental property","Wave packet interpretation: narrow wave packet = precise position but uncertain wavelength","Application: why electrons don't collapse into nucleus","Application: virtual particles and quantum fluctuations","Δx·Δ(mv) ≥ ℏ/2, so Δx·Δv ≥ ℏ/2m"]},
            "davisson-germer.html": {"title":"Davisson Germer Experiment","learn":["Experimental confirmation of de Broglie hypothesis","Electron diffraction by nickel crystal","Bragg's Law: nλ = 2d sin θ","De Broglie wavelength: λ = h/mv = h/√(2meV)","Combined: λ = 1.227/√V nm (V in volts)","Accelerating voltage determines electron wavelength","Diffraction peaks at specific angles","Proves wave nature of matter","Critical angle depends on crystal spacing d","Nobel Prize 1937: Davisson and Thomson"]},
            "cathode-rays.html": {"title":"Cathode Rays & Properties","learn":["Discovery of cathode rays in discharge tubes","Travel in straight lines (shadow formation)","Negative charge - deflection by electric field","Deflection by magnetic field","Kinetic energy and ability to rotate paddle wheel","Fluorescence on hitting glass or zinc sulfide","Ionization of gas molecules"]},
            "millikan-oil-drop.html": {"title":"Millikan Oil Drop Experiment","learn":["Principle of balancing gravitational and electric forces","Formula: qE = mg for balanced oil drop","Measurement of elementary charge e = 1.6 × 10⁻¹⁹ C","Quantization of charge: q = ne","How oil drop mass is determined","Effect of Brownian motion on measurements","Significance in discovering the electron charge"]},
            "rutherford-scattering.html": {"title":"Rutherford Scattering Experiment","learn":["Alpha particle scattering by thin gold foil","Most particles pass straight through - atom is mostly empty","Some deflected at small angles - positive charge in center","Very few bounce back - small dense nucleus","Impact parameter and scattering angle relationship","Nuclear model of the atom","Limitations of Rutherford's model"]},
            "wave-motion.html": {"title":"Wave Motion Characteristics","learn":["Wavelength (λ) - distance between consecutive crests","Frequency (f) - number of cycles per second","Amplitude (A) - maximum displacement from equilibrium","Wave velocity (v) - v = f × λ","Time period (T) - T = 1/f","Wave number (k) - k = 2π/λ","Transverse vs longitudinal waves","Compression and rarefaction in longitudinal waves","Damping effect on wave amplitude"]},
            "spinning-electron.html": {"title":"Spinning of Electron","learn":["Electron spin is an intrinsic quantum property","Spin quantum number: +1/2 (spin up) or -1/2 (spin down)","Electron behaves as if spinning on its axis","Spin creates magnetic moment","Pauli Exclusion Principle: two electrons in same orbital must have opposite spins","Spin is not actual rotation - it's purely quantum mechanical","Spin is fundamental to magnetism and chemistry"]},
            "radial-wave-function.html": {"title":"Radial Wave Function","learn":["Radial wave function R(r) describes electron probability vs distance from nucleus","Depends on principal quantum number n and azimuthal quantum number l","Radial nodes = n - l - 1","R²(r) gives radial probability density","For n=1, l=0: maximum probability at Bohr radius","As n increases, more radial nodes appear","Radial distribution function: 4πr²R²(r)","Nodes represent regions of zero electron probability"]},
            "orbital-shapes.html": {"title":"Orbital Shapes","learn":["s orbital: spherical shape, non-directional","p orbitals (px, py, pz): dumbbell shape, directional","d orbitals: cloverleaf shape (4 of them) or dumbbell with ring (dz²)","Orbital shape determined by angular wave function","Number of angular nodes = l","More lobes = higher angular momentum","Orbitals represent regions of highest electron probability","Colors represent phase: positive (+) and negative (-)"]},
            "chemical-equilibrium.html": {"title":"Chemical Equilibrium","learn":["What is chemical equilibrium","Forward and reverse reaction rates","Dynamic equilibrium concept","Le Chatelier's Principle","How concentration changes affect equilibrium","Effect of temperature on equilibrium","Calculating equilibrium constant (K)"]},
            "gas-laws.html": {"title":"Gas Laws","learn":["Boyle's Law: pressure-volume relationship","Charles's Law: volume-temperature relationship","Gay-Lussac's Law: pressure-temperature relationship","Ideal Gas Law: PV = nRT","How gas particles behave under different conditions","Real-world applications: tires, balloons, and engines"]},
            "hybridization.html": {"title":"Orbital Hybridization","learn":["What is orbital hybridization","sp, sp2, and sp3 hybridization","How hybridization affects molecular geometry","Relationship between hybridization and bond angles","Sigma and pi bonds in hybridized orbitals","Real-world examples: methane, ethene, and ethyne"]},
            "ions.html": {"title":"Ions and Ionic Bonding","learn":["What are cations and anions","How atoms gain or lose electrons","Ionic bonding and crystal structures","Naming ionic compounds","Properties of ionic compounds","Electrovalency and charge balance"]},
            "organic-reactions.html": {"title":"Organic Reactions","learn":["Types of organic reactions","Substitution reactions","Addition reactions","Elimination reactions","Functional groups and their reactivity","Mechanism of organic reactions"]},
            "periodic-trends.html": {"title":"Periodic Trends","learn":["Atomic radius trends across periods and groups","Ionization energy and its trends","Electronegativity and its significance","Metallic and non-metallic character","Why trends exist: nuclear charge and shielding","Predicting properties from periodic table position"]}
        },
        maths: {
            "calculus-derivatives.html": {"title":"Calculus - Derivatives","learn":["What is a derivative: rate of change","Power rule for differentiation","Derivative as slope of tangent line","Product rule and quotient rule","Chain rule for composite functions","Real-world applications: velocity, acceleration, and optimization"]},
            "calculus-integrals.html": {"title":"Calculus - Integrals","learn":["What is an integral: area under curve","Definite vs indefinite integrals","Power rule for integration","Relationship between derivatives and integrals","Fundamental Theorem of Calculus","Applications: area, volume, and accumulation"]},
            "matrices.html": {"title":"Matrices","learn":["What are matrices and their notation","Matrix addition and subtraction","Matrix multiplication","Determinant and its calculation","Inverse of a matrix","Applications in solving systems of equations"]},
            "probability.html": {"title":"Probability","learn":["Basic probability concepts","Sample space and events","Calculating probability of events","Independent and dependent events","Conditional probability","Real-world applications: games, statistics, and predictions"]},
            "quadratic-function.html": {"title":"Quadratic Functions","learn":["Standard form of quadratic equations","Graphing parabolas","Vertex and axis of symmetry","Finding roots using factoring and quadratic formula","Maximum and minimum values","Real-world applications: projectile motion and optimization"]},
            "trigonometry.html": {"title":"Trigonometry","learn":["Sine, cosine, and tangent ratios","Unit circle and angles","Trigonometric identities","Graphing trigonometric functions","Solving trigonometric equations","Real-world applications: waves, navigation, and architecture"]}
        },
    };
    
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
    infoBtn.textContent = "\ud83d\udcd6";
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
