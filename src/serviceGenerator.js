const {genInterfaceImport} = require("./fileProcessing");
const {exportClass, exportInterface, servicePostfix, serviceImplPostfix, domainRepoDir, separator, entityDomainDir} = require("./langConstraints");
const {lowerFirstLetter} = require("./utils");


function generateServiceImpl(entityName, entityNameBig, interfaceName, entityDomainRepoName, fields) {
    const serviceImplName = entityNameBig + serviceImplPostfix;
    let body = "";
    body = body + genInterfaceImport(interfaceName);
    body = body + 'import {' + entityNameBig + "} from \"../../../" + entityDomainDir + separator + entityNameBig + "\";\n";
    body = body + 'import {' + entityDomainRepoName + '} from "../../../' + domainRepoDir + separator + entityDomainRepoName + '";\n';
    body = body + exportClass + serviceImplName + " implements " + interfaceName + "{";

    // gen constr
    let entityDomainRepoNameVarName = lowerFirstLetter(entityDomainRepoName);
    body = body + `private readonly ${entityDomainRepoNameVarName}: ${entityDomainRepoName}; constructor(${entityDomainRepoNameVarName}: ${entityDomainRepoName}){ this.${entityDomainRepoNameVarName} = ${entityDomainRepoNameVarName} }`;

    body = body + genServiceCreateFunc(entityName, entityNameBig, entityDomainRepoName, fields);
    body = body + genServiceUpdateFunc(entityName, entityNameBig, entityDomainRepoName, fields);
    body = body + genServiceDeleteFunc(entityDomainRepoName);
    body = body + "}";
    return {name: serviceImplName, content: body};
}

function generateServiceInterface(entityNameBig) {
    const interfaceName = entityNameBig + servicePostfix;
    let interfaceBody = exportInterface + interfaceName + "{";
    interfaceBody = interfaceBody + genServiceCreate() + ";";
    interfaceBody = interfaceBody + genServiceUpdate() + ";";
    interfaceBody = interfaceBody + genServiceDelete() + ";";
    interfaceBody = interfaceBody + "}";
    return {name: interfaceName, content: interfaceBody};
}

function genServiceCreate() {
    return "create(val: any): Promise<void>";
}

function genServiceUpdate() {
    return "update(val: any): Promise<void>";
}

function genServiceDelete() {
    return "delete(id: string): Promise<void>";
}

function genServiceDeleteFunc(entityDomainRepoName) {
    let body = "async " + genServiceDelete() + "{";
    let entityDomainRepoNameVarName = lowerFirstLetter(entityDomainRepoName);
    body = body + `await this.${entityDomainRepoNameVarName}.delete(id);}`;
    return body;
}

function genServiceUpdateFunc(entityName, entityNameBig, entityDomainRepoName, fields) {
    let body = "async " + genServiceUpdate() + "{";
    let entityDomainRepoNameVarName = lowerFirstLetter(entityDomainRepoName);
    body = body + `const ${entityName} = await this.${entityDomainRepoNameVarName}.getById(val.id);`;
    for (let i = 0; i < fields.length; i++) {
        body = body + genUpdateFieldCode(entityName, fields[i].name);
    }
    body = body + `await this.${entityDomainRepoNameVarName}.store(${entityName});}`;
    return body;
}

function genUpdateFieldCode(entityName, fieldName) {
    return `if (val.${fieldName}) { ${entityName}.${fieldName} = val.${fieldName}; }`;
}

function genServiceCreateFunc(entityName, entityNameBig, entityDomainRepoName, fields) {
    let body = "async " + genServiceCreate() + "{";
    let entityDomainRepoNameVarName = lowerFirstLetter(entityDomainRepoName);
    body = body + `const ${entityName} = new ${entityNameBig}(${getFieldsNamesStr(fields, true)});`;
    body = body + `await this.${entityDomainRepoNameVarName}.store(${entityName});}`;
    return body;
}

function getFieldsNamesStr(fields, withVal) {
    let str = "";
    for (let i = 0; i < fields.length; i++) {
        str = str + (withVal ? "val." : "") + fields[i].name + (i+1 === fields.length ? "" : ",");
    }
    return  str;
}

/**
 *
 * @param entityNameBig string entity Name capital
 * @param fields array of objects format {name: string, type: "string | number | date | object"}
 *
 */
function generateEntityObject(entityNameBig, fields) {
    let body = 'import {v4} from "uuid";import {Expose} from "class-transformer";';
    body = body + "export class " + entityNameBig + " {";
    body = body + generateEntityConstructor(fields);
    for (let i = 0; i < fields.length; i++) {
        let tsType = getFieldTsType(fields[i].type);
        let fieldCode = `@Expose({name: "${fields[i].name}"})\nprivate _${fields[i].name}: ${tsType}; get ${fields[i].name}(): ${tsType}{return this._${fields[i].name};} set ${fields[i].name}(value: ${tsType}) {this._${fields[i].name} = value;}\n`;
        body = body + fieldCode;
    }
    body = body + generateIdFunctional();
    body = body + "}";
    return {name: entityNameBig, content: body};
}

function generateIdFunctional() {
    return "@Expose({name: \"id\"})\nprivate readonly _id: string; get id(): string {\nreturn this._id;\n}";
}

/**
 *
 * @param type "string | number | date | object"
 *
 */
function getFieldTsType(type) {
    switch (type) {
        case "string":
            return "string";
        case "number":
            return "number";
        case "date":
            return "Date";
        case "object":
            // uuid reference
            return "string";
        default:
            return "undefined";
    }
}

function generateEntityConstructor(fields) {
    let body = "constructor(";
    for (let i = 0; i < fields.length; i++) {
        let tsType = getFieldTsType(fields[i].type);
        body = body + `${fields[i].name}: ${tsType},`;
    }
    body = body + "id?: string) {this._id = id ? id : v4();";
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].name !== "id") {
            body = body + `this._${fields[i].name} = ${fields[i].name} ? ${fields[i].name} : null;`;
        }
    }
    body = body + "}";
    return body;
}

module.exports = {
    generateServiceImpl: generateServiceImpl,
    generateServiceInterface: generateServiceInterface,
    generateEntityObject: generateEntityObject
}