import { openWindow } from './windowManager';
import { dragElement } from './draggable';
import { createDesktopIcon } from './createIcon';
import type { Position } from './types';
import { margin, iconHeight, iconWidth, numIcons } from './sharedState';


const isBlobUrlValid = async (blobUrl: string | null): Promise<boolean> => {
    if (!blobUrl) return false;

    try {
        const response = await fetch(blobUrl);
        return response.ok;
    } catch (error) {
        console.warn("Blob URL validation failed:", error);
        return false;
    }
};

const waitUntilBlobIsReady = (blobUrl: string, timeout: number, interval: number = 100) => {
    return new Promise<void>((resolve, reject) => {
        const startTime = Date.now();

        const checkBlob = async () => {
            const isValid = await isBlobUrlValid(blobUrl);

            if (isValid) {
                resolve();
            } else if (Date.now() - startTime > timeout) {
                reject(new Error("Blob URL is not ready or invalid (timeout)."));
            } else {
                setTimeout(checkBlob, interval);
            }
        };

        checkBlob();
    });
};


document.addEventListener('DOMContentLoaded', () => {
    const desktop = document.querySelector(".desktop") as HTMLElement;
    const taskbar = document.querySelector(".taskbar") as HTMLElement;

    const channel = new BroadcastChannel("desktop-icon");
    channel.addEventListener("message", async (event) => {
        const { type, icon } = event.data;

        const iconImage = localStorage.getItem(icon.imageKey);

        if (type === "create") {
            const desktopRect = desktop.getBoundingClientRect();
            const itemsPerColumn = Math.floor((desktopRect.height - 2 * margin - taskbar.offsetHeight) / (iconHeight + 2 * margin));

            const column = Math.floor(numIcons.value / itemsPerColumn);
            const row = numIcons.value % itemsPerColumn;
            const position = {
                top: margin + 1.5 * row * (iconHeight + margin),
                left: margin + 1.5 * column * (iconWidth + margin),
            }
            numIcons.value++;
            const iconElement = createDesktopIcon(icon, position, false);
            desktop.appendChild(iconElement);

            dragElement(iconElement, desktop);
        } else if (type === "edit") {
            const existingIcon = Array.from(desktop.querySelectorAll(".desktop-icon")).find(
                (el) => el.getAttribute("data-key") === icon.imageKey
            );

            if (existingIcon) {
                existingIcon.setAttribute("data-label", icon.label);
                existingIcon.setAttribute("data-link", icon.link);
                const existingImg = existingIcon.querySelector("img");
                const existingP = existingIcon.querySelector("p");
                if (existingP) {
                    existingP.textContent = icon.label;
                }
                if (existingImg && iconImage) {
                    await waitUntilBlobIsReady(iconImage, 5000);
                    existingImg.src = iconImage;
                }
            }
        }
    });

});