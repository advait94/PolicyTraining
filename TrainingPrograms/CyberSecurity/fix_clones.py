import os

def overwrite_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

cyber_s6 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Incident Response | CyberSecurity Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>CyberSecurity Training</h2>
        </div>
        <ul class="toc-nav">
            <li ><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li ><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li ><a href="section3.html"><span class="toc-num">3</span> Common Threats</a></li>
            <li ><a href="section4.html"><span class="toc-num">4</span> Password Security</a></li>
            <li ><a href="section5.html"><span class="toc-num">5</span> Data Protection</a></li>
            <li class="active"><a href="section6.html"><span class="toc-num">6</span> Incident Response</a></li>
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
            <h1>Incident Response</h1>
            <p class="subtitle">What to do when you suspect a cyber security breach</p>
        </div>
        <div class="content-body">
            <h2>What is a Cyber Incident?</h2>
            <p>A cyber incident is any event that threatens the confidentiality, integrity, or availability of an information system or its data.</p>
            <div class="info-card danger">
                <div class="info-icon">🚨</div>
                <div>
                    <h3>Common Examples</h3>
                    <ul>
                        <li>Loss or theft of laptop or mobile device</li>
                        <li>Suspicious login attempts or account lockouts</li>
                        <li>Unusual system performance or unexpected pop-ups</li>
                        <li>Clicking on a phishing link or downloading a suspicious file</li>
                        <li>Receiving a ransomware message</li>
                    </ul>
                </div>
            </div>
            <h2>Immediate Actions</h2>
            <p>If you suspect an incident, your first actions are critical to containing the threat.</p>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">🚫</div>
                    <h4>Do Not Power Off</h4>
                    <p>Unless instructed, avoid shutting down your PC as it may erase forensic evidence</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">📶</div>
                    <h4>Disconnect Wi-Fi</h4>
                    <p>Disconnect from Wi-Fi or unplug the network cable to prevent the spread of malware</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">📞</div>
                    <h4>Report Immediately</h4>
                    <p>Contact the IT Helpdesk and your manager as soon as possible</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🔇</div>
                    <h4>Remain Discreet</h4>
                    <p>Avoid discussing the incident on public channels until it is resolved</p>
                </div>
            </div>
            <h2>How to Report</h2>
            <div class="highlight-box">
                <p>Use the following channels to report any security concerns:</p>
                <ul>
                    <li><strong>IT Helpdesk:</strong> it.helpdesk@ishantechnologies.com (Phone: +91-XXXX-XXXXXX)</li>
                    <li><strong>Security Portal:</strong> internal.security.portal</li>
                    <li><strong>Manager:</strong> Always keep your immediate supervisor informed</li>
                </ul>
            </div>
            <div class="info-card warning">
                <div class="info-icon">⏳</div>
                <div>
                    <h3>The 6-Hour Rule (CERT-In)</h3>
                    <p>Under Indian regulations, certain security incidents must be reported to CERT-In within <strong>6 hours</strong>. Quick internal reporting is essential for the company to comply with the law.</p>
                </div>
            </div>
            <div class="info-card success">
                <div class="info-icon">✅</div>
                <div>
                    <h3>No Penalty for Honest Mistakes</h3>
                    <p>The company encourages a "Reporting Culture." You will not be penalized for reporting an accidental click on a malicious link, provided you report it <strong>promptly</strong>.</p>
                </div>
            </div>
        </div>
        <div class="navigation-footer">
            <a href="section5.html" class="nav-btn prev-btn">← Previous: Data Protection</a>
            <a href="section7.html" class="nav-btn next-btn">Next: Consequences →</a>
        </div>
    </main>
    <script>
        const trainingId = 'cybersecurity';
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

cyber_s7 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consequences | CyberSecurity Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>CyberSecurity Training</h2>
        </div>
        <ul class="toc-nav">
            <li ><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li ><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li ><a href="section3.html"><span class="toc-num">3</span> Common Threats</a></li>
            <li ><a href="section4.html"><span class="toc-num">4</span> Password Security</a></li>
            <li ><a href="section5.html"><span class="toc-num">5</span> Data Protection</a></li>
            <li ><a href="section6.html"><span class="toc-num">6</span> Incident Response</a></li>
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
            <p class="subtitle">The impact of cyber attacks on individuals and the organization</p>
        </div>
        <div class="content-body">
            <h2>Financial Impact</h2>
            <p>Cyber attacks can lead to direct and indirect financial losses that can be devastating for a company.</p>
            <div class="info-card danger">
                <div class="info-icon">📉</div>
                <div>
                    <h3>Direct Losses</h3>
                    <ul>
                        <li>Ransom payments (though discouraged)</li>
                        <li>Theft of funds via fraudulent transfers</li>
                        <li>Costs for incident response and forensic investigations</li>
                        <li>Legal fees and regulatory fines</li>
                    </ul>
                </div>
            </div>
            <h2>Reputational Damage</h2>
            <p>Loss of trust is often more expensive than the direct financial cost of a breach. Customers and partners may avoid doing business with a "hacked" company.</p>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">💔</div>
                    <h4>Customer Trust</h4>
                    <p>Loss of existing and potential customers</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">📊</div>
                    <h4>Market Value</h4>
                    <p>Drop in stock price and company valuation</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">📢</div>
                    <h4>Brand Image</h4>
                    <p>Negative media coverage and brand devaluation</p>
                </div>
            </div>
            <h2>Operational Disruption</h2>
            <div class="highlight-box">
                <p>A cyber attack can bring business operations to a complete standstill. This includes:</p>
                <ul>
                    <li>Downtime of critical services and servers</li>
                    <li>Inability to process orders or serve customers</li>
                    <li>Loss of intellectual property or trade secrets</li>
                    <li>Employee productivity loss during system recovery</li>
                </ul>
            </div>
            <h2>Individual Consequences</h2>
            <div class="info-card warning">
                <div class="info-icon">👤</div>
                <div>
                    <h3>Personal Liability</h3>
                    <p>Under the IT Act, individuals can face personal fines and imprisonment if they are found to be willfully negligent or involved in a cybercrime.</p>
                </div>
            </div>
            <div class="info-card success">
                <div class="info-icon">🛡️</div>
                <div>
                    <h3>The Value of Prevention</h3>
                    <p>Every rupee and hour spent on prevention is worth tenfold in recovery costs saved. Your vigilance is our primary defense against these consequences.</p>
                </div>
            </div>
        </div>
        <div class="navigation-footer">
            <a href="section6.html" class="nav-btn prev-btn">← Previous: Incident Response</a>
            <a href="section8.html" class="nav-btn next-btn">Next: Best Practices →</a>
        </div>
    </main>
    <script>
        const trainingId = 'cybersecurity';
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

cyber_s8 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Best Practices | CyberSecurity Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>CyberSecurity Training</h2>
        </div>
        <ul class="toc-nav">
            <li ><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li ><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li ><a href="section3.html"><span class="toc-num">3</span> Common Threats</a></li>
            <li ><a href="section4.html"><span class="toc-num">4</span> Password Security</a></li>
            <li ><a href="section5.html"><span class="toc-num">5</span> Data Protection</a></li>
            <li ><a href="section6.html"><span class="toc-num">6</span> Incident Response</a></li>
            <li ><a href="section7.html"><span class="toc-num">7</span> Consequences</a></li>
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
            <p class="subtitle">Summary of daily habits to keep our data secure</p>
        </div>
        <div class="content-body">
            <h2>The Human Firewall</h2>
            <p>Technology alone cannot stop cyber attacks. Your daily habits and vigilance form the "Human Firewall" that protects the organization.</p>
            <div class="info-card success">
                <div class="info-icon">🌟</div>
                <div>
                    <h3>Cyber Hygiene Checklist</h3>
                    <ul>
                        <li><strong>Think Before You Click:</strong> Be skeptical of unexpected links or attachments</li>
                        <li><strong>MFA Everywhere:</strong> Enable Multi-Factor Authentication on all accounts</li>
                        <li><strong>Unique Passwords:</strong> Use a password manager for high complexity and uniqueness</li>
                        <li><strong>Update Regularly:</strong> Never skip software or system updates</li>
                        <li><strong>Report Early:</strong> When in doubt, report it to IT immediately</li>
                        <li><strong>Lock Your Screen:</strong> Don't leave your computer unsecured in the office or in public</li>
                    </ul>
                </div>
            </div>
            <h2>Social Media Safety</h2>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">🕵️</div>
                    <h4>Oversharing</h4>
                    <p>Don't post sensitive work details or photos of your office badge</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🔒</div>
                    <h4>Privacy Settings</h4>
                    <p>Keep your personal profiles private to prevent profiling by hackers</p>
                </div>
            </div>
            <h2>Remote Work Security</h2>
            <div class="highlight-box">
                <ul>
                    <li>Connect only via the corporate VPN</li>
                    <li>Secure your home Wi-Fi with a strong password</li>
                    <li>Avoid "Juice Jacking" by using your own charging cables in public</li>
                    <li>Don't allow family or friends to use your corporate devices</li>
                </ul>
            </div>
            <div class="info-card primary">
                <div class="info-icon">🏁</div>
                <div>
                    <h3>Module Summary</h3>
                    <p>You have completed the Cybersecurity training sections. You should now understand the legal landscape, recognize common threats, and know how to protect yourself and the company through secure practices and prompt reporting.</p>
                </div>
            </div>
            <div class="info-card success">
                <div class="info-icon">🏆</div>
                <div>
                    <h3>Ready for Assessment?</h3>
                    <p>Click the button below to take the final assessment quiz. You must score 80% or higher to receive your certification.</p>
                </div>
            </div>
        </div>
        <div class="navigation-footer">
            <a href="section7.html" class="nav-btn prev-btn">← Previous: Consequences</a>
            <a href="quiz.html" class="nav-btn next-btn">Take Final Quiz →</a>
        </div>
    </main>
    <script>
        const trainingId = 'cybersecurity';
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

cyber_quiz = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assessment | CyberSecurity Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <style>
        .quiz-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .question-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .options { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
        .option { padding: 12px 15px; border: 2px solid #eef2f6; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .option:hover { background: #f8fafc; border-color: #cbd5e1; }
        .option.selected { background: #3b82f6; border-color: #3b82f6; color: white; }
        .result-screen { display: none; text-align: center; padding: 40px; }
        .score { font-size: 48px; font-weight: 800; color: #3b82f6; margin-bottom: 10px; }
    </style>
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>CyberSecurity Training</h2>
        </div>
        <ul class="toc-nav">
            <li ><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li ><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li ><a href="section3.html"><span class="toc-num">3</span> Common Threats</a></li>
            <li ><a href="section4.html"><span class="toc-num">4</span> Password Security</a></li>
            <li ><a href="section5.html"><span class="toc-num">5</span> Data Protection</a></li>
            <li ><a href="section6.html"><span class="toc-num">6</span> Incident Response</a></li>
            <li ><a href="section7.html"><span class="toc-num">7</span> Consequences</a></li>
            <li ><a href="section8.html"><span class="toc-num">8</span> Best Practices</a></li>
            <li class="active"><a href="quiz.html"><span class="toc-num">📄</span> Assessment Quiz</a></li>
        </ul>
    </nav>
    <main class="main-content">
        <div class="quiz-container" id="quizContainer">
            <div class="question-card">
                <div class="breadcrumb">Question 1 of 5</div>
                <h3>Which of the following is the BEST practice for creating a strong password?</h3>
                <div class="options" data-correct="2">
                    <div class="option" onclick="selectOption(this, 0)">Using your birthdate and name</div>
                    <div class="option" onclick="selectOption(this, 1)">Reusing a password from another site</div>
                    <div class="option" onclick="selectOption(this, 2)">Using a long passphrase with mixed characters</div>
                    <div class="option" onclick="selectOption(this, 3)">Using "password123"</div>
                </div>
            </div>
            <div class="question-card">
                <div class="breadcrumb">Question 2 of 5</div>
                <h3>What should you do if you accidentally click a link in a suspicious email?</h3>
                <div class="options" data-correct="1">
                    <div class="option" onclick="selectOption(this, 0)">Ignore it and delete the email</div>
                    <div class="option" onclick="selectOption(this, 1)">Report it to IT immediately and disconnect Wi-Fi</div>
                    <div class="option" onclick="selectOption(this, 2)">Shut down the computer and go home</div>
                    <div class="option" onclick="selectOption(this, 3)">Wait a few days to see if anything happens</div>
                </div>
            </div>
            <div class="question-card">
                <div class="breadcrumb">Question 3 of 5</div>
                <h3>Multi-Factor Authentication (MFA) protects you primarily when:</h3>
                <div class="options" data-correct="0">
                    <div class="option" onclick="selectOption(this, 0)">Your password is stolen or compromised</div>
                    <div class="option" onclick="selectOption(this, 1)">You forget your username</div>
                    <div class="option" onclick="selectOption(this, 2)">You want to log in faster</div>
                    <div class="option" onclick="selectOption(this, 3)">The internet is slow</div>
                </div>
            </div>
            <div class="question-card">
                <div class="breadcrumb">Question 4 of 5</div>
                <h3>Under Section 70B of the IT Act, cyber incidents must be reported to CERT-In within:</h3>
                <div class="options" data-correct="2">
                    <div class="option" onclick="selectOption(this, 0)">24 Hours</div>
                    <div class="option" onclick="selectOption(this, 1)">1 Week</div>
                    <div class="option" onclick="selectOption(this, 2)">6 Hours</div>
                    <div class="option" onclick="selectOption(this, 3)">30 Days</div>
                </div>
            </div>
            <div class="question-card">
                <div class="breadcrumb">Question 5 of 5</div>
                <h3>"Spear Phishing" is best described as:</h3>
                <div class="options" data-correct="1">
                    <div class="option" onclick="selectOption(this, 0)">A random attack on everyone</div>
                    <div class="option" onclick="selectOption(this, 1)">A targeted attack on a specific individual or company</div>
                    <div class="option" onclick="selectOption(this, 2)">A type of computer hardware</div>
                    <div class="option" onclick="selectOption(this, 3)">An antivirus software</div>
                </div>
            </div>
            <button onclick="submitQuiz()" class="nav-btn next-btn" style="width: 100%; justify-content: center; margin-top: 20px;">Submit Assessment</button>
        </div>
        <div class="result-screen" id="resultScreen">
            <h2 id="resultTitle">Assessment Complete!</h2>
            <div class="score" id="scoreDisplay">0%</div>
            <p id="resultText">You have completed the Cybersecurity training.</p>
            <a href="../index.html" class="nav-btn next-btn" style="margin-top: 20px;">Return to Training Hub</a>
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
                document.getElementById('resultText').textContent = 'Congratulations! You have successfully completed the Cybersecurity training module.';
                localStorage.setItem('cybersecurity_passed', 'true');
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

os.chdir(r"c:\Users\pc\Desktop\IshanPolicyTraining\TrainingPrograms\CyberSecurity")
overwrite_file("section6.html", cyber_s6)
overwrite_file("section7.html", cyber_s7)
overwrite_file("section8.html", cyber_s8)
overwrite_file("quiz.html", cyber_quiz)
