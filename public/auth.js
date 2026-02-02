import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

// Initialize Client
// Standard initialization uses localStorage by default, which AuthSync component populates
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check Authentication
export async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        // Not logged in - Redirect to Login (use absolute path)
        window.location.href = '/';
    }

    return session;
}

// Check if user is admin
export async function checkAdminAuth() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        // Not logged in - Redirect to Login
        window.location.href = '/';
        return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user?.user_metadata?.is_admin === true || user?.email === 'adgautam94@gmail.com';

    if (!isAdmin) {
        // Not an admin - Redirect to training hub
        window.location.href = '/TrainingPrograms/';
        return null;
    }

    return { session, user };
}

// Logout Function
export async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error logging out:', error);
        alert('Error logging out. Please try again.');
    } else {
        // Redirect to login (use absolute path)
        window.location.href = '/';
    }
}

// Auto-run check on load (can be disabled if manual check preferred)
// For simple usage, we run it immediately
// Auto-run check on load REMOVED to prevent conflict with checkAdminAuth
// Pages should explicitly call checkAuth() or checkAdminAuth()
// if (window.location.pathname !== '/login.html' && window.location.pathname !== '/admin/index.html') {
//    checkAuth();
// }

