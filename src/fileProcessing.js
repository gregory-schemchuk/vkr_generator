const fsextra = require("fs-extra");
const fs = require("fs");
const {
    separator, errorDir, libDir, controllerDir, domainDir, entityDomainDir, serviceDir, serviceImplDir,
    infrastructureDir, repositoryDir, domainRepoDir, domainRepoImplDir, queryRepoDir, queryRepoImplDir, routesDir,
    prismaDb
} = require("./langConstraints");


function createEnvFile(rootDir, entityName, dbUser, dbPass, dbTypeName, dbName) {
    let fileBody = "DATABASE_URL=\"" + dbTypeName + "://" + dbUser + ":" + dbPass + "@localhost:5432/" + dbName + "?schema=public\"";
    createProjFile(getEntityDir(rootDir, entityName, false), ".env", fileBody, true);
}

function createConfigFile(rootDir, entityName) {
    fsextra.copySync(__dirname + "/templates/package.json", getEntityDir(rootDir, entityName, false) + separator + "package.json");
    fsextra.copySync(__dirname + "/templates/tsconfig.json", getEntityDir(rootDir, entityName, false) + separator + "tsconfig.json");
}

function createIndexFile(rootDir, entityName) {
    fsextra.copySync(__dirname + "/templates/index.ts", getEntityDir(rootDir, entityName, true) + separator + "index.ts");
}

function createErrors(rootDir, entityName) {
    fsextra.copySync(__dirname + "/templates/errorsHandler.ts", getEntityDir(rootDir, entityName) + separator + libDir + separator + "errorsHandler.ts");
    fsextra.copySync(__dirname + "/templates/DatabaseInternalError.ts", getEntityDir(rootDir, entityName) + separator + errorDir + separator + "DatabaseInternalError.ts");
}

function createAppConfig(rootDir, entityName) {
    fsextra.copySync(__dirname + "/templates/appConfig.ts", getEntityDir(rootDir, entityName) + separator + libDir + separator + "appConfig.ts");
}

function createDbClientFile(rootDir, entityName) {
    let fileBody = "import Prisma from '@prisma/client'; export const dbClient = new Prisma.PrismaClient();";
    createProjFile(getEntityDir(rootDir, entityName) + separator + libDir, "dbClient", fileBody);
}

function createProjFile(dir, fileName, fileBody, plain = false) {
    let fullPath = dir + separator + fileName;
    if (!plain) {
        fullPath = dir + separator + fileName + ".ts";
    }
    fs.writeFileSync(fullPath, fileBody);
}

function getEntityDir(rootDir, entityName, src = true) {
    if (src) {
        return rootDir + separator + entityName + separator + "src";
    } else {
        return rootDir + separator + entityName;
    }
}

function createFolderStructure(rootDir, entityName) {
    let entityDir = getEntityDir(rootDir, entityName);
    if (!fs.existsSync(rootDir + separator + entityName)) {
        fs.mkdirSync(rootDir + separator + entityName);
    }
    if (!fs.existsSync(entityDir)) {
        fs.mkdirSync(entityDir);
    }
    if (!fs.existsSync(rootDir + separator + entityName + separator + prismaDb)) {
        fs.mkdirSync(rootDir + separator + entityName + separator + prismaDb);
    }
    if (!fs.existsSync(entityDir + separator + controllerDir)) {
        fs.mkdirSync(entityDir + separator + controllerDir);
    }
    if (!fs.existsSync(entityDir + separator + domainDir)) {
        fs.mkdirSync(entityDir + separator + domainDir);
    }
    if (!fs.existsSync(entityDir + separator + routesDir)) {
        fs.mkdirSync(entityDir + separator + routesDir);
    }
    if (!fs.existsSync(entityDir + separator + entityDomainDir)) {
        fs.mkdirSync(entityDir + separator + entityDomainDir);
    }
    if (!fs.existsSync(entityDir + separator + errorDir)) {
        fs.mkdirSync(entityDir + separator + errorDir);
    }
    if (!fs.existsSync(entityDir + separator + serviceDir)) {
        fs.mkdirSync(entityDir + separator + serviceDir);
    }
    if (!fs.existsSync(entityDir + separator + serviceImplDir)) {
        fs.mkdirSync(entityDir + separator + serviceImplDir);
    }
    if (!fs.existsSync(entityDir + separator + infrastructureDir)) {
        fs.mkdirSync(entityDir + separator + infrastructureDir);
    }
    if (!fs.existsSync(entityDir + separator + libDir)) {
        fs.mkdirSync(entityDir + separator + libDir);
    }
    if (!fs.existsSync(entityDir + separator + repositoryDir)) {
        fs.mkdirSync(entityDir + separator + repositoryDir);
    }
    if (!fs.existsSync(entityDir + separator + domainRepoDir)) {
        fs.mkdirSync(entityDir + separator + domainRepoDir);
    }
    if (!fs.existsSync(entityDir + separator + domainRepoImplDir)) {
        fs.mkdirSync(entityDir + separator + domainRepoImplDir);
    }
    if (!fs.existsSync(entityDir + separator + queryRepoDir)) {
        fs.mkdirSync(entityDir + separator + queryRepoDir);
    }
    if (!fs.existsSync(entityDir + separator + queryRepoImplDir)) {
        fs.mkdirSync(entityDir + separator + queryRepoImplDir);
    }
}

function genInterfaceImport(interfaceName) {
    return 'import {' + interfaceName + '} from "../' + interfaceName + '";';
}

function createDependencyContainer(rootDir, entityName, domainRepoName, domainRepoImplName, queryRepoName, queryRepoImplName, serviceName, serviceNameImpl) {
    let body = 'import {' + queryRepoName + '} from "../../' + queryRepoDir + separator + queryRepoName + '";\n';
    body = body + 'import {' + queryRepoImplName + '} from "../../' + queryRepoImplDir + separator + queryRepoImplName + '";\n';
    body = body + 'import {' + domainRepoName + '} from "../../' + domainRepoDir + separator + domainRepoName + '";\n';
    body = body + 'import {' + domainRepoImplName + '} from "../../' + domainRepoImplDir + separator + domainRepoImplName + '";\n';
    body = body + 'import {' + serviceName + '} from "../../' + serviceDir + separator + serviceName + '";\n';
    body = body + 'import {' + serviceNameImpl + '} from "../../' + serviceImplDir + separator + serviceNameImpl + '";\n';
    body = body + `export class DependencyContainer {
    static dependencyContainer: DependencyContainer = null;
    constructor() {
        if (DependencyContainer.dependencyContainer !== null) {
            const msg = 'Cannot create more than one dependency container instance';
            console.log(msg);
        }
        DependencyContainer.dependencyContainer = this;
    }
    new${domainRepoName}(): ${domainRepoName} {
        return new ${domainRepoImplName}();
    }
    new${queryRepoName}(): ${queryRepoName} {
        return new ${queryRepoImplName}();
    }
    new${serviceName}(): ${serviceName} {
        return new ${serviceNameImpl}(this.new${domainRepoName}());
    }
    }\n`;
    createProjFile(getEntityDir(rootDir, entityName) + separator + libDir, "DependencyContainer", body);
}

module.exports = {
    createEnvFile: createEnvFile,
    createConfigFile: createConfigFile,
    createIndexFile: createIndexFile,
    createErrors: createErrors,
    createAppConfig: createAppConfig,
    createDbClientFile: createDbClientFile,
    createDependencyContainer: createDependencyContainer,
    createProjFile: createProjFile,
    getEntityDir: getEntityDir,
    createFolderStructure: createFolderStructure,
    genInterfaceImport: genInterfaceImport
}

