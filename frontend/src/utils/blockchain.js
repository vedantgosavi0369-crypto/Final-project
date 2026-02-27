import { BrowserProvider, Contract } from 'ethers';

// Mock ABI for the audit log contract
const AUDIT_ABI = [
    "event DocumentAccessed(string recordHash, address doctor, string reason, uint256 timestamp)",
    "function logAccessReason(string memory recordHash, string memory reason) public"
];

// Fallback address for mock deployment
const MOCK_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Interacts with Polygon Smart Contract.
 * In production, it connects to MetaMask or another injected provider.
 */
export async function logAccessReason(recordHash, reason) {
    try {
        if (!window.ethereum) {
            console.warn("No Web3 provider found. Using mock signature.");
            // Simulate network delay for Mock
            await new Promise(resolve => setTimeout(resolve, 800));
            return {
                status: "mock_success",
                hash: recordHash,
                reason: reason,
                txLog: `MOCK_TX_${Math.random().toString(36).substring(7)}`
            };
        }

        const provider = new BrowserProvider(window.ethereum);
        // Request account access
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();

        // Instance of the contract
        const auditContract = new Contract(MOCK_CONTRACT_ADDRESS, AUDIT_ABI, signer);

        // Call the function
        const tx = await auditContract.logAccessReason(recordHash, reason);

        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log("Transaction Hash:", tx.hash);

        return { status: "success", txHash: tx.hash, receipt };

    } catch (error) {
        console.error("Blockchain signature failed:", error);
        throw error;
    }
}
