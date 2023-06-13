const {exportClass, controllerPostfix, serviceDir, separator, queryRepoDir, libDir, controllerDir} = require("./langConstraints");
const {lowerFirstLetter} = require("./utils");


function generateControllerClass(entityName, entityNameBig, entityServiceName, entityQueryRepoName) {
    const controllerName = entityNameBig + controllerPostfix;
    let body = "";
    body = body + "import {NextFunction, Request, Response} from \"express\";\n";
    body = body + getServiceInterfaceImport(entityServiceName);
    body = body + getQueryRepoImport(entityQueryRepoName);
    body = body + exportClass + controllerName + "{";

    // gen constr
    let entityServiceNameVarName = lowerFirstLetter(entityServiceName);
    let entityQueryRepoNameVarName = lowerFirstLetter(entityQueryRepoName);

    body = body + `private readonly ${entityServiceNameVarName}: ${entityServiceName}; private readonly ${entityQueryRepoNameVarName}: ${entityQueryRepoName}; constructor(${entityServiceNameVarName}: ${entityServiceName}, ${entityQueryRepoNameVarName}: ${entityQueryRepoName}){ this.${entityServiceNameVarName} = ${entityServiceNameVarName}; this.${entityQueryRepoNameVarName} = ${entityQueryRepoNameVarName}; }`;

    body = body + genCreateFunc(entityServiceNameVarName);
    body = body + genUpdateFunc(entityServiceNameVarName);
    body = body + genDeleteFunc(entityServiceNameVarName);
    body = body + genGetByIdFunc(entityQueryRepoNameVarName);
    body = body + genByListFunc(entityQueryRepoNameVarName);
    body = body + "}";
    return {name: controllerName, content: body};
}

function genCreateFunc(serviceName) {
    return `async create(req: Request, res: Response, next: NextFunction) {
        try {
            await this.${serviceName}.create(req.body);
            res.status(200);
            res.json({msg: 'ok'});
        } catch (e) {
            next(e);
        }
    }\n`;
}

function genUpdateFunc(serviceName) {
    return `async update(req: Request, res: Response, next: NextFunction) {
        try {
            await this.${serviceName}.update(req.body);
            res.status(200);
            res.json({msg: 'ok'});
        } catch (e) {
            next(e);
        }
    }\n`;
}

function genDeleteFunc(serviceName) {
    return `async deleteEntity(req: Request, res: Response, next: NextFunction) {
        try {
            await this.${serviceName}.delete(String(req.query.id));
            res.status(200);
            res.json({msg: 'ok'});
        } catch (e) {
            next(e);
        }
    }\n`;
}

function genGetByIdFunc(queryRepoName) {
    return `async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await this.${queryRepoName}.getById(req.params.id);
            res.status(200);
            res.json(data);
        } catch (e) {
            next(e);
        }
    }\n`;
}

function genByListFunc(queryRepoName) {
    return `async getList(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await this.${queryRepoName}.getList(Number(req.query.limit), Number(req.query.offset));
            res.status(200);
            res.json(data);
        } catch (e) {
            next(e);
        }
    }\n`;
}

function getServiceInterfaceImport(interfaceName) {
    return 'import {' + interfaceName + '} from "../' + serviceDir + separator + interfaceName + '";';
}

function getQueryRepoImport(interfaceName) {
    return 'import {' + interfaceName + '} from "../' + queryRepoDir + separator + interfaceName + '";';
}

function generateRouter(entityName, controllerName, serviceName, queryRepoName) {
    return `import express, {NextFunction, Request, Response} from "express";
import {DependencyContainer} from "../${libDir}/DependencyContainer";
import {${controllerName}} from "../${controllerDir}/${controllerName}";
const router = express.Router();
const initController = async () => await new ${controllerName}(
    DependencyContainer.dependencyContainer.new${serviceName}(),
    DependencyContainer.dependencyContainer.new${queryRepoName}(),
);
async function create(req: Request, res: Response, next: NextFunction) {
    const controller = await initController();
    await controller.create(req, res, next);
}
async function update(req: Request, res: Response, next: NextFunction) {
    const controller = await initController();
    await controller.update(req, res, next);
}
async function deleteEntity(req: Request, res: Response, next: NextFunction) {
    const controller = await initController();
    await controller.deleteEntity(req, res, next);
}
async function getById(req: Request, res: Response, next: NextFunction) {
    const controller = await initController();
    await controller.getById(req, res, next);
}
async function getList(req: Request, res: Response, next: NextFunction) {
    const controller = await initController();
    await controller.getList(req, res, next);
}
router.post('/${entityName}', create);
router.patch('/${entityName}', update);
router.delete('/${entityName}', deleteEntity);
router.get('/${entityName}', getList);
router.get('/${entityName}/:id', getById);
export default router;`;
}

module.exports = {
    generateControllerClass: generateControllerClass,
    generateRouter: generateRouter
}