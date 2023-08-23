import sha256 from 'crypto-js/sha256';

export default class Block {
    index: number;
    timestamp: number;
    hash: string;
    previousHash: string;
    data: string;

    constructor(index: number, previousHash: string, data: string) {
        this.index = index;
        this.timestamp = Date.now();
        this.previousHash = previousHash;
        this.data = data;
        this.hash = this.getHash();
    }

    getHash(): string {
        return sha256(this.index + this.data + this.timestamp + this.previousHash).toString();
    }

    isValid(): boolean{
        if (this.index < 0) return false;
        if (!this.hash) return false;
        if (!this.data) return false;
        if (this.timestamp < 1) return false;
        if (!this.previousHash) return false;
        return true
    }
}
