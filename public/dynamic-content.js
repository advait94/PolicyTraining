
console.log('DEBUG: dynamic-content.js module loaded');
import { supabase } from './auth.js';

async function injectDynamicContent() {
    try {
        console.log('Fetching organization config...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('No user logged in or auth error:', authError);
            return;
        }
        console.log('User found:', user.id);

        // Get User's Org ID
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('organization_id')
            .eq('id', user.id)
            .single();

        if (userError || !userData || !userData.organization_id) {
            console.error('Organization fetch error for user:', userError);
            return;
        }
        console.log('User Org ID:', userData.organization_id);

        // Get Org Details
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', userData.organization_id)
            .single();

        if (orgError || !org) {
            console.error('Organization details fetch error:', orgError);
            return;
        }

        console.log('Applying config for:', org.name, org);

        // Define mappings: ID -> Value
        const updates = {
            'org-display-name': org.display_name || org.name,
            'org-support-email': org.support_email,
            'org-helpline': org.helpline_number,
            'org-posh-email': org.posh_ic_email,
            'org-commitment-title': `${org.display_name || org.name} Commitment`
        };

        // Apply text updates (ID based)
        for (const [id, value] of Object.entries(updates)) {
            const el = document.getElementById(id);
            if (el && value) {
                if (el.tagName === 'A') {
                    if (id.includes('email')) el.href = `mailto:${value}`;
                    if (id.includes('helpline')) el.href = `tel:${value}`;
                }
                el.textContent = value;
            }
        }

        // Apply text updates (Class based - for multiple instances)
        const classUpdates = {
            '.dynamic-org-name': org.display_name || org.name,
            '.dynamic-support-email': org.support_email,
            '.dynamic-posh-email': org.posh_ic_email
        };

        for (const [selector, value] of Object.entries(classUpdates)) {
            if (!value) continue;
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el.tagName === 'A' && selector.includes('email')) {
                    el.href = `mailto:${value}`;
                }
                el.textContent = value;
            });
        }

    } catch (error) {
        console.error('Dynamic content injection failed:', error);
    }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectDynamicContent);
} else {
    injectDynamicContent();
}
