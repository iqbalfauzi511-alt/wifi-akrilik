export function normalizeWhatsAppNumber(number) {
  if (!number) return '';
  
  // Remove all non-numeric characters except +
  let cleanNumber = number.replace(/[^\d+]/g, '');
  
  // If it starts with 0, replace with 62
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.substring(1);
  }
  
  // If it starts with +, remove the +
  if (cleanNumber.startsWith('+')) {
    cleanNumber = cleanNumber.substring(1);
  }
  
  return cleanNumber;
}

export function validateWhatsAppNumber(number) {
  if (!number) return false;
  const cleanNumber = normalizeWhatsAppNumber(number);
  // Basic validation: 9 to 15 digits
  return cleanNumber.length >= 9 && cleanNumber.length <= 15;
}
