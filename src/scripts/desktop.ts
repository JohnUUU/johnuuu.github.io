import type { IconData, Position } from "./types";
import { dragElement } from "./draggable";
import { createDesktopIcon } from "./createIcon";
import { margin, iconHeight, iconWidth, postitId } from "./sharedState";
import { openWindow } from "./windowManager";

export function storeIcon(iconKey: string, iconData: IconData) {
    localStorage.setItem(iconKey, JSON.stringify(iconData));
}

export function getIcon(iconKey: string) {
    const iconData = localStorage.getItem(iconKey);
    return iconData ? JSON.parse(iconData) : null;
}

document.addEventListener("DOMContentLoaded", () => {
    const desktop = document.querySelector('.desktop') as HTMLElement;

    const savedBackground = localStorage.getItem('desktopBackground');
    if (savedBackground) {
        desktop.style.backgroundImage = `url(${savedBackground})`;
    }

    const channel = new BroadcastChannel('background-change');
    channel.onmessage = (event) => {
        const newBackground = event.data.background;
        if (newBackground) {
            desktop.style.backgroundImage = `url(${newBackground})`;
        }
    };
});

document.addEventListener("DOMContentLoaded", () => {
    const desktop = document.querySelector(".desktop") as HTMLElement;
    const taskbar = document.querySelector(".taskbar") as HTMLElement;
    const desktopRect = desktop.getBoundingClientRect();

    const desktopIcons = [
        { icon: "/icons/about.svg", label: "About Me", link: "/about", iconKey: "icon-1", navbar: false, },
        { icon: "/icons/resume.svg", label: "Resume", link: "/resume", iconKey: "icon-2", navbar: false, },
        {
            icon: "/icons/projects.svg",
            label: "Projects",
            link: "/projects",
            iconKey: "icon-3",
            navbar: false
        },
        { icon: "/icons/internet.svg", label: "Internet", link: "/internet", iconKey: "icon-4", navbar: false, },
        { icon: "/icons/note.png", label: "Sticky Note", link: "/postit", iconKey: "icon-5", navbar: true, width: Math.min(desktopRect.width * 0.5, 400), height: Math.min(desktopRect.height * 0.5, 400) },
    ];



    const itemsPerColumn = Math.floor((desktopRect.height - 2 * margin - taskbar.offsetHeight) / (iconHeight + 2 * margin));

    desktopIcons.map((item, index) => {
        const column = Math.floor(index / itemsPerColumn);
        const row = index % itemsPerColumn;
        const position = {
            top: margin + 1.5 * row * (iconHeight + margin),
            left: margin + 1.5 * column * (iconWidth + margin),
        }

        localStorage.setItem(item.iconKey, item.icon);
        const icondata = { label: item.label, imageKey: item.iconKey, link: item.link };

        let queryExtension = "";
        if (item.link === "/postit") {
            queryExtension = `noteID=${postitId.value}`;
            postitId.value++;
        }

        const desktopIcon = (item.width && item.height) ? createDesktopIcon(icondata, position, item.navbar, item.width, item.height, queryExtension) : createDesktopIcon(icondata, position, item.navbar);
        desktop.appendChild(desktopIcon);

        dragElement(desktopIcon, desktop);
    });

    openWindow("Welcome Traveler", "/postit?noteID=0", true, Math.min(desktopRect.width * 0.5, 400), Math.min(desktopRect.height * 0.5, 400))
});

