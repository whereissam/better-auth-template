import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X, Shield, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface NavbarProps {
  onSignIn: () => void
}

const Navbar = ({ onSignIn }: NavbarProps) => {
  const { user, isLoading, signOut } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Display name logic
  const isSIWEUser = user?.email?.startsWith('0x') && user?.email?.includes('@localhost')
  const isSyntheticEmail = isSIWEUser || user?.email?.endsWith('@telegram.local')
  let displayName = user?.name || ''
  if (!displayName && user?.email && !isSyntheticEmail) {
    displayName = user.email
  }
  if (isSIWEUser && user?.email) {
    displayName = `${user.email.slice(0, 8)}...${user.email.slice(-6)}`
  }

  return (
    <div className="flex justify-center w-full py-4 px-4 absolute top-0 left-0 right-0 z-40">
      <motion.div
        className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-lg shadow-black/[0.04] border border-gray-200/60 w-full max-w-3xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2.5 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm"
            whileHover={{ rotate: 8 }}
            transition={{ duration: 0.3 }}
          >
            <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
          </motion.div>
          <span className="text-sm font-semibold text-gray-900 hidden sm:block">
            Better Auth
          </span>
        </motion.div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-3">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          ) : user ? (
            <>
              <div className="flex items-center gap-2">
                {user.image && (
                  <img
                    src={user.image}
                    alt={displayName || 'User'}
                    className="w-7 h-7 rounded-full ring-2 ring-white"
                  />
                )}
                {displayName && (
                  <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
                    {displayName}
                  </span>
                )}
              </div>
              <motion.button
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </motion.button>
            </>
          ) : (
            <motion.button
              onClick={onSignIn}
              className="px-5 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Sign in
            </motion.button>
          )}
        </div>

        {/* Mobile menu button */}
        <motion.button
          className="md:hidden flex items-center p-1.5 cursor-pointer"
          onClick={() => setIsMobileOpen(true)}
          whileTap={{ scale: 0.9 }}
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </motion.button>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-50 flex flex-col md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {/* Mobile header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-semibold text-gray-900">Better Auth</span>
              </div>
              <motion.button
                className="p-2 cursor-pointer"
                onClick={() => setIsMobileOpen(false)}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-5 w-5 text-gray-700" />
              </motion.button>
            </div>

            {/* Mobile content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              ) : user ? (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {user.image && (
                    <img
                      src={user.image}
                      alt={displayName || 'User'}
                      className="w-16 h-16 rounded-full ring-4 ring-gray-100 mx-auto mb-3"
                    />
                  )}
                  {displayName && (
                    <p className="text-lg font-semibold text-gray-900 mb-1">{displayName}</p>
                  )}
                  <p className="text-sm text-gray-500 mb-6">Signed in</p>
                  <motion.button
                    onClick={() => {
                      setIsMobileOpen(false)
                      signOut()
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <p className="text-lg font-semibold text-gray-900 mb-2">Welcome</p>
                  <p className="text-sm text-gray-500 mb-6">Sign in to get started</p>
                  <motion.button
                    onClick={() => {
                      setIsMobileOpen(false)
                      onSignIn()
                    }}
                    className="px-8 py-3 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { Navbar }
