const {domainRepositoryImplPostfix, importDbClient, importDbError, exportClass, domainRepositoryPostfix,
    exportInterface, queryRepositoryImplPostfix, queryRepositoryPostfix
} = require("./langConstraints");
const {genInterfaceImport} = require("./fileProcessing");


function generateDomainRepoImpl(entityName, entityNameBig, interfaceName, fields) {
    const repoImplName = entityNameBig + domainRepositoryImplPostfix;
    let body = "" + importDbClient;
    body = body + importDbError;
    body = body + genInterfaceImport(interfaceName);
    body = body + exportClass + repoImplName + " implements " + interfaceName + "{";
    //body = body + genRepoConstructor();
    body = body + genDomainRepoGetFunc(entityName);
    body = body + genDomainRepoStoreFunc(entityName, fields);
    body = body + genDomainRepoDeleteFunc(entityName);
    body = body + "}";
    return {name: repoImplName, content: body};
}

function generateDomainRepoInterface(entityNameBig) {
    const interfaceName = entityNameBig + domainRepositoryPostfix;
    let queryRepoInterfaceBody = exportInterface + interfaceName + "{";
    queryRepoInterfaceBody = queryRepoInterfaceBody + genDomainGetSign() + ";";
    queryRepoInterfaceBody = queryRepoInterfaceBody + genDomainStoreSign() + ";";
    queryRepoInterfaceBody = queryRepoInterfaceBody + genDomainDeleteSign() + ";";
    queryRepoInterfaceBody = queryRepoInterfaceBody + "}";
    return {name: interfaceName, content: queryRepoInterfaceBody};
}

function generateQueryRepoImpl(entityName, entityNameBig, interfaceName) {
    const queryRepoImplName = entityNameBig + queryRepositoryImplPostfix;
    let body = "" + importDbClient;
    body = body + importDbError;
    body = body + genInterfaceImport(interfaceName);
    body = body + exportClass + queryRepoImplName + " implements " + interfaceName + "{";
    //body = body + genRepoConstructor();
    body = body + genRepoGetFunc(entityName);
    body = body + genRepoGetListFunc(entityName);
    body = body + "}";
    return {name: queryRepoImplName, content: body};
}

function genRepoGetListFunc(entityName) {
    let body = "async " + genQueryGetListSign() + "{";
    let innerBody = "let retVal = await dbClient." + entityName + ".findMany({skip: offset, take: limit}); return retVal;";
    body = body + genRepoFuncBlock(innerBody) + "}";
    return body;
}

function genRepoGetFunc(entityName) {
    let body = "async " + genQueryGetSign() + "{";
    let innerBody = "let retVal = await dbClient." + entityName + ".findMany({where: {id}}); return retVal[0];";
    body = body + genRepoFuncBlock(innerBody) + "}";
    return body;
}

function genDomainRepoGetFunc(entityName) {
    let body = "async " + genDomainGetSign() + "{";
    let innerBody = "let retVal = await dbClient." + entityName + ".findMany({where: {id}}); return retVal[0];";
    body = body + genRepoFuncBlock(innerBody) + "}";
    return body;
}

function genDomainRepoStoreFunc(entityName, fields) {
    let body = "async " + genDomainStoreSign() + "{";
    let innerBody = "await dbClient." + entityName + ".upsert({where: {id: entity.id},update: {" + genEntityFieldsFill(fields) + "}, create: {" + genEntityFieldsFill(fields, true) + "}});";
    body = body + genRepoFuncBlock(innerBody) + "}";
    return body;
}

function genDomainRepoDeleteFunc(entityName) {
    let body = "async " + genDomainDeleteSign() + "{";
    let innerBody = "let retVal = await dbClient." + entityName + ".delete({where: {id}});";
    body = body + genRepoFuncBlock(innerBody) + "}";
    return body;
}

function genEntityFieldsFill(fields, withId = false) {
    let body = "";
    if (withId) {
        body = body + "id: entity.id,\n";
    }
    for (let i = 0; i < fields.length; i++) {
        body = body + fields[i].name + ": entity." + fields[i].name + (i+1 === fields.length ? "\n" : ",\n");
    }
    return body;
}

function genRepoFuncBlock(innerBody) {
    return "try {" + innerBody + "} catch (e) {throw new DatabaseInternalError(e);}"
}

function genRepoConstructor() {
    return "private readonly db;constructor(db) {this.db = db;}";
}

function generateQueryRepoInterface(entityNameBig) {
    const queryRepoInterfaceName = entityNameBig + queryRepositoryPostfix;
    let queryRepoInterfaceBody = exportInterface + queryRepoInterfaceName + "{";
    queryRepoInterfaceBody = queryRepoInterfaceBody + genQueryGetSign() + ";";
    queryRepoInterfaceBody = queryRepoInterfaceBody + genQueryGetListSign() + ";";
    queryRepoInterfaceBody = queryRepoInterfaceBody + "}";
    return {name: queryRepoInterfaceName, content: queryRepoInterfaceBody};
}

function genDomainGetSign() {
    return "getById(id: string): Promise<any>";
}

function genDomainStoreSign() {
    return "store(entity): Promise<void>";
}

function genDomainDeleteSign() {
    return "delete(id: string): Promise<void>";
}

function genQueryGetSign() {
    return "getById(id: string): Promise<any>";
}

function genQueryGetListSign() {
    return "getList(limit: number, offset: number): Promise<Array<any>>";
}

module.exports = {
    generateDomainRepoImpl: generateDomainRepoImpl,
    generateDomainRepoInterface: generateDomainRepoInterface,
    generateQueryRepoImpl: generateQueryRepoImpl,
    generateQueryRepoInterface: generateQueryRepoInterface
}