import { describe, expect, it, jest, beforeAll } from '@jest/globals';
import Block from '../src/lib/block';
import Blockchain from '../src/lib/blockchain';
import Transaction from '../src/lib/transaction';
import TransactionInput from '../src/lib/transactionInput';
import Wallet from '../src/lib/wallet';
import TransactionType from '../src/lib/transactionType';
import TransactionOutput from '../src/lib/transactionOutput';

jest.mock('../src/lib/block')
jest.mock('../src/lib/transaction');
jest.mock('../src/lib/transactionInput');

describe("Blockchain tests", () => {

    let alice: Wallet, bob: Wallet;

    beforeAll(() => {
        alice = new Wallet();
        bob = new Wallet();
    });
    
    it('Should has genesis blocks', () =>{
        const blockchain = new Blockchain(alice.publicKey);
        expect(blockchain.blocks.length).toEqual(1);
    })

    it('Should be valid (genesis)', () =>{
        const blockchain = new Blockchain(alice.publicKey);
        expect(blockchain.isValid().success).toEqual(true);
    })

    it('Should be valid (two blocks)', () =>{
        const blockchain = new Blockchain(alice.publicKey);
        blockchain.addBlock(new Block({
            index: 1,
            previousHash: blockchain.blocks[0].hash,
            transactions: [new Transaction({
                txInputs: [new TransactionInput()]
            } as Transaction)],
        }as Block));
        expect(blockchain.isValid().success).toEqual(true);
    })

    it('Should NOT be valid', () =>{
        const blockchain = new Blockchain(alice.publicKey);
        const tx = new Transaction({
            txInputs: [new TransactionInput()]
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
        const blockchain = new Blockchain(alice.publicKey);
        const txo = blockchain.blocks[0].transactions[0];

        const tx = new Transaction();
        tx.hash = 'tx';
        tx.txInputs = [new TransactionInput({
            amount: 10,
            previousTx: txo.hash,
            fromAddress: alice.publicKey,
            signature: 'abc',
        } as TransactionInput)];

        tx.txOutputs = [new TransactionOutput({
            amount: 10,
            toAddress: 'abc',
        } as TransactionOutput)];

        const validation = blockchain.addTransaction(tx);
        expect(validation.success).toEqual(true);
    })

    it('Should NOT add transaction (pending tx)', () =>{
        const blockchain = new Blockchain(alice.publicKey);
        
        const tx = new Transaction();
        tx.hash = 'tx';
        tx.txInputs = [new TransactionInput({
            amount: 10,
            previousTx: 'abc',
            fromAddress: alice.publicKey,
            signature: 'abc',
        } as TransactionInput)];

        tx.txOutputs = [new TransactionOutput({
            amount: 10,
            toAddress: 'abc',
        } as TransactionOutput)];

        blockchain.mempool.push(tx);

        const validation = blockchain.addTransaction(tx);
        expect(validation.success).toBeFalsy();
    })

    it('Should NOT add transaction (Invalid tx)', () =>{
        const blockchain = new Blockchain(alice.publicKey);
        const txo = blockchain.blocks[0].transactions[0];
        
        const tx = new Transaction();
        tx.hash = 'tx';
        tx.timestamp = -1;

        tx.txInputs = [new TransactionInput({
            amount: 10,
            previousTx: txo.hash,
            fromAddress: alice.publicKey,
            signature: 'abc',
        } as TransactionInput)];

        tx.txOutputs = [new TransactionOutput({
            amount: 10,
            toAddress: 'abc',
        } as TransactionOutput)];

        const validation = blockchain.addTransaction(tx);
        expect(validation.success).toEqual(false);
    })

    it('Should NOT add transaction (Duplicated in blockchain)', () =>{
        const blockchain = new Blockchain(alice.publicKey);
        const tx = blockchain.blocks[0].transactions[0];
        const validation = blockchain.addTransaction(tx);
        expect(validation.success).toEqual(false);
    })

    it('Should get transaction (mempool)', () =>{
        const blockchain = new Blockchain(alice.publicKey);
        const tx = new Transaction({
            txInputs: [new TransactionInput()],
            hash: 'xyz',
        } as Transaction);

        blockchain.mempool.push(tx);
        const result = blockchain.getTransaction('xyz');
        expect(result.mempoolIndex).toEqual(0);
    })

    it('Should get transaction (blockchain)', () =>{
        const blockchain = new Blockchain(alice.publicKey);
        const tx = new Transaction({
            txInputs: [new TransactionInput()],
            hash: 'xyz',
        } as Transaction);

        blockchain.blocks.push(new Block({
            transactions: [tx],
        } as Block));

        const result = blockchain.getTransaction('xyz');
        expect(result.blockIndex).toEqual(1);
    })

    it('Should NOT get transaction', () =>{
        const blockchain = new Blockchain(alice.publicKey);
    
        const result = blockchain.getTransaction('xyz');
        expect(result.blockIndex).toEqual(-1);
        expect(result.mempoolIndex).toEqual(-1);
    })

    it('Should add block', () =>{
        const blockchain = new Blockchain(alice.publicKey);
        const tx = new Transaction({
            txInputs: [new TransactionInput()]
        } as Transaction);
        blockchain.mempool.push(tx);
        const result = blockchain.addBlock(new Block({
            index: 1,
            previousHash: blockchain.blocks[0].hash,
            transactions: [tx],
        }as Block));
        expect(result.success).toEqual(true);
    })

    it('Should NOT add block (invalid mempol)', () =>{
        const blockchain = new Blockchain(alice.publicKey);
        blockchain.mempool.push(new Transaction());
        blockchain.mempool.push(new Transaction());

        const tx = new Transaction({
            txInputs: [new TransactionInput()]
        } as Transaction);
        
        const result = blockchain.addBlock(new Block({
            index: 1,
            previousHash: blockchain.blocks[0].hash,
            transactions: [tx],
        }as Block));
        expect(result.success).toBeFalsy();
    })

    it('Should NOT get block', () =>{
        const blockchain = new Blockchain(alice.publicKey);
        const block = blockchain.getBlock(blockchain.blocks[0].hash);
        expect(block).toBeTruthy();
    })

    it('Should NOT add block (invalid index)', () =>{
        const blockchain = new Blockchain(alice.publicKey);
        blockchain.mempool.push(new Transaction());

        const block = new Block({
            index: -1,
            previousHash: blockchain.blocks[0].hash,
        } as Block);

        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            txOutputs: [ new TransactionOutput({
                toAddress: alice.publicKey,
                amount: 1,
            } as TransactionOutput)]
        } as Transaction));

        block.hash = block.getHash();
        const result = blockchain.addBlock(block);
        expect(result.success).toEqual(false);
    })

    it('Should get next block info', () => {
        const blockchain = new Blockchain(alice.publicKey);
        blockchain.mempool.push(new Transaction());
        const info = blockchain.getNextBlock();
        expect (info? info.index : 0).toEqual(1);
    })

    it('Should NOT get next block info', () => {
        const blockchain = new Blockchain(alice.publicKey);
        const info = blockchain.getNextBlock();
        expect (info).toBeNull();
    })

    it('Should get balance', () => {
        const blockchain = new Blockchain(alice.publicKey);
        const balance = blockchain.getBalance(alice.publicKey);
        expect (balance).toBeGreaterThan(0);
    })

    it('Should get balance', () => {
        const blockchain = new Blockchain(alice.publicKey);
        const balance = blockchain.getBalance(bob.publicKey);
        expect (balance).toEqual(0);
    })

    it('Should get UTXO', () => {
        const blockchain = new Blockchain(alice.publicKey);
        const txo = blockchain.blocks[0].transactions[0];

        const tx = new Transaction();
        tx.hash = 'tx';
        tx.txInputs = [new TransactionInput({
            amount: 10,
            previousTx: txo.hash,
            fromAddress: alice.publicKey,
            signature: 'abc',
        } as TransactionInput)];

        tx.txOutputs = [
            new TransactionOutput({
                amount: 5,
                toAddress: 'abc',
            } as TransactionOutput),
            new TransactionOutput({
                amount: 4,
                toAddress: alice.publicKey,
            } as TransactionOutput)
        ];

        blockchain.blocks.push(new Block({
            index: 1,
            transactions: [tx],
        } as Block));

        const utxo = blockchain.getUtxo(alice.publicKey);
        expect (utxo.length).toBeGreaterThan(0);
    })

    it('Should NOT add transaction (invalid UTXO)', () =>{
        const blockchain = new Blockchain(alice.publicKey);

        const tx = new Transaction();
        tx.hash = 'tx';
        tx.txInputs = [new TransactionInput({
            amount: 10,
            previousTx: 'wrong',
            fromAddress: alice.publicKey,
            signature: 'abc',
        } as TransactionInput)];

        tx.txOutputs = [new TransactionOutput({
            amount: 10,
            toAddress: 'abc',
        } as TransactionOutput)];

        const validation = blockchain.addTransaction(tx);
        expect(validation.success).toBeFalsy();
    })

})