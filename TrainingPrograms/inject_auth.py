import os

# Define the root directory
params_dir = r"c:\Users\pc\Desktop\IshanPolicyTraining\TrainingPrograms"

# The script tag to inject
auth_script = '\n    <!-- Auth Guard -->\n    <script type="module" src="../auth.js"></script>'

# Modules to update
modules = ["AntiCorruption", "POSH", "DataPrivacy", "HSE", "CyberSecurity"]

def inject_auth(file_path):
    print(f"Processing {file_path}")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        print(f"UTF-8 decode failed for {file_path}, trying latin-1")
        with open(file_path, 'r', encoding='latin-1') as f:
            content = f.read()
    
    # Check if already has auth.js
    if "auth.js" in content:
        print(f"Skipping {file_path} (already present)")
        return
    
    # Inject before </head>
    if "</head>" in content:
        new_content = content.replace("</head>", f"{auth_script}\n</head>")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Injected auth into {file_path}")
    else:
        print(f"Warning: No </head> in {file_path}")

for module in modules:
    module_path = os.path.join(params_dir, module)
    if os.path.exists(module_path):
        for filename in os.listdir(module_path):
            if filename.endswith(".html"):
                inject_auth(os.path.join(module_path, filename))
