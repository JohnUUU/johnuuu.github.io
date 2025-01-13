import { dragElement } from './draggable';
import { dragResizeState, windowStateMap } from './sharedState';
import { cumsum, incrementCumsum } from './sharedState';
import { updateTaskbar } from './taskbar';

export function isCrossOrigin(iframe: HTMLIFrameElement) {
    try {
        if (iframe.contentWindow) {
            iframe.contentWindow.location.href;
            return false
        }
        return true;
    } catch (e) {
        return true;
    }
}

export function enableResizing(elmnt: HTMLElement, container: HTMLElement) {
    const resizeHandles = elmnt.querySelectorAll('.resize-handle');

    resizeHandles.forEach((handle) => {
        handle.addEventListener('mousedown', (e) => startResizing(e as MouseEvent, handle as HTMLElement));
    });

    function startResizing(e: MouseEvent, handle: HTMLElement) {
        e.preventDefault();

        const iframes = document.querySelectorAll('iframe');
        iframes.forEach((iframe) => {
            (iframe as HTMLElement).style.pointerEvents = 'none';
        });

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = elmnt.offsetWidth;
        const startHeight = elmnt.offsetHeight;
        const startTop = elmnt.offsetTop;
        const startLeft = elmnt.offsetLeft;

        function resize(e: MouseEvent) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (handle.classList.contains('resize-right') || handle.classList.contains('resize-top-right') || handle.classList.contains('resize-bottom-right')) {
                elmnt.style.width = `${startWidth + dx}px`;
            }

            if (handle.classList.contains('resize-left') || handle.classList.contains('resize-top-left') || handle.classList.contains('resize-bottom-left')) {
                elmnt.style.width = `${startWidth - dx}px`;
                elmnt.style.left = `${startLeft + dx}px`;
            }

            if (handle.classList.contains('resize-bottom') || handle.classList.contains('resize-bottom-left') || handle.classList.contains('resize-bottom-right')) {
                elmnt.style.height = `${startHeight + dy}px`;
            }

            if (handle.classList.contains('resize-top') || handle.classList.contains('resize-top-left') || handle.classList.contains('resize-top-right')) {
                elmnt.style.height = `${startHeight - dy}px`;
                elmnt.style.top = `${startTop + dy}px`;
            }
        }

        function stopResizing() {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResizing);

            const iframes = document.querySelectorAll('iframe');
            iframes.forEach((iframe) => {
                (iframe as HTMLElement).style.pointerEvents = 'auto';

                iframe.style.display = 'none';
                setTimeout(() => {
                    iframe.style.display = 'block';
                    iframe.focus();
                }, 0);
            });

            dragResizeState.isResizing = false;
        }

        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResizing);

        dragResizeState.isResizing = true;
    }
}


export function openWindow(label: string, url: string, hidenav: boolean, width?: number, height?: number) {
    const desktop = document.querySelector('.desktop') as HTMLElement;
    const taskbarTabs = document.querySelector('.taskbar-tabs') as HTMLElement;
    const overflowMenu = document.querySelector('.overflow-menu') as HTMLElement;
    const overflowBtn = document.querySelector('.overflow-btn') as HTMLElement;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const realwidth = width ? width : Math.max(screenWidth * 0.7, 600);
    const realheight = height ? height : Math.max(screenHeight * 0.75, 400);

    const windowId = `window-${Date.now()}`;
    const state = { label };
    windowStateMap.set(windowId, state);

    const windowElement = document.createElement('div');
    windowElement.classList.add('draggable-window');
    windowElement.style.width = `${realwidth}px`;
    windowElement.style.height = `${realheight}px`;
    windowElement.style.top = `${(screenHeight - realheight) / 2}px`;
    windowElement.style.left = `${(screenWidth - realwidth) / 2}px`;
    windowElement.setAttribute('data-window-id', windowId);

    windowElement.innerHTML = `
        <div class="window-header" data-window-id="${windowId}">
            <span class="title">${state.label}</span>
            <div class="window-controls">
                <button class="window-btn minimize-btn">&minus;</button>
                <button class="window-btn expand-btn">&#x26F6;</button>
                <button class="window-btn close-btn">x</button>
            </div>
        </div>
        <div class="trigger-area"></div>
        <div class="window-nav">
            <button class="nav-btn back-btn " data-tooltip="Back">&larr;</button>
            <button class="nav-btn forward-btn" data-tooltip="Forward">&rarr;</button>
            <button class="nav-btn reload-btn" data-tooltip="Reload">&#x21bb;</button>
            <input class="nav-input" type="text" value="${url}" title="Enter URL" />
        </div>
        <iframe src="${url}" frameborder="0" scrolling="yes"></iframe>
        <div class="resize-handle resize-top"></div>
        <div class="resize-handle resize-right"></div>
        <div class="resize-handle resize-bottom"></div>
        <div class="resize-handle resize-left"></div>
        <div class="resize-handle resize-top-left"></div>
        <div class="resize-handle resize-top-right"></div>
        <div class="resize-handle resize-bottom-left"></div>
        <div class="resize-handle resize-bottom-right"></div>
    `;
    desktop.appendChild(windowElement);

    dragElement(windowElement, desktop, {
        onStart: (elmnt) => {
            elmnt.style.boxShadow = "0 0 10px 5px rgba(173, 216, 230, 0.8)";
            elmnt.style.borderRadius = "5px";
        },
        onEnd: (elmnt) => {
            elmnt.style.boxShadow = "none";
            elmnt.style.borderRadius = "0";
        },
    });
    enableResizing(windowElement, desktop);

    const minimizeButton = windowElement.querySelector('.minimize-btn');
    minimizeButton?.addEventListener('click', () => {
        windowElement.style.display = 'none';

        const taskbarTab = document.createElement('div');
        taskbarTab.classList.add('taskbar-tab');
        taskbarTab.innerText = state.label;
        taskbarTab.setAttribute('data-window-id', windowId);

        taskbarTabs.appendChild(taskbarTab);
        const tabWidth = taskbarTab.offsetWidth;
        taskbarTab.remove();

        incrementCumsum(tabWidth);

        const isOverflowing = cumsum.value + 10 > window.innerWidth;

        taskbarTab.addEventListener('click', () => {
            windowElement.style.display = 'block';
            taskbarTab.remove();

            updateTaskbar();
        });

        if (isOverflowing) {
            overflowBtn.style.display = 'inline-block';
            overflowMenu.appendChild(taskbarTab);
        } else {
            taskbarTabs.appendChild(taskbarTab);
        }
    });

    const expandButton = windowElement.querySelector('.expand-btn');
    expandButton?.addEventListener('click', () => {
        const isFullscreen = windowElement.classList.contains('fullscreen');
        if (isFullscreen) {
            windowElement.classList.remove('fullscreen');
            windowElement.style.width = `${Math.max(window.innerWidth * 0.5, 300)}px`;
            windowElement.style.height = `${Math.max(window.innerHeight * 0.75, 200)}px`;
            windowElement.style.top = `${(window.innerHeight - windowElement.offsetHeight) / 2}px`;
            windowElement.style.left = `${(window.innerWidth - windowElement.offsetWidth) / 2}px`;
            expandButton.innerHTML = '&#x26F6;';
        } else {
            windowElement.classList.add('fullscreen');
            windowElement.style.width = `100vw`;
            windowElement.style.height = `100vh`;
            windowElement.style.top = `0`;
            windowElement.style.left = `0`;
            expandButton.innerHTML = '&#x29C9';
        }
    });

    const closeButton = windowElement.querySelector('.close-btn');
    closeButton?.addEventListener('click', () => {
        windowElement.remove();
    });

    const iframe = windowElement.querySelector('iframe') as HTMLIFrameElement;
    const backButton = windowElement.querySelector('.back-btn') as HTMLButtonElement;
    const forwardButton = windowElement.querySelector('.forward-btn') as HTMLButtonElement;
    const reloadButton = windowElement.querySelector('.reload-btn') as HTMLButtonElement;
    const navInput = windowElement.querySelector('.nav-input') as HTMLInputElement;

    let iframeHistory: string[] = [];
    let iframeHistoryIndex: number = -1;

    function updateNavButtonStates(iframe: HTMLIFrameElement, backButton: HTMLButtonElement, forwardButton: HTMLButtonElement, reloadButton: HTMLButtonElement) {
        if (isCrossOrigin(iframe)) {
            backButton.disabled = true;
            forwardButton.disabled = true;
            backButton.classList.add('disabled');
            forwardButton.classList.add('disabled');

            backButton.setAttribute('data-tooltip', 'Disabled for cross domain content.');
            forwardButton.setAttribute('data-tooltip', 'Disabled for cross-domain content.');
            reloadButton.setAttribute('data-tooltip', 'Reload to current URL')

        } else {
            reloadButton.setAttribute('data-tooltip', 'Reload');
            if (iframe.contentWindow) {
                backButton.disabled = iframeHistoryIndex <= 0;
                forwardButton.disabled = iframeHistoryIndex >= iframeHistory.length - 1;

                if (backButton.disabled) {
                    backButton.classList.add('disabled');
                } else {
                    backButton.classList.remove('disabled');
                }

                if (forwardButton.disabled) {
                    forwardButton.classList.add('disabled');
                } else {
                    forwardButton.classList.remove('disabled');
                }

                backButton.setAttribute(
                    'data-tooltip',
                    backButton.disabled ? 'No pages left' : 'Back'
                );
                forwardButton.setAttribute(
                    'data-tooltip',
                    forwardButton.disabled ? 'No pages left' : 'Forward'
                );
            }
        }
    }

    iframe.addEventListener('load', () => {
        const currentUrl: string = iframe.contentWindow?.location.href || '';

        if (iframeHistoryIndex === -1 || iframeHistory[iframeHistoryIndex] !== currentUrl) {
            iframeHistory.splice(iframeHistoryIndex + 1);
            iframeHistory.push(currentUrl);
            iframeHistoryIndex = iframeHistory.length - 1;
        }

        updateNavButtonStates(iframe, backButton, forwardButton, reloadButton);
    });

    backButton.addEventListener('click', () => {
        if (!backButton.disabled) {
            iframeHistoryIndex--;
            iframe.src = iframeHistory[iframeHistoryIndex];
            updateNavButtonStates(iframe, backButton, forwardButton, reloadButton);
        }
    });

    forwardButton.addEventListener('click', () => {
        if (!forwardButton.disabled) {
            iframeHistoryIndex++;
            iframe.src = iframeHistory[iframeHistoryIndex];
            updateNavButtonStates(iframe, backButton, forwardButton, reloadButton);
        }
    });
    reloadButton.addEventListener('click', () =>
        iframe.src = iframe.src
    );

    navInput.addEventListener('mousedown', (event: MouseEvent) => {
        event.preventDefault();
        navInput.focus();
    });

    navInput.addEventListener('keydown', (event: KeyboardEvent) => {
        event.stopPropagation();
        if (event.key === 'Enter') {
            const newUrl: string = navInput.value.trim();
            if (newUrl) {
                const urlPattern: RegExp = /^(https?:\/\/)/;
                const validUrl: string = urlPattern.test(newUrl) ? newUrl : `https://${newUrl}`;
                iframe.src = validUrl;
            } else {
                alert('Please enter a valid URL.');
            }
        }
    });

    if (isCrossOrigin(iframe)) {
        backButton.disabled = true;
        forwardButton.disabled = true;
    } else {
        backButton.disabled = false;
        forwardButton.disabled = false;
    }


    iframe.addEventListener('load', () => updateNavButtonStates(iframe, backButton, forwardButton, reloadButton));

    updateNavButtonStates(iframe, backButton, forwardButton, reloadButton);

    if (hidenav) {
        windowElement.querySelector('.trigger-area')?.remove();
        windowElement.querySelector('.window-nav')?.remove();
    }

}
