import Block from "./block";
import Validation from "./validation";

export default class Blockchain {
    blocks: Block[];
    nextIndex: number = 0;
    static readonly DIFFICULTY_FACTOR = 5;

    constructor() {
        this.blocks = [new Block({
            index: this.nextIndex,
            previousHash: ""  ,
            data: "genesis"
        }as Block)];
        this.nextIndex++;
    }

    getLastBlock(): Block {
        return this.blocks[this.blocks.length - 1];
    }

    getDifficulty() :number {
        return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR)
    }

    addBlock(block: Block): Validation {
        const lastBlock = this.getLastBlock();

        const validation = block.isValid(lastBlock.hash, lastBlock.index, this.getDifficulty())
        if(!validation.success)
        return new Validation(false, `Invalid Block ${validation.message}`);

        this.blocks.push(block);
        this.nextIndex++;

        return new Validation();
    }

    getBlock(hash: string): Block | undefined {
        return this.blocks.find(b => b.hash === hash)
    }

    isValid(): Validation {
        for (let i = this.blocks.length - 1; i > 0; i--) {
            const currentBlock = this.blocks[i];
            const previousBlock = this.blocks[i - 1];
            const validation = currentBlock.isValid(previousBlock.hash, previousBlock.index, this.getDifficulty());
            if (!validation.success)
            return new Validation(false, `Invalid Block #${currentBlock.index}: + ${validation.message}`);
        }
        return new Validation();
    }
}