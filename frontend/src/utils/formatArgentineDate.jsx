// src/utils/formatArgentineDate.jsx
export const formatArgentineDate = (dateStr) => {
  if (!dateStr) return "S/N";

  // 1. Normalización para que JS lo trate como UTC
  const isoDate = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
  const finalDate = (isoDate.includes('Z') || isoDate.includes('+')) ? isoDate : `${isoDate}Z`;
  const d = new Date(finalDate);

  // Verificamos si la fecha es válida para evitar errores de "Invalid Date"
  if (isNaN(d.getTime())) return "Fecha inválida";

  // 2. Extraemos las partes configurando la zona horaria de Argentina
  const dia = d.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: 'numeric' });
  const mes = d.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', month: 'short' }).replace('.', '');
  
  // 3. Forzamos formato 24hs con hour12: false
  const hora = d.toLocaleString('es-AR', { 
    timeZone: 'America/Argentina/Buenos_Aires', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });

  // 4. Construimos el string final exacto
  return `${dia} de ${mes} - ${hora}`;
};