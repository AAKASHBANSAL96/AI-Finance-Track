const mask = (value: string, showLast = 4) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= showLast) return '*'.repeat(cleaned.length);
  return '*'.repeat(cleaned.length - showLast) + cleaned.slice(-showLast);
};

export const maskAccountNumber = (value: string) => value.replace(/\b\d{8,}\b/g, (match) => mask(match, 4));
export const maskCardNumber = (value: string) => value.replace(/\b\d{12,19}\b/g, (match) => mask(match, 4));
export const maskUPI = (value: string) => value.replace(/\b[\w.\-]{2,}@[\w]+\b/g, (match) => `${'*'.repeat(Math.max(3, match.length - 3))}${match.slice(-3)}`);
export const maskPhone = (value: string) => value.replace(/\b\d{10,13}\b/g, (match) => mask(match, 4));

export const maskSensitiveData = (text: string) => {
  let output = text;
  output = maskAccountNumber(output);
  output = maskCardNumber(output);
  output = maskUPI(output);
  output = maskPhone(output);
  return output;
};
