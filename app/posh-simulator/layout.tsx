export default function PoshSimulatorLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <link rel="stylesheet" href="/dark-styles.css" />
            {children}
        </>
    )
}
