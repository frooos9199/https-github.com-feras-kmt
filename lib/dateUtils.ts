// Utility functions for date formatting with Arabic support

/**
 * Convert Western numerals to Arabic numerals
 */
const toArabicNumerals = (num: number): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)] || digit).join('')
}

/**
 * Format date in Arabic with Arabic numerals (Gregorian calendar)
 * @param date - Date to format
 * @param format - 'long' for full date, 'short' for numeric
 * @returns Formatted date string in Arabic
 */
export const formatDateArabic = (date: Date, format: 'long' | 'short' = 'long'): string => {
  const day = date.getDate()
  const month = date.getMonth() + 1 // Months are 0-indexed
  const year = date.getFullYear()
  
  // Return numeric format with Arabic numerals: ٤/١٢/٢٠٢٥
  return `${toArabicNumerals(day)}/${toArabicNumerals(month)}/${toArabicNumerals(year)}`
}

/**
 * Format date based on language
 * @param date - Date to format
 * @param language - 'ar' or 'en'
 * @param format - 'long' or 'short' (ignored, always numeric now)
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date, 
  language: 'ar' | 'en', 
  format: 'long' | 'short' = 'long'
): string => {
  if (language === 'ar') {
    // Arabic: numeric format with Arabic numerals (٤/١٢/٢٠٢٥)
    return formatDateArabic(date, format)
  }
  
  // English: numeric format day/month/year (4/12/2025)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
    
  return `${day}/${month}/${year}`
}
