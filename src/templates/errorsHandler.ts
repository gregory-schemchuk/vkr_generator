import {DatabaseInternalError} from "../../domain/error/DatabaseInternalError";


export function errorsHandler(err, req, res, next) {
    let status = 500;
    let statusCode: any = {internal: err.message};

    if (err instanceof DatabaseInternalError) {
        status = 500;
        statusCode = {internal: err.message};
    }
    res.status(status);
    res.json(statusCode);
    console.log(err.message + '\n' + err.stack);
    next();
}