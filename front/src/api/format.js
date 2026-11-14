export const stars = (rating) => {
  const full = Math.floor(Number(rating) || 0);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
};

export const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : '');

export const formatTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';

export const formatMoney = (value) =>
  value == null ? null : `R$ ${Number(value).toFixed(2).replace('.', ',')}`;

export const initial = (name) => (name || 'U').charAt(0).toUpperCase();

/** Estimativa simples de distância a partir dos textos "Cidade, UF". */
export const estimateDistance = (cityA, cityB) => {
  if (!cityA || !cityB) return null;
  const a = cityA.toLowerCase();
  const b = cityB.toLowerCase();
  if (a === b || a.split(',')[0].trim() === b.split(',')[0].trim()) return 'Mesma cidade';
  if (a.split(',')[1]?.trim() === b.split(',')[1]?.trim()) return 'Mesmo estado (~50-200 km)';
  return 'Outro estado (+200 km)';
};
