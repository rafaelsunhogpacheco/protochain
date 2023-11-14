import Block from "./block";
import Validation from "./validation";
import BlockInfo from "./blockInfo";
import Transaction from "./transaction";
import TransactionType from "./transactionType";
import TransactionSearch from "./transactionSearch";
import TransactionOutput from "./transactionOutput";
import TransactionInput from "./transactionInput";

export default class Blockchain {
    blocks: Block[];
    mempool: Transaction[];
    nextIndex: number = 0;
    static readonly DIFFICULTY_FACTOR = 5;
    static readonly TX_PER_BLOCK = 2;
    static readonly MAX_DIFFICULTY = 62;

    constructor(miner: string) {
        this.blocks = [];
        this.mempool = [];

        const genesis = this.createGenesis(miner);
        this.blocks.push(genesis);
        this.nextIndex++;
    }

    createGenesis(miner: string) : Block {
        const amount = 10; //TODO calcular a recompensa

        const tx = new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput({
                amount,
                toAddress: miner
            } as TransactionOutput)]
        } as Transaction)

        tx.hash = tx.getHash()
        tx.txOutputs[0].tx = tx.hash

        const block = new Block();
        block.transactions = [tx];
        block.mine(this.getDifficulty(), miner);

        return block
    }

    getLastBlock(): Block {
        return this.blocks[this.blocks.length - 1];
    }

    addTransaction(transaction: Transaction): Validation {
        if(transaction.txInputs && transaction.txInputs.length) {
            const from = transaction.txInputs[0].fromAddress;
            const pendingTx = this.mempool
                .filter(tx => tx.txInputs && tx.txInputs.length)
                .map(tx => tx.txInputs)
                .flat()
                .filter(txi => txi!.fromAddress === from);
            
            if(pendingTx && pendingTx.length)
                return new Validation(false, `This wallet has a pendding transaction`);
            
            // calcular a origem dos fundos
            const utxo = this.getUtxo(from);
            for(let i=0; i<transaction.txInputs.length; i++) {
                const txi = transaction.txInputs[i];
                if(utxo.findIndex(txo => txo.tx === txi.previousTx && txo.amount >= txi.amount) === -1)
                    return new Validation(false, `Invalid Transaction: the TXO is already spent ou unexistent`);
            }
        }
        
        // TODO fazer versão final que valida as taxas.
        const validation = transaction.isValid();
        if(!validation.success)
            return new Validation(false, `Invalid Transaction ${validation.message}`);
        
        if(this.blocks.some(b => b.transactions.some(tx => tx.hash === transaction.hash)))
            return new Validation(false, `Duplicated tx in Blockchain ${transaction.hash}`);

        this.mempool.push(transaction);
        return new Validation(true, transaction.hash);
    }

    getDifficulty() :number {
        return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR) + 1;
    }

    addBlock(block: Block): Validation {
        const nextBlock = this.getNextBlock();
        if(!nextBlock)
            return new Validation(false, `There is no next block info.`)

        const validation = block.isValid(nextBlock.previousHash, nextBlock.index - 1, nextBlock.difficulty);
        if(!validation.success)
            return new Validation(false, `Invalid Block ${validation.message}`);

        const txs = block.transactions.filter(tx => tx.type != TransactionType.FEE).map(tx => tx.hash);
        const newMemPool = this.mempool.filter(tx => !txs.includes(tx.hash));
        if(newMemPool.length + txs.length !== this.mempool.length)
            return new Validation(false, `Invalid tx in Block: mempool`);

        this.mempool = newMemPool;

        this.blocks.push(block);
        this.nextIndex++;

        return new Validation(true, block.hash);
    }

    getBlock(hash: string): Block | undefined {
        return this.blocks.find(b => b.hash === hash)
    }

    getTransaction(hash: string): TransactionSearch {
        const mempoolIndex = this.mempool.findIndex(tx => tx.hash === hash);
        if(mempoolIndex !== -1)
            return {
                mempoolIndex,
                transaction: this.mempool[mempoolIndex]
            } as TransactionSearch;
        
        const blockIndex = this.blocks.findIndex(b => b.transactions.some(tx => tx.hash === hash));
        if(blockIndex !== -1)
            return {
                blockIndex,
                transaction: this.blocks[blockIndex].transactions.find(tx => tx.hash === hash)
            } as TransactionSearch;
        
        return {blockIndex: -1, mempoolIndex: -1} as TransactionSearch;

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

    getFeePerTx() : number {
        return 1;
    }

    getNextBlock() : BlockInfo | null {
        if(!this.mempool || !this.mempool.length)
            return null;

        const transactions = this.mempool.slice(0, Blockchain.TX_PER_BLOCK);
        const difficulty = this.getDifficulty();
        const previousHash = this.getLastBlock().hash;
        const index = this.blocks.length;
        const feePerTx = this.getFeePerTx();
        const maxDifficulty = Blockchain.MAX_DIFFICULTY;
        return {
            transactions,
            difficulty,
            previousHash,
            index,
            feePerTx,
            maxDifficulty
        } as BlockInfo;
    }

    // todos os gastos
    getTxInputs(wallet: string) : (TransactionInput | undefined)[] {
        return this.blocks
            .map(b => b.transactions)
            .flat()
            .filter(tx => tx.txInputs && tx.txInputs.length)
            .map(tx => tx.txInputs)
            .flat()
            .filter(txi => txi!.fromAddress === wallet);
    }

    // todos os recebimentos
    getTxOutputs(wallet: string) : TransactionOutput[] {
        return this.blocks
            .map(b => b.transactions)
            .flat()
            .filter(tx => tx.txOutputs && tx.txOutputs.length)
            .map(tx => tx.txOutputs)
            .flat()
            .filter(txi => txi.toAddress === wallet);
    }

    getUtxo(wallet: string) : TransactionOutput[] {
        const txIns = this.getTxInputs(wallet);
        const txOuts = this.getTxOutputs(wallet);

        if(!txIns || !txIns.length)
            return txOuts;

        txIns.forEach(txi => {
            const index = txOuts.findIndex(txo => txo.amount === txi!.amount);
            txOuts.slice(index, 1);
        })

        return txOuts;
    }

    getBalance(wallet: string) : number {
        const utxo = this.getUtxo(wallet);
        if(!utxo || !utxo.length)
            return 0;
        
        return utxo.reduce((a,b) => a + b.amount, 0)
    }
}