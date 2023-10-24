import Block from '../src/lib/block';
import Blockchain from '../src/lib/blockchain';
import Transaction from '../src/lib/transaction';

jest.mock('../src/lib/block')

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
        blockchain.addBlock(new Block({
            index: 1,
            previousHash: blockchain.blocks[0].hash,
            transactions: [new Transaction({
                data: 'Bloco 2',
            } as Transaction)],
        }as Block));
        expect(blockchain.isValid().success).toEqual(true);
    })

    it('Should NOT be valid', () =>{
        const blockchain = new Blockchain();
        blockchain.addBlock(new Block({
            index: 1,
            previousHash: blockchain.blocks[0].hash,
            transactions: [new Transaction({
                data: 'Bloco 2',
            } as Transaction)],
        }as Block));
        blockchain.blocks[1].index = -1
        expect(blockchain.isValid().success).toEqual(false);
    })

    it('Should add block', () =>{
        const blockchain = new Blockchain();
        const result = blockchain.addBlock(new Block({
            index: 1,
            previousHash: blockchain.blocks[0].hash,
            transactions: [new Transaction({
                data: 'Bloco 2',
            } as Transaction)],
        }as Block));
        expect(result.success).toEqual(true);
    })

    it('Should get block', () =>{
        const blockchain = new Blockchain();
        const block = blockchain.getBlock(blockchain.blocks[0].hash);
        expect(block).toBeTruthy();
    })

    it('Should NOT add block', () =>{
        const blockchain = new Blockchain();
        const block = new Block({
            index: -1,
            previousHash: blockchain.blocks[0].hash,
            transactions: [new Transaction({
                data: 'Bloco 2',
            } as Transaction)],
        }as Block);
        const result = blockchain.addBlock(block);
        expect(result.success).toEqual(false);
    })

    it('Should get next block info', () => {
        const blockchain = new Blockchain();
        const info = blockchain.getNextBlock();
        expect (info.index).toEqual(1);
    })

})