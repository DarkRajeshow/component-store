export const isElectron = () => {
    // @ts-expect-error Accessing Electron-specific window.process property
    return typeof window !== 'undefined' && window?.process?.type === 'renderer';
};
