// src/utils/linkPicker.ts - FINAL FIX
export function pickLink(
    match: any,
    device: 'iOS' | 'Android' | 'Desktop',
    language: 'Hindi' | 'English'
  ): string | null {
    console.log('🔍 pickLink called:', { device, language, match })
    
    if (device === 'iOS' && language === 'Hindi') {
      console.log('Looking for ioslinkhindi:', match.ioslinkhindi)  // FIXED: lowercase
      return match.ioslinkhindi || null
    }
    if (device === 'iOS' && language === 'English') {
      console.log('Looking for ioslinkenglish:', match.ioslinkenglish)
      return match.ioslinkenglish || null
    }
    if (device === 'Android' && language === 'Hindi') {
      console.log('Looking for androidlinkhindi:', match.androidlinkhindi)
      return match.androidlinkhindi || null
    }
    if (device === 'Android' && language === 'English') {
      console.log('Looking for androidlinkenglish:', match.androidlinkenglish)
      return match.androidlinkenglish || null
    }
    if (device === 'Desktop' && language === 'Hindi') {
      console.log('Looking for desktoplinkhindi:', match.desktoplinkhindi)
      return match.desktoplinkhindi || null
    }
    if (device === 'Desktop' && language === 'English') {
      console.log('Looking for desktoplinkenglish:', match.desktoplinkenglish)
      return match.desktoplinkenglish || null
    }
    return null
  }
  