// src/utils/globalTheme.ts
export const globalTheme = {
    isDarkMode: false,
    setIsDarkMode: (value: boolean) => {
      globalTheme.isDarkMode = value
      localStorage.setItem('watchWithRadar_theme', value ? 'dark' : 'light')
      window.dispatchEvent(new CustomEvent('themeChange', { detail: { isDarkMode: value } }))
    }
  }
  
  // Initialize theme from localStorage
  const savedTheme = localStorage.getItem('watchWithRadar_theme')
  if (savedTheme === 'dark') {
    globalTheme.isDarkMode = true
  }
  