

export default class Block {
    index: number;
    timestamp: number;
    hash: string;
    previousHash: string;
    data: string;

    constructor(index: number, hash: string, previousHash: string, data: string) {
        this.index = index;
        this.hash = hash;
        this.timestamp = Date.now();
        this.previousHash = previousHash;
        this.data = data
    }

    isValid(): boolean{
        if (this.index < 0) return false;
        if (!this.hash) return false;
        return true
    }
}
