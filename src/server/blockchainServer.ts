import  express  from "express";
import morgan from "morgan";

const PORT: number = 3000;

const app = express();

app.use(morgan('tiny'));
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Blockchain server is running at PORT: ${PORT}`);
})