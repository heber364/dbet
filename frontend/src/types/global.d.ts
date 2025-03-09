declare global {
    interface Window {
        ethereum?: any;
    }
}

// Necessário para garantir que o arquivo seja tratado como um módulo TypeScript
export { };
