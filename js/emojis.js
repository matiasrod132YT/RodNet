document.getElementById('emoji-icon').addEventListener('click', function() {
    const emojiPopup = document.getElementById('emoji-popup');
    emojiPopup.style.display = emojiPopup.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('emoji-close').addEventListener('click', function() {
    document.getElementById('emoji-popup').style.display = 'none';
});

// Lista de emojis
const emojis = [
    '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '😗', '😙', '😚', '☺️', '😇', '🙂', '🤗', '🤔', '🤐', '🤨', '😐', '😑', '😶', '🙄', '😯', '😪', '😫', '😴', '😌', '😍', '😎', '🤓', '😝', '😛', '😜', '🤤', '😒', '😓', '😔', '😕', '🙁', '☹️', '😖', '😣', '😫', '😨', '😰', '😥', '😢', '😭', '😓', '😩', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '👻', '👽', '💩', '🤡', '👹', '👺', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙌', '👏', '👋', '👐', '🤲', '🤝', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤚', '🖐', '✋', '🤚', '🖖', '👌', '✌️', '🤘', '🤙', '💪', '🖕', '🖖', '🖐', '✋', '🤚', '✊', '🤛', '🤜', '👐', '🤲', '🤝', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤚', '🖐', '✋', '🤚', '🖖', '👌', '✌️', '🤘', '🤙', '💪', '🖕'
];

// Insertar emojis en el contenedor
const emojiContainer = document.getElementById('emoji-container');
emojis.forEach(emoji => {
    const span = document.createElement('span');
    span.className = 'emoji-item';
    span.textContent = emoji;
    span.addEventListener('click', () => {
        document.getElementById('post-text').value += emoji;
        document.getElementById('emoji-popup').style.display = 'none';
    });
    emojiContainer.appendChild(span);
});