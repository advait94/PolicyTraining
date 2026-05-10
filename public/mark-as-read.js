/* mark-as-read.js
 * Adds server-side "Mark as Read" tracking to static training section pages.
 * Replaces the existing localStorage-only "Next" button with a button that
 * saves progress via /api/progress/mark-read, then navigates forward.
 * Also dims the quiz sidebar link until all sections are complete.
 */
(function () {
    // Total section counts per module slug (used for progress % and quiz gating)
    var TOTALS = {
        anticorruption: 8,
        cybersecurity:  8,
        dataprivacy:    8,
        hse:            8,
        posh:           12   // Comprehensive POSH module has 12 slides
    };

    // ─── Derive module info from the URL path ──────────────────────────────
    function getModuleInfo() {
        var p = window.location.pathname.toLowerCase();
        // Subfolder versions share the parent slug but have smaller section counts
        if (p.indexOf('/posh/posh/') !== -1)         return { slug: 'posh', total: 8 };
        if (p.indexOf('/hse/hse/')   !== -1)          return { slug: 'hse',  total: 8 };
        if (p.indexOf('/anticorruption/') !== -1)     return { slug: 'anticorruption', total: 8 };
        if (p.indexOf('/cybersecurity/')  !== -1)     return { slug: 'cybersecurity',  total: 8 };
        if (p.indexOf('/dataprivacy/')    !== -1)     return { slug: 'dataprivacy',    total: 8 };
        if (p.indexOf('/hse/')  !== -1)               return { slug: 'hse',  total: 8 };
        if (p.indexOf('/posh/') !== -1)               return { slug: 'posh', total: TOTALS.posh };
        return null;
    }

    function getSectionNum() {
        var filename = window.location.pathname.split('/').pop().toLowerCase();
        if (!filename || filename === 'index.html') return 1;
        var m = filename.match(/section(\d+)\.html/);
        return m ? parseInt(m[1], 10) : null;
    }

    // ─── Fetch server-side read status ────────────────────────────────────
    async function loadStatus(slug) {
        try {
            var r = await fetch('/api/progress/module-status?module=' + slug);
            if (!r.ok) return [];
            var data = await r.json();
            return data.sectionsRead || [];
        } catch (_) { return []; }
    }

    // ─── Update sidebar TOC and progress bar ─────────────────────────────
    function renderSidebarProgress(sectionsRead, info) {
        // Checkmarks on completed TOC items
        document.querySelectorAll('.toc-nav li').forEach(function (li) {
            var span = li.querySelector('.toc-num');
            if (!span) return;
            var num = parseInt(span.innerText, 10);
            if (isNaN(num)) return;
            if (sectionsRead.indexOf(num) !== -1) {
                li.classList.add('completed');
                var a = li.querySelector('a');
                if (a && !a.querySelector('.mar-check')) {
                    var chk = document.createElement('span');
                    chk.className = 'mar-check';
                    chk.textContent = ' ✓';
                    chk.style.cssText = 'color:#22c55e;font-weight:700;font-size:0.8em;margin-left:2px;';
                    a.appendChild(chk);
                }
            }
        });

        // Dim the quiz link until all sections are read
        var quizLink = document.querySelector('.toc-nav a[href="quiz.html"]');
        if (quizLink) {
            if (sectionsRead.length >= info.total) {
                quizLink.style.cssText = '';
                quizLink.removeAttribute('title');
            } else {
                quizLink.style.cssText = 'opacity:0.35;pointer-events:none;cursor:not-allowed;';
                quizLink.title = 'Complete all ' + info.total + ' sections first (' + sectionsRead.length + '/' + info.total + ' done)';
            }
        }

        // Progress bar (may not exist on all pages)
        var pct   = Math.round(sectionsRead.length / info.total * 100);
        var elPct  = document.getElementById('progressPercent');
        var elFill = document.getElementById('progressFill');
        if (elPct)  elPct.textContent     = pct + '%';
        if (elFill) elFill.style.width    = pct + '%';
    }

    // ─── Replace the "Next →" anchor with a "Mark as Read" button ─────────
    function replaceNextButton(sectionNum, info, sectionsRead) {
        // Support both .next-btn anchor and the last .nav-btn in the footer
        var link = document.querySelector('.navigation-footer .next-btn')
                || document.querySelector('.navigation-footer a.nav-btn:last-child');
        if (!link) return;

        var dest       = link.getAttribute('href');
        var alreadyRead = sectionsRead.indexOf(sectionNum) !== -1;

        var btn = document.createElement('button');
        btn.type      = 'button';
        btn.className = link.className; // inherits .nav-btn .next-btn styling
        btn.innerHTML = alreadyRead
            ? '&#10003; Already Read &mdash; Continue &rarr;'
            : '&#10003; Mark as Read &amp; Continue &rarr;';

        if (alreadyRead) {
            btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            btn.style.borderColor = '#16a34a';
        }

        btn.addEventListener('click', async function () {
            btn.disabled     = true;
            btn.textContent  = 'Saving…';
            btn.style.opacity = '0.7';
            try {
                await fetch('/api/progress/mark-read', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ moduleSlug: info.slug, sectionNum: sectionNum })
                });
            } catch (_) { /* still navigate even if save fails */ }
            window.location.href = dest;
        });

        link.replaceWith(btn);
    }

    // ─── Entry point ──────────────────────────────────────────────────────
    function init() {
        var info       = getModuleInfo();
        var sectionNum = getSectionNum();
        if (!info || !sectionNum) return;

        loadStatus(info.slug).then(function (sectionsRead) {
            renderSidebarProgress(sectionsRead, info);
            replaceNextButton(sectionNum, info, sectionsRead);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
