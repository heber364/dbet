'use client'
import { getProvider } from "@/lib/blockchain/provider";
import { getSigner } from "@/lib/blockchain/wallet";

export default function Home() {

  const handleConnect = async () => {
    const provider = getProvider();
    const signer = await getSigner(provider);
    console.log(signer)
  }
  return (
    <div>
      <h1>Hello world</h1>
      <button onClick={() => handleConnect()}>Connect with metamask</button>
    </div>
  );
}
