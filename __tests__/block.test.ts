import Block from '../src/lib/block';

describe("Block tests", () => {
    
    it('Should be valid', () =>{
        const block = new Block(1, "abc");
        const valid = block.isValid();
        expect(valid).toBeTruthy();
    })

    it('Should NOT be valid (hash)', () =>{
        const block = new Block(1, "");
        const valid = block.isValid();
        expect(valid).toBeFalsy();
    })

    it('Should NOT be valid (hash)', () =>{
        const block = new Block(-1, "abc");
        const valid = block.isValid();
        expect(valid).toBeFalsy();
    })

    
})