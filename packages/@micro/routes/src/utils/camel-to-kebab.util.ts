export function camelToKebab(s: string): string {
  let result = '';
  for (let i = 0, len = s.length; i < len; i++) {
    const char = s[i]!;
    if (char >= 'A' && char <= 'Z') {
      if (i !== 0) result += '-';
      result += char.toLowerCase();
    } else {
      result += char;
    }
  }
  return result;
}