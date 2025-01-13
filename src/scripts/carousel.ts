document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.carousel-item');
    const prevButton = document.querySelector('.carousel-control-prev') as HTMLElement;
    const nextButton = document.querySelector('.carousel-control-next') as HTMLElement;

    let currentIndex = -1;

    const updateCarouselDisplay = () => {
        items.forEach((item, index) => {
            (item as HTMLElement).style.display = index === currentIndex ? 'block' : 'none';
        });
    };

    const updateButtonHeight = () => {
        if (currentIndex >= 0) {
            const activeImage = items[currentIndex].querySelector('img');
            if (activeImage) {
                const imageHeight = activeImage.offsetHeight;
                if (prevButton) prevButton.style.height = `${imageHeight}px`;
                if (nextButton) nextButton.style.height = `${imageHeight}px`;
            }
        }
    };

    const showNextSlide = () => {
        currentIndex = (currentIndex + 1) % items.length;
        updateCarouselDisplay();
        updateButtonHeight();
    };

    const showPrevSlide = () => {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateCarouselDisplay();
        updateButtonHeight();
    };

    prevButton.addEventListener('click', () => {
        if (currentIndex === -1) currentIndex = 0;
        showPrevSlide();
    });

    nextButton.addEventListener('click', () => {
        if (currentIndex === -1) currentIndex = 0;
        showNextSlide();
    });

    showNextSlide();
});
