import sha256 from 'crypto-js/sha256';
import Validation from './validation';
import BlockInfo from './blockInfo';

export default class Block {
    index: number;
    timestamp: number;
    hash: string;
    previousHash: string;
    data: string;
    nonce: number;
    miner: string;

    constructor(block?: Block) {
        this.index = block?.index || 0;
        this.timestamp = block?.timestamp || Date.now();
        this.previousHash = block?.previousHash || "";
        this.data = block?.data || "";
        this.nonce = block?.nonce || 0;
        this.miner = block?.miner || "";
        this.hash = block?.hash || this.getHash();
    }

    getHash(): string {
        return sha256(this.index + this.data + this.timestamp + this.previousHash + this.nonce + this.miner).toString();
    }

    mine(difficulty: number, miner: string) {
        this.miner = miner;
        const prefix = new Array(difficulty + 1).join("0");
        console.log('prefix', prefix)

        do {
            this.nonce++;
            this.hash = this.getHash()

        }while (!this.hash.startsWith(prefix))
    }

    isValid(previousHash: string, previousIndex: number, difficulty: number): Validation{
        if (previousIndex !== this.index - 1) return new Validation(false, "Invalid Index");
        if (!this.data) return new Validation(false, "Invalid data");
        if (this.timestamp < 1) return new Validation(false, "Invalid Timestamp");
        if (this.previousHash !== previousHash) return new Validation(false, "Invalid Previous Hash");
        if (!this.nonce || !this.miner) return new Validation(false, "No mined.")

        const prefix = new Array(difficulty + 1).join("0");
        if (this.hash !== this.getHash() || !this.hash.startsWith(prefix))
            return new Validation(false, "Invalid hash.");


        return new Validation();
    }

    static fromBlockInfo(blockInfo: BlockInfo): Block {
        const block = new Block();
        block.index = blockInfo.index;
        block.previousHash = blockInfo.previousHash;
        block.data = blockInfo.data;
        return block;
    }
}
