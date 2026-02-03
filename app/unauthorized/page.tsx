import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-xl shadow-black/50">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>

                <p className="text-slate-400 mb-8 leading-relaxed">
                    Your account is not linked to any organization.
                    <br className="hidden sm:block" />
                    Please verify your invite link or contact your administrator.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/login"
                        className="block w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium border border-slate-700"
                    >
                        Back to Login
                    </Link>

                    <p className="text-xs text-slate-500 mt-4">
                        If you just signed up, check your email for a pending invitation.
                    </p>
                </div>
            </div>
        </div>
    )
}
