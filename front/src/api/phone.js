export const COUNTRIES = [
  { code: 'BR', name: 'Brasil', ddi: '55', flag: '🇧🇷', mask: '(00) 00000-0000' },
  { code: 'US', name: 'Estados Unidos', ddi: '1', flag: '🇺🇸', mask: '(000) 000-0000' },
  { code: 'PT', name: 'Portugal', ddi: '351', flag: '🇵🇹', mask: '000 000 000' },
  { code: 'AR', name: 'Argentina', ddi: '54', flag: '🇦🇷', mask: '(000) 000-0000' },
  { code: 'CL', name: 'Chile', ddi: '56', flag: '🇨🇱', mask: '00 0000 0000' },
  { code: 'CO', name: 'Colômbia', ddi: '57', flag: '🇨🇴', mask: '000 000 0000' },
  { code: 'MX', name: 'México', ddi: '52', flag: '🇲🇽', mask: '(000) 000-0000' },
  { code: 'ES', name: 'Espanha', ddi: '34', flag: '🇪🇸', mask: '000 000 000' },
  { code: 'AO', name: 'Angola', ddi: '244', flag: '🇦🇴', mask: '000 000 000' },
  { code: 'MZ', name: 'Moçambique', ddi: '258', flag: '🇲🇿', mask: '00 000 0000' },
];

export const getCountry = (code) => COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];

export const buildNumber = (countryCode, raw) => {
  const digits = (raw || '').replace(/\D/g, '');
  return digits ? getCountry(countryCode).ddi + digits : '';
};

export const whatsappUrl = (number, name) => {
  const digits = (number || '').replace(/\D/g, '');
  if (digits.length < 8) return null;
  const text = encodeURIComponent(`Olá, ${name}! Vi seu perfil no Avalia.Serv. 😊`);
  return `https://wa.me/${digits}?text=${text}`;
};

export const maskCpf = (value) => {
  let v = (value || '').replace(/\D/g, '').slice(0, 11);
  if (v.length > 9) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  if (v.length > 6) return v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  if (v.length > 3) return v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  return v;
};
