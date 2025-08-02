import { Address } from "viem";
import { UserAccountData, UserAccountDataNormalized } from './user_account_data.model';


export interface ReportDataNormalized {
    user: Address;
    fromCalculation: UserAccountDataNormalized;
    fromChain: UserAccountDataNormalized;
    flags: string[];
}

export class ReportData {
    user: Address;
    fromCalculation: UserAccountData;
    fromChain: UserAccountData;
    flags: string[];

    constructor(user: Address, fromCalculation: UserAccountData, fromChain: UserAccountData, flag: string[] = []) {
        this.user = user;
        this.fromCalculation = fromCalculation;
        this.fromChain = fromChain;
        this.flags = flag;
    }

    normalize(): ReportDataNormalized {
        return {
            user: this.user,
            fromCalculation: this.fromCalculation.normalize(),
            fromChain: this.fromChain.normalize(),
            flags: this.flags
        };

    }
}