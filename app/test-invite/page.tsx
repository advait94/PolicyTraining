
import { testInvite, deleteTestUser } from './actions';

export default function TestPage() {
    return (
        <div className="p-10 space-y-8 text-white">
            <h1 className="text-2xl font-bold">Invitation Debugger</h1>

            <form action={testInvite} className="space-y-4 border p-4 rounded border-white/20">
                <h2 className="text-xl">1. Test Invite</h2>
                <input
                    name="email"
                    type="email"
                    placeholder="Enter test email"
                    className="p-2 rounded text-black w-full"
                    required
                />
                <button type="submit" className="bg-blue-600 px-4 py-2 rounded">
                    Send Test Invite
                </button>
            </form>

            <form action={deleteTestUser} className="space-y-4 border p-4 rounded border-red-500/20">
                <h2 className="text-xl text-red-400">2. Cleanup User</h2>
                <input
                    name="email"
                    type="email"
                    placeholder="Enter email to delete"
                    className="p-2 rounded text-black w-full"
                    required
                />
                <button type="submit" className="bg-red-600 px-4 py-2 rounded">
                    Delete User
                </button>
            </form>
        </div>
    );
}
