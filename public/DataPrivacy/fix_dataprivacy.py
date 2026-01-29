import os

def overwrite_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

dp_s2 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Legal Framework | Data Privacy Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>Data Privacy Training</h2>
        </div>
        <ul class="toc-nav">
            <li><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li class="active"><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li><a href="section3.html"><span class="toc-num">3</span> Data Principles</a></li>
            <li><a href="section4.html"><span class="toc-num">4</span> Data Subjects' Rights</a></li>
            <li><a href="section5.html"><span class="toc-num">5</span> Breach Management</a></li>
            <li><a href="section6.html"><span class="toc-num">6</span> International Transfers</a></li>
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
            <p class="subtitle">Understanding the DPDP Act 2023 and Global Standards</p>
        </div>
        <div class="content-body">
            <h2>The DPDP Act, 2023</h2>
            <p>India's <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> is the primary law governing how we handle the digital personal data of individuals.</p>
            <div class="info-card primary">
                <div class="info-icon">📜</div>
                <div>
                    <h3>Key Pillars of the Act</h3>
                    <ul>
                        <li><strong>Consent:</strong> Data can only be processed with free, specific, and informed consent.</li>
                        <li><strong>Legitimate Uses:</strong> Processing without consent is only allowed for certain "legitimate uses" (e.g., medical emergencies, legal requirements).</li>
                        <li><strong>Data Fiduciary:</strong> Ishan Technologies is a "Data Fiduciary" and is responsible for the data it collects.</li>
                    </ul>
                </div>
            </div>
            <h2>Global Perspective</h2>
            <p>While we operate primarily in India, we often handle data that falls under other international regulations.</p>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">🇪🇺</div>
                    <h4>GDPR</h4>
                    <p>The General Data Protection Regulation in the EU is the gold standard for privacy globally.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🇺🇸</div>
                    <h4>CCPA/CPRA</h4>
                    <p>California's privacy laws that provide rights to US-based residents.</p>
                </div>
            </div>
            <h2>Sensitive Personal Data</h2>
            <div class="highlight-box">
                <p>Certain categories of data require higher protection:</p>
                <ul>
                    <li>Financial Information</li>
                    <li>Health Data</li>
                    <li>Biometric Data</li>
                    <li>Caste or Tribe details</li>
                    <li>Sexual orientation</li>
                </ul>
            </div>
            <div class="info-card warning">
                <div class="info-icon">⚖️</div>
                <div>
                    <h3>Heavy Penalties</h3>
                    <p>Non-compliance with the DPDP Act can lead to fines of up to <strong>₹250 Crores</strong> per instance. Protecting data is a financial necessity.</p>
                </div>
            </div>
        </div>
        <div class="navigation-footer">
            <a href="index.html" class="nav-btn prev-btn">← Previous: Introduction</a>
            <a href="section3.html" class="nav-btn next-btn">Next: Data Principles →</a>
        </div>
    </main>
    <script>
        const trainingId = 'dataprivacy';
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

dp_s3 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Principles | Data Privacy Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>Data Privacy Training</h2>
        </div>
        <ul class="toc-nav">
            <li><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li class="active"><a href="section3.html"><span class="toc-num">3</span> Data Principles</a></li>
            <li><a href="section4.html"><span class="toc-num">4</span> Data Subjects' Rights</a></li>
            <li><a href="section5.html"><span class="toc-num">5</span> Breach Management</a></li>
            <li><a href="section6.html"><span class="toc-num">6</span> International Transfers</a></li>
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
            <h1>Data Principles</h1>
            <p class="subtitle">The core rules for ethical and legal data handling</p>
        </div>
        <div class="content-body">
            <h2>The Seven Core Principles</h2>
            <p>Every interaction with personal data must adhere to these fundamental principles.</p>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">🛡️</div>
                    <h4>Lawfulness & Transparency</h4>
                    <p>Process data fairly and tell the individual what you are doing.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🎯</div>
                    <h4>Purpose Limitation</h4>
                    <p>Only collect data for a specified, explicit, and legitimate purpose.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🤏</div>
                    <h4>Data Minimization</h4>
                    <p>Only collect what is absolutely necessary. Don't ask for "just in case" data.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">✅</div>
                    <h4>Accuracy</h4>
                    <p>Ensure data is kept up to date and corrected if inaccurate.</p>
                </div>
            </div>
            <h2>Storage Limitation</h2>
            <div class="info-card warning">
                <div class="info-icon">⏳</div>
                <div>
                    <h3>Delete When Done</h3>
                    <p>Personal data should not be kept longer than necessary for the purpose for which it was collected. Once the purpose is served, it must be securely deleted or anonymized.</p>
                </div>
            </div>
            <h2>Integrity & Confidentiality</h2>
            <p>Data must be protected against unauthorized or unlawful processing, and against accidental loss, destruction, or damage.</p>
            <div class="highlight-box">
                <ul>
                    <li>Use encryption whenever possible.</li>
                    <li>Restrict access on a "Need-to-Know" basis.</li>
                    <li>Always lock your screen when leaving your workstation.</li>
                </ul>
            </div>
            <div class="info-card success">
                <div class="info-icon">🤝</div>
                <div>
                    <h3>Accountability</h3>
                    <p>The company is responsible for demonstrating compliance with all the above principles. This includes maintaining records of processing activities.</p>
                </div>
            </div>
        </div>
        <div class="navigation-footer">
            <a href="section2.html" class="nav-btn prev-btn">← Previous: Legal Framework</a>
            <a href="section4.html" class="nav-btn next-btn">Next: Data Subjects' Rights →</a>
        </div>
    </main>
    <script>
        const trainingId = 'dataprivacy';
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

dp_s4 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Subjects' Rights | Data Privacy Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>Data Privacy Training</h2>
        </div>
        <ul class="toc-nav">
            <li><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li><a href="section3.html"><span class="toc-num">3</span> Data Principles</a></li>
            <li class="active"><a href="section4.html"><span class="toc-num">4</span> Data Subjects' Rights</a></li>
            <li><a href="section5.html"><span class="toc-num">5</span> Breach Management</a></li>
            <li><a href="section6.html"><span class="toc-num">6</span> International Transfers</a></li>
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
            <h1>Data Subjects' Rights</h1>
            <p class="subtitle">Empowering individuals to control their digital footprint</p>
        </div>
        <div class="content-body">
            <h2>Who is a Data Principal?</h2>
            <p>Under the DPDP Act, an individual whose personal data is being processed is called a <strong>Data Principal</strong>. They have specific rights that we must honor.</p>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">👁️</div>
                    <h4>Right to Access</h4>
                    <p>The right to know what data we have about them and who we share it with.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">✏️</div>
                    <h4>Right to Correction</h4>
                    <p>The right to have inaccurate or incomplete data updated.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🗑️</div>
                    <h4>Right to Erasure</h4>
                    <p>The right to have their data deleted when it is no longer needed (also known as the "Right to be Forgotten").</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🔙</div>
                    <h4>Right to Withdraw Consent</h4>
                    <p>The right to change their mind and stop us from processing their data.</p>
                </div>
            </div>
            <h2>Fulfilling Requests</h2>
            <div class="info-card primary">
                <div class="info-icon">🤝</div>
                <div>
                    <h3>Nomination</h3>
                    <p>Data Principals also have the right to nominate someone to exercise their rights in case of death or incapacity.</p>
                </div>
            </div>
            <div class="highlight-box">
                <p>If you receive a request from a customer or colleague regarding their privacy rights:</p>
                <ul>
                    <li>Do not attempt to handle it yourself.</li>
                    <li>Immediately forward the request to the <strong>Data Protection Officer (DPO)</strong>.</li>
                    <li>Note the date and time the request was received (strict timelines apply).</li>
                </ul>
            </div>
            <div class="info-card warning">
                <div class="info-icon">⚠️</div>
                <div>
                    <h3>Grievance Redressal</h3>
                    <p>Data Principals have a right to have their grievances addressed by the company within a specified timeframe. Failure to do so allows them to complain to the Data Protection Board.</p>
                </div>
            </div>
        </div>
        <div class="navigation-footer">
            <a href="section3.html" class="nav-btn prev-btn">← Previous: Data Principles</a>
            <a href="section5.html" class="nav-btn next-btn">Next: Breach Management →</a>
        </div>
    </main>
    <script>
        const trainingId = 'dataprivacy';
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

dp_s5 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Breach Management | Data Privacy Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>Data Privacy Training</h2>
        </div>
        <ul class="toc-nav">
            <li><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li><a href="section3.html"><span class="toc-num">3</span> Data Principles</a></li>
            <li><a href="section4.html"><span class="toc-num">4</span> Data Subjects' Rights</a></li>
            <li class="active"><a href="section5.html"><span class="toc-num">5</span> Breach Management</a></li>
            <li><a href="section6.html"><span class="toc-num">6</span> International Transfers</a></li>
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
            <h1>Breach Management</h1>
            <p class="subtitle">Responding to unauthorized access or loss of personal data</p>
        </div>
        <div class="content-body">
            <h2>What is a Data Breach?</h2>
            <p>A personal data breach is a breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to, personal data.</p>
            <div class="info-card danger">
                <div class="info-icon">🚨</div>
                <div>
                    <h3>Examples of Breaches</h3>
                    <ul>
                        <li>Sending an email with personal data to the wrong recipient.</li>
                        <li>Losing a USB drive containing unencrypted payroll data.</li>
                        <li>A cyber attack that allows hackers to view customer records.</li>
                        <li>An employee looking at personal data without a business need.</li>
                    </ul>
                </div>
            </div>
            <h2>Reporting Obligations</h2>
            <p>The DPDP Act requires the company to notify the <strong>Data Protection Board</strong> and each <strong>affected Data Principal</strong> in the event of a breach.</p>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">⏱️</div>
                    <h4>Immediate Action</h4>
                    <p>Internal reporting must happen within minutes of discovery.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">📞</div>
                    <h4>DPO Notification</h4>
                    <p>Email: privacy@ishantechnologies.com or use the security portal.</p>
                </div>
            </div>
            <div class="highlight-box">
                <p>If you suspect a breach:</p>
                <ol>
                    <li>Stop the activity immediately (if possible).</li>
                    <li>Notify the DPO and your manager.</li>
                    <li>Do not try to "fix" or hide the mistake.</li>
                    <li>Document what happened (who, what, where, when).</li>
                </ol>
            </div>
            <div class="info-card warning">
                <div class="info-icon">⚖️</div>
                <div>
                    <h3>Legal Liability</h3>
                    <p>Failure to report a breach to the authorities can lead to additional heavy fines beyond the penalty for the breach itself.</p>
                </div>
            </div>
        </div>
        <div class="navigation-footer">
            <a href="section4.html" class="nav-btn prev-btn">← Previous: Data Subjects' Rights</a>
            <a href="section6.html" class="nav-btn next-btn">Next: International Transfers →</a>
        </div>
    </main>
    <script>
        const trainingId = 'dataprivacy';
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

dp_s6 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>International Transfers | Data Privacy Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>Data Privacy Training</h2>
        </div>
        <ul class="toc-nav">
            <li><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li><a href="section3.html"><span class="toc-num">3</span> Data Principles</a></li>
            <li><a href="section4.html"><span class="toc-num">4</span> Data Subjects' Rights</a></li>
            <li><a href="section5.html"><span class="toc-num">5</span> Breach Management</a></li>
            <li class="active"><a href="section6.html"><span class="toc-num">6</span> International Transfers</a></li>
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
            <h1>International Transfers</h1>
            <p class="subtitle">Managing data across borders securely and legally</p>
        </div>
        <div class="content-body">
            <h2>The Borderless Digital World</h2>
            <p>Data often travels across international borders for processing, storage, or analysis. This is carefully regulated to ensure privacy is not lost during the transfer.</p>
            <div class="info-card primary">
                <div class="info-icon">🌐</div>
                <div>
                    <h3>DPDP Act Provisions</h3>
                    <p>The Government of India may "restrict" the transfer of personal data to certain countries. Transfers are allowed unless a country is explicitly blacklisted.</p>
                </div>
            </div>
            <h2>Standard Contractual Clauses (SCCs)</h2>
            <p>When sharing data with international partners or vendors, we use legally binding agreements to ensure they protect the data as strictly as we do.</p>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">📝</div>
                    <h4>Enforceable Rights</h4>
                    <p>Ensuring data subjects have rights in the destination country.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🔒</div>
                    <h4>Security Safeguards</h4>
                    <p>Requiring the recipient to have technical security measures in place.</p>
                </div>
            </div>
            <div class="highlight-box">
                <p>Before transferring personal data outside of India:</p>
                <ul>
                    <li>Confirm that the transfer is authorized for your project.</li>
                    <li>Ensure a <strong>Data Processing Agreement (DPA)</strong> is in place.</li>
                    <li>Check if the vendor is a "Data Processor" or a "Data Fiduciary."</li>
                </ul>
            </div>
            <div class="info-card warning">
                <div class="info-icon">⚠️</div>
                <div>
                    <h3>Public Interest Transfers</h3>
                    <p>Different rules may apply to transfers required by law enforcement or in the interest of national security.</p>
                </div>
            </div>
        </div>
        <div class="navigation-footer">
            <a href="section5.html" class="nav-btn prev-btn">← Previous: Breach Management</a>
            <a href="section7.html" class="nav-btn next-btn">Next: Consequences →</a>
        </div>
    </main>
    <script>
        const trainingId = 'dataprivacy';
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

dp_s7 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consequences | Data Privacy Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>Data Privacy Training</h2>
        </div>
        <ul class="toc-nav">
            <li><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li><a href="section3.html"><span class="toc-num">3</span> Data Principles</a></li>
            <li><a href="section4.html"><span class="toc-num">4</span> Data Subjects' Rights</a></li>
            <li><a href="section5.html"><span class="toc-num">5</span> Breach Management</a></li>
            <li><a href="section6.html"><span class="toc-num">6</span> International Transfers</a></li>
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
            <p class="subtitle">The high cost of privacy failure</p>
        </div>
        <div class="content-body">
            <h2>Financial Penalties</h2>
            <p>The DPDP Act has some of the highest financial penalties in Indian law to ensure companies take privacy seriously.</p>
            <div class="info-card danger">
                <div class="info-icon">💰</div>
                <div>
                    <h3>Penalty Scale</h3>
                    <ul>
                        <li><strong>Failure to prevent breach:</strong> Up to ₹250 Crores</li>
                        <li><strong>Failure to notify breach:</strong> Up to ₹200 Crores</li>
                        <li><strong>Breach of children's data:</strong> Up to ₹200 Crores</li>
                        <li><strong>General non-compliance:</strong> Up to ₹50 Crores</li>
                    </ul>
                </div>
            </div>
            <h2>Reputational Harm</h2>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">📉</div>
                    <h4>Loss of Business</h4>
                    <p>Clients are reluctant to work with companies that have a history of data mismanagement.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">🚫</div>
                    <h4>Trust Deficit</h4>
                    <p>Employees and customers feel violated when their personal details are leaked.</p>
                </div>
            </div>
            <h2>Operational Impact</h2>
            <div class="highlight-box">
                <p>A major privacy incident can lead to:</p>
                <ul>
                    <li>Internal audits and regulatory investigations.</li>
                    <li>Mandatory changes to business processes at high cost.</li>
                    <li>Individual lawsuits from affected Data Principals.</li>
                </ul>
            </div>
            <div class="info-card warning">
                <div class="info-icon">⛓️</div>
                <div>
                    <h3>Individual Responsibility</h3>
                    <p>Willful negligence or unauthorized use of data for personal gain can lead to <strong>disciplinary action</strong>, including termination of employment and possible criminal charges.</p>
                </div>
            </div>
        </div>
        <div class="navigation-footer">
            <a href="section6.html" class="nav-btn prev-btn">← Previous: International Transfers</a>
            <a href="section8.html" class="nav-btn next-btn">Next: Best Practices →</a>
        </div>
    </main>
    <script>
        const trainingId = 'dataprivacy';
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

dp_s8 = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Best Practices | Data Privacy Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>Data Privacy Training</h2>
        </div>
        <ul class="toc-nav">
            <li><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li><a href="section3.html"><span class="toc-num">3</span> Data Principles</a></li>
            <li><a href="section4.html"><span class="toc-num">4</span> Data Subjects' Rights</a></li>
            <li><a href="section5.html"><span class="toc-num">5</span> Breach Management</a></li>
            <li><a href="section6.html"><span class="toc-num">6</span> International Transfers</a></li>
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
            <p class="subtitle">Daily habits to maintain the highest standards of privacy</p>
        </div>
        <div class="content-body">
            <h2>Privacy by Design</h2>
            <p>Don't add privacy as an afterthought. It should be built into every project, process, and system from the start.</p>
            <div class="info-card success">
                <div class="info-icon">🌟</div>
                <div>
                    <h3>Privacy Best Practices</h3>
                    <ul>
                        <li><strong>Minimize Collection:</strong> Don't collect data "just in case."</li>
                        <li><strong>Clear Notices:</strong> Help users understand why you need their information.</li>
                        <li><strong>Secure Sharing:</strong> Only use approved channels to share sensitive info.</li>
                        <li><strong>Prompt Deletion:</strong> Regularly clean up files that are no longer needed.</li>
                        <li><strong>Stay Informed:</strong> Privacy laws change rapidly; keep your training up to date.</li>
                    </ul>
                </div>
            </div>
            <h2>Dealing with Vendors</h2>
            <div class="key-points-grid">
                <div class="key-point-card">
                    <div class="kp-icon">🤝</div>
                    <h4>Due Diligence</h4>
                    <p>Verify that third-party vendors have strong privacy controls.</p>
                </div>
                <div class="key-point-card">
                    <div class="kp-icon">📝</div>
                    <h4>DPAs</h4>
                    <p>Ensure a Data Processing Agreement is signed before sharing data.</p>
                </div>
            </div>
            <div class="highlight-box">
                <h3>🏁 Final Summary</h3>
                <p>Data privacy is about respecting individual freedom and dignity. By following the law, adhering to the seven principles, and honoring data subjects' rights, we maintain our reputation as a trusted technology leader.</p>
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
        const trainingId = 'dataprivacy';
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

dp_quiz = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assessment | Data Privacy Training</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <style>
        .quiz-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .question-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .options { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
        .option { padding: 12px 15px; border: 2px solid #eef2f6; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .option:hover { background: #f8fafc; border-color: #cbd5e1; }
        .option.selected { background: #6366f1; border-color: #6366f1; color: white; }
        .result-screen { display: none; text-align: center; padding: 40px; }
        .score { font-size: 48px; font-weight: 800; color: #6366f1; margin-bottom: 10px; }
    </style>
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../ishantechnologies_logo.jpeg" alt="Ishan Technologies" class="sidebar-logo">
            <a href="../index.html" class="back-link">← Training Hub</a>
            <h2>Data Privacy Training</h2>
        </div>
        <ul class="toc-nav">
            <li><a href="index.html"><span class="toc-num">1</span> Introduction</a></li>
            <li><a href="section2.html"><span class="toc-num">2</span> Legal Framework</a></li>
            <li><a href="section3.html"><span class="toc-num">3</span> Data Principles</a></li>
            <li><a href="section4.html"><span class="toc-num">4</span> Data Subjects' Rights</a></li>
            <li><a href="section5.html"><span class="toc-num">5</span> Breach Management</a></li>
            <li><a href="section6.html"><span class="toc-num">6</span> International Transfers</a></li>
            <li><a href="section7.html"><span class="toc-num">7</span> Consequences</a></li>
            <li><a href="section8.html"><span class="toc-num">8</span> Best Practices</a></li>
            <li class="active"><a href="quiz.html"><span class="toc-num">📄</span> Assessment Quiz</a></li>
        </ul>
    </nav>
    <main class="main-content">
        <div class="quiz-container" id="quizContainer">
            <div class="question-card">
                <div class="breadcrumb">Question 1 of 5</div>
                <h3>Which principle of the DPDP Act states that we should only collect data for a specified purpose?</h3>
                <div class="options" data-correct="1">
                    <div class="option" onclick="selectOption(this, 0)">Data Accuracy</div>
                    <div class="option" onclick="selectOption(this, 1)">Purpose Limitation</div>
                    <div class="option" onclick="selectOption(this, 2)">Storage Limitation</div>
                    <div class="option" onclick="selectOption(this, 3)">Transparency</div>
                </div>
            </div>
            <div class="question-card">
                <div class="breadcrumb">Question 2 of 5</div>
                <h3>Under the DPDP Act, what is the maximum fine for failing to prevent a major data breach?</h3>
                <div class="options" data-correct="2">
                    <div class="option" onclick="selectOption(this, 0)">₹50 Crores</div>
                    <div class="option" onclick="selectOption(this, 1)">₹100 Crores</div>
                    <div class="option" onclick="selectOption(this, 2)">₹250 Crores</div>
                    <div class="option" onclick="selectOption(this, 3)">₹500 Crores</div>
                </div>
            </div>
            <div class="question-card">
                <div class="breadcrumb">Question 3 of 5</div>
                <h3>The "Right to be Forgotten" refers to which data subject right?</h3>
                <div class="options" data-correct="1">
                    <div class="option" onclick="selectOption(this, 0)">Right to access data</div>
                    <div class="option" onclick="selectOption(this, 1)">Right to erasure</div>
                    <div class="option" onclick="selectOption(this, 2)">Right to withdrawal of consent</div>
                    <div class="option" onclick="selectOption(this, 3)">Right to nomination</div>
                </div>
            </div>
            <div class="question-card">
                <div class="breadcrumb">Question 4 of 5</div>
                <h3>What is "Data Minimization"?</h3>
                <div class="options" data-correct="0">
                    <div class="option" onclick="selectOption(this, 0)">Collecting only the data that is absolutely necessary</div>
                    <div class="option" onclick="selectOption(this, 1)">Reducing the size of data files</div>
                    <div class="option" onclick="selectOption(this, 2)">Sharing data with fewer people</div>
                    <div class="option" onclick="selectOption(this, 3)">Deleting data after 24 hours</div>
                </div>
            </div>
            <div class="question-card">
                <div class="breadcrumb">Question 5 of 5</div>
                <h3>Which of the following is considered "Sensitive Personal Data"?</h3>
                <div class="options" data-correct="2">
                    <div class="option" onclick="selectOption(this, 0)">Your favorite color</div>
                    <div class="option" onclick="selectOption(this, 1)">Your work email address</div>
                    <div class="option" onclick="selectOption(this, 2)">Your biometric fingerprints</div>
                    <div class="option" onclick="selectOption(this, 3)">The city you live in</div>
                </div>
            </div>
            <button onclick="submitQuiz()" class="nav-btn next-btn" style="width: 100%; justify-content: center; margin-top: 20px; background: #6366f1; border-color: #6366f1;">Submit Assessment</button>
        </div>
        <div class="result-screen" id="resultScreen">
            <h2 id="resultTitle">Assessment Complete!</h2>
            <div class="score" id="scoreDisplay">0%</div>
            <p id="resultText">You have completed the Data Privacy training.</p>
            <a href="../index.html" class="nav-btn next-btn" style="margin-top: 20px; background: #6366f1; border-color: #6366f1;">Return to Training Hub</a>
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
                document.getElementById('resultText').textContent = 'Congratulations! You have successfully completed the Data Privacy training module.';
                localStorage.setItem('dataprivacy_passed', 'true');
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

os.chdir(r"c:\Users\pc\Desktop\IshanPolicyTraining\TrainingPrograms\DataPrivacy")
overwrite_file("section2.html", dp_s2)
overwrite_file("section3.html", dp_s3)
overwrite_file("section4.html", dp_s4)
overwrite_file("section5.html", dp_s5)
overwrite_file("section6.html", dp_s6)
overwrite_file("section7.html", dp_s7)
overwrite_file("section8.html", dp_s8)
overwrite_file("quiz.html", dp_quiz)
