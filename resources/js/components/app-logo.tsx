export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md bg-white p-1 ring-1 ring-black/5">
                <img src="/image/CD NARIÑO.png" alt="Bavaria · Adenar S.A.S. · Easy Logística" className="h-full w-full object-contain" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">Software 5S</span>
                <span className="text-muted-foreground truncate text-xs leading-none">CD Nariño</span>
            </div>
        </>
    );
}
