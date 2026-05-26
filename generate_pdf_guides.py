#!/usr/bin/env python3
"""
Generate Admin and Learner How-To guides as PDFs.
Dark theme matching the PPTX — same background, colours, and layout.
"""

from fpdf import FPDF

# ── Palette (matches the PPTX exactly) ───────────────────────────────────────
BG      = (11,  15,  25)    # #0B0F19  dark navy page background
CARD    = (20,  30,  50)    # slightly lighter card / panel
CARD2   = (30,  41,  59)    # step row background
PURPLE  = (139, 92,  246)   # #8B5CF6
CYAN    = (34,  211, 238)   # #22D3EE
PINK    = (236, 72,  153)   # #EC4899
ORANGE  = (251, 146, 60)    # #FB923C
WHITE   = (255, 255, 255)
LGRAY   = (203, 213, 225)   # slate-300
GRAY    = (148, 163, 184)   # slate-400
DGRAY   = (71,  85,  105)   # slate-600  (faint decorative text)

PW = 210   # A4 width  mm
PH = 297   # A4 height mm
LM = 16    # left margin
RM = 16    # right margin
CW = PW - LM - RM


# ── Base class ────────────────────────────────────────────────────────────────

class GuidePDF(FPDF):
    def __init__(self, accent=PURPLE):
        super().__init__()
        self.accent = accent
        self.set_margins(LM, 16, RM)
        self.set_auto_page_break(auto=True, margin=18)

    # Override to auto-fill dark background on every page
    def add_page(self, *args, **kwargs):
        super().add_page(*args, **kwargs)
        self._fill_bg()

    def _fill_bg(self):
        self.set_fill_color(*BG)
        self.rect(0, 0, PW, PH, "F")

    # Sanitise text so Helvetica (latin-1) never chokes on Unicode
    @staticmethod
    def _s(text):
        return (str(text)
                .replace("→", "->")
                .replace("←", "<-")
                .replace("•", "-")
                .replace("’", "'")
                .replace("‘", "'")
                .replace("“", '"')
                .replace("”", '"')
                .replace("—", "--")
                .replace("–", "-")
                .replace("·", "."))

    # Thin wrappers that sanitise text
    def cell(self, w=0, h=0, text="", *args, **kwargs):
        super().cell(w, h, self._s(text), *args, **kwargs)

    def multi_cell(self, w, h=0, text="", *args, **kwargs):
        super().multi_cell(w, h, self._s(text), *args, **kwargs)

    # ── Colour helpers ────────────────────────────────────────────────────────
    def fc(self, rgb): self.set_fill_color(*rgb)
    def tc(self, rgb): self.set_text_color(*rgb)
    def dc(self, rgb): self.set_draw_color(*rgb)

    def filled_rect(self, x, y, w, h, color):
        self.fc(color)
        self.rect(x, y, w, h, "F")

    # ── Shared page furniture ─────────────────────────────────────────────────
    def _header_bar(self, label=""):
        """Thin accent bar at top + optional section label."""
        self.filled_rect(0, 0, PW, 1.5, self.accent)
        if label:
            self.set_xy(LM, 4)
            self.tc(self.accent)
            self.set_font("Helvetica", "B", 8)
            self.cell(CW, 5, label.upper())

    def _footer(self):
        self.set_xy(LM, PH - 13)
        self.filled_rect(0, PH - 16, PW, 16, CARD)
        self.set_xy(LM, PH - 12)
        self.tc(GRAY)
        self.set_font("Helvetica", "", 8)
        self.cell(CW / 2, 5, "AA Plus Policy Training  |  training.aaplus.app")
        self.set_xy(LM, PH - 12)
        self.tc(GRAY)
        self.cell(CW, 5, f"Page {self.page_no()}", align="R")

    # ── COVER ─────────────────────────────────────────────────────────────────
    def cover(self, title, subtitle, role_label, accent):
        self.add_page()

        # Left accent bar (full height)
        self.filled_rect(0, 0, 5, PH, accent)

        # Decorative large faint circle (top-right)
        self.fc((20, 12, 45))
        self.dc((20, 12, 45))
        self.set_line_width(0)
        self.ellipse(PW - 55, -30, 90, 90, "F")

        # Brand pill
        self.filled_rect(LM + 6, 18, 80, 7, accent)
        self.set_xy(LM + 6, 18)
        self.tc(WHITE)
        self.set_font("Helvetica", "B", 8)
        self.cell(80, 7, "AA PLUS POLICY TRAINING PLATFORM")

        # Role badge
        self.fc(CARD2)
        self.dc(accent)
        self.set_line_width(0.4)
        self.rect(PW - RM - 36, 18, 36, 7, "FD")
        self.set_xy(PW - RM - 36, 18)
        self.tc(accent)
        self.set_font("Helvetica", "B", 8)
        self.cell(36, 7, role_label.upper(), align="C")

        # Title
        self.set_xy(LM + 6, 38)
        self.tc(WHITE)
        self.set_font("Helvetica", "B", 34)
        self.multi_cell(CW - 10, 13, title)

        # Accent rule
        self.filled_rect(LM + 6, self.get_y() + 2, 40, 1.5, accent)

        # Subtitle
        self.set_xy(LM + 6, self.get_y() + 6)
        self.tc(LGRAY)
        self.set_font("Helvetica", "", 13)
        self.multi_cell(CW - 10, 7, subtitle)

        # Bottom footer strip
        self.filled_rect(0, PH - 18, PW, 18, CARD)
        self.set_xy(LM + 6, PH - 13)
        self.tc(GRAY)
        self.set_font("Helvetica", "", 9)
        self.cell(CW, 6, "training.aaplus.app")

    # ── TABLE OF CONTENTS ─────────────────────────────────────────────────────
    def toc(self, sections, accent):
        self.add_page()
        self._header_bar()

        self.set_xy(LM, 10)
        self.tc(WHITE)
        self.set_font("Helvetica", "B", 22)
        self.cell(CW, 10, "What's Inside")
        self.filled_rect(LM, 22, 30, 1.5, accent)

        y = 28
        col_w = (CW - 4) / 2
        for i, (num, sec_title, items) in enumerate(sections):
            col = i % 2
            row = i // 2
            x = LM + col * (col_w + 4)
            cy = y + row * 62

            # Card
            self.filled_rect(x, cy, col_w, 58, CARD)
            # Number badge (circle approximated by small filled square with rounded look)
            self.filled_rect(x + 4, cy + 4, 11, 11, accent)
            self.set_xy(x + 4, cy + 4)
            self.tc(WHITE)
            self.set_font("Helvetica", "B", 9)
            self.cell(11, 11, num, align="C")

            # Section title
            self.set_xy(x + 19, cy + 6)
            self.tc(WHITE)
            self.set_font("Helvetica", "B", 11)
            self.cell(col_w - 22, 7, sec_title)

            # Divider
            self.filled_rect(x + 4, cy + 19, col_w - 8, 0.5, DGRAY)

            # Items
            for j, item in enumerate(items):
                self.set_xy(x + 6, cy + 23 + j * 9)
                self.tc(LGRAY)
                self.set_font("Helvetica", "", 9)
                self.cell(col_w - 10, 6, f"- {item}")

        self._footer()

    # ── SECTION DIVIDER ───────────────────────────────────────────────────────
    def section_divider(self, number, title, description="", accent=None):
        if accent is None:
            accent = self.accent
        self.add_page()
        self._header_bar()

        # Right panel (card colour)
        self.filled_rect(PW / 2, 0, PW / 2, PH, CARD)
        # Accent stripe between panels
        self.filled_rect(PW / 2 - 1.5, 0, 3, PH, accent)

        # Big faint number
        self.set_xy(LM, 18)
        self.tc(CARD)   # almost invisible against BG — just a ghost
        self.set_font("Helvetica", "B", 110)
        # Use draw color trick: render as outline by making text colour close to BG
        self.tc((25, 35, 60))
        self.cell(90, 70, number)

        # "SECTION" label
        self.set_xy(LM, 22)
        self.tc(accent)
        self.set_font("Helvetica", "B", 10)
        self.cell(80, 6, "SECTION")

        # Title
        self.set_xy(LM, 72)
        self.tc(WHITE)
        self.set_font("Helvetica", "B", 26)
        self.multi_cell(PW / 2 - LM - 4, 10, title)

        # Rule
        self.filled_rect(LM, self.get_y() + 3, 22, 1.5, accent)

        # Description
        if description:
            self.set_xy(LM, self.get_y() + 8)
            self.tc(LGRAY)
            self.set_font("Helvetica", "", 11)
            self.multi_cell(PW / 2 - LM - 8, 6, description)

        # Right panel label
        self.set_xy(PW / 2 + 8, PH - 28)
        self.tc(GRAY)
        self.set_font("Helvetica", "", 9)
        self.cell(PW / 2 - 16, 6, "AA Plus Policy Training Platform")

        self._footer()

    # ── STEPS PAGE ────────────────────────────────────────────────────────────
    def steps_page(self, section_label, title, steps, note="", accent=None):
        if accent is None:
            accent = self.accent
        self.add_page()

        # Left accent bar
        self.filled_rect(0, 0, 4, PH, accent)

        # Section label chip
        self.filled_rect(LM, 10, 50, 6, accent)
        self.set_xy(LM, 10)
        self.tc(WHITE)
        self.set_font("Helvetica", "B", 7)
        self.cell(50, 6, section_label.upper())

        # Title
        self.set_xy(LM, 20)
        self.tc(WHITE)
        self.set_font("Helvetica", "B", 17)
        self.multi_cell(CW, 8, title)

        # Rule
        self.filled_rect(LM, self.get_y() + 1, 18, 1.2, accent)

        y = self.get_y() + 5

        for i, step in enumerate(steps):
            if isinstance(step, str):
                header, detail = step, ""
            else:
                header = step[0]
                detail = step[1] if len(step) > 1 else ""

            row_h = 13 if not detail else 20

            # Row card
            self.filled_rect(LM, y, CW, row_h, CARD)

            # Number pill
            self.filled_rect(LM, y, 9, row_h, accent)
            self.set_xy(LM, y + row_h / 2 - 4)
            self.tc(WHITE)
            self.set_font("Helvetica", "B", 9)
            self.cell(9, 8, str(i + 1), align="C")

            # Connector line between steps
            if i < len(steps) - 1:
                self.filled_rect(LM + 4, y + row_h, 1.5, 3, DGRAY)

            # Header
            self.set_xy(LM + 13, y + 3)
            self.tc(WHITE)
            self.set_font("Helvetica", "B", 10)
            self.multi_cell(CW - 15, 5, header)

            # Detail
            if detail:
                self.set_xy(LM + 13, y + 10)
                self.tc(LGRAY)
                self.set_font("Helvetica", "", 9)
                self.multi_cell(CW - 15, 5, detail)

            y += row_h + 3

            if y > PH - 38:
                self._footer()
                self.add_page()
                self.filled_rect(0, 0, 4, PH, accent)
                self.set_xy(LM, 10)
                self.tc(GRAY)
                self.set_font("Helvetica", "", 9)
                self.cell(CW, 5, f"{title} (continued)")
                y = 20

        # Tip note
        if note and y < PH - 28:
            self.filled_rect(LM, y + 2, CW, 13, CARD2)
            self.filled_rect(LM, y + 2, 3, 13, CYAN)
            self.set_xy(LM + 6, y + 4)
            self.tc(LGRAY)
            self.set_font("Helvetica", "B", 8)
            self.cell(12, 5, "Tip:")
            self.set_xy(LM + 18, y + 4)
            self.tc(LGRAY)
            self.set_font("Helvetica", "I", 8)
            self.multi_cell(CW - 20, 5, note)

        self._footer()

    # ── SUMMARY / CLOSING ─────────────────────────────────────────────────────
    def summary(self, title, points, accent=None):
        if accent is None:
            accent = self.accent
        self.add_page()

        # Top accent bar
        self.filled_rect(0, 0, PW, 2, accent)

        self.set_xy(LM, 8)
        self.tc(WHITE)
        self.set_font("Helvetica", "B", 22)
        self.cell(CW, 10, title, align="C")
        self.filled_rect(PW / 2 - 18, 20, 36, 1.2, accent)

        col_w = (CW - 5) / 2
        y_start = 26
        row_h = 38

        for i, (heading, body) in enumerate(points):
            col = i % 2
            row = i // 2
            x = LM + col * (col_w + 5)
            cy = y_start + row * (row_h + 4)

            self.filled_rect(x, cy, col_w, row_h, CARD)
            self.filled_rect(x, cy, col_w, 2, accent)

            self.set_xy(x + 4, cy + 6)
            self.tc(WHITE)
            self.set_font("Helvetica", "B", 10)
            self.cell(col_w - 8, 6, heading)

            self.set_xy(x + 4, cy + 15)
            self.tc(LGRAY)
            self.set_font("Helvetica", "", 9)
            self.multi_cell(col_w - 8, 5, body)

        # Footer card
        rows = ((len(points) - 1) // 2) + 1
        footer_y = y_start + rows * (row_h + 4) + 6
        self.filled_rect(LM, footer_y, CW, 14, CARD2)
        self.filled_rect(LM, footer_y, 3, 14, accent)
        self.set_xy(LM + 6, footer_y + 4)
        self.tc(LGRAY)
        self.set_font("Helvetica", "", 9)
        self.cell(CW - 8, 6,
                  "Questions? Contact your organisation admin or visit training.aaplus.app",
                  align="C")

        self._footer()


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN GUIDE
# ═══════════════════════════════════════════════════════════════════════════════

def build_admin_pdf():
    pdf = GuidePDF(accent=PURPLE)

    pdf.cover(
        title="Admin\nHow-To Guide",
        subtitle="A complete reference for managing your\norganisation's compliance training",
        role_label="Admin",
        accent=PURPLE,
    )

    pdf.toc([
        ("01", "Inviting & Managing Users",
         ["Single & bulk user invitations", "Changing user roles", "Revoking access"]),
        ("02", "Departments & Module Assignment",
         ["Create departments", "Assign users", "Enable modules", "Set deadlines"]),
        ("03", "Reports & Compliance Tracking",
         ["Compliance dashboard", "Audit log export", "Certificate downloads"]),
        ("04", "AI Policy & Org Settings",
         ["AI policy quiz", "Upload organisation logo", "POSH / ICC details"]),
    ], accent=PURPLE)

    # ── Section 01 ─────────────────────────────────────────────────────────────
    pdf.section_divider("01", "Inviting &\nManaging Users",
        "Add individuals or bulk-import teams,\nassign roles, and control access.",
        accent=PURPLE)

    pdf.steps_page("Section 01 — User Management", "Invite a Single User", [
        ("Go to Admin Dashboard -> Users tab",
         "Click Users in the top navigation of the admin panel."),
        ("Click the Invite User button",
         "Found in the top-right corner of the Users tab."),
        ("Enter the user's full name and email address",
         "Both fields are required to send the invitation."),
        ("Select a role: Learner or Manager",
         "Managers can view their team's compliance status in addition to their own training."),
        ("(Optional) Select a department",
         "Assigns the user to a team and filters their module list accordingly."),
        ("Click Send Invite",
         "The user receives a setup email with a secure link valid for 7 days."),
    ], note="If the link expires, resend it from the Users tab -- click ... next to the user.", accent=PURPLE)

    pdf.steps_page("Section 01 — User Management", "Bulk Import Users via CSV", [
        ("Go to Admin Dashboard -> Users tab", ""),
        ("Click Bulk Invite and download the CSV template",
         "The template has Name, Email, and Department columns."),
        ("Fill in one user per row and save the file",
         "Department names must match exactly what exists in the platform."),
        ("Upload the completed CSV file",
         "Drag and drop or click Browse to select the file."),
        ("Review the preview list for any errors",
         "Rows with invalid or duplicate emails are highlighted in red."),
        ("Click Send All Invites",
         "Each user receives an individual invitation email."),
    ], note="Always use the downloaded template -- custom column orders will cause import errors.", accent=PURPLE)

    pdf.steps_page("Section 01 — User Management", "Change a User's Role", [
        ("Go to Admin Dashboard -> Users tab", ""),
        ("Find the user using the search bar",
         "Search by name or email address."),
        ("Click the role badge next to their name",
         "The badge shows their current role: Learner or Manager."),
        ("Select the new role from the dropdown", ""),
        ("The change takes effect immediately",
         "No email is sent -- the user sees their new access on next login."),
    ], note="Admins cannot demote themselves. Ask another admin or your SuperAdmin to change your role.", accent=PURPLE)

    pdf.steps_page("Section 01 — User Management", "Revoke User Access", [
        ("Go to Admin Dashboard -> Users tab", ""),
        ("Find the user and click the ... menu",
         "The three-dot menu appears at the right of each user row."),
        ("Select Revoke Access", ""),
        ("Confirm the action in the dialog",
         "This is immediate and cannot be undone from this screen."),
        ("The user is signed out instantly",
         "They can no longer log in or access any training content."),
    ], note="Revoked users can be re-invited at any time using the same email address.", accent=PURPLE)

    # ── Section 02 ─────────────────────────────────────────────────────────────
    pdf.section_divider("02", "Departments &\nModule Assignment",
        "Structure your organisation into teams and\ncontrol which training each team sees.",
        accent=CYAN)

    pdf.steps_page("Section 02 — Departments & Modules", "Create a Department", [
        ("Go to Admin Dashboard -> Departments tab", ""),
        ("Click Add Department", ""),
        ("Enter a department name (e.g. Finance, Legal, HR)",
         "Names must be unique within your organisation."),
        ("Click Save",
         "The department is immediately available for user and module assignment."),
        ("(Optional) Enable RPT Simulator for the department",
         "Toggle the simulator switch on the department card."),
    ], note="You can only delete a department if it has no assigned users.", accent=CYAN)

    pdf.steps_page("Section 02 — Departments & Modules", "Assign Users to a Department", [
        ("Go to Admin Dashboard -> Users tab", ""),
        ("Select one or more users using the checkboxes",
         "Tick the header checkbox to select every visible user at once."),
        ("Click Assign Department in the bulk-action toolbar",
         "The toolbar appears at the top when one or more users are selected."),
        ("Choose the target department from the dropdown", ""),
        ("Click Confirm",
         "Users are reassigned instantly; their module list updates automatically."),
    ], note="A user can only belong to one department at a time.", accent=CYAN)

    pdf.steps_page("Section 02 — Departments & Modules", "Enable a Module for Your Organisation", [
        ("Go to Admin Dashboard -> Modules & Compliance tab", ""),
        ("Locate the policy module you want to activate",
         "Modules include Anti-Corruption, POSH, Data Privacy, Cybersecurity, and more."),
        ("Toggle the Enable switch to ON", ""),
        ("Choose scope: All Employees or specific departments", ""),
        ("Click Save",
         "The module appears on the dashboards of assigned users immediately."),
    ], note="Disabling a module hides it from users but preserves all existing completion records.", accent=CYAN)

    pdf.steps_page("Section 02 — Departments & Modules", "Set a Module Deadline", [
        ("Go to Admin Dashboard -> Modules & Compliance tab", ""),
        ("Click the calendar icon next to the active module",
         "Only enabled modules can have deadlines assigned."),
        ("Pick a due date from the date picker", ""),
        ("Click Save",
         "The deadline is displayed on every assigned user's dashboard."),
        ("Overdue warnings appear automatically",
         "Users who miss the deadline see a red banner on their dashboard."),
    ], note="Set deadlines at least 2 weeks ahead to give users adequate time to complete training.", accent=CYAN)

    # ── Section 03 ─────────────────────────────────────────────────────────────
    pdf.section_divider("03", "Reports &\nCompliance Tracking",
        "Monitor training progress, export audit records,\nand download certificates.",
        accent=PINK)

    pdf.steps_page("Section 03 — Reports", "View the Compliance Dashboard", [
        ("Go to Admin Dashboard -> Reports tab", ""),
        ("View the compliance overview chart",
         "Shows the percentage of employees who have completed all assigned modules."),
        ("Use the date range filter to refine the view",
         "Compare progress across different time periods."),
        ("Click a department bar to drill down",
         "See the completion status for every individual in that team."),
        ("Switch to the Leaderboard tab",
         "View top-performing employees ranked by training completion."),
    ], note="The compliance % only counts modules that are marked as required for the organisation.", accent=PINK)

    pdf.steps_page("Section 03 — Reports", "Export the Audit Log", [
        ("Go to Admin Dashboard -> Reports tab -> Audit Log", ""),
        ("Set the date range filter (From / To)",
         "Leave blank to export the full available history."),
        ("Click Export CSV",
         "The file downloads to your computer immediately."),
        ("Open in Excel or Google Sheets",
         "The log includes logins, quiz attempts, completions, and all admin actions."),
    ], note="Audit logs are retained for the past 12 months.", accent=PINK)

    pdf.steps_page("Section 03 — Reports", "Download Certificates", [
        ("Go to Admin Dashboard -> Reports tab", ""),
        ("Click Bulk Download Certificates", ""),
        ("Select the module and date range",
         "Filter by completion date to get a specific cohort's certificates."),
        ("Click Export",
         "A ZIP file of individual PDF certificates is downloaded."),
        ("To view a single user's certificate:",
         "Find the user in the Users tab -> click View Certificate."),
    ], note="Certificates display your organisation logo -- upload it in Settings first.", accent=PINK)

    # ── Section 04 ─────────────────────────────────────────────────────────────
    pdf.section_divider("04", "AI Policy &\nOrg Settings",
        "Configure AI use policy tier, upload branding,\nand set up POSH committee details.",
        accent=ORANGE)

    pdf.steps_page("Section 04 — AI Policy & Settings", "Run the AI Policy Quiz", [
        ("Go to Admin Dashboard -> AI Policy tab", ""),
        ("Read the four policy assessment questions carefully",
         "Questions cover how your organisation uses AI across different workflows."),
        ("Answer each question based on your organisation's actual AI usage",
         "Examples: invoice processing, legal document drafting, data anonymisation."),
        ("The platform assigns a tier automatically",
         "Tier 1: Restricted Use  |  Tier 2: Standard  |  Tier 3: Responsible Use"),
        ("The matching AI training module is assigned to all users",
         "Users see the new module on their dashboard immediately."),
    ], note="Re-run the quiz any time your organisation's AI practices change.", accent=ORANGE)

    pdf.steps_page("Section 04 — AI Policy & Settings", "Upload Your Organisation Logo", [
        ("Go to Admin -> Settings (gear icon in the sidebar)", ""),
        ("Scroll to the Organisation Logo section", ""),
        ("Click Upload Logo",
         "Supported formats: PNG, JPG -- maximum file size 2 MB."),
        ("Preview the logo in the thumbnail",
         "Ensure it looks clear and well-cropped at small sizes."),
        ("Click Save",
         "The logo appears on all new and existing user certificates."),
    ], note="A square or landscape logo with a transparent background produces the best results.", accent=ORANGE)

    pdf.steps_page("Section 04 — AI Policy & Settings", "Configure POSH / ICC Details", [
        ("Go to Admin -> POSH Policy (via the sidebar)", ""),
        ("Enter your company's registered address and helpline number", ""),
        ("Enter the Presiding Officer's name and contact details",
         "The Presiding Officer chairs the Internal Complaints Committee (ICC)."),
        ("Add all IC members with their names and designations", ""),
        ("Click Save",
         "Details are embedded in the POSH policy module content shown to users."),
    ], note="Update these details immediately whenever your ICC membership changes.", accent=ORANGE)

    pdf.summary("You're All Set!", [
        ("Invite & Manage Users",
         "Single invites, bulk CSV imports, role changes, and access revocation."),
        ("Departments & Modules",
         "Create teams, enable required training, and set completion deadlines."),
        ("Reports & Compliance",
         "Monitor compliance, export audit logs, and download certificates."),
        ("AI Policy & Settings",
         "AI policy tier, organisation logo, and POSH/ICC configuration."),
        ("Need Help?",
         "Contact support via training.aaplus.app or your SuperAdmin."),
        ("Keep Updated",
         "Re-run the AI policy quiz and update ICC details whenever they change."),
    ], accent=PURPLE)

    out = r"c:\Users\pc\Desktop\PolicyTraining\public\guides\AA_Plus_Admin_How-To_Guide.pdf"
    pdf.output(out)
    print(f"Saved: {out}")


# ═══════════════════════════════════════════════════════════════════════════════
# LEARNER GUIDE
# ═══════════════════════════════════════════════════════════════════════════════

def build_learner_pdf():
    pdf = GuidePDF(accent=CYAN)

    pdf.cover(
        title="Learner\nHow-To Guide",
        subtitle="Everything you need to complete your compliance\ntraining with confidence",
        role_label="Learner",
        accent=CYAN,
    )

    pdf.toc([
        ("01", "Getting Started",
         ["First login & password setup", "Navigating your dashboard"]),
        ("02", "Completing Training",
         ["Starting a module", "Navigating slides", "Taking & passing the quiz", "Retaking the quiz"]),
        ("03", "Your Certificates",
         ["Viewing your certificate", "Printing", "Sharing on LinkedIn"]),
        ("04", "Deadlines & Recertification",
         ["Understanding deadlines", "Overdue warnings", "Annual renewal"]),
    ], accent=CYAN)

    # ── Section 01 ─────────────────────────────────────────────────────────────
    pdf.section_divider("01", "Getting Started",
        "Log in for the first time and find your\nway around the dashboard.",
        accent=CYAN)

    pdf.steps_page("Section 01 — Getting Started", "Log In for the First Time", [
        ("Check your email for an invitation from AA Plus",
         "Subject line: 'You've been invited to AA Plus Policy Training'"),
        ("Click the Set Up Your Account link in the email",
         "The link is valid for 7 days. Contact your admin if it has expired."),
        ("You are taken to the password creation page", ""),
        ("Enter a strong password and confirm it",
         "Minimum 8 characters -- mix letters, numbers, and symbols for best security."),
        ("Click Save Password",
         "You are logged in automatically and taken straight to your training dashboard."),
    ], note="Bookmark training.aaplus.app for quick access in future sessions.", accent=CYAN)

    pdf.steps_page("Section 01 — Getting Started", "Navigate Your Dashboard", [
        ("The large ring shows your overall completion %",
         "It fills as you complete each assigned module."),
        ("Module cards list all your assigned training topics",
         "Each card shows the policy name, current status, and deadline."),
        ("Status labels: Not Started / In Progress / Completed",
         "A green tick appears on fully completed modules."),
        ("A red banner appears if any module is overdue",
         "Complete overdue modules as soon as possible."),
        ("Click any module card to start or resume training",
         "Your progress is saved automatically -- pick up where you left off."),
    ], note="Your dashboard updates in real time as you complete each module.", accent=CYAN)

    # ── Section 02 ─────────────────────────────────────────────────────────────
    pdf.section_divider("02", "Completing Training",
        "Work through training slides and pass the assessment\nquiz to earn your certificate.",
        accent=PURPLE)

    pdf.steps_page("Section 02 — Training", "Start a Module", [
        ("From your dashboard, click on a module card", ""),
        ("Read the module overview and learning objectives",
         "This gives you a clear preview of what the training covers."),
        ("Click Start Training to begin", ""),
        ("Your progress is saved automatically",
         "You can close the browser at any time and resume later."),
        ("The module reopens exactly where you left off",
         "Look for the Continue button on the module card on your dashboard."),
    ], note="Read every slide carefully -- quiz questions are drawn from the training content.", accent=PURPLE)

    pdf.steps_page("Section 02 — Training", "Navigate Training Slides", [
        ("Click Next to advance through slides", ""),
        ("Click Back to review a previous slide",
         "You can revisit any slide as many times as needed."),
        ("The progress bar at the top shows how far you have come",
         "e.g. Slide 6 of 14."),
        ("Some slides have interactive elements",
         "Read them carefully before proceeding -- they reinforce key points."),
        ("After the last slide, the quiz becomes available",
         "Click Take Quiz to start the assessment."),
    ], note="There is no time limit on slides -- take your time to read thoroughly before moving on.", accent=PURPLE)

    pdf.steps_page("Section 02 — Training", "Take the Quiz", [
        ("After the last slide, click Take Quiz", ""),
        ("Answer all 10 multiple-choice questions",
         "Only one answer is correct per question -- choose carefully."),
        ("You need 70% (7 out of 10) to pass", ""),
        ("Questions are randomly selected from a larger question bank",
         "Each attempt presents a different set of questions."),
        ("Your score is shown immediately after submission",
         "Pass: your certificate is generated automatically."),
    ], note="Re-read the module slides if you are unsure before submitting the quiz.", accent=PURPLE)

    pdf.steps_page("Section 02 — Training", "Retake the Quiz (If You Don't Pass)", [
        ("If your score is below 70%, click Retake Quiz", ""),
        ("A new randomised set of 10 questions is generated",
         "The question bank has more than 10 questions, so expect variety each attempt."),
        ("Review the module slides before retrying",
         "Focus on topics where you felt less confident."),
        ("There is no limit on retakes",
         "Keep going -- you will get there!"),
        ("Once you pass, your certificate is issued immediately",
         "It appears on your dashboard and in the certificate view."),
    ], note="Most learners pass within 1-2 attempts after reviewing the slides.", accent=PURPLE)

    # ── Section 03 ─────────────────────────────────────────────────────────────
    pdf.section_divider("03", "Your Certificates",
        "View, print, and share your proof of completion.",
        accent=PINK)

    pdf.steps_page("Section 03 — Certificates", "View Your Certificate", [
        ("After passing the quiz, your certificate is generated automatically", ""),
        ("Click View Certificate on the result screen",
         "Or find it via your dashboard -- click the module card then View Certificate."),
        ("The certificate shows your name, module, score, and completion date",
         "Your organisation's logo appears in the top corner."),
        ("Certificates are valid for 12 months from the date of issue",
         "The expiry date is shown at the bottom of the certificate."),
        ("All your certificates are stored in your dashboard",
         "Access them any time -- they never disappear from your account."),
    ], note="If your name appears incorrectly, contact your admin to update your profile.", accent=PINK)

    pdf.steps_page("Section 03 — Certificates", "Print Your Certificate", [
        ("Open your certificate from the dashboard or result screen", ""),
        ("Click the Print button in the top-right corner", ""),
        ("The browser print dialog opens", ""),
        ("Select your printer, or choose Save as PDF",
         "Saving as PDF lets you email or archive it without printing."),
        ("The certificate is formatted for A4 / Letter paper",
         "Choose portrait orientation for the best result."),
    ], note="Use 'Save as PDF' to keep a digital copy without needing to print.", accent=PINK)

    pdf.steps_page("Section 03 — Certificates", "Share on LinkedIn", [
        ("Open your certificate page", ""),
        ("Click the Share on LinkedIn button", ""),
        ("A LinkedIn post is pre-filled with your certification details",
         "Module name, score, and organisation are included automatically."),
        ("Customise the post caption if you wish", ""),
        ("Click Post",
         "Your network can see your compliance achievement!"),
    ], note="You may need to log in to LinkedIn if you are not already signed in.", accent=PINK)

    # ── Section 04 ─────────────────────────────────────────────────────────────
    pdf.section_divider("04", "Deadlines &\nRecertification",
        "Stay on top of due dates and renew your\ncertifications every year.",
        accent=ORANGE)

    pdf.steps_page("Section 04 — Deadlines", "Understanding Module Deadlines", [
        ("Deadlines are set by your organisation's admin", ""),
        ("Your dashboard shows the due date on each module card",
         "e.g. 'Due: 30 June 2026'"),
        ("A countdown appears as the deadline approaches",
         "You will see warnings like '5 days remaining'."),
        ("Complete the module before the deadline",
         "No further action is needed once you have passed the quiz."),
        ("If you need more time, contact your manager or admin",
         "Only admins can extend module deadlines."),
    ], note="Start modules early -- the quiz may take a couple of attempts to pass.", accent=ORANGE)

    pdf.steps_page("Section 04 — Deadlines", "Overdue Warnings", [
        ("If a module is past its deadline, a red Overdue banner appears",
         "The banner is shown prominently at the top of your dashboard."),
        ("The overdue module card is highlighted with a warning border", ""),
        ("Complete the overdue module as soon as possible",
         "Your compliance status remains incomplete until you pass."),
        ("Contact your manager or admin if you need an extension",
         "Admins can adjust the deadline from their dashboard."),
        ("Your compliance status updates instantly once you pass",
         "The overdue warning disappears and your completion percentage increases."),
    ], note="Overdue status is visible to your manager -- act quickly to resolve it.", accent=ORANGE)

    pdf.steps_page("Section 04 — Deadlines", "Recertification -- Annual Renewal", [
        ("Certificates are valid for 12 months from completion date", ""),
        ("30 days before expiry, a warning appears on your dashboard",
         "The module card shows 'Expiring Soon'."),
        ("Click Recertify on the module card", ""),
        ("Complete the training slides and quiz again",
         "Content may be updated -- read it carefully even if you are familiar with it."),
        ("Pass the quiz to receive a new certificate",
         "The new certificate resets your 12-month validity period."),
    ], note="Recertification keeps your compliance record continuous -- do not let it lapse.", accent=ORANGE)

    pdf.summary("You're Ready to Learn!", [
        ("First Login",
         "Check your invitation email, set your password, and log in."),
        ("Complete Modules",
         "Read every slide, then take the quiz. 70% to pass. Unlimited retakes."),
        ("Certificates",
         "Issued automatically on passing. Valid for 12 months."),
        ("Share on LinkedIn",
         "Celebrate your achievement with your professional network."),
        ("Watch Deadlines",
         "Complete modules before the due date shown on your dashboard."),
        ("Recertify Annually",
         "Renew each certificate within 30 days of the expiry warning."),
    ], accent=CYAN)

    out = r"c:\Users\pc\Desktop\PolicyTraining\public\guides\AA_Plus_Learner_How-To_Guide.pdf"
    pdf.output(out)
    print(f"Saved: {out}")


if __name__ == "__main__":
    build_admin_pdf()
    build_learner_pdf()
    print("Done.")
