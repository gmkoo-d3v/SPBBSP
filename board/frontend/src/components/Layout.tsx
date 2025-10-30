import React from 'react'
import Header from './Header'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />
      <main className="flex-1 container-main">
        {children}
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-6 mt-12">
        <div className="container-main text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 Board Application. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
