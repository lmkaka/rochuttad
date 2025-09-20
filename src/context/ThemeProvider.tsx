// src/context/ThemeProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'

type ThemeContextType = {
  isDarkMode: boolean
  setIsDarkMode: (value: boolean) => void
  toggleTheme: () => void
  themeClasses: {
    bg: string
    cardBg: string
    headerBg: string
    headerBorder: string
    text: string
    textSecondary: string
    textMuted: string
    accent: string
    button: string
    buttonSecondary: string
    navHover: string
    input: string
    googleButton: string
    footerBg: string
    logoGradient: string
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false) // Day mode by default

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('watchWithRadar_theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
    }
  }, [])

  // Save theme to localStorage when changed
  useEffect(() => {
    localStorage.setItem('watchWithRadar_theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Unified theme classes
  const themeClasses = isDarkMode ? {
    bg: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    cardBg: 'bg-gradient-to-br from-slate-800/50 to-purple-800/30 backdrop-blur-xl border-purple-500/20',
    headerBg: 'rgba(15, 23, 42, 0.8)',
    headerBorder: 'border-purple-500/20',
    text: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    accent: 'text-purple-400',
    button: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/25',
    buttonSecondary: 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 border-slate-600/50',
    navHover: 'hover:bg-purple-500/20 text-slate-200',
    input: 'bg-slate-800/50 border-slate-600/50 text-slate-100 focus:border-purple-500 focus:ring-purple-500/20',
    googleButton: 'bg-white/10 hover:bg-white/20 text-slate-200 border-slate-600/30',
    footerBg: 'bg-slate-800/50 border-purple-500/20',
    logoGradient: 'from-purple-400 to-blue-400'
  } : {
    bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
    cardBg: 'bg-white/70 backdrop-blur-xl border-indigo-200/50 shadow-xl shadow-indigo-500/10',
    headerBg: 'rgba(255, 255, 255, 0.8)',
    headerBorder: 'border-indigo-200/50',
    text: 'text-slate-800',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-500',
    accent: 'text-indigo-600',
    button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-indigo-500/25',
    buttonSecondary: 'bg-white/50 hover:bg-white/70 text-slate-700 border-indigo-200/50',
    navHover: 'hover:bg-indigo-500/20 text-slate-700',
    input: 'bg-white/50 border-indigo-200/50 text-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20',
    googleButton: 'bg-white/80 hover:bg-white text-slate-700 border-indigo-200/50 shadow-sm',
    footerBg: 'bg-white/70 border-indigo-200/50',
    logoGradient: 'from-indigo-600 to-purple-600'
  }

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      setIsDarkMode,
      toggleTheme,
      themeClasses
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
