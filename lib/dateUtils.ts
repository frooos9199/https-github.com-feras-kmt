// Utility functions for date formatting with Arabic support

/**
 * Format date in Arabic with Western numerals (Gregorian calendar)
 * @param date - Date to format
 * @param format - 'long' for full date, 'short' for numeric
 * @returns Formatted date string in Arabic
 */
export const formatDateArabic = (date: Date, format: 'long' | 'short' = 'long'): string => {
  const months = [
    'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ]
  
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  
  if (format === 'long') {
    return `${day} ${month}، ${year}`
  } else {
    return `${day}/${date.getMonth() + 1}/${year}`
  }
}

/**
 * Format date based on language
 * @param date - Date to format
 * @param language - 'ar' or 'en'
 * @param format - 'long' or 'short'
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date, 
  language: 'ar' | 'en', 
  format: 'long' | 'short' = 'long'
): string => {
  if (language === 'ar') {
    return formatDateArabic(date, format)
  }
  
  const options: Intl.DateTimeFormatOptions = format === 'long' 
    ? { year: 'numeric', month: 'long', day: 'numeric' }
    : { year: 'numeric', month: 'numeric', day: 'numeric' }
    
  return date.toLocaleDateString('en-US', options)
}
