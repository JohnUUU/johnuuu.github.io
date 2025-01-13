import { openWindow } from "./windowManager";
import { virus, antivirus } from "./virus";
import { nested } from "./sharedState";


document.addEventListener("DOMContentLoaded", () => {
    const startMenuButton = document.getElementById("start-menu-button") as HTMLElement;
    const taskbar = document.querySelector('.taskbar') as HTMLElement;

    let isDropdownVisible = false;
    let startMenuDropdown: HTMLElement | null = null;

    startMenuButton.addEventListener("click", () => {
        if (isDropdownVisible) {
            startMenuDropdown?.remove();
            isDropdownVisible = false;
            return;
        }

        startMenuDropdown = document.createElement("div");
        startMenuDropdown.className = "start-menu-dropdown";
        startMenuDropdown.innerHTML = `
            <ul>
                <li id="resume-option" class="start-menu-item" data-tooltip="Resume from where you left off">
                    Resume (PDF)
                </li>
                <li id="create-icon-option" class="start-menu-item" data-tooltip="Portal to any website you want">
                    Create an Shortcut
                </li>
                <li id="virus-option" class="start-menu-item" data-tooltip="Trust me I'm a dolphin">
                    Totally Not a virus &#128044;
                </li>
                <li id="antivirus-option" class="start-menu-item" data-tooltip="Ba dum ba ba ba">
                    Anti-Virus &#9749;
                </li>
                <li id="simulation-option" class="start-menu-item" data-tooltip="The universe is a simulation">
                    Inception
                </li>
                <li id="youtube-option" class="start-menu-item" data-tooltip="Play a random embedded video">
                    Random Youtube Video
                </li>
                <li id="music-option" class="start-menu-item" data-tooltip="A sample of my taste in music">
                    Play some music
                </li>
                <li id="find-talent-option" class="start-menu-item" data-tooltip="Well, that's just rude...">
                    Find Other Talent
                </li>
                <li id="contact-option" class="start-menu-item" data-tooltip="Don't be shy!">
                    Contact Me
                </li>
                <li id="restart-option" class="start-menu-item" data-tooltip="Reset the Universe">Restart</li>
            </ul>
        `;

        const menuHeight = 372;
        const screenHeight = window.innerHeight - taskbar.offsetHeight;

        const adjustedX = 5;
        const adjustedY = screenHeight - menuHeight;

        startMenuDropdown.style.position = "absolute";
        startMenuDropdown.style.top = `${adjustedY}px`;
        startMenuDropdown.style.left = `${adjustedX}px`;

        document.body.appendChild(startMenuDropdown);

        isDropdownVisible = true;

        const restartOption = document.getElementById("restart-option");
        restartOption?.addEventListener("click", () => {
            location.reload();
        });

        const findTalentOption = document.getElementById("find-talent-option") as HTMLElement;
        findTalentOption?.addEventListener("click", () => {
            const label = "Find Other Talent";
            const url = "https://s111ew.github.io/random-button-redirector/";
            openWindow(label, url, false);
        });

        const createIconOption = document.getElementById("create-icon-option") as HTMLElement;
        createIconOption?.addEventListener("click", () => {
            let iconKey = `icon-${Date.now()}`;
            const queryParams = new URLSearchParams({
                iconKey: iconKey,
            });
            openWindow("Creating Icon", `/createDesktopIcon?${queryParams.toString()}`, true);
        });

        const virusOption = document.getElementById("virus-option") as HTMLElement;
        virusOption?.addEventListener("click", () => {
            virus();
        });

        const antivirusOption = document.getElementById("antivirus-option") as HTMLElement;
        antivirusOption?.addEventListener("click", () => {
            antivirus();
        });

        const simulationOption = document.getElementById("simulation-option") as HTMLElement;
        simulationOption?.addEventListener("click", () => {
            const label = "Simulating Reality";
            const url = "/?depth=" + nested.value;
            nested.value++;
            openWindow(label, url, true);
        });

        const youtubeOption = document.getElementById("youtube-option") as HTMLElement;
        youtubeOption?.addEventListener("click", () => {
            const label = "Maybe you just got unlucky?";
            const url = "https://www.youtube.com/embed/dQw4w9WgXcQ";
            openWindow(label, url, false);
        });

        const musicOption = document.getElementById("music-option") as HTMLElement;
        musicOption?.addEventListener("click", () => {
            const label = "Chill music";
            const url = "https://www.youtube.com/embed/videoseries?list=PL4MV-YucLa6cp4rW01XPoyYNYMAycFXHw";
            openWindow(label, url, true);
        });

        const contactOption = document.getElementById("contact-option") as HTMLElement;
        contactOption?.addEventListener("click", () => {
            window.location.href = "mailto:john_w_wu@brown.edu";
        });

        const resumeOption = document.getElementById("resume-option") as HTMLElement;
        resumeOption?.addEventListener("click", () => {
            openWindow("Resume (PDF)", `/resume.pdf`, true);
        });
    });

    document.addEventListener("click", (event) => {
        if (
            startMenuDropdown &&
            !startMenuDropdown.contains(event.target as Node) &&
            !startMenuButton.contains(event.target as Node)
        ) {
            startMenuDropdown.remove();
            isDropdownVisible = false;
        }
    });
});
