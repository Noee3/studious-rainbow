import { Address, } from "viem";
import { EventService } from "../services/event.service";
import { EventNames } from "../typechain/interfaces/event.interface";
import { ServiceContainer } from "../services/service_container";
import { Helpers } from "@/utils/helpers.utils";
import { Constants } from "@/utils/constants.utils";
import { EventRepository } from "@/repositories/event.repository";
import { Event, EventDB } from "../models/event.model";
import assert from "assert";
import { rayDiv } from "@/utils/math.utils";

export class EventController {
    public eventRepository: EventRepository;

    constructor(eventRepository: EventRepository) {
        this.eventRepository = eventRepository;
    }

    public async fetchContractEvents(contractAddress: Address, abi: any, fromBlock: bigint, toBlock: bigint, eventName?: string, args?: {}): Promise<Event[]> {
        try {
            return await this.eventRepository.fetchContractEventsData(contractAddress, abi, fromBlock, toBlock, eventName, args);
        } catch (error) {
            console.error("[EventController] :: Error fetching contract events", error);
            throw error;
        }
    }

    public async fetchAllEvents(where?: string): Promise<Event[]> {
        try {
            return await this.eventRepository.fetchAll(where);
        } catch (error) {
            console.error("[EventController][fetchAllEvents] :: Error fetching events:", error);
            throw error;
        }
    }

    public async getEventsCount(where?: string): Promise<number> {
        try {
            return await this.eventRepository.getTableCount(where);
        } catch (error) {
            console.error("[EventController] :: Error getting events count", error);
            throw error;
        }
    }

    public async insertEvents(events: Event[]): Promise<any> {
        try {
            return await this.eventRepository.insertMany(events);
        } catch (error) {
            console.error("[EventController] :: Error inserting events", error);
            throw error;
        }
    }

    public async extractUsersFromEvents(events: Event[]): Promise<Address[]> {
        const users = new Set<string>();

        for (const event of events) {

            const addUser = (address: string) => {
                if (address) users.add(address.toLowerCase());
            };


            switch (event.eventName) {
                case EventNames.Supply.toLowerCase(): // provide collateral
                    addUser(event.eventArgs.onBehalfOf);
                    addUser(event.eventArgs.user);
                    break;
                case EventNames.Withdraw.toLowerCase(): // recover collateral
                    addUser(event.eventArgs.user);
                    addUser(event.eventArgs.to);
                    break;
                case EventNames.Borrow.toLowerCase(): // borrow funds
                    addUser(event.eventArgs.onBehalfOf);
                    break;
                case EventNames.Repay.toLowerCase(): // repay borrowed funds
                    addUser(event.eventArgs.user);
                    addUser(event.eventArgs.onBehalfOf);
                    break;
                case EventNames.LiquidationCall.toLowerCase(): // liquidate collateral and debt
                    addUser(event.eventArgs.user);
                    break;
            };
        }

        return Array.from(users).map(user => user as Address);
    }

    public async processEvents(events: Event[]): Promise<void> {
        try {
            for (const event of events) {
                await this.processEvent(event);
            }
        } catch (error) {
            console.error("[EventController][processEvents] :: Error processing events", error);
            throw error;
        }
    }



    public async processEvent(event: Event): Promise<void> {
        try {
            const users = await ServiceContainer.userController.usersExists([event.eventArgs.onBehalfOf, event.eventArgs.user]);
            const currentReserve = await ServiceContainer.reserveController?.fetchAllReserves(`asset_address = '${event.eventArgs.reserve ?? event.eventArgs.collateralAsset}'`);

            // console.log("event", event);

            switch (event.eventName) {
                case EventNames.ReserveDataUpdated: // triggered each time reserve data is updated
                    await ServiceContainer.reserveController?.updateReserve(`asset_address = '${event.eventArgs.reserve}'`, {
                        liquidity_index: BigInt(event.eventArgs.liquidityIndex),
                        variable_borrow_index: BigInt(event.eventArgs.variableBorrowIndex),
                        last_updated: BigInt(event.blockTimestamp * 1000n),
                    });
                    break;
                case EventNames.Supply: // provide collateral
                    //TODO if i want them to exist i have to create it they are new user; or not in bdd;
                    if (!users[event.eventArgs.onBehalfOf]) break;
                    const amountScaled = rayDiv(BigInt(event.eventArgs.amount), currentReserve[0].liquidityIndex);
                    await ServiceContainer.userReserveController?.updateAtokenBalance(`user_address = '${event.eventArgs.onBehalfOf}' AND asset_address = '${event.eventArgs.reserve}'`, BigInt(amountScaled), 'increment');
                    break;
                case EventNames.Withdraw: // recover collateral
                    if (!users[event.eventArgs.user]) break;
                    console.log("WITHDRAW", event.eventArgs.user);
                    const amountScaledWithdraw = rayDiv(BigInt(event.eventArgs.amount), currentReserve[0].liquidityIndex);
                    await ServiceContainer.userReserveController?.updateAtokenBalance(`user_address = '${event.eventArgs.user}' AND asset_address = '${event.eventArgs.reserve}'`, BigInt(amountScaledWithdraw), 'decrement');
                    break;
                case EventNames.Borrow: // borrow funds
                    if (!users[event.eventArgs.onBehalfOf]) break;
                    const amountScaledBorrow = rayDiv(BigInt(event.eventArgs.amount), currentReserve[0].variableBorrowIndex);
                    await ServiceContainer.userReserveController?.updateVariableDebtBalance(`user_address = '${event.eventArgs.onBehalfOf}' AND asset_address = '${event.eventArgs.reserve}'`, BigInt(amountScaledBorrow), 'increment');
                    break;
                case EventNames.Repay: // repay borrowed funds
                    if (!users[event.eventArgs.user]) break;
                    const amountScaledRepay = rayDiv(BigInt(event.eventArgs.amount), currentReserve[0].variableBorrowIndex);
                    await ServiceContainer.userReserveController?.updateVariableDebtBalance(`user_address = '${event.eventArgs.user}' AND asset_address = '${event.eventArgs.reserve}'`, BigInt(amountScaledRepay), 'decrement');
                    break;
                case EventNames.LiquidationCall:
                    console.log("LIQUIDATION CALL");
                    if (!users[event.eventArgs.user]) break;
                    const debtReserve = await ServiceContainer.reserveController?.fetchAllReserves(`asset_address = '${event.eventArgs.debtAsset}'`);

                    const collateralScaled = rayDiv(BigInt(event.eventArgs.liquidatedCollateralAmount), currentReserve[0].liquidityIndex);
                    const debtScaled = rayDiv(BigInt(event.eventArgs.debtToCover), debtReserve[0].variableBorrowIndex);
                    await ServiceContainer.userReserveController?.updateAtokenBalance(`user_address = '${event.eventArgs.user}' AND asset_address = '${event.eventArgs.collateralAsset}'`, BigInt(collateralScaled), 'decrement');
                    await ServiceContainer.userReserveController?.updateVariableDebtBalance(`user_address = '${event.eventArgs.user}' AND asset_address = '${event.eventArgs.debtAsset}'`, BigInt(debtScaled), 'decrement');
                    break;
            };

        } catch (error) {
            console.error("[EventController][processEvent] :: Error processing event", event, error);
            throw error;
        }
    }

    public eventCounts(events: any[]): Record<string, number> {
        const eventCounts = events
            .filter((event: { removed: any; }) => !event.removed)
            .reduce((counts: { [x: string]: any; }, event: { eventName: string | number; }) => {
                counts[event.eventName] = (counts[event.eventName] || 0) + 1;
                return counts;
            }, {} as Record<string, number>);
        return eventCounts;
    }
}
