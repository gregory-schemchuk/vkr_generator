export class DatabaseInternalError extends Error {

    constructor(e:String) {
        super("DB error: " + e);
    }

}