import { Constants } from "./constants.utils";

export function rayDiv(a: bigint, b: bigint): bigint {
    //https://vscode.blockscan.com/8453/0x3b09f82090422fcb8f715c620e5ca23d99a26de2
    if (b === 0n) {
        return 0n; // Avoid division by zero
    }

    return ((a * Constants.RAY) + (b / 2n)) / b;
}