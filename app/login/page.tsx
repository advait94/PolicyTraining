import { LoginForm } from '@/components/feature/auth/login-form'
import Image from 'next/image'

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-6 md:p-12">

            {/* Background Glows matching design */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center relative z-10">

                {/* Left Side - Typography Hero */}
                <div className="space-y-8 text-center lg:text-left">
                    {/* Logo Box - Dark Glass to match theme */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl inline-block shadow-2xl overflow-hidden p-4">
                        <Image src="/aaplus_logo.png" alt="AA Plus Architects" width={200} height={100} className="h-24 w-auto object-contain invert" />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                        Empowering Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient-x">
                            Compliance Journey
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Access world-class training modules designed to keep you safe, informed, and compliant. Secure, reliable, and always available.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm text-cyan-400">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                            </span>
                            System Operational
                        </div>
                    </div>
                </div>

                {/* Right Side - Glassmorphism Login Card */}
                <div className="w-full max-w-md mx-auto lg:ml-auto">
                    <div className="bg-[#151A29]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-900/20 rounded-3xl p-8 md:p-10 relative overflow-hidden group">
                        {/* Shimmer effect top border */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />

                        <LoginForm />
                    </div>
                </div>
            </div>
        </div>
    )
}
