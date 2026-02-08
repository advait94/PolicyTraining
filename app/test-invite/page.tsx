'use client';

import { useState } from 'react';
import { testInvite, deleteTestUser } from './actions';

export default function TestPage() {
    const [result, setResult] = useState<any>(null);

    async function handleInvite(formData: FormData) {
        try {
            setResult({ status: 'Testing...' });
            const res = await testInvite(formData);
            setResult(res);
        } catch (e: any) {
            setResult({ success: false, error: e.message });
        }
    }

    async function handleDelete(formData: FormData) {
        try {
            setResult({ status: 'Deleting...' });
            await deleteTestUser(formData);
            setResult({ success: true, message: 'Delete executed (check logs or try invite again)' });
        } catch (e: any) {
            setResult({ success: false, error: e.message });
        }
    }

    return (
        <div className="p-10 space-y-8 text-black bg-slate-900 min-h-screen">
            <h1 className="text-2xl font-bold text-white">Invitation Debugger</h1>

            {result && (
                <div className="p-4 bg-gray-800 rounded border border-gray-700 text-white overflow-auto max-h-60">
                    <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}

            <form action={handleInvite} className="space-y-4 border p-4 rounded border-white/20">
                <h2 className="text-xl text-white">1. Test Invite</h2>
                <input
                    name="email"
                    type="email"
                    placeholder="Enter test email"
                    className="p-2 rounded w-full"
                    required
                />
                <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700">
                    Send Test Invite
                </button>
            </form>

            <form action={handleDelete} className="space-y-4 border p-4 rounded border-red-500/20">
                <h2 className="text-xl text-red-400">2. Cleanup User</h2>
                <input
                    name="email"
                    type="email"
                    placeholder="Enter email to delete"
                    className="p-2 rounded w-full"
                    required
                />
                <button type="submit" className="bg-red-600 px-4 py-2 rounded text-white hover:bg-red-700">
                    Delete User
                </button>
            </form>
        </div>
    );
}
