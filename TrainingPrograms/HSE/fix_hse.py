import os

def overwrite_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

hse_s2 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Legal Framework | HSE Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>HSE Training</h2>
        </div>
        <ul class="toc-nav">
            <li><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li class="active"><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li><a href="section3.html"><span class="toc-num">3</span> Workplace Hazards</a></li>
            <li><a href="section4.html"><span class="toc-num">4</span> Fire Safety & PPE</a></li>
            <li><a href="section5.html"><span class="toc-num">5</span> Emergency Procedures</a></li>
            <li><a href="section6.html"><span class="toc-num">6</span> Environmental Responsibility</a></li>
            <li><a href="section7.html"><span class="toc-num">7</span> Consequences</a></li>
            <li><a href="section8.html"><span class="toc-num">8</span> Best Practices</a></li>
            <li><a href="quiz.html"><span class="toc-num">📄</span> Assessment Quiz</a></li>
        </ul>
        <div class="sidebar-progress">
            <div class="progress-label">Progress: <span id="progressPercent">0%</span></div>
            <div class="progress-bar-mini">
                <div class="progress-fill-mini" id="progressFill"></div>
            </div>
        </div>
    </nav>
    <main class="main-content">
        <div class="content-header">
            <div class="breadcrumb">Module 2 of 8</div>
            <h1>Legal Framework</h1>
            <p class="subtitle">Laws and regulations governing Health, Safety, and Environment in India</p>
        </div>
        <div class="content-body">
            <h2>Primary Legislation</h2>
            <p>HSE compliance is mandatory under various Indian laws. Failure to comply can lead to severe legal and financial penalties.</p>
            <div class="info-card primary">
                <div class="info-icon">⚖️</div>
                <div>
                    <h3>The Factories Act, 1948</h3>
                    <p>The main legislation governing health, safety, and welfare of workers in factories. It covers hours of work, safety measures, and facility standards.</p>
                </div>
            </div>
            <h3>Other Key Regulations</h3>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">🌱</div>
                    <h4>Environmental Protection Act, 1986</h4>
                    <p>Framework for protecting and improving the environment and preventing pollution.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">⚡</div>
                    <h4>Indian Electricity Rules</h4>
                    <p>Safety requirements for electrical installations and operations.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">☣️</div>
                    <h4>Hazardous Waste Rules</h4>
                    <p>Regulations for the management, handling, and transboundary movement of hazardous waste.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🏗️</div>
                    <h4>BOCW Act</h4>
                    <p>Building and Other Construction Workers Act for safety in construction sites.</p>
                </div>
            </div>
            <h2>International Standards</h2>
            <p>Ishan Technologies strives to meet international benchmarks for safety and environmental management.</p>
            <div class="highlight-box">
                <ul>
                    <li><strong>ISO 45001:</strong> Occupational Health and Safety Management Systems</li>
                    <li><strong>ISO 14001:</strong> Environmental Management Systems</li>
                </ul>
            </div>
            <div class="info-card warning">
                <div class="info-icon">⚠️</div>
                <div>
                    <h3>Compliance is Mandatory</h3>
                    <p>Every employee is responsible for following the safety guidelines mandated by these laws. Ignorance of the law is not an excuse for non-compliance.</p>
                </div>
            </div>
        </div>
        <div class="navigation-footer">
            <a href="index.html" class="nav-btn prev-btn">← Previous: Introduction</a>
            <a href="section3.html" class="nav-btn next-btn">Next: Workplace Hazards →</a>
        </div>
    </main>
    <script>
        const trainingId = 'hse';
        const totalSections = 8;
        let completedSections = JSON.parse(localStorage.getItem(trainingId + '_completed') || '[]');
        if (!completedSections.includes(2)) {
            completedSections.push(2);
            localStorage.setItem(trainingId + '_completed', JSON.stringify(completedSections));
        }
        const progress = Math.round((completedSections.length / totalSections) * 100);
        document.getElementById('progressPercent').textContent = progress + '%';
        document.getElementById('progressFill').style.width = progress + '%';
        document.querySelectorAll('.toc-nav li a').forEach(link => {
            const span = link.querySelector('.toc-num');
            if (span) {
                const num = parseInt(span.innerText);
                if (!isNaN(num) && completedSections.includes(num)) {
                    link.parentElement.classList.add('completed');
                }
            }
        });
    </script>
</body>
</html>"""

hse_s3 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workplace Hazards | HSE Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>HSE Training</h2>
        </div>
        <ul class="toc-nav">
            <li><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li class="active"><a href="section3.html"><span class="toc-num">3</span> Workplace Hazards</a></li>
            <li><a href="section4.html"><span class="toc-num">4</span> Fire Safety & PPE</a></li>
            <li><a href="section5.html"><span class="toc-num">5</span> Emergency Procedures</a></li>
            <li><a href="section6.html"><span class="toc-num">6</span> Environmental Responsibility</a></li>
            <li><a href="section7.html"><span class="toc-num">7</span> Consequences</a></li>
            <li><a href="section8.html"><span class="toc-num">8</span> Best Practices</a></li>
            <li><a href="quiz.html"><span class="toc-num">📄</span> Assessment Quiz</a></li>
        </ul>
        <div class="sidebar-progress">
            <div class="progress-label">Progress: <span id="progressPercent">0%</span></div>
            <div class="progress-bar-mini">
                <div class="progress-fill-mini" id="progressFill"></div>
            </div>
        </div>
    </nav>
    <main class="main-content">
        <div class="content-header">
            <div class="breadcrumb">Module 3 of 8</div>
            <h1>Workplace Hazards</h1>
            <p class="subtitle">Identifying and mitigating risks in the professional environment</p>
        </div>
        <div class="content-body">
            <h2>Types of Hazards</h2>
            <p>A hazard is anything with the potential to cause harm. We classify workplace hazards into four main categories.</p>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">⚡</div>
                    <h4>Physical Hazards</h4>
                    <p>Slippery floors, unprotected machinery, loud noise, and electrical risks.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🧪</div>
                    <h4>Chemical Hazards</h4>
                    <p>Exposure to cleaning agents, solvents, gases, or vapors.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🪑</div>
                    <h4>Ergonomic Hazards</h4>
                    <p>Poor workstation setup, repetitive movements, and improper lifting.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🧠</div>
                    <h4>Psychosocial Hazards</h4>
                    <p>Workplace stress, harassment, and burnout.</p>
                </div>
            </div>
            <h2>Risk Assessment</h2>
            <p>Risk is the likelihood that a hazard will actually cause harm. We use the <strong>Hierarchy of Controls</strong> to manage risk:</p>
            <ol>
                <li><strong>Elimination:</strong> Physically remove the hazard.</li>
                <li><strong>Substitution:</strong> Replace the hazard.</li>
                <li><strong>Engineering Controls:</strong> Isolate people from the hazard (e.g., machine guards).</li>
                <li><strong>Administrative Controls:</strong> Change the way people work (e.g., signs, training).</li>
                <li><strong>PPE:</strong> Protect the worker with Personal Protective Equipment.</li>
            </ol>
            <div class="highlight-box">
                <h3>🔍 Spot the Hazard</h3>
                <p>If you see a trailing wire, a spill, or an unstable stack of boxes, <strong>report it or fix it immediately</strong>. Don't assume someone else will do it.</p>
            </div>
            <div class="info-card success">
                <div class="info-icon">💡</div>
                <div>
                    <h3>Ergonomics Tip</h3>
                    <p>Ensure your screen is at eye level, your feet are flat on the floor, and you take a "micro-break" every 20 minutes to stretch.</p>
                </div>
            </div>
        </div>
        <div class="navigation-footer">
            <a href="section2.html" class="nav-btn prev-btn">← Previous: Legal Framework</a>
            <a href="section4.html" class="nav-btn next-btn">Next: Fire Safety & PPE →</a>
        </div>
    </main>
    <script>
        const trainingId = 'hse';
        const totalSections = 8;
        let completedSections = JSON.parse(localStorage.getItem(trainingId + '_completed') || '[]');
        if (!completedSections.includes(3)) {
            completedSections.push(3);
            localStorage.setItem(trainingId + '_completed', JSON.stringify(completedSections));
        }
        const progress = Math.round((completedSections.length / totalSections) * 100);
        document.getElementById('progressPercent').textContent = progress + '%';
        document.getElementById('progressFill').style.width = progress + '%';
        document.querySelectorAll('.toc-nav li a').forEach(link => {
            const span = link.querySelector('.toc-num');
            if (span) {
                const num = parseInt(span.innerText);
                if (!isNaN(num) && completedSections.includes(num)) {
                    link.parentElement.classList.add('completed');
                }
            }
        });
    </script>
</body>
</html>"""

hse_s4 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fire Safety & PPE | HSE Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>HSE Training</h2>
        </div>
        <ul class="toc-nav">
            <li><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li><a href="section3.html"><span class="toc-num">3</span> Workplace Hazards</a></li>
            <li class="active"><a href="section4.html"><span class="toc-num">4</span> Fire Safety & PPE</a></li>
            <li><a href="section5.html"><span class="toc-num">5</span> Emergency Procedures</a></li>
            <li><a href="section6.html"><span class="toc-num">6</span> Environmental Responsibility</a></li>
            <li><a href="section7.html"><span class="toc-num">7</span> Consequences</a></li>
            <li><a href="section8.html"><span class="toc-num">8</span> Best Practices</a></li>
            <li><a href="quiz.html"><span class="toc-num">📄</span> Assessment Quiz</a></li>
        </ul>
        <div class="sidebar-progress">
            <div class="progress-label">Progress: <span id="progressPercent">0%</span></div>
            <div class="progress-bar-mini">
                <div class="progress-fill-mini" id="progressFill"></div>
            </div>
        </div>
    </nav>
    <main class="main-content">
        <div class="content-header">
            <div class="breadcrumb">Module 4 of 8</div>
            <h1>Fire Safety & PPE</h1>
            <p class="subtitle">Fire prevention and proper use of Personal Protective Equipment</p>
        </div>
        <div class="content-body">
            <h2>The Fire Triangle</h2>
            <p>Fire needs three elements to exist: <strong>Heat, Fuel, and Oxygen</strong>. Removing any one of these will extinguish the fire.</p>
            <div class="info-card warning">
                <div class="info-icon">🔥</div>
                <div>
                    <h3>Fire Extinguisher Types</h3>
                    <ul>
                        <li><strong>Type A (Water):</strong> For wood, paper, and cloth.</li>
                        <li><strong>Type B (CO2/Dry Powder):</strong> For flammable liquids like oil or petrol.</li>
                        <li><strong>Type C (CO2/Dry Powder):</strong> For electrical fires.</li>
                    </ul>
                    <p style="margin-top:10px;"><strong>Never use water on an electrical fire!</strong></p>
                </div>
            </div>
            <h2>Using a Fire Extinguisher: The PASS Method</h2>
            <ol>
                <li><strong>P</strong>ull the pin.</li>
                <li><strong>A</strong>im at the base of the fire.</li>
                <li><strong>S</strong>queeze the handle.</li>
                <li><strong>S</strong>weep from side to side.</li>
            </ol>
            <h2>Personal Protective Equipment (PPE)</h2>
            <p>PPE is your last line of defense. It must be worn correctly and maintained in good condition.</p>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">🦺</div>
                    <h4>Visibility</h4>
                    <p>High-visibility vests for field and warehouse operations.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">⛑️</div>
                    <h4>Head Protection</h4>
                    <p>Safety helmets where there's a risk of falling objects.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🥽</div>
                    <h4>Eye Protection</h4>
                    <p>Safety goggles when handling chemicals or during drilling/cutting.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🧤</div>
                    <h4>Hand Protection</h4>
                    <p>Gloves suited for the task (chemical resistant, heat resistant, etc.)</p>
                </div>
            </div>
            <div class="info-card info">
                <div class="info-icon">ℹ️</div>
                <div>
                    <h3>PPE Inspection</h3>
                    <p>Inspect your PPE before every use. If it is damaged, cracked, or worn out, request a replacement from your supervisor immediately.</p>
                </div>
            </div>
        </div>
        <div class="navigation-footer">
            <a href="section3.html" class="nav-btn prev-btn">← Previous: Workplace Hazards</a>
            <a href="section5.html" class="nav-btn next-btn">Next: Emergency Procedures →</a>
        </div>
    </main>
    <script>
        const trainingId = 'hse';
        const totalSections = 8;
        let completedSections = JSON.parse(localStorage.getItem(trainingId + '_completed') || '[]');
        if (!completedSections.includes(4)) {
            completedSections.push(4);
            localStorage.setItem(trainingId + '_completed', JSON.stringify(completedSections));
        }
        const progress = Math.round((completedSections.length / totalSections) * 100);
        document.getElementById('progressPercent').textContent = progress + '%';
        document.getElementById('progressFill').style.width = progress + '%';
        document.querySelectorAll('.toc-nav li a').forEach(link => {
            const span = link.querySelector('.toc-num');
            if (span) {
                const num = parseInt(span.innerText);
                if (!isNaN(num) && completedSections.includes(num)) {
                    link.parentElement.classList.add('completed');
                }
            }
        });
    </script>
</body>
</html>"""

hse_s5 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emergency Procedures | HSE Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>HSE Training</h2>
        </div>
        <ul class="toc-nav">
            <li><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li><a href="section3.html"><span class="toc-num">3</span> Workplace Hazards</a></li>
            <li><a href="section4.html"><span class="toc-num">4</span> Fire Safety & PPE</a></li>
            <li class="active"><a href="section5.html"><span class="toc-num">5</span> Emergency Procedures</a></li>
            <li><a href="section6.html"><span class="toc-num">6</span> Environmental Responsibility</a></li>
            <li><a href="section7.html"><span class="toc-num">7</span> Consequences</a></li>
            <li><a href="section8.html"><span class="toc-num">8</span> Best Practices</a></li>
            <li><a href="quiz.html"><span class="toc-num">📄</span> Assessment Quiz</a></li>
        </ul>
        <div class="sidebar-progress">
            <div class="progress-label">Progress: <span id="progressPercent">0%</span></div>
            <div class="progress-bar-mini">
                <div class="progress-fill-mini" id="progressFill"></div>
            </div>
        </div>
    </nav>
    <main class="main-content">
        <div class="content-header">
            <div class="breadcrumb">Module 5 of 8</div>
            <h1>Emergency Procedures</h1>
            <p class="subtitle">Quick and effective response during critical events</p>
        </div>
        <div class="content-body">
            <h2>Fire Evacuation</h2>
            <p>When the fire alarm sounds, remain calm and follow these steps immediately:</p>
            <div class="highlight-box">
                <ol>
                    <li><strong>Leave immediately:</strong> Do not stop to collect personal belongings.</li>
                    <li><strong>No Elevators:</strong> Always use the stairs.</li>
                    <li><strong>Assembly Point:</strong> Proceed directly to the designated assembly point for your building.</li>
                    <li><strong>Roll Call:</strong> Report to your fire warden so you can be accounted for.</li>
                    <li><strong>Stay Clear:</strong> Do not re-enter the building until the "All Clear" signal is given.</li>
                </ol>
            </div>
            <h2>Medical Emergencies</h2>
            <div class="info-card primary">
                <div class="info-icon">🚑</div>
                <div>
                    <h3>First Aid Assistance</h3>
                    <p>Alert the nearest First Aider. Note the location of the First Aid boxes and the list of trained responders displayed in your area.</p>
                </div>
            </div>
            <h2>Reporting Incidents & Near-Misses</h2>
            <p>An incident is an event that causes harm. A <strong>Near-Miss</strong> is an event that *could* have caused harm but didn't.</p>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">📝</div>
                    <h4>Report All Events</h4>
                    <p>Reporting near-misses helps prevent real accidents in the future.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">📞</div>
                    <h4>Emergency Hotline</h4>
                    <p>Dial [Internal Number] for immediate security or medical dispatch.</p>
                </div>
            </div>
            <div class="info-card danger">
                <div class="info-icon">🖐️</div>
                <div>
                    <h3>Stop Work Authority</h3>
                    <p>Every employee at Ishan Technologies has the <strong>authority and obligation</strong> to stop any work that they believe is unsafe or puts the environment at risk.</p>
                </div>
            </div>
        </div>
        <div class="navigation-footer">
            <a href="section4.html" class="nav-btn prev-btn">← Previous: Fire Safety & PPE</a>
            <a href="section6.html" class="nav-btn next-btn">Next: Environmental Responsibility →</a>
        </div>
    </main>
    <script>
        const trainingId = 'hse';
        const totalSections = 8;
        let completedSections = JSON.parse(localStorage.getItem(trainingId + '_completed') || '[]');
        if (!completedSections.includes(5)) {
            completedSections.push(5);
            localStorage.setItem(trainingId + '_completed', JSON.stringify(completedSections));
        }
        const progress = Math.round((completedSections.length / totalSections) * 100);
        document.getElementById('progressPercent').textContent = progress + '%';
        document.getElementById('progressFill').style.width = progress + '%';
        document.querySelectorAll('.toc-nav li a').forEach(link => {
            const span = link.querySelector('.toc-num');
            if (span) {
                const num = parseInt(span.innerText);
                if (!isNaN(num) && completedSections.includes(num)) {
                    link.parentElement.classList.add('completed');
                }
            }
        });
    </script>
</body>
</html>"""

hse_s6 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Environmental Responsibility | HSE Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>HSE Training</h2>
        </div>
        <ul class="toc-nav">
            <li><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li><a href="section3.html"><span class="toc-num">3</span> Workplace Hazards</a></li>
            <li><a href="section4.html"><span class="toc-num">4</span> Fire Safety & PPE</a></li>
            <li><a href="section5.html"><span class="toc-num">5</span> Emergency Procedures</a></li>
            <li class="active"><a href="section6.html"><span class="toc-num">6</span> Environmental Responsibility</a></li>
            <li><a href="section7.html"><span class="toc-num">7</span> Consequences</a></li>
            <li><a href="section8.html"><span class="toc-num">8</span> Best Practices</a></li>
            <li><a href="quiz.html"><span class="toc-num">📄</span> Assessment Quiz</a></li>
        </ul>
        <div class="sidebar-progress">
            <div class="progress-label">Progress: <span id="progressPercent">0%</span></div>
            <div class="progress-bar-mini">
                <div class="progress-fill-mini" id="progressFill"></div>
            </div>
        </div>
    </nav>
    <main class="main-content">
        <div class="content-header">
            <div class="breadcrumb">Module 6 of 8</div>
            <h1>Environmental Responsibility</h1>
            <p class="subtitle">Reducing our footprint and protecting our planet</p>
        </div>
        <div class="content-body">
            <h2>Waste Management: The 3 Rs</h2>
            <p>Our goal is to minimize waste through a systematic approach to resource management.</p>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">📉</div>
                    <h4>Reduce</h4>
                    <p>Avoid single-use plastics and print only when necessary.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🔄</div>
                    <h4>Reuse</h4>
                    <p>Repurpose materials where possible before discarding.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">♻️</div>
                    <h4>Recycle</h4>
                    <p>Sort waste correctly into the designated bins (E-waste, Dry, Wet).</p>
                </div>
            </div>
            <h2>Energy & Water Conservation</h2>
            <div class="highlight-box">
                <ul>
                    <li>Switch off lights and AC when leaving a room.</li>
                    <li>Unplug chargers and electronic equipment after work.</li>
                    <li>Report leaking taps or pipes immediately.</li>
                    <li>Use energy-efficient settings on company devices.</li>
                </ul>
            </div>
            <h2>E-Waste Management</h2>
            <div class="info-card warning">
                <div class="info-icon">💻</div>
                <div>
                    <h3>Electronic Waste</h3>
                    <p>Old batteries, keyboards, phones, and cables contain hazardous materials. <strong>Never throw e-waste in the regular trash.</strong> Use the designated e-waste collection points.</p>
                </div>
            </div>
            <div class="info-card success">
                <div class="info-icon">🌍</div>
                <div>
                    <h3>Ishan's Green Initiative</h3>
                    <p>We are committed to reducing our carbon footprint by 20% by [Year]. Small actions by every employee contribute to this company-wide goal.</p>
                </div>
            </div>
        </div>
        <div class="navigation-footer">
            <a href="section5.html" class="nav-btn prev-btn">← Previous: Emergency Procedures</a>
            <a href="section7.html" class="nav-btn next-btn">Next: Consequences →</a>
        </div>
    </main>
    <script>
        const trainingId = 'hse';
        const totalSections = 8;
        let completedSections = JSON.parse(localStorage.getItem(trainingId + '_completed') || '[]');
        if (!completedSections.includes(6)) {
            completedSections.push(6);
            localStorage.setItem(trainingId + '_completed', JSON.stringify(completedSections));
        }
        const progress = Math.round((completedSections.length / totalSections) * 100);
        document.getElementById('progressPercent').textContent = progress + '%';
        document.getElementById('progressFill').style.width = progress + '%';
        document.querySelectorAll('.toc-nav li a').forEach(link => {
            const span = link.querySelector('.toc-num');
            if (span) {
                const num = parseInt(span.innerText);
                if (!isNaN(num) && completedSections.includes(num)) {
                    link.parentElement.classList.add('completed');
                }
            }
        });
    </script>
</body>
</html>"""

hse_s7 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consequences | HSE Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>HSE Training</h2>
        </div>
        <ul class="toc-nav">
            <li><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li><a href="section3.html"><span class="toc-num">3</span> Workplace Hazards</a></li>
            <li><a href="section4.html"><span class="toc-num">4</span> Fire Safety & PPE</a></li>
            <li><a href="section5.html"><span class="toc-num">5</span> Emergency Procedures</a></li>
            <li><a href="section6.html"><span class="toc-num">6</span> Environmental Responsibility</a></li>
            <li class="active"><a href="section7.html"><span class="toc-num">7</span> Consequences</a></li>
            <li><a href="section8.html"><span class="toc-num">8</span> Best Practices</a></li>
            <li><a href="quiz.html"><span class="toc-num">📄</span> Assessment Quiz</a></li>
        </ul>
        <div class="sidebar-progress">
            <div class="progress-label">Progress: <span id="progressPercent">0%</span></div>
            <div class="progress-bar-mini">
                <div class="progress-fill-mini" id="progressFill"></div>
            </div>
        </div>
    </nav>
    <main class="main-content">
        <div class="content-header">
            <div class="breadcrumb">Module 7 of 8</div>
            <h1>Consequences</h1>
            <p class="subtitle">The price of non-compliance and negligence</p>
        </div>
        <div class="content-body">
            <h2>Health & Safety Impacts</h2>
            <p>The most severe consequence of HSE negligence is physical harm to people.</p>
            <div class="info-card danger">
                <div class="info-icon">🩹</div>
                <div>
                    <h3>Personal Injury</h3>
                    <ul>
                        <li>Serious injury, disability, or fatality.</li>
                        <li>Chronic illnesses due to long-term exposure to hazards.</li>
                        <li>Psychological trauma for the affected worker and their family.</li>
                    </ul>
                </div>
            </div>
            <h2>Legal & Financial Consequences</h2>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">💰</div>
                    <h4>Financial Penalties</h4>
                    <p>Heavy fines for the company and individual directors.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">⛓️</div>
                    <h4>Imprisonment</h4>
                    <p>Potential jail time for responsible individuals under the Factories Act.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🛑</div>
                    <h4>License Revocation</h4>
                    <p>Cancellation of business licenses and permits.</p>
                </div>
            </div>
            <h2>Environmental Damage</h2>
            <p>Irresponsible disposal or accidents can lead to:</p>
            <div class="highlight-box">
                <ul>
                    <li>Contamination of local soil and water sources.</li>
                    <li>Harm to local wildlife and ecosystems.</li>
                    <li>National-level pollution fines and "Polluter Pays" liability.</li>
                </ul>
            </div>
            <div class="info-card warning">
                <div class="info-icon">⚠️</div>
                <div>
                    <h3>Company Reputation</h3>
                    <p>Major safety or environmental incidents lead to permanent loss of brand trust, making it difficult to attract customers and top talent.</p>
                </div>
            </div>
        </div>
        <div class="navigation-footer">
            <a href="section6.html" class="nav-btn prev-btn">← Previous: Environmental Responsibility</a>
            <a href="section8.html" class="nav-btn next-btn">Next: Best Practices →</a>
        </div>
    </main>
    <script>
        const trainingId = 'hse';
        const totalSections = 8;
        let completedSections = JSON.parse(localStorage.getItem(trainingId + '_completed') || '[]');
        if (!completedSections.includes(7)) {
            completedSections.push(7);
            localStorage.setItem(trainingId + '_completed', JSON.stringify(completedSections));
        }
        const progress = Math.round((completedSections.length / totalSections) * 100);
        document.getElementById('progressPercent').textContent = progress + '%';
        document.getElementById('progressFill').style.width = progress + '%';
        document.querySelectorAll('.toc-nav li a').forEach(link => {
            const span = link.querySelector('.toc-num');
            if (span) {
                const num = parseInt(span.innerText);
                if (!isNaN(num) && completedSections.includes(num)) {
                    link.parentElement.classList.add('completed');
                }
            }
        });
    </script>
</body>
</html>"""

hse_s8 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Best Practices | HSE Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>HSE Training</h2>
        </div>
        <ul class="toc-nav">
            <li><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li><a href="section3.html"><span class="toc-num">3</span> Workplace Hazards</a></li>
            <li><a href="section4.html"><span class="toc-num">4</span> Fire Safety & PPE</a></li>
            <li><a href="section5.html"><span class="toc-num">5</span> Emergency Procedures</a></li>
            <li><a href="section6.html"><span class="toc-num">6</span> Environmental Responsibility</a></li>
            <li><a href="section7.html"><span class="toc-num">7</span> Consequences</a></li>
            <li class="active"><a href="section8.html"><span class="toc-num">8</span> Best Practices</a></li>
            <li><a href="quiz.html"><span class="toc-num">📄</span> Assessment Quiz</a></li>
        </ul>
        <div class="sidebar-progress">
            <div class="progress-label">Progress: <span id="progressPercent">0%</span></div>
            <div class="progress-bar-mini">
                <div class="progress-fill-mini" id="progressFill"></div>
            </div>
        </div>
    </nav>
    <main class="main-content">
        <div class="content-header">
            <div class="breadcrumb">Module 8 of 8</div>
            <h1>Best Practices</h1>
            <p class="subtitle">Commitment to a culture of Safety and Sustainability</p>
        </div>
        <div class="content-body">
            <h2>Safety Mindset</h2>
            <p>Safety is not just a set of rules; it's a way of thinking and acting every single day.</p>
            <div class="info-card success">
                <div class="info-icon">✨</div>
                <div>
                    <h3>Your Daily Safety Checklist</h3>
                    <ul>
                        <li><strong>Be Aware:</strong> Pay attention to your surroundings at all times.</li>
                        <li><strong>Follow Procedures:</strong> Never take shortcuts, even if they save time.</li>
                        <li><strong>Proper PPE:</strong> Wear the right gear for the right job, every time.</li>
                        <li><strong>Speak Up:</strong> Intervention is an act of care. Prevent an accident before it happens.</li>
                        <li><strong>Think Green:</strong> Make sustainability a part of your office habits.</li>
                    </ul>
                </div>
            </div>
            <h2>Team Responsibility</h2>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">🤝</div>
                    <h4>Support Colleagues</h4>
                    <p>Remind others if they forget their PPE or safe practices.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🕵️</div>
                    <h4>Reporting Near-Misses</h4>
                    <p>Help us learn from "close calls" so we can eliminate hazards.</p>
                </div>
            </div>
            <div class="highlight-box">
                <h3>🏁 Final Summary</h3>
                <p>Safety is a shared journey. By understanding our legal duties, identifying hazards, responding to emergencies correctly, and protecting our environment, we create a workplace where everyone goes home safe every day.</p>
            </div>
            <div class="info-card success">
                <div class="info-icon">🏆</div>
                <div>
                    <h3>Ready for Assessment?</h3>
                    <p>Click the button below to take the final assessment quiz. A passing score of 80% is required.</p>
                </div>
            </div>
        </div>
        <div class="navigation-footer">
            <a href="section7.html" class="nav-btn prev-btn">← Previous: Consequences</a>
            <a href="quiz.html" class="nav-btn next-btn">Take Final Quiz →</a>
        </div>
    </main>
    <script>
        const trainingId = 'hse';
        const totalSections = 8;
        let completedSections = JSON.parse(localStorage.getItem(trainingId + '_completed') || '[]');
        if (!completedSections.includes(8)) {
            completedSections.push(8);
            localStorage.setItem(trainingId + '_completed', JSON.stringify(completedSections));
        }
        const progress = Math.round((completedSections.length / totalSections) * 100);
        document.getElementById('progressPercent').textContent = progress + '%';
        document.getElementById('progressFill').style.width = progress + '%';
        document.querySelectorAll('.toc-nav li a').forEach(link => {
            const span = link.querySelector('.toc-num');
            if (span) {
                const num = parseInt(span.innerText);
                if (!isNaN(num) && completedSections.includes(num)) {
                    link.parentElement.classList.add('completed');
                }
            }
        });
    </script>
</body>
</html>"""

hse_quiz = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assessment | HSE Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <style>
        .quiz-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .question-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .options { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
        .option { padding: 12px 15px; border: 2px solid #eef2f6; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .option:hover { background: #f8fafc; border-color: #cbd5e1; }
        .option.selected { background: #16a34a; border-color: #16a34a; color: white; }
        .result-screen { display: none; text-align: center; padding: 40px; }
        .score { font-size: 48px; font-weight: 800; color: #16a34a; margin-bottom: 10px; }
    </style>
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>HSE Training</h2>
        </div>
        <ul class="toc-nav">
            <li><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li><a href="section3.html"><span class="toc-num">3</span> Workplace Hazards</a></li>
            <li><a href="section4.html"><span class="toc-num">4</span> Fire Safety & PPE</a></li>
            <li><a href="section5.html"><span class="toc-num">5</span> Emergency Procedures</a></li>
            <li><a href="section6.html"><span class="toc-num">6</span> Environmental Responsibility</a></li>
            <li><a href="section7.html"><span class="toc-num">7</span> Consequences</a></li>
            <li><a href="section8.html"><span class="toc-num">8</span> Best Practices</a></li>
            <li class="active"><a href="quiz.html"><span class="toc-num">📄</span> Assessment Quiz</a></li>
        </ul>
    </nav>
    <main class="main-content">
        <div class="quiz-container" id="quizContainer">
            <div class="question-card">
                <div class="breadcrumb">Question 1 of 5</div>
                <h3>What does the "PASS" method stand for when using a fire extinguisher?</h3>
                <div class="options" data-correct="0">
                    <div class="option" onclick="selectOption(this, 0)">Pull, Aim, Squeeze, Sweep</div>
                    <div class="option" onclick="selectOption(this, 1)">Push, Activate, Spray, Stop</div>
                    <div class="option" onclick="selectOption(this, 2)">Point, Apply, Shake, Secure</div>
                    <div class="option" onclick="selectOption(this, 3)">Pick up, Alarm, Save, Shout</div>
                </div>
            </div>
            <div class="question-card">
                <div class="breadcrumb">Question 2 of 5</div>
                <h3>Which type of fire extinguisher should NEVER be used on an electrical fire?</h3>
                <div class="options" data-correct="1">
                    <div class="option" onclick="selectOption(this, 0)">CO2</div>
                    <div class="option" onclick="selectOption(this, 1)">Water</div>
                    <div class="option" onclick="selectOption(this, 2)">Dry Powder</div>
                    <div class="option" onclick="selectOption(this, 3)">Blanket</div>
                </div>
            </div>
            <div class="question-card">
                <div class="breadcrumb">Question 3 of 5</div>
                <h3>What is a "Near-Miss"?</h3>
                <div class="options" data-correct="1">
                    <div class="option" onclick="selectOption(this, 0)">A minor injury that needs first aid</div>
                    <div class="option" onclick="selectOption(this, 1)">An event that could have caused harm but didn't</div>
                    <div class="option" onclick="selectOption(this, 2)">An accident that happened far away</div>
                    <div class="option" onclick="selectOption(this, 3)">Missing a safety meeting</div>
                </div>
            </div>
            <div class="question-card">
                <div class="breadcrumb">Question 4 of 5</div>
                <h3>What should you do when you hear a fire alarm?</h3>
                <div class="options" data-correct="2">
                    <div class="option" onclick="selectOption(this, 0)">Finish your task and then leave</div>
                    <div class="option" onclick="selectOption(this, 1)">Take the elevator to the ground floor</div>
                    <div class="option" onclick="selectOption(this, 2)">Leave immediately via stairs and go to the assembly point</div>
                    <div class="option" onclick="selectOption(this, 3)">Call your manager for instructions</div>
                </div>
            </div>
            <div class="question-card">
                <div class="breadcrumb">Question 5 of 5</div>
                <h3>Which of the following is an "Ergonomic" hazard?</h3>
                <div class="options" data-correct="0">
                    <div class="option" onclick="selectOption(this, 0)">Poor workstation setup causing back pain</div>
                    <div class="option" onclick="selectOption(this, 1)">A spilled chemical on the floor</div>
                    <div class="option" onclick="selectOption(this, 2)">High voltage electrical wires</div>
                    <div class="option" onclick="selectOption(this, 3)">A noisy generator</div>
                </div>
            </div>
            <button onclick="submitQuiz()" class="nav-btn next-btn" style="width: 100%; justify-content: center; margin-top: 20px; background: #16a34a; border-color: #16a34a;">Submit Assessment</button>
        </div>
        <div class="result-screen" id="resultScreen">
            <h2 id="resultTitle">Assessment Complete!</h2>
            <div class="score" id="scoreDisplay">0%</div>
            <p id="resultText">You have completed the HSE training.</p>
            <a href="../index.html" class="nav-btn next-btn" style="margin-top: 20px; background: #16a34a; border-color: #16a34a;">Return to Training Hub</a>
        </div>
    </main>
    <script>
        function selectOption(btn, idx) {
            const parent = btn.parentElement;
            parent.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
            btn.classList.add('selected');
        }
        function submitQuiz() {
            const questions = document.querySelectorAll('.options');
            let correctCount = 0;
            let answeredCount = 0;
            questions.forEach(q => {
                const selected = q.querySelector('.option.selected');
                if (selected) {
                    answeredCount++;
                    const options = Array.from(q.querySelectorAll('.option'));
                    if (options.indexOf(selected) === parseInt(q.dataset.correct)) {
                        correctCount++;
                    }
                }
            });
            if (answeredCount < questions.length) {
                alert('Please answer all questions before submitting.');
                return;
            }
            const score = Math.round((correctCount / questions.length) * 100);
            document.getElementById('quizContainer').style.display = 'none';
            document.getElementById('resultScreen').style.display = 'block';
            document.getElementById('scoreDisplay').textContent = score + '%';
            if (score >= 80) {
                document.getElementById('resultTitle').textContent = '✅ Assessment Passed!';
                document.getElementById('resultText').textContent = 'Congratulations! You have successfully completed the HSE (Health, Safety, and Environment) training module.';
                localStorage.setItem('hse_passed', 'true');
            } else {
                document.getElementById('resultTitle').textContent = '❌ Assessment Failed';
                document.getElementById('resultText').textContent = 'You need 80% to pass. Please review the material and try again.';
                const retryBtn = document.createElement('button');
                retryBtn.textContent = 'Retry Quiz';
                retryBtn.className = 'nav-btn prev-btn';
                retryBtn.style.marginTop = '20px';
                retryBtn.onclick = () => location.reload();
                document.getElementById('resultScreen').appendChild(retryBtn);
            }
        }
    </script>
</body>
</html>"""

os.chdir(r"c:\Users\pc\Desktop\IshanPolicyTraining\TrainingPrograms\HSE")
overwrite_file("section2.html", hse_s2)
overwrite_file("section3.html", hse_s3)
overwrite_file("section4.html", hse_s4)
overwrite_file("section5.html", hse_s5)
overwrite_file("section6.html", hse_s6)
overwrite_file("section7.html", hse_s7)
overwrite_file("section8.html", hse_s8)
overwrite_file("quiz.html", hse_quiz)
