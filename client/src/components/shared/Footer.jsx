const Footer = () => (
  <footer className="mt-16 border-t border-slate-800/60 bg-slate-950/80">
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-10 text-center text-sm text-slate-400 sm:flex-row sm:justify-between">
      <p>&copy; {new Date().getFullYear()} Kabarak University Blockchain Voting System.</p>
      <p className="text-xs">Built for secure, transparent, and accountable student elections.</p>
    </div>
  </footer>
)

export default Footer
