import { Monitor } from 'lucide-react'

export default function MobileBlockedPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-xl shadow-black/50">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Monitor className="w-8 h-8 text-blue-400" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Desktop Only</h1>

                <p className="text-slate-400 mb-6 leading-relaxed">
                    This platform is designed for desktop and laptop use only.
                    <br />
                    Please open it on a PC or laptop for the best experience.
                </p>

                <p className="text-xs text-slate-500">
                    AA Plus Policy Training Platform
                </p>
            </div>
        </div>
    )
}
