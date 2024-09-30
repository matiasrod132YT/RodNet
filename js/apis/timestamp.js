// timeFormatter.js
export function formatTimestamp(timestamp) {
    const date = new Date(timestamp?.seconds * 1000);
    const now = new Date();
  
    // Calcular la diferencia en milisegundos
    const diff = now - date;
  
    // Convertir la diferencia en segundos, minutos, horas, días
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
  
    // Formato de la fecha para día y mes
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    let formattedTimestamp = "";
  
    // Si es hace menos de 1 minuto
    if (seconds < 60) {
      formattedTimestamp = `Ahora`;
    } 
    // Si es hace menos de 1 hora
    else if (minutes < 60) {
      formattedTimestamp = `${minutes}min`;
    } 
    // Si es hace menos de 1 día
    else if (hours < 24) {
      formattedTimestamp = `${hours}h`;
    } 
    // Si es hace más de 1 día
    else if (months < 12) {
      formattedTimestamp += `${day} ${month}.`;
    }
    // Si es hace mas de 1 año
    else {
      formattedTimestamp = `${day} ${month}. ${year}`;
    }
  
    return formattedTimestamp;
  }
  