import { Address, } from "viem";
import { EventService } from "../services/event.service";
import { EventNames } from "../typechain/interfaces/event.interface";
import { ServiceContainer } from "../services/service_container";
import { Helpers } from "@/utils/helpers.utils";
import { Constants } from "@/utils/constants.utils";
import { EventNewRepository } from "@/repositories/event.new.repository";
import { EventNew, EventNewDB } from "../models/event.new.model";

export class EventNewController {
    public eventRepository: EventNewRepository;

    constructor(eventRepository: EventNewRepository) {
        this.eventRepository = eventRepository;
    }

    public async fetchContractEvents(contractAddress: Address, abi: any, blockToAdd: bigint, eventName?: string, args?: {}): Promise<EventNew[]> {
        try {
            return await this.eventRepository.fetchContractEventsData(contractAddress, abi, blockToAdd, eventName, args);
        } catch (error) {
            console.error("[EventController] :: Error fetching contract events", error);
            throw error;
        }
    }

    public async fetchAllEvents(where?: string): Promise<EventNew[]> {
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

    public async insertEvents(events: EventNew[]): Promise<any> {
        try {
            return await this.eventRepository.insertMany(events);
        } catch (error) {
            console.error("[EventController] :: Error inserting events", error);
            throw error;
        }
    }

    public async processEvents(events: any[]): Promise<void> {
        try {
            for (const event of events) {
                // await this.processEvent(event);
            }
        } catch (error) {
            console.error("[EventController][processEvents] :: Error processing events", error);
            throw error;
        }
    }

    // public async processEvent(event: any): Promise<void> {
    //     try {
    //         const useronBehalfOf = await ServiceContainer.userController.usersExists([event.onBehalfOf]);
    //         const user = await ServiceContainer.userController.usersExists([event.user]);

    //         switch (event.eventName) {
    //             case EventNames.ReserveDataUpdated: // triggered each time reserve data is updated
    //                 await ServiceContainer.reserveController?.updateReserve(`asset_address = '${event.reserve}'`, {
    //                     liquidity_index: BigInt(event.args.liquidityIndex),
    //                     variable_borrow_index: BigInt(event.args.variableBorrowIndex),
    //                     last_updated: BigInt(event.blockTimestamp * 1000),
    //                 });
    //                 break;
    //             case EventNames.Supply: // provide collateral
    //                 // if i want them to exist i have to create it they are new user; or not in bdd;
    //                 if (!useronBehalfOf[event.onBehalfOf]) break;
    //                 const reserve = await ServiceContainer.reserveController?.reserveRepository.fetchReservesData(event.blockNumber);
    //                 let currentReserve = reserve.find(r => r.assetAddress === event.reserve);
    //                 let newAmount = ((event.amount * Constants.RAY) + (currentReserve!.liquidityIndex / 2n)) / currentReserve!.liquidityIndex;
    //                 await ServiceContainer.userReserveController?.updateAtokenBalance(`user_address = '${event.onBehalfOf}' AND asset_address = '${event.reserve}'`, BigInt(newAmount), 'increment');
    //                 break;
    //             // case EventNames.Withdraw: // recover collateral
    //             //     if (!user[event.args.user]) break;

    //             //     console.log("Event %s :: - %s to %s, reserve atoken %s", event.eventName, BigInt(event.args.amount), event.args.user, event.args.reserve);
    //             //     await ServiceContainer.userReserveController?.updateAtokenBalance(`user_address = '${event.args.user}' AND asset_address = '${event.args.reserve}'`, BigInt(event.args.amount), 'decrement');
    //             //     break;
    //             // case EventNames.Borrow: // borrow funds
    //             //     if (!useronBehalfOf[event.args.onBehalfOf]) break;
    //             //     console.log("Event %s :: + %s to %s, reserve debtoken %s", event.eventName, BigInt(event.args.amount), event.args.onBehalfOf, event.args.reserve);
    //             //     await ServiceContainer.userReserveController?.updateVariableDebtBalance(`user_address = '${event.args.onBehalfOf}' AND asset_address = '${event.args.reserve}'`, BigInt(event.args.amount), 'increment');
    //             //     break;
    //             // case EventNames.Repay: // repay borrowed funds
    //             //     if (!user[event.args.user]) break;

    //             //     console.log("Event %s :: - %s to %s, reserve debtoken %s", event.eventName, BigInt(event.args.amount), event.args.user, event.args.reserve);
    //             //     await ServiceContainer.userReserveController?.updateVariableDebtBalance(`user_address = '${event.args.user}' AND asset_address = '${event.args.reserve}'`, BigInt(event.args.amount), 'decrement');
    //             //     break;
    //             // case EventNames.LiquidationCall:
    //             //     if (!user[event.args.user]) break;

    //             //     console.log("Event %s :: - %s to %s on reserve atoken %s, - %s on reserve debtToken %s", event.eventName, BigInt(event.args.liquidatedCollateralAmount), event.args.user, event.args.collateralAsset, BigInt(event.args.debtToCover), event.args.debtAsset);
    //             //     await ServiceContainer.userReserveController?.updateAtokenBalance(`user_address = '${event.args.user}' AND asset_address = '${event.args.collateralAsset}'`, BigInt(event.args.liquidatedCollateralAmount), 'decrement');
    //             //     await ServiceContainer.userReserveController?.updateVariableDebtBalance(`user_address = '${event.args.user}' AND asset_address = '${event.args.debtAsset}'`, BigInt(event.args.debtToCover), 'decrement');
    //             //     break;
    //         };

    //     } catch (error) {
    //         console.error("[EventController][processEvent] :: Error processing event", event, error);
    //         throw error;
    //     }
    // }
}