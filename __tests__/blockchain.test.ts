import Blockchain from '../src/lib/blockchain';

describe("Blockchain tests", () => {
    
    it('Should has genesis blocks', () =>{
        const blockchain = new Blockchain();
        expect(blockchain.blocks.length).toEqual(1);
    })
})