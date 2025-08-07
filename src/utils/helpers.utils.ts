import Table from 'cli-table3';

export class Helpers {

    static normalizeAddresses(dbObject: any): any {
        const normalized = { ...dbObject } as any;

        Object.keys(normalized).forEach(key => {
            if (typeof normalized[key] === 'string') {
                normalized[key] = normalized[key].toLowerCase();
            }
        });

        return normalized;
    }

    static consoleTable(header: any[], data: any[][]) {
        var table = new Table();

        table.push(header);
        data.forEach(e => table.push(e));

        console.log(table.toString());
    }

    static short(addr: string) {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
}