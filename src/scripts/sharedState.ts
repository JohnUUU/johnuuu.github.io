// Global Variables
export const dragResizeState = {
    isResizing: false,
};

export const numIcons = { value: 5 };

export const nested = { value: 0};

export const iconHeight = 48;
export const iconWidth = 48;
export const margin = 25;

export const postitId = { value : 1 }



// Taskbar Variables
export const cumsum = { value: 0 };

export function incrementCumsum(width: number): void {
    cumsum.value += width;
}

export function decrementCumsum(width: number): void {
    cumsum.value -= width;
}

export function resetCumsum(initialValue: number = 0): void {
    cumsum.value = initialValue;
}

// Window Variables
export const windowStateMap = new Map<string, { label: string }>();