import os

# Define paths
base_dir = r"c:\Users\pc\Desktop\IshanPolicyTraining\TrainingPrograms"

# Templates for injection
# We will inject imports at the top of the script tag
supabase_import = """
        import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
        import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabase-config.js';
        
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
"""

modules = {
    # FilePath -> (ModuleID, Hook, Style)
    "AntiCorruption/quiz.html": ("anticorruption", "localStorage.setItem('anticorruption_passed', passed);", "legacy"),
    "POSH/quiz.html": ("posh", "localStorage.setItem('posh_passed', passed);", "legacy"),
    "DataPrivacy/quiz.html": ("dataprivacy", "localStorage.setItem('dataprivacy_passed', 'true');", "new"),
    "HSE/quiz.html": ("hse", "localStorage.setItem('hse_passed', 'true');", "new"),
    "CyberSecurity/quiz.html": ("cybersecurity", "localStorage.setItem('cybersecurity_passed', 'true');", "new")
}

def get_upsert_code(module_id, style):
    if style == "legacy":
        # Uses 'passed' variable and 'score' variable (score is raw count out of 10)
        # We might want to normalize score to percentage? Schema expects integer. 
        # Legacy score is 0-10. New score is 0-100.
        # Let's save percentage for consistency. score * 10.
        return f"""
            if (passed) {{
                // Save to Supabase
                const percentageScore = score * 10;
                supabase.auth.getUser().then(async ({{ data: {{ user }} }}) => {{
                    if (user) {{
                         await supabase.from('user_progress').upsert({{
                            user_id: user.id,
                            module_id: '{module_id}',
                            status: 'completed',
                            score: percentageScore,
                            completed_at: new Date().toISOString()
                        }}, {{ onConflict: 'user_id, module_id' }});
                    }}
                }});
            }}
        """
    else:
        # Style "new": Inside if(score >= 80) block. 'score' is percentage (0-100).
        return f"""
                // Save to Supabase
                supabase.auth.getUser().then(async ({{ data: {{ user }} }}) => {{
                    if (user) {{
                         await supabase.from('user_progress').upsert({{
                            user_id: user.id,
                            module_id: '{module_id}',
                            status: 'completed',
                            score: score,
                            completed_at: new Date().toISOString()
                        }}, {{ onConflict: 'user_id, module_id' }});
                    }}
                }});
        """

def update_quiz(rel_path, module_id, hook_line, style):
    file_path = os.path.join(base_dir, rel_path)
    if not os.path.exists(file_path):
        print(f"Skipping {file_path}")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Inject Imports
    if '<script type="module">' not in content:
        # We need to make sure the script is type="module"
        # Since we know the structure, let's look for the main logic script.
        # In legacy: <script> ... const answers = ...
        # In new: <script> ... function selectOption ...
        
        # Strategy: Replace the LAST <script> tag with <script type="module">
        # and inject imports immediately after.
        last_script_idx = content.rfind('<script>')
        if last_script_idx == -1:
             print(f"No script tag found in {file_path}")
             return

        # Perform replacement
        content = content[:last_script_idx] + '<script type="module">' + supabase_import + content[last_script_idx+8:]
    
    # Check if we already injected imports (idempotency check roughly)
    if "import { createClient }" in content and '<script type="module">' in content:
         # Imports act as a marker, but if we just added them via replacement above, good.
         # If we are re-running, the imports block might be there but maybe not valid if we messed up.
         # Assuming clean slate or simple idempotency.
         pass

    # 2. Inject Logic
    if hook_line in content:
        # Check if already injected
        if f"module_id: '{module_id}'" in content:
            print(f"Already updated {file_path}")
            return

        upsert_block = get_upsert_code(module_id, style)
        content = content.replace(hook_line, hook_line + "\n" + upsert_block)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
    else:
        print(f"Hook not found in {file_path}")

for path, (mid, hook, style) in modules.items():
    update_quiz(path, mid, hook, style)
