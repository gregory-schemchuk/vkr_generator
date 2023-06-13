const controllerPostfix = "Controller";

const queryRepositoryPostfix = "QueryRepository";
const queryRepositoryImplPostfix = "QueryRepositoryImpl";
const domainRepositoryPostfix = "Repository";
const domainRepositoryImplPostfix = "RepositoryImpl";

const servicePostfix = "Service";
const serviceImplPostfix = "ServiceDefault";

const exportInterface = "export interface ";
const exportClass = "export class ";

const importDbClient = 'import {dbClient} from "../../../infrastructure/lib/dbClient";\n';
const importDbError = 'import {DatabaseInternalError} from "../../../domain/error/DatabaseInternalError";\n';

const separator = "/";
const prismaDb = "prisma";
const controllerDir = "controller";
const domainDir = "domain";
const routesDir = "routes";
const entityDomainDir = domainDir + separator + "entity";
const errorDir = domainDir + separator + "error";
const serviceDir = domainDir + separator + "service";
const serviceImplDir = serviceDir + separator + "impl";
const infrastructureDir = "infrastructure";
const libDir = infrastructureDir + separator + "lib";
const repositoryDir = "repository";
const domainRepoDir = repositoryDir + separator + "domain";
const domainRepoImplDir = domainRepoDir + separator + "impl";
const queryRepoDir = repositoryDir + separator + "query";
const queryRepoImplDir = queryRepoDir + separator + "impl";


module.exports = {
    controllerPostfix: controllerPostfix,
    queryRepositoryPostfix: queryRepositoryPostfix,
    queryRepositoryImplPostfix: queryRepositoryImplPostfix,
    domainRepositoryPostfix: domainRepositoryPostfix,
    domainRepositoryImplPostfix: domainRepositoryImplPostfix,
    servicePostfix: servicePostfix,
    serviceImplPostfix: serviceImplPostfix,
    exportInterface: exportInterface,
    exportClass: exportClass,
    importDbClient: importDbClient,
    importDbError: importDbError,
    separator: separator,
    controllerDir: controllerDir,
    domainDir: domainDir,
    entityDomainDir: entityDomainDir,
    errorDir: errorDir,
    serviceDir: serviceDir,
    serviceImplDir: serviceImplDir,
    infrastructureDir: infrastructureDir,
    libDir: libDir,
    repositoryDir: repositoryDir,
    domainRepoDir: domainRepoDir,
    domainRepoImplDir: domainRepoImplDir,
    queryRepoDir: queryRepoDir,
    queryRepoImplDir: queryRepoImplDir,
    routesDir: routesDir,
    prismaDb: prismaDb
}