import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Header = () => {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-slate-900/80 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-kabarak-blue to-kabarak-emerald flex items-center justify-center shadow-glass">
              <span className="text-lg font-semibold text-white">KV</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs uppercase tracking-widest text-slate-400">Kabarak University</p>
              <p className="text-lg font-semibold text-slate-100">Blockchain Voting</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-800/70 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-300">Secure ? Transparent ? Real-time</span>
            </div>

            {user && (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-3 rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-2 text-left text-sm shadow-sm transition hover:border-kabarak-light/60">
                  <div>
                    <p className="font-medium text-slate-100">{user.name}</p>
                    <p className="text-xs uppercase tracking-wide text-kabarak-light/80">{user.role}</p>
                  </div>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl border border-slate-700/60 bg-slate-900/95 shadow-lg backdrop-blur">
                    <div className="p-3 text-xs text-slate-400">
                      Connected as
                      <p className="font-semibold text-slate-100">{user.email}</p>
                    </div>
                    <div className="border-t border-slate-800/70" />
                    <div className="p-2">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={logout}
                            className={`w-full rounded-xl px-4 py-2 text-left text-sm font-medium transition ${
                              active ? 'bg-red-500/10 text-red-300' : 'text-red-400'
                            }`}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
