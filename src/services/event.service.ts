import { Address } from "viem";
import { ViemService } from "./viem.service";
import { Event } from "ethers";
import { Helpers } from "../utils/helpers.utils";

export class EventService {
    constructor(private viemService: ViemService) { }

    async getContractEvents(contractAddress: Address, abi: any, blockToAdd: bigint, eventName?: string, args?: {}): Promise<any[]> {
        try {
            const result = await this.viemService.client.getContractEvents({
                address: contractAddress,
                abi: abi,
                eventName: eventName,
                args: args,
                fromBlock: this.viemService.blockNumber,
                toBlock: this.viemService.blockNumber + blockToAdd,
                //limit 500
            }) as unknown as Event[];

            return result.map(event => {
                event.args = Helpers.normalizeAddresses(event.args);
                return event;
            });
        } catch (error) {
            console.error("[EventService] :: Error fetching contract events", error);
            throw error;
        }
    }
}