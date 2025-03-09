import { getProvider } from "./provider";

const getSigner = async () => {
    const provider = getProvider();
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const signer = provider.getSigner();
    return signer;
};

export { getSigner };