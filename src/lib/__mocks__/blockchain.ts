import Block from "./block";
import Validation from "../validation";
import BlockInfo from "../blockInfo";

export default class Blockchain {
    blocks: Block[];
    nextIndex: number = 0;

    constructor() {
        this.blocks = [new Block({
            index: 0,
            hash: "abc",
            previousHash: ""  ,
            data: "genesis",
            timestamp: Date.now()
        }as Block)];
        this.nextIndex++;
    }

    getLastBlock(): Block {
        return this.blocks[this.blocks.length - 1];
    }

    addBlock(block: Block): Validation {
        if (block.index < 0) return new Validation(false, "Invalid mock block");
        
        this.blocks.push(block);
        this.nextIndex++;

        return new Validation();
    }

    getBlock(hash: string): Block | undefined {
        return this.blocks.find(b => b.hash === hash)
    }

    isValid(): Validation {
        return new Validation();
    }

    getFeePerTx() : number {
        return 1;
    }

    getNextBlock() : BlockInfo {
        return {
            data: new Date().toString(),
            difficulty: 0,
            previousHash: this.getLastBlock().hash,
            index: 1,
            feePerTx: this.getFeePerTx(),
            maxDifficulty: 62
        } as BlockInfo;
    }
}