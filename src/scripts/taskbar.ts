import { cumsum, incrementCumsum, resetCumsum } from './sharedState';

function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const timeDisplay = document.getElementById("time-display");

    if (timeDisplay) {
        timeDisplay.textContent = `${hours}:${minutes}`;
    }
}

setInterval(updateTime, 1000);
updateTime();

let isOverflowMenuVisible = false;

export function updateTaskbar() {
    const overflowBtn = document.querySelector('.overflow-btn') as HTMLElement;
    const overflowMenu = document.querySelector('.overflow-menu') as HTMLElement;
    const taskbarTabs = document.querySelector('.taskbar-tabs') as HTMLElement;
    const timeDisplay = document.querySelector('.time-display') as HTMLElement;
    const startMenuButton = document.getElementById("start-menu-button") as HTMLElement;

    function updateOverflowButtonVisibility() {
        overflowBtn.style.display = overflowMenu.children.length > 0 ? 'inline-block' : 'none';
    }

    function redistributeTabs(tabsArray: HTMLElement[]) {
        const availableWidth = window.innerWidth;

        taskbarTabs.innerHTML = '';
        taskbarTabs.appendChild(startMenuButton);
        overflowMenu.innerHTML = '';

        tabsArray.forEach((tab) => {
            if (cumsum.value + tab.offsetWidth + 100 <= availableWidth) {
                taskbarTabs.appendChild(tab);
                incrementCumsum(tab.offsetWidth);
            } else {
                overflowMenu.appendChild(tab);
            }
        });

        updateOverflowButtonVisibility();
    }

    resetCumsum(timeDisplay.offsetWidth + overflowBtn.offsetWidth + startMenuButton.offsetWidth);

    const tabsArray = [
        ...Array.from(taskbarTabs.children),
        ...Array.from(overflowMenu.children),
    ] as HTMLElement[];

    redistributeTabs(tabsArray);
}

document.addEventListener('DOMContentLoaded', () => {
    const overflowBtn = document.querySelector('.overflow-btn') as HTMLElement;
    const overflowMenu = document.querySelector('.overflow-menu') as HTMLElement;
    
    updateTaskbar();

    window.addEventListener('resize', updateTaskbar);

    overflowBtn.addEventListener('click', () => {
        isOverflowMenuVisible = !isOverflowMenuVisible;
        overflowMenu.style.display = isOverflowMenuVisible ? 'block' : 'none';
    });

    document.addEventListener('click', (event) => {
        if (
            !overflowMenu.contains(event.target as Node) &&
            !overflowBtn.contains(event.target as Node)
        ) {
            isOverflowMenuVisible = false;
            overflowMenu.style.display = 'none';
        }
    });
});
