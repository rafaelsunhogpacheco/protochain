import dotenv from 'dotenv';
dotenv.config();

import  express, { Request, Response, NextFunction}  from "express";
import morgan from "morgan";
import Blockchain from "../lib/blockchain";
import Block from "../lib/block";
import Transaction from '../lib/transaction';

/* c8 ignore next */
const PORT: number = parseInt(`${process.env.BLOCKCHAIN_PORT || 3000}`);

const app = express();

/* c8 ignore start */
if (process.argv.includes("--run"))
    app.use(morgan('tiny'));
app.use(express.json());
/* c8 ignore end */

const blockchain = new Blockchain();

app.get('/status', (req, res, next) => {
    res.json({
        numberOfBlocks: blockchain.blocks.length,
        isValid: blockchain.isValid(),
        lastBlock: blockchain.getLastBlock()
    })
})

app.get('/blocks/next', (req: Request, res: Response, next: NextFunction) => {
    res.json(blockchain.getNextBlock());

})

app.get('/blocks/:indexOrHash', (req: Request, res: Response, next: NextFunction) => {
    let block;

    if (/^[0-9]+$/.test(req.params.indexOrHash))
        //block = res.json(blockchain.blocks[parseInt(req.params.indexOrHash)]);
        block = blockchain.blocks[parseInt(req.params.indexOrHash)];
    else
        //block = res.json(blockchain.getBlock(req.params.indexOrHash));
        block = blockchain.getBlock(req.params.indexOrHash);

    if (!block)
        return res.sendStatus(404);
    else
        return res.json(block);
})

app.post('/blocks', (req: Request, res: Response, next: NextFunction) =>{
    if (req.body.hash === undefined) return res.sendStatus(422);

    const block = new Block(req.body as Block);
    const validation = blockchain.addBlock(block)

    if(validation.success)
        res.status(201).json(block);
    else
        res.status(400).json(validation)
})

app.get('/transactions', (req: Request, res: Response, next: NextFunction) =>{
    return res.json({
        next: blockchain.mempool.slice(0, Blockchain.TX_PER_BLOCK),
        total: blockchain.mempool.length
    });
})

app.post('/transactions', (req: Request, res: Response, next: NextFunction) =>{
    if (req.body.hash === undefined) return res.sendStatus(422);

    const tx = new Transaction(req.body as Transaction);
    const validation = blockchain.addTransaction(tx);

    if(validation.success)
        res.status(201).json(tx);
    else
        res.status(400).json(validation)
})


/* c8 ignore start */
if (process.argv.includes("--run")) {
    app.listen(PORT, () => {console.log(`Blockchain server is running at PORT: ${PORT}`);})
}
/* c8 ignore end */


export {
    app
}