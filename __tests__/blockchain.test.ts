import Block from '../src/lib/block';
import Blockchain from '../src/lib/blockchain';

describe("Blockchain tests", () => {
    
    it('Should has genesis blocks', () =>{
        const blockchain = new Blockchain();
        expect(blockchain.blocks.length).toEqual(1);
    })

    it('Should be valid (genesis)', () =>{
        const blockchain = new Blockchain();
        expect(blockchain.isValid().success).toEqual(true);
    })

    it('Should be valid (two blocks)', () =>{
        const blockchain = new Blockchain();
        blockchain.addBlock(new Block(1, blockchain.blocks[0].hash, "Bloco 2"));
        expect(blockchain.isValid().success).toEqual(true);
    })

    it('Should NOT be valid', () =>{
        const blockchain = new Blockchain();
        blockchain.addBlock(new Block(1, blockchain.blocks[0].hash, "Bloco 2"));
        blockchain.blocks[1].data = "transfiro para mim"
        expect(blockchain.isValid().success).toEqual(false);
    })

    it('Should add block', () =>{
        const blockchain = new Blockchain();
        const result = blockchain.addBlock(new Block(1, blockchain.blocks[0].hash, "Bloco 2"));
        expect(result.success).toEqual(true);
    })

    it('Should get block', () =>{
        const blockchain = new Blockchain();
        const block = blockchain.getBlock(blockchain.blocks[0].hash);
        expect(block).toBeTruthy();
    })

    it('Should NOT add block', () =>{
        const blockchain = new Blockchain();
        const block = new Block(-1, blockchain.blocks[0].hash, "Bloco 2");
        const result = blockchain.addBlock(block);
        expect(result.success).toEqual(false);
    })

})