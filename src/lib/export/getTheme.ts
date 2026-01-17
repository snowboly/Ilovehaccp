import { AuditClassicTheme } from './themes/auditClassicTheme';
import { ProfessionalModernTheme } from './themes/professionalModernTheme';

export function getTheme(themeId?: string) {
  // Normalize themeId
  const normalizedId = themeId?.toLowerCase().replace(/\s+/g, '-');
  
  if (normalizedId === 'professional-modern') {
    return ProfessionalModernTheme;
  }
  
  return AuditClassicTheme; // Default
}