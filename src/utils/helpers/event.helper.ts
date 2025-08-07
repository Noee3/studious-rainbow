import { EventNames } from "../../typechain/interfaces/event.interface";
import { Event } from "../../models/event.model";
import { Address } from "viem";

export class EventHelper {

    static async extractUsersFromEvents(events: Event[]): Promise<Address[]> {
        const users = new Set<string>();

        for (const event of events) {

            const addUser = (address: string) => {
                if (address) users.add(address.toLowerCase());
            };


            switch (event.eventName) {
                case EventNames.Supply.toLowerCase(): // provide collateral
                    addUser(event.onBehalfOf);
                    break;
                case EventNames.Withdraw.toLowerCase(): // recover collateral
                    addUser(event.user);
                    break;
                case EventNames.Borrow.toLowerCase(): // borrow funds
                    addUser(event.onBehalfOf);
                    break;
                case EventNames.Repay.toLowerCase(): // repay borrowed funds
                    addUser(event.user);
                    break;
                case EventNames.LiquidationCall.toLowerCase(): // liquidate collateral and debt
                    addUser(event.user);
                    break;
            };
        }

        return Array.from(users).map(user => user as Address);
    }

    static eventCounts(events: any[]): Record<string, number> {
        const eventCounts = events
            .filter((event: { removed: any; }) => !event.removed)
            .reduce((counts: { [x: string]: any; }, event: { eventName: string | number; }) => {
                counts[event.eventName] = (counts[event.eventName] || 0) + 1;
                return counts;
            }, {} as Record<string, number>);
        return eventCounts;
    }

}