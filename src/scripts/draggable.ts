import { dragResizeState } from './sharedState';

export function dragElement(
    elmnt: HTMLElement,
    container: HTMLElement,
    options?: {
        onStart?: (elmnt: HTMLElement) => void;
        onMove?: (elmnt: HTMLElement, pos: { top: number; left: number }) => void;
        onEnd?: (elmnt: HTMLElement) => void;
    }
) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    let animationFrameId: number | null = null;

    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e: MouseEvent) {
        if (dragResizeState.isResizing) {
            return;
        }


        e.preventDefault();

        const iframes = document.querySelectorAll('iframe');
        iframes.forEach((iframe) => {
            (iframe as HTMLElement).style.pointerEvents = 'none';
        });


        isDragging = true;

        pos3 = e.clientX;
        pos4 = e.clientY;

        if (options?.onStart) {
            options.onStart(elmnt);
        }

        function closeDragElement() {
            if (!isDragging) return;

            isDragging = false;

            if (options?.onEnd) {
                options.onEnd(elmnt);
            }

            document.removeEventListener('mousemove', elementDrag);
            document.removeEventListener('mouseup', closeDragElement);

            const iframes = document.querySelectorAll('iframe');
            iframes.forEach((iframe) => {
                (iframe as HTMLElement).style.pointerEvents = 'auto';
            });
        }

        document.addEventListener('mousemove', elementDrag);
        document.addEventListener('mouseup', closeDragElement);
    }

    function elementDrag(e: MouseEvent) {
        if (!isDragging) return;

        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(() => {
                const containerRect = container.getBoundingClientRect();
                const taskbar = document.querySelector('.taskbar') as HTMLElement;
                const taskbarHeight = taskbar ? taskbar.offsetHeight : 0;

                const newTop = Math.max(
                    0,
                    Math.min(elmnt.offsetTop - pos2, containerRect.height - elmnt.offsetHeight - taskbarHeight)
                );
                const newLeft = Math.max(
                    0,
                    Math.min(elmnt.offsetLeft - pos1, containerRect.width - elmnt.offsetWidth)
                );

                elmnt.style.top = `${newTop}px`;
                elmnt.style.left = `${newLeft}px`;

                if (options?.onMove) {
                    options.onMove(elmnt, { top: newTop, left: newLeft });
                }

                animationFrameId = null;
            });
        }
    }
}


