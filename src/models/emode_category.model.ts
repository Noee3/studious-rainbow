export interface EmodeCategoryDB {
    id: number,
    ltv: number;
    liquidation_threshold: number;
    liquidation_bonus: number;
    label: string;
    bitmap: bigint;
    last_updated: bigint;
}


export class EmodeCategory {
    id: number;
    ltv: bigint;
    liquidationThreshold: bigint;
    liquidationBonus: bigint;
    label: string;
    bitmap: bigint;
    lastUpdated: Date;

    constructor(id: number, ltv: bigint, liquidationThreshold: bigint, liquidationBonus: bigint, label: string, bitmap: bigint, lastUpdated?: Date) {
        this.id = id;
        this.ltv = ltv;
        this.liquidationThreshold = liquidationThreshold;
        this.liquidationBonus = liquidationBonus;
        this.label = label;
        this.bitmap = bitmap;
        this.lastUpdated = lastUpdated ?? new Date();
    }

    toDB(): EmodeCategoryDB {
        return {
            id: this.id,
            ltv: Number(this.ltv),
            liquidation_threshold: Number(this.liquidationThreshold),
            liquidation_bonus: Number(this.liquidationBonus),
            label: this.label,
            bitmap: this.bitmap,
            last_updated: BigInt(this.lastUpdated.getTime())
        };
    }

    static fromDB(emodeCategoryDB: EmodeCategoryDB): EmodeCategory {
        return new EmodeCategory(
            emodeCategoryDB.id,
            BigInt(emodeCategoryDB.ltv),
            BigInt(emodeCategoryDB.liquidation_threshold),
            BigInt(emodeCategoryDB.liquidation_bonus),
            emodeCategoryDB.label,
            emodeCategoryDB.bitmap,
            new Date(Number(emodeCategoryDB.last_updated))
        );
    }
}