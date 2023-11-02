import Block from '../src/lib/block';
import Blockchain from '../src/lib/blockchain';
import Transaction from '../src/lib/transaction';
import TransactionInput from '../src/lib/transactionInput';

jest.mock('../src/lib/block')
jest.mock('../src/lib/transaction');
jest.mock('../src/lib/transactionInput');

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
                txInput: new TransactionInput()
            } as Transaction)],
        }as Block));
        expect(blockchain.isValid().success).toEqual(true);
    })

    it('Should NOT be valid', () =>{
        const blockchain = new Blockchain();
        const tx = new Transaction({
            txInput: new TransactionInput()
        } as Transaction);
        blockchain.mempool.push(tx);
        blockchain.addBlock(new Block({
            index: 1,
            previousHash: blockchain.blocks[0].hash,
            transactions: [tx],
        }as Block));
        blockchain.blocks[1].index = -1
        expect(blockchain.isValid().success).toEqual(false);
    })

    it('Should add transaction', () =>{
        const blockchain = new Blockchain();
        const tx = new Transaction({
            txInput: new TransactionInput(),
            hash: 'xyz',
        } as Transaction);
        const validation = blockchain.addTransaction(tx);
        expect(validation.success).toEqual(true);
    })

    it('Should NOT add transaction (Invalid tx)', () =>{
        const blockchain = new Blockchain();

        const txInput = new TransactionInput()
        txInput.amount = -10;

        const tx = new Transaction({
            txInput: txInput,
            hash: 'xyz',
        } as Transaction);
        const validation = blockchain.addTransaction(tx);
        expect(validation.success).toEqual(false);
    })

    it('Should NOT add transaction (Duplicated in blockchain)', () =>{
        const blockchain = new Blockchain();
        const tx = new Transaction({
            txInput: new TransactionInput(),
            hash: 'xyz',
        } as Transaction);

        blockchain.blocks.push(new Block({
            transactions: [tx],
        } as Block));
        const validation = blockchain.addTransaction(tx);
        expect(validation.success).toEqual(false);
    })

    it('Should NOT add transaction (Duplicated in mempool)', () =>{
        const blockchain = new Blockchain();
        const tx = new Transaction({
            txInput: new TransactionInput(),
            hash: 'xyz',
        } as Transaction);

        blockchain.mempool.push(tx);
        const validation = blockchain.addTransaction(tx);
        expect(validation.success).toEqual(false);
    })

    it('Should get transaction (mempool)', () =>{
        const blockchain = new Blockchain();
        const tx = new Transaction({
            txInput: new TransactionInput(),
            hash: 'xyz',
        } as Transaction);

        blockchain.mempool.push(tx);
        const result = blockchain.getTransaction('xyz');
        expect(result.mempoolIndex).toEqual(0);
    })

    it('Should get transaction (blockchain)', () =>{
        const blockchain = new Blockchain();
        const tx = new Transaction({
            txInput: new TransactionInput(),
            hash: 'xyz',
        } as Transaction);

        blockchain.blocks.push(new Block({
            transactions: [tx],
        } as Block));

        const result = blockchain.getTransaction('xyz');
        expect(result.blockIndex).toEqual(1);
    })

    it('Should NOT get transaction', () =>{
        const blockchain = new Blockchain();
    
        const result = blockchain.getTransaction('xyz');
        expect(result.blockIndex).toEqual(-1);
        expect(result.mempoolIndex).toEqual(-1);
    })

    it('Should add block', () =>{
        const blockchain = new Blockchain();
        const tx = new Transaction({
            txInput: new TransactionInput()
        } as Transaction);
        blockchain.mempool.push(tx);
        const result = blockchain.addBlock(new Block({
            index: 1,
            previousHash: blockchain.blocks[0].hash,
            transactions: [tx],
        }as Block));
        expect(result.success).toEqual(true);
    })

    it('Should NOT get block', () =>{
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
                txInput: new TransactionInput(),
            } as Transaction)],
        }as Block);
        const result = blockchain.addBlock(block);
        expect(result.success).toEqual(false);
    })

    it('Should get next block info', () => {
        const blockchain = new Blockchain();
        blockchain.mempool.push(new Transaction());
        const info = blockchain.getNextBlock();
        expect (info? info.index : 0).toEqual(1);
    })

    it('Should NOT get next block info', () => {
        const blockchain = new Blockchain();
        const info = blockchain.getNextBlock();
        expect (info).toBeNull();
    })

})