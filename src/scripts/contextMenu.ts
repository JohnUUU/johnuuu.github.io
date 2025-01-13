import { windowStateMap } from "./sharedState";
import { openWindow } from "./windowManager";
import { dragElement } from "./draggable";

document.addEventListener("DOMContentLoaded", () => {
    const contextMenu = document.getElementById("context-menu") as HTMLElement;
    const taskbar = document.querySelector(".taskbar") as HTMLElement;
    let currentTarget: HTMLElement | null = null;

    // Menu option ids
    const renameOptionId = "rename-option";
    const changeBackgroundId = "change-background-option";
    const deleteOptionId = "delete-option";
    const editOptionId = "edit-icon-option";
    const createIconId = "create-icon-option";
    const openTabId = "open-tab-option";
    const openTabIdWindow = "open-tab-window-option"

    // Different sets of menu options
    const desktopContextOptions = [
        { label: "Create Icon", id: createIconId },
        { label: "Change Background", id: changeBackgroundId },
    ];

    const desktopIconContextOptions = [
        { label: "Edit Icon", id: editOptionId },
        { label: "Delete", id: deleteOptionId },
        { label: "Rename", id: renameOptionId },
        { label: "Open in External Tab", id: openTabId },
    ];

    const windowContextOptions = [
        { label: "Open in External Tab", id: openTabIdWindow },
        { label: "Delete", id: deleteOptionId },
        { label: "Rename", id: renameOptionId },
    ];

    const defaultContextOptions = [
        { label: "Delete", id: deleteOptionId },
        { label: "Rename", id: renameOptionId },
    ];

    const setContextMenuOptions = (options: { label: string; id: string }[]) => {
        const ul = contextMenu.querySelector("ul");
        if (ul) {
            ul.innerHTML = "";
            options.forEach((option) => {
                const li = document.createElement("li");
                li.textContent = option.label;
                li.id = option.id;
                li.className = "context-menu-item";
                ul.appendChild(li);
            });
        }
    };

    const addContextMenuListeners = () => {
        contextMenu.addEventListener("click", (event) => {
            const target = event.target as HTMLElement;
            if (!target.id) return;

            if (target.id === "rename-option") {
                if (currentTarget) {
                    const isDesktopIcon = currentTarget.classList.contains("desktop-icon");
                    const isWindowHeader = currentTarget.classList.contains("window-header");
                    const isTaskbarTab = currentTarget.classList.contains("taskbar-tab");

                    let currentText = "";

                    if (isDesktopIcon) {
                        currentText = currentTarget.getAttribute("data-label") || "";
                    } else if (isWindowHeader || isTaskbarTab) {
                        const windowId = currentTarget.getAttribute("data-window-id");
                        const state = windowId ? windowStateMap.get(windowId) : null;
                        currentText = state?.label || "";
                    }

                    const input = document.createElement("input");
                    input.type = "text";
                    input.value = currentText;
                    input.style.width = `${currentTarget.offsetWidth}px`;

                    if (isDesktopIcon) {
                        currentTarget.querySelector("p")!.textContent = "";
                        currentTarget.querySelector("p")!.appendChild(input);
                    } else if (isWindowHeader) {
                        const titleElement = currentTarget.querySelector(".title")!;
                        titleElement.textContent = "";
                        titleElement.appendChild(input);
                    } else if (isTaskbarTab) {
                        currentTarget.textContent = "";
                        currentTarget.appendChild(input);
                    }

                    input.focus();

                    input.addEventListener("blur", () => {
                        const newText = input.value.trim() || currentText;
                        const sanitizedText = DOMPurify.sanitize(newText, { ALLOWED_TAGS: [] });

                        if (currentTarget) {

                            if (isDesktopIcon) {
                                const labelElement = currentTarget.querySelector("p")!;
                                currentTarget.setAttribute("data-label", sanitizedText);
                                labelElement.textContent = sanitizedText;
                            } else if (isWindowHeader) {
                                const titleElement = currentTarget.querySelector(".title")!;
                                titleElement.textContent = sanitizedText;

                                const windowId = currentTarget.getAttribute("data-window-id");
                                if (windowId && windowStateMap.has(windowId)) {
                                    const state = windowStateMap.get(windowId);
                                    state!.label = sanitizedText;
                                }
                            } else if (isTaskbarTab) {
                                currentTarget.textContent = sanitizedText;

                                const windowId = currentTarget.getAttribute("data-window-id");
                                if (windowId && windowStateMap.has(windowId)) {
                                    const state = windowStateMap.get(windowId);
                                    state!.label = sanitizedText;

                                    const windowHeader = document.querySelector(
                                        `.window-header[data-window-id="${windowId}"] .title`
                                    );
                                    if (windowHeader) {
                                        windowHeader.textContent = sanitizedText;
                                    }
                                }
                            }

                        }

                        input.remove();
                        currentTarget = null;

                    });

                    input.addEventListener("keydown", (e) => {
                        if (e.key === "Enter") {
                            input.blur();
                        }
                    });
                }

                contextMenu.style.display = "none";
            } else if (target.id === changeBackgroundId) {
                openWindow("Change Background", "/changeBackground", true);
            } else if (target.id === deleteOptionId) {
                if (currentTarget) {
                    if (currentTarget.classList.contains("desktop-icon")) {
                        currentTarget.remove();
                    } else if (currentTarget.classList.contains("taskbar-tab")) {
                        const windowId = currentTarget.getAttribute("data-window-id");
                        const windowElement = document.querySelector(
                            `.draggable-window[data-window-id="${windowId}"]`,
                        );
                        if (windowElement) {
                            windowElement.remove();
                        }
                        currentTarget.remove();
                    } else if (currentTarget.classList.contains("window-header")) {
                        const windowId = currentTarget.getAttribute("data-window-id");
                        const windowElement = document.querySelector(
                            `.draggable-window[data-window-id="${windowId}"]`,
                        );
                        if (windowElement) {
                            windowElement.remove();
                        }
                    }
                }
                currentTarget = null;
                contextMenu.style.display = "none";
            } else if (target.id === editOptionId) {
                if (currentTarget && currentTarget.classList.contains("desktop-icon")) {
                    const iconName = currentTarget.getAttribute("data-label") || "";
                    const iconLink = currentTarget.getAttribute("data-link") || "";

                    let imageKey = currentTarget.getAttribute("data-key");

                    const queryParams = new URLSearchParams({
                        iconName: iconName,
                        iconLink: iconLink,
                        imageKey: imageKey || "",
                    });
                    openWindow(`Editing Icon: ${iconName}`, `/createDesktopIcon?${queryParams.toString()}`, true);
                }
            } else if (target.id === createIconId) {
                let iconKey = `icon-${Date.now()}`;
                const queryParams = new URLSearchParams({
                    iconKey: iconKey,
                });
                openWindow("Creating Icon", `/createDesktopIcon?${queryParams.toString()}`, true);
            } else if (target.id === openTabId) {
                if (currentTarget && currentTarget.classList.contains("desktop-icon")) {
                    const iconLink = currentTarget.getAttribute("data-link") || "";
                    if (iconLink) {
                        window.open(iconLink, "_blank");
                    }
                }
            } else if (target.id === openTabIdWindow) {
                if (currentTarget && currentTarget.classList.contains("window-header")) {

                    let sibling = currentTarget.nextElementSibling;
                    while (sibling) {
                        if (sibling.tagName === "IFRAME") {
                            const iframe = sibling as HTMLIFrameElement;
                            const url = iframe.src;
                            if (url) {
                                window.open(url, "_blank");
                            }
                            break;
                        }
                        sibling = sibling.nextElementSibling;
                    }
                    currentTarget.parentElement?.remove()
                }
            }
            contextMenu.style.display = "none";
        });
    };


    document.addEventListener("contextmenu", (event) => {
        const element = (event.target as HTMLElement).closest(
            ".desktop-icon, .taskbar-tab, .window-header"
        ) as HTMLElement;

        event.preventDefault();

        currentTarget = element;

        if (!element) {
            setContextMenuOptions(desktopContextOptions);
        } else if (element.classList.contains("desktop-icon")) {
            setContextMenuOptions(desktopIconContextOptions);
        } else if (
            element.classList.contains("window-header")
        ) {
            setContextMenuOptions(windowContextOptions);
        } else if (element.classList.contains("taskbar-tab")) {
            setContextMenuOptions(defaultContextOptions);
        }

        contextMenu.style.display = "block";

        const { clientX: mouseX, clientY: mouseY } = event;
        const menuWidth = contextMenu.offsetWidth;
        const menuHeight = contextMenu.offsetHeight;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight - taskbar.offsetHeight;
        const adjustedX = mouseX + menuWidth > screenWidth ? screenWidth - menuWidth : mouseX;
        const adjustedY = mouseY + menuHeight > screenHeight ? screenHeight - menuHeight : mouseY;


        contextMenu.style.left = `${adjustedX}px`;
        contextMenu.style.top = `${adjustedY}px`;
    });



    document.addEventListener("click", () => {
        contextMenu.style.display = "none";
    });

    addContextMenuListeners();
});
