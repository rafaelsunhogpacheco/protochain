import { describe, it, expect, beforeAll } from '@jest/globals';
import Block from '../src/lib/block';
import BlockInfo from '../src/lib/blockInfo';

describe("Block tests", () => {

    const exampleDifficulty = 1;
    const exampleMiner = "rafael";
    let genesis: Block;

    beforeAll(() => {
        genesis = new Block({
            data: "genesis"
        }as Block);
    })
    
    it('Should be valid', () =>{
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            data: "block 2"
        }as Block);
        block.mine(exampleDifficulty, exampleMiner)
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
        console.log(block.hash)
        expect(valid.success).toBeTruthy();
    })

    it('Should create from blockInfo', () =>{
        const block = Block.fromBlockInfo({
            data: "Block 2",
            difficulty: exampleDifficulty,
            feePerTx: 1,
            index: 1,
            maxDifficulty: 62,
            previousHash: genesis.hash
        } as BlockInfo)
        block.mine(exampleDifficulty, exampleMiner);

        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
        expect(valid.success).toBeTruthy();
    })

    it('Should NOT be valid (fallbacks)', () =>{
        const block = new Block();
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (previous hash)', () =>{
        const block = new Block({
            index: 1,
            previousHash: "abc",
            data: "block 2"
        }as Block);
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (timestamp)', () =>{
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            data: "block 2"
        }as Block);
        block.timestamp = -1;
        block.hash = block.getHash()
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (empty hash)', () =>{
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            data: "block 2"
        }as Block);
        block.mine(exampleDifficulty, exampleMiner)
        block.hash = "";
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (no mined)', () =>{
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            data: "block 2"
        }as Block);

        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (data)', () =>{
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            data: ""
        }as Block);
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (index)', () =>{
        const block = new Block({
            index: -1,
            previousHash: genesis.hash,
            data: "block 2"
        }as Block);
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
        expect(valid.success).toBeFalsy();
    })

    
})