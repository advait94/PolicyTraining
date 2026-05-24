import Image from 'next/image'
import { AlertTriangle } from 'lucide-react'

const PLANS = [
    { name: 'Essentials', price: '₹36,000', users: 'Up to 25 users' },
    { name: 'Business', price: '₹84,000', users: 'Up to 100 users' },
    { name: 'Professional', price: '₹1,60,000', users: 'Up to 250 users' },
    { name: 'Corporate', price: '₹3,00,000', users: 'Up to 500 users' },
]

export default function InactivePage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute top-[-10%] left-[-15%] w-[50vw] h-[50vw] bg-amber-900/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-15%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-lg">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl inline-block shadow-xl overflow-hidden p-4">
                        <Image
                            src="/aaplus_logo.png"
                            alt="AA Plus"
                            width={160}
                            height={80}
                            className="h-16 w-auto object-contain invert"
                        />
                    </div>
                </div>

                {/* Main card */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/50">
                    {/* Icon + heading */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-5">
                            <AlertTriangle className="w-8 h-8 text-amber-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">No Active Plan</h1>
                        <p className="text-slate-400 leading-relaxed">
                            Your organisation does not have an active plan.
                            <br />
                            Contact us to activate your subscription and restore access.
                        </p>
                    </div>

                    {/* Plans list */}
                    <div className="mb-8">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                            Available Plans (Annual)
                        </p>
                        <div className="space-y-2">
                            {PLANS.map((plan) => (
                                <div
                                    key={plan.name}
                                    className="flex items-center justify-between px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl"
                                >
                                    <div>
                                        <span className="text-sm font-semibold text-white">{plan.name}</span>
                                        <span className="ml-2 text-xs text-slate-500">{plan.users}</span>
                                    </div>
                                    <span className="text-sm font-bold text-purple-400">{plan.price}/yr</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-600 mt-2 text-center">+ 18% GST · Enterprise plans available on request</p>
                    </div>

                    {/* CTA */}
                    <a
                        href="mailto:praveen@aaplusconsultants.com?subject=Activate%20Plan%20-%20AA%20Plus%20Policy%20Training&body=Hi%20Praveen%2C%0A%0AWe%20would%20like%20to%20activate%20our%20plan%20on%20AA%20Plus%20Policy%20Training.%0A%0AOrganisation%3A%20%5Byour%20org%20name%5D%0APreferred%20Plan%3A%20%5BEssentials%20%2F%20Business%20%2F%20Professional%20%2F%20Corporate%5D%0A%0APlease%20get%20back%20to%20us%20at%20your%20earliest%20convenience.%0A%0AThank%20you"
                        className="block w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl transition-all font-semibold text-center shadow-lg shadow-purple-900/30"
                    >
                        Contact us to activate
                    </a>
                </div>

                <p className="text-center text-xs text-slate-600 mt-6">
                    Already activated?{' '}
                    <a href="/login" className="text-slate-400 hover:text-white transition-colors underline underline-offset-2">
                        Sign in again
                    </a>{' '}
                    to refresh your session.
                </p>
            </div>
        </div>
    )
}
