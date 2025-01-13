import type { IconData, Position } from "./types";
import { openWindow } from "./windowManager";
import { numIcons } from "./sharedState";


const processAndStoreImage = async (updatedImage: string, imageKey: string) => {
    try {
        const response = await fetch(updatedImage);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        if (blobUrl && imageKey) {
            localStorage.setItem(imageKey, blobUrl);
        }
    } catch (error) {
        console.error("Error storing image:", error);
    }
};

const processAndStoreCanvas = async (canvas: HTMLCanvasElement, imageKey: string) => {
    try {
        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/png');
        });
        if (blob) {
            const blobUrl = URL.createObjectURL(blob);

            if (blobUrl && imageKey) {
                localStorage.setItem(imageKey, blobUrl);
            }
        }
    } catch (error) {
        console.error("Error storing image:", error);
    }
}

export function createDesktopIcon(icon: IconData, position: Position, navbar: boolean, width?: number, height?: number, queryExtension?: string) {
    const iconElement = document.createElement("div")
    iconElement.className = "desktop-icon";

    const image = localStorage.getItem(icon.imageKey)

    iconElement.innerHTML = `
    <div class="icon-svg">
        <img src=${image} alt=${icon.label} />
    </div>
    <p>${icon.label}</p>
    `;

    iconElement.style.position = "absolute";
    iconElement.style.top = `${position.top}px`;
    iconElement.style.left = `${position.left}px`;

    iconElement.setAttribute("data-key", icon.imageKey);
    iconElement.setAttribute("data-label", icon.label);
    iconElement.setAttribute("data-link", icon.link);


    iconElement.addEventListener('dblclick', (event) => {
        event.stopPropagation();
        const label = iconElement.getAttribute('data-label') || '';
        let link = iconElement.getAttribute('data-link') || '';
        if (queryExtension) {
            link = `${link}?${queryExtension}`;
        }

        if (label && link) {
            (width && height) ? openWindow(label, link, navbar, width, height) : openWindow(label, link, navbar);
        }
    });

    return iconElement;
}


document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const iconName = params.get("iconName");
    const iconLink = params.get("iconLink");
    let imageKey = params.get("imageKey");

    const iconNameInput = document.getElementById("icon-name") as HTMLInputElement;
    const iconLinkInput = document.getElementById("icon-link") as HTMLInputElement;
    const iconPreview = document.getElementById("icon-preview") as HTMLImageElement;
    const uploadInput = document.getElementById("upload-input") as HTMLInputElement;
    const uploadMode = document.getElementById("upload-mode") as HTMLSelectElement;
    const drawInput = document.getElementById("icon-canvas") as HTMLCanvasElement;
    const drawMode = document.getElementById("draw-mode") as HTMLSelectElement;


    const actionButton = document.getElementById("icon-action-button") as HTMLButtonElement;

    if (actionButton) {
        if (iconName && iconLink && imageKey) {
            if (iconName) iconNameInput.value = iconName;
            if (iconLink) iconLinkInput.value = iconLink;
            if (imageKey) {
                const storedImage = localStorage.getItem(imageKey);
                if (storedImage && iconPreview) {
                    iconPreview.src = storedImage;
                }
            }
            actionButton.textContent = "Save Changes";
            actionButton.classList.remove("create-button");
            actionButton.classList.add("edit-button");
        } else {
            actionButton.textContent = "Create Icon";
            actionButton.classList.remove("edit-button");
            actionButton.classList.add("create-button");
        }

        actionButton.addEventListener("click", async (event) => {
            event.preventDefault();
            const updatedName = iconNameInput.value.trim();
            let updatedLink = iconLinkInput.value.trim();
            if (updatedLink.startsWith("www")) {
                updatedLink = `https://${updatedLink}`;
            }
            const isEditMode = actionButton.classList.contains("edit-button");

            if ((!uploadMode.classList.contains('hidden')) && uploadInput.files && uploadInput.files[0]) {
                if (isEditMode && imageKey) {
                    const updatedImage = iconPreview.src;

                    await processAndStoreImage(updatedImage, imageKey);
                } else {
                    const reader = new FileReader();
                    reader.onload = async () => {
                        const updatedImage = reader.result as string;

                        imageKey = `icon-${numIcons.value + 1}`;
                        numIcons.value += 1;

                        await processAndStoreImage(updatedImage, imageKey);
                    };
                    reader.readAsDataURL(uploadInput.files[0]);
                }
            } else if ((!drawMode.classList.contains('hidden')) && drawInput) {
                if (isEditMode && imageKey) {
                    await processAndStoreCanvas(drawInput, imageKey);
                } else {
                    imageKey = `icon-${numIcons.value + 1}`;
                    numIcons.value += 1;

                    await processAndStoreCanvas(drawInput, imageKey);
                }
            }

            if (!updatedName || !updatedLink || !imageKey) {
                alert("Please fill out all fields.");
                return;
            }

            const channel = new BroadcastChannel("desktop-icon");
            channel.postMessage({
                type: isEditMode ? "edit" : "create",
                icon: {
                    label: updatedName,
                    link: updatedLink,
                    imageKey: imageKey,
                },
            });
        });
    }
});
