export default class Block {
    index: number;
    hash: string;

    constructor(index: number, hash: string) {
        this.index = index;
        this.hash = hash;
    }

    isValid(): boolean{
        if (this.index < 0) return false;
        if (!this.hash) return false;
        return true
    }
}
