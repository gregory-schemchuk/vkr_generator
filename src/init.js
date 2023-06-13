const {exampleJson} = require("./example");
const {capitalizeFirstLetter} = require("./utils");
const {createFolderStructure, createEnvFile, createConfigFile, createDbClientFile, createIndexFile, createAppConfig,
    createErrors, getEntityDir, createProjFile, createDependencyContainer
} = require("./fileProcessing");
const {generateQueryRepoInterface, generateDomainRepoInterface, generateDomainRepoImpl, generateQueryRepoImpl} = require("./repositoryGenerator");
const {queryRepoDir, separator, queryRepoImplDir, domainRepoDir, domainRepoImplDir, serviceDir, serviceImplDir,
    entityDomainDir, controllerDir, routesDir, prismaDb
} = require("./langConstraints");
const {generateServiceInterface, generateServiceImpl, generateEntityObject} = require("./serviceGenerator");
const {generateControllerClass, generateRouter} = require("./controllerGenerator");


const userDbData = {user: 'postgres', pass: '1234', typeName: "postgresql", dbName: "vkr_tests"};

function init() {
    for (let i = 0; i < exampleJson.length; i++) {
        startLog(exampleJson[i].name);

        const entityName = exampleJson[i].name;
        const entityNameBig = capitalizeFirstLetter(exampleJson[i].name);

        generateCreateStructure(entityName);
        console.log("generating repositories to " + exampleJson[i].name);
        let {entityQueryRepoName, entityQueryRepoImplName} = generateQueryRepo(entityName, entityNameBig);
        let {entityDomainRepoName, entityDomainRepoImplName} = generateDomainRepo(entityName, entityNameBig, exampleJson[i].fields);
        console.log("generating services to " + exampleJson[i].name);
        let {entityServiceName, entityServiceImplName} = generateService(entityName, entityNameBig, exampleJson[i].fields, entityDomainRepoName);
        console.log("generating controllers to " + exampleJson[i].name);
        let controllerName = generateController(entityName, entityNameBig, entityServiceName, entityQueryRepoName);
        generateRouterFile(entityName, controllerName, entityServiceName, entityQueryRepoName);

        createDependencyContainer(__dirname, entityName, entityDomainRepoName, entityDomainRepoImplName, entityQueryRepoName, entityQueryRepoImplName, entityServiceName, entityServiceImplName);
        generateDbPrismaFile(entityName, entityNameBig, exampleJson[i].fields);
        console.log("Entity " + exampleJson[i].name + " generated successfully");
    }
}

function startLog(name) {
    console.log("generating entity data: " + name);
    console.log("initializing core settings files");
    console.log("creating project structure");
    console.log("generating repositories to " + name);
}

function generateDbPrismaFile(entityName, entityNameBig, fields) {
    let body = `generator client {
      provider = "prisma-client-js"
    }
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }`;
    body = body + "model " + entityNameBig + "{    \nid String @id\n";
    for (let i = 0; i < fields.length; i++) {
        body = body + fields[i].name + " " + getDbPrismaType(fields[i].type) + "\n";
    }
    body = body + "}";
    createProjFile(__dirname + separator + entityName + separator + prismaDb, 'schema.prisma', body, true);
}

function getDbPrismaType(fieldType) {
    switch (fieldType) {
        case "string":
            return "String?";
        case "number":
            return "Float?";
        case "date":
            return "DateTime?";
        case "object":
            // uuid reference
            return "String?";
        default:
            return "String?";
    }
}

function generateCreateStructure(entityName) {
    createFolderStructure(__dirname, entityName);
    createEnvFile(__dirname, entityName, userDbData.user, userDbData.pass, userDbData.typeName, userDbData.dbName);

    createConfigFile(__dirname, entityName);
    createDbClientFile(__dirname, entityName);
    createIndexFile(__dirname, entityName);
    createAppConfig(__dirname, entityName);
    createErrors(__dirname, entityName);
}

function generateQueryRepo(entityName, entityNameBig) {
    // interface
    let fileData = generateQueryRepoInterface(entityNameBig);
    let entityQueryRepoName = fileData.name;
    createProjFile(getEntityDir(__dirname, entityName) + separator + queryRepoDir, fileData.name, fileData.content);
    // impl
    fileData = generateQueryRepoImpl(entityName, entityNameBig, fileData.name);
    let entityQueryRepoImplName = fileData.name;
    createProjFile(getEntityDir(__dirname, entityName) + separator + queryRepoImplDir, fileData.name, fileData.content);
    return {entityQueryRepoName, entityQueryRepoImplName};
}

function generateDomainRepo(entityName, entityNameBig, fields) {
    // interface
    let fileData = generateDomainRepoInterface(entityNameBig);
    let entityDomainRepoName = fileData.name;
    createProjFile(getEntityDir(__dirname, entityName) + separator + domainRepoDir, fileData.name, fileData.content);
    // impl
    fileData = generateDomainRepoImpl(entityName, entityNameBig, fileData.name, fields);
    let entityDomainRepoImplName = fileData.name;
    createProjFile(getEntityDir(__dirname, entityName) + separator + domainRepoImplDir, fileData.name, fileData.content);
    return {entityDomainRepoName, entityDomainRepoImplName};
}

function generateService(entityName, entityNameBig, fields, entityDomainRepoName) {
    let fileData = generateServiceInterface(entityNameBig);
    createProjFile(getEntityDir(__dirname, entityName) + separator + serviceDir, fileData.name, fileData.content);
    let entityServiceName = fileData.name;

    fileData = generateServiceImpl(entityName, entityNameBig, fileData.name, entityDomainRepoName, fields);
    createProjFile(getEntityDir(__dirname, entityName) + separator + serviceImplDir, fileData.name, fileData.content);
    let entityServiceImplName = fileData.name;

    fileData = generateEntityObject(entityNameBig, fields);
    createProjFile(getEntityDir(__dirname, entityName) + separator + entityDomainDir, fileData.name, fileData.content);
    return {entityServiceName, entityServiceImplName};
}

function generateController(entityName, entityNameBig, entityServiceName, entityQueryRepoName) {
    let fileData = generateControllerClass(entityName, entityNameBig, entityServiceName, entityQueryRepoName);
    createProjFile(getEntityDir(__dirname, entityName) + separator + controllerDir, fileData.name, fileData.content);
    return fileData.name;
}

function generateRouterFile(entityName, controllerName, entityServiceName, entityQueryRepoName) {
    let body = generateRouter(entityName, controllerName, entityServiceName, entityQueryRepoName);
    createProjFile(getEntityDir(__dirname, entityName) + separator + routesDir, "entityRoutes", body);
}

module.exports = {
    userDbData: userDbData,
    init: init
}