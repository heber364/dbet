import { providers } from "ethers";

interface Ethereum extends providers.ExternalProvider {
  isMetaMask?: boolean;
  // Outras propriedades específicas podem ser adicionadas aqui
}

declare global {
  interface Window {
    ethereum?: Ethereum;
  }
}

// Necessário para garantir que o arquivo seja tratado como um módulo TypeScript
export {};