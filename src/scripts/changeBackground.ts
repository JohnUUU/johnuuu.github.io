document.addEventListener("DOMContentLoaded", () => {
    const backgroundOptions = document.querySelectorAll('.background-preview');
    const channel = new BroadcastChannel('background-change');

    backgroundOptions.forEach((preview) => {
        preview.addEventListener('click', () => {
            const bgUrl = preview.getAttribute('data-bg');
            if (bgUrl) {
                localStorage.setItem('desktopBackground', bgUrl);
                channel.postMessage({ background: bgUrl });
            }
        });
    });
});

