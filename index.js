const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * JSON Database Repository - CRUD Operations
 * @param {Object} options - Configurazione operazione
 * @param {string} options.entity - Nome entità (es: 'users', 'products')
 * @param {string} options.operation - Operazione: 'ADD', 'GET', 'UPDATE', 'DELETE'
 * @param {Object} options.data - Dati per ADD/UPDATE (singolo oggetto o array)
 * @param {Object} options.filters - Filtri query per GET/UPDATE/DELETE
 * @param {Object} options.config - Configurazione opzionale
 * @returns {Promise<Object>} - { success, data, count, operation, message }
 */
async function jsonRepository(options) {
    try {
        // Validazione parametri
        const { entity, operation, data, filters = {}, config = {} } = options;
        
        if (!entity || typeof entity !== 'string') {
            throw new Error('Entity name is required and must be a string');
        }
        
        if (!operation || !['ADD', 'GET', 'UPDATE', 'DELETE'].includes(operation.toUpperCase())) {
            throw new Error('Operation must be one of: ADD, GET, UPDATE, DELETE');
        }
        
        // Configurazione default
        const dbConfig = {
            basePath: config.basePath || path.join(__dirname, 'data', 'db'),
            prettyPrint: config.prettyPrint !== undefined ? config.prettyPrint : true,
            backup: config.backup || false,
            autoCreateEntity: config.autoCreateEntity !== undefined ? config.autoCreateEntity : true
        };
        
        // Esegui operazione
        const op = operation.toUpperCase();
        let result;
        
        switch (op) {
            case 'ADD':
                result = await addOperation(entity, data, dbConfig);
                break;
            case 'GET':
                result = await getOperation(entity, filters, dbConfig);
                break;
            case 'UPDATE':
                result = await updateOperation(entity, data, filters, dbConfig);
                break;
            case 'DELETE':
                result = await deleteOperation(entity, filters, dbConfig);
                break;
        }
        
        return {
            success: true,
            operation: op,
            entity: entity,
            ...result
        };
        
    } catch (error) {
        return {
            success: false,
            operation: options.operation?.toUpperCase() || 'UNKNOWN',
            entity: options.entity || 'unknown',
            data: null,
            count: 0,
            message: error.message,
            error: error.stack
        };
    }
}

// ==================== OPERAZIONI CRUD ====================

/**
 * ADD - Aggiunge uno o più oggetti
 */
async function addOperation(entity, data, config) {
    if (!data) {
        throw new Error('Data is required for ADD operation');
    }
    
    const filePath = getEntityFilePath(entity, config);
    const existingData = await readEntityFile(filePath, config);
    
    // Normalizza input (singolo oggetto o array)
    const itemsToAdd = Array.isArray(data) ? data : [data];
    const addedItems = [];
    
    for (let item of itemsToAdd) {
        // Genera _id se mancante
        if (!item._id) {
            item._id = uuidv4();
        }
        
        // Verifica duplicati _id
        if (existingData.some(existing => existing._id === item._id)) {
            throw new Error(`Duplicate _id: ${item._id}`);
        }
        
        addedItems.push({ ...item });
    }
    
    const newData = [...existingData, ...addedItems];
    await writeEntityFile(filePath, newData, config);
    
    return {
        data: addedItems,
        count: addedItems.length,
        message: `Successfully added ${addedItems.length} item(s)`
    };
}

/**
 * GET - Recupera oggetti con filtri
 */
async function getOperation(entity, filters, config) {
    const filePath = getEntityFilePath(entity, config);
    const existingData = await readEntityFile(filePath, config);
    
    // Se nessun filtro, ritorna tutto
    if (!filters || Object.keys(filters).length === 0) {
        return {
            data: existingData,
            count: existingData.length,
            message: `Retrieved ${existingData.length} item(s)`
        };
    }
    
    // Applica filtri
    const filteredData = existingData.filter(item => matchesFilters(item, filters));
    
    return {
        data: filteredData,
        count: filteredData.length,
        message: `Retrieved ${filteredData.length} item(s) matching filters`
    };
}

/**
 * UPDATE - Aggiorna oggetti con filtri
 */
async function updateOperation(entity, data, filters, config) {
    if (!data) {
        throw new Error('Data is required for UPDATE operation');
    }
    
    if (!filters || Object.keys(filters).length === 0) {
        throw new Error('Filters are required for UPDATE operation (safety measure)');
    }
    
    const filePath = getEntityFilePath(entity, config);
    const existingData = await readEntityFile(filePath, config);
    
    let updatedCount = 0;
    const updatedItems = [];
    
    const newData = existingData.map(item => {
        if (matchesFilters(item, filters)) {
            const updatedItem = { ...item, ...data };
            // Preserva _id originale
            updatedItem._id = item._id;
            updatedItems.push(updatedItem);
            updatedCount++;
            return updatedItem;
        }
        return item;
    });
    
    await writeEntityFile(filePath, newData, config);
    
    return {
        data: updatedItems,
        count: updatedCount,
        message: `Successfully updated ${updatedCount} item(s)`
    };
}

/**
 * DELETE - Elimina oggetti con filtri
 */
async function deleteOperation(entity, filters, config) {
    if (!filters || Object.keys(filters).length === 0) {
        throw new Error('Filters are required for DELETE operation (safety measure)');
    }
    
    const filePath = getEntityFilePath(entity, config);
    const existingData = await readEntityFile(filePath, config);
    
    const deletedItems = [];
    const newData = existingData.filter(item => {
        if (matchesFilters(item, filters)) {
            deletedItems.push(item);
            return false; // Rimuovi
        }
        return true; // Mantieni
    });
    
    await writeEntityFile(filePath, newData, config);
    
    return {
        data: deletedItems,
        count: deletedItems.length,
        message: `Successfully deleted ${deletedItems.length} item(s)`
    };
}

// ==================== SISTEMA FILTRI AVANZATO ====================

/**
 * Verifica se un oggetto corrisponde ai filtri
 */
function matchesFilters(item, filters) {
    for (let [key, value] of Object.entries(filters)) {
        // Gestione operatori logici
        if (key === '$and') {
            return value.every(subFilter => matchesFilters(item, subFilter));
        }
        if (key === '$or') {
            return value.some(subFilter => matchesFilters(item, subFilter));
        }
        if (key === '$not') {
            return !matchesFilters(item, value);
        }
        
        // Estrai valore (supporta campi annidati: "address.city")
        const itemValue = getNestedValue(item, key);
        
        // Gestione operatori avanzati
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            if (!matchesOperators(itemValue, value)) {
                return false;
            }
        } else {
            // Confronto semplice
            if (itemValue !== value) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Gestisce operatori di confronto
 */
function matchesOperators(itemValue, operators) {
    for (let [operator, compareValue] of Object.entries(operators)) {
        switch (operator) {
            case '$eq':
                if (itemValue !== compareValue) return false;
                break;
            case '$ne':
                if (itemValue === compareValue) return false;
                break;
            case '$gt':
                if (itemValue <= compareValue) return false;
                break;
            case '$gte':
                if (itemValue < compareValue) return false;
                break;
            case '$lt':
                if (itemValue >= compareValue) return false;
                break;
            case '$lte':
                if (itemValue > compareValue) return false;
                break;
            case '$in':
                if (!Array.isArray(compareValue) || !compareValue.includes(itemValue)) return false;
                break;
            case '$nin':
                if (!Array.isArray(compareValue) || compareValue.includes(itemValue)) return false;
                break;
            case '$contains':
                if (typeof itemValue !== 'string' || !itemValue.includes(compareValue)) return false;
                break;
            case '$startsWith':
                if (typeof itemValue !== 'string' || !itemValue.startsWith(compareValue)) return false;
                break;
            case '$endsWith':
                if (typeof itemValue !== 'string' || !itemValue.endsWith(compareValue)) return false;
                break;
            case '$exists':
                if ((itemValue !== undefined) !== compareValue) return false;
                break;
            default:
                throw new Error(`Unknown operator: ${operator}`);
        }
    }
    return true;
}

/**
 * Estrae valore da campi annidati (es: "address.city")
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

// ==================== FILE SYSTEM OPERATIONS ====================

/**
 * Ottiene il path completo del file entità
 */
function getEntityFilePath(entity, config) {
    return path.join(config.basePath, `${entity}.json`);
}

/**
 * Legge file entità (crea se non esiste)
 */
async function readEntityFile(filePath, config) {
    try {
        // Assicura che la directory esista
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        
        const fileContent = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        if (error.code === 'ENOENT' && config.autoCreateEntity) {
            // File non esiste, crea array vuoto
            await writeEntityFile(filePath, [], config);
            return [];
        }
        throw error;
    }
}

/**
 * Scrive file entità
 */
async function writeEntityFile(filePath, data, config) {
    const jsonString = config.prettyPrint 
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);
    
    // Backup opzionale
    if (config.backup) {
        try {
            await fs.copyFile(filePath, `${filePath}.backup`);
        } catch (error) {
            // Ignora se backup fallisce (file potrebbe non esistere)
        }
    }
    
    await fs.writeFile(filePath, jsonString, 'utf8');
}

// ==================== EXPORT ====================

module.exports = jsonRepository;