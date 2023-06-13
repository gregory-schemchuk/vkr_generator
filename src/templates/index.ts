import express, {NextFunction, Request, Response} from 'express';
import * as bodyParser from 'body-parser';
import {appConfig} from "./infrastructure/lib/appConfig";
import {DependencyContainer} from "./infrastructure/lib/DependencyContainer";
import entityRoutes from "./routes/entityRoutes";
import {errorsHandler} from "./infrastructure/lib/errorsHandler";


// CREATE DEPENDENCY CONTAINER

new DependencyContainer();


// CREATE HTTP REST APP

const app = express();
const port = appConfig.listenPort;

app.use(function (req: Request, res: Response, next: NextFunction) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
    res.header('Access-Control-Allow-Headers', '*');
    res.contentType('application/json');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

initModule(entityRoutes);

app.use(errorsHandler);

app.listen(port, (err?) => {
    if (err) {
        console.log(err);
    }
    console.log("Server is listening on " + port + " port");
})

function initModule(router, container?): void {
    app.use(router);
}

