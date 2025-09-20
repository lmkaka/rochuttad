// src/utils/themeManager.ts

// Theme state management
let isDarkMode = false

// Initialize from localStorage
const savedTheme = localStorage.getItem('watchWithRadar_theme')
if (savedTheme === 'dark') {
  isDarkMode = true
}

export const getIsDarkMode = () => isDarkMode

export const setIsDarkMode = (value: boolean) => {
  isDarkMode = value
  localStorage.setItem('watchWithRadar_theme', value ? 'dark' : 'light')
  window.dispatchEvent(new CustomEvent('themeChange', { detail: { isDarkMode: value } }))
}

export const toggleTheme = () => {
  setIsDarkMode(!isDarkMode)
}
