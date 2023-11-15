import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import Block from '../src/lib/block';
import BlockInfo from '../src/lib/blockInfo';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import TransactionInput from '../src/lib/transactionInput';
import TransactionOutput from '../src/lib/transactionOutput';
import Wallet from '../src/lib/wallet';

jest.mock('../src/lib/transaction');
jest.mock('../src/lib/transactionInput');
jest.mock('../src/lib/transactionOutput');

describe("Block tests", () => {

    const exampleDifficulty: number = 1;
    const exampleFee: number = 1;
    const exampleTx: string = 'adc2a48ae16f1b1a1006435c048fde0f822ae7d8f7fbfeec4e00018b749c6026'
    let genesis: Block;
    let alice: Wallet, bob: Wallet

    beforeAll(() => {
        alice = new Wallet()
        bob = new Wallet()

        genesis = new Block({
            transactions: [new Transaction({
                txInputs: [new TransactionInput()]
            } as Transaction)]
        } as Block);
    })

    function getFullBlock() : Block {
        const txIn = new TransactionInput({
            amount: 10,
            fromAddress: alice.publicKey,
            previousTx: exampleTx,
        } as TransactionInput)
        txIn.sign(alice.privateKey)

        const txOut = new TransactionOutput({
            amount: 10,
            toAddress: bob.publicKey,
        } as TransactionOutput)

        const tx = new Transaction({
            txInputs: [txIn],
            txOutputs: [txOut],
        } as Transaction)

        const txFee = new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput({
                amount: 1,
                toAddress: alice.publicKey,
            } as TransactionOutput)]
        } as Transaction)

        const block = new Block({
            index: 1,
            transactions: [tx, txFee],
            previousHash: genesis.hash,
        } as Block)

        block.mine(exampleDifficulty, alice.publicKey);

        return block;
    }
    
    it('Should be valid', () =>{
        const block = getFullBlock();
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
        expect(valid.success).toBeTruthy();
    })

    it('Should NOT be valid (diferent hash)', () =>{
        const block = getFullBlock();
        block.hash = "abc"; 
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (no FEE)', () =>{
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            transactions: [new Transaction({
                txInputs: [new TransactionInput()]
            } as Transaction)]
        } as Block);

        block.mine(exampleDifficulty, alice.publicKey)
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
        expect(valid.success).toBeFalsy();
    })

    it('Should create from blockInfo', () =>{
        const block = Block.fromBlockInfo({
            transactions: [new Transaction({
                txInputs: [new TransactionInput()]
            } as Transaction)],
            difficulty: exampleDifficulty,
            feePerTx: 1,
            index: 1,
            maxDifficulty: 62,
            previousHash: genesis.hash
        } as BlockInfo)

        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput({
                toAddress: alice.publicKey,
                amount: 1,
            } as TransactionOutput)],
        } as Transaction))

        block.hash = block.getHash();
        block.mine(exampleDifficulty, alice.publicKey);

        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
        console.log(valid.message)
        expect(valid.success).toBeTruthy();
    })

    it('Should NOT be valid (2 FEE)', () =>{
        const block = getFullBlock();

        const tx = new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput()]
        } as Transaction);
        tx.txInputs = undefined;

        block.transactions.push(tx);
                
        block.mine(exampleDifficulty, alice.publicKey)
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (invalid tx)', () =>{

        const block = getFullBlock();
        block.transactions[0].timestamp = -1;
        block.hash = block.getHash();
        block.mine(exampleDifficulty, alice.publicKey);
        
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (fallbacks)', () =>{
        const block = new Block();
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput()],
        } as Transaction))

        block.hash = block.getHash();
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (invalid previous hash)', () =>{
        const block = getFullBlock();
        block.previousHash = 'wrongHash';
        block.mine(exampleDifficulty, alice.publicKey);

        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (invalid timestamp)', () =>{
        const block = getFullBlock();
        block.timestamp = -1;
        block.mine(exampleDifficulty, alice.publicKey);

        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (empty hash)', () =>{
        const block = getFullBlock();
        block.hash = "";
        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (no mined)', () =>{
        const block = getFullBlock();
        block.nonce = 0;

        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (invalid index)', () =>{
        const block = getFullBlock();
        block.index = -1;

        const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty, exampleFee);
        expect(valid.success).toBeFalsy();
    })
})