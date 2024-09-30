// Función para escapar los caracteres especiales de HTML
export function escapeHtml(unsafeText) {
    const text = document.createElement('div');
    text.innerText = unsafeText;
    return text.innerHTML;
}
