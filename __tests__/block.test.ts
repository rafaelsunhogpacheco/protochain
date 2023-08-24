import { describe, it, expect, beforeAll } from '@jest/globals';
import Block from '../src/lib/block';

describe("Block tests", () => {

    let genesis: Block;

    beforeAll(() => {
        genesis = new Block(0, ""  ,"genesis");
    })
    
    it('Should be valid', () =>{
        const block = new Block(1, genesis.hash, "block 2");
        const valid = block.isValid(genesis.hash, genesis.index);
        expect(valid).toBeTruthy();
    })

    it('Should NOT be valid (previous hash)', () =>{
        const block = new Block(1, "abc", "block 2");
        const valid = block.isValid(genesis.hash, genesis.index);
        expect(valid).toBeFalsy();
    })

    it('Should NOT be valid (timestamp)', () =>{
        const block = new Block(1, genesis.hash, "block 2");
        block.timestamp = -1;
        block.hash = block.getHash()
        const valid = block.isValid(genesis.hash, genesis.index);
        expect(valid).toBeFalsy();
    })

    it('Should NOT be valid (hash)', () =>{
        const block = new Block(1, genesis.hash, "block 2");
        block.hash = "";
        const valid = block.isValid(genesis.hash, genesis.index);
        expect(valid).toBeFalsy();
    })

    it('Should NOT be valid (data)', () =>{
        const block = new Block(1, genesis.hash, "");
        const valid = block.isValid(genesis.hash, genesis.index);
        expect(valid).toBeFalsy();
    })

    it('Should NOT be valid (index)', () =>{
        const block = new Block(-1, genesis.hash,  "block 2");
        const valid = block.isValid(genesis.hash, genesis.index);
        expect(valid).toBeFalsy();
    })

    
})