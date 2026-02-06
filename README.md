# 📦 APXC JSON Repository - Sistema CRUD su Filesystem

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

Sistema completo di gestione database JSON su filesystem con sintassi compatibile MongoDB. Perfetto per prototipazione rapida e migrazione futura verso database documentali.

---

## 📑 Indice

- [Caratteristiche](#-caratteristiche)
- [Requisiti](#-requisiti)
- [Installazione](#-installazione)
- [Quick Start](#-quick-start)
- [Configurazione](#-configurazione)
- [API Reference](#-api-reference)
  - [Operazione ADD](#add---aggiunta-oggetti)
  - [Operazione GET](#get---lettura-oggetti)
  - [Operazione UPDATE](#update---aggiornamento-oggetti)
  - [Operazione DELETE](#delete---eliminazione-oggetti)
- [Sistema di Filtri](#-sistema-di-filtri)
  - [Operatori di Confronto](#operatori-di-confronto)
  - [Operatori Logici](#operatori-logici)
  - [Operatori su Stringhe](#operatori-su-stringhe)
- [Campi Annidati](#-campi-annidati)
- [Esempi Avanzati](#-esempi-avanzati)
- [Integrazione Node-RED](#-integrazione-node-red)
- [Struttura File](#-struttura-file)
- [Best Practices](#-best-practices)
- [Performance](#-performance)
- [Migrazione MongoDB](#-migrazione-mongodb)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Caratteristiche

✅ **CRUD Completo** - Operazioni CREATE, READ, UPDATE, DELETE  
✅ **File per Entità** - Organizzazione ottimizzata (`users.json`, `products.json`)  
✅ **Auto ID Generation** - UUID v4 automatico per campo `_id`  
✅ **Operazioni Massive** - Gestione multi-oggetto con filtri  
✅ **Query Avanzate** - Operatori di confronto, logici e su stringhe  
✅ **Campi Annidati** - Supporto `object.nested.field`  
✅ **MongoDB Compatible** - Sintassi query identica per migrazione facile  
✅ **Error Handling** - Gestione errori robusta con messaggi dettagliati  
✅ **Async/Await** - Codice ES6+ moderno  
✅ **Auto-Creation** - Creazione automatica entità se non esistente  
✅ **Backup Opzionale** - Sistema di backup automatico  
✅ **TypeScript Ready** - Pronto per definizioni di tipo  

---

## 🔧 Requisiti

- **Node.js**: >= 14.0.0
- **NPM Packages**:
  - `uuid` (^9.0.0)

---

## 📥 Installazione

### Installazione

```bash

npm install apxc-json-repository

```

### Installazione Node-RED

1. **Opzione A - Function Node Globale**:
   ```javascript
   // Settings.js - Aggiungi al functionGlobalContext
   functionGlobalContext: {
       jsonRepository: require('/path/to/json-repository.js')
   }
   ```

2. **Opzione B - Context Flow**:
   ```javascript
   // Nel nodo Function, Setup tab
   const jsonRepository = require('/path/to/json-repository.js');
   flow.set('jsonRepository', jsonRepository);
   ```

3. **Opzione C - Inline** (copia direttamente nel Function Node)

---

## 🚀 Quick Start

### Esempio Base

```javascript
const jsonRepository = require('apxc-json-repository'); 

// 1. Aggiungi un utente
const addResult = await jsonRepository({
    entity: 'users',
    operation: 'ADD',
    data: {
        name: 'Mario Rossi',
        email: 'mario@example.com',
        age: 35,
        address: {
            city: 'VERONA',
            street: 'Via Roma 10'
        }
    }
});

console.log(addResult);
// {
//   success: true,
//   operation: 'ADD',
//   entity: 'users',
//   data: [{ _id: 'abc-123-def...', name: 'Mario Rossi', ... }],
//   count: 1,
//   message: 'Successfully added 1 item(s)'
// }

// 2. Cerca utenti per città
const getResult = await jsonRepository({
    entity: 'users',
    operation: 'GET',
    filters: {
        'address.city': 'VERONA'
    }
});

console.log(getResult.data); // Array di utenti trovati

// 3. Aggiorna utenti
const updateResult = await jsonRepository({
    entity: 'users',
    operation: 'UPDATE',
    data: { status: 'verified' },
    filters: { 'address.city': 'VERONA' }
});

// 4. Elimina utenti
const deleteResult = await jsonRepository({
    entity: 'users',
    operation: 'DELETE',
    filters: { status: 'inactive' }
});
```

---

## ⚙️ Configurazione

### Parametri Globali

```javascript
const config = {
    basePath: '/data/db',              // Path directory database (default: ./data/db)
    prettyPrint: true,                 // JSON formattato (default: true)
    backup: false,                     // Backup automatico (default: false)
    autoCreateEntity: true             // Crea entità se non esiste (default: true)
};

// Usa config custom
await jsonRepository({
    entity: 'users',
    operation: 'GET',
    config: config
});
```

### Struttura Directory

```
/data/db/
├── users.json
├── products.json
├── orders.json
├── users.json.backup      (se backup: true)
└── products.json.backup
```

---

## 📖 API Reference

### Parametri Funzione Principale

```javascript
jsonRepository({
    entity: string,        // REQUIRED - Nome entità
    operation: string,     // REQUIRED - 'ADD', 'GET', 'UPDATE', 'DELETE'
    data: object|array,    // OPTIONAL - Dati per ADD/UPDATE
    filters: object,       // OPTIONAL - Filtri query
    config: object         // OPTIONAL - Configurazione custom
})
```

### Struttura Risposta

Tutte le operazioni ritornano un oggetto con questa struttura:

```javascript
{
    success: boolean,      // true = successo, false = errore
    operation: string,     // Operazione eseguita
    entity: string,        // Nome entità
    data: array,           // Dati risultanti
    count: number,         // Numero elementi coinvolti
    message: string,       // Messaggio descrittivo
    error: string          // Stack trace errore (solo se success: false)
}
```

---

## ADD - Aggiunta Oggetti

### Singolo Oggetto

```javascript
const result = await jsonRepository({
    entity: 'users',
    operation: 'ADD',
    data: {
        name: 'Luigi Verdi',
        email: 'luigi@example.com',
        role: 'admin'
    }
});

// Risposta:
// {
//   success: true,
//   data: [{ _id: 'generated-uuid', name: 'Luigi Verdi', ... }],
//   count: 1
// }
```

### Multipli Oggetti

```javascript
const result = await jsonRepository({
    entity: 'products',
    operation: 'ADD',
    data: [
        { name: 'Laptop', price: 999, category: 'electronics' },
        { name: 'Mouse', price: 29, category: 'accessories' },
        { name: 'Keyboard', price: 79, category: 'accessories' }
    ]
});

// count: 3
```

### Con _id Pre-Esistente

```javascript
const result = await jsonRepository({
    entity: 'users',
    operation: 'ADD',
    data: {
        _id: 'custom-id-123',  // Usa questo invece di generarne uno
        name: 'Anna Bianchi'
    }
});
```

### ⚠️ Comportamento

- Se `_id` non è presente, viene **generato automaticamente** (UUID v4)
- Se `_id` è duplicato, l'operazione **fallisce** con errore
- Gli oggetti vengono aggiunti alla **fine dell'array** esistente

---

## GET - Lettura Oggetti

### Tutti gli Oggetti

```javascript
const result = await jsonRepository({
    entity: 'users',
    operation: 'GET'
});

// Ritorna tutti gli utenti
```

### Con Filtro Semplice

```javascript
const result = await jsonRepository({
    entity: 'users',
    operation: 'GET',
    filters: {
        role: 'admin'
    }
});
```

### Con Filtri Multipli (AND Implicito)

```javascript
const result = await jsonRepository({
    entity: 'products',
    operation: 'GET',
    filters: {
        category: 'electronics',
        price: { $gte: 500 }
    }
});

// Cerca: category = 'electronics' AND price >= 500
```

### Con Operatori Avanzati

```javascript
const result = await jsonRepository({
    entity: 'users',
    operation: 'GET',
    filters: {
        age: { $gte: 18, $lte: 65 },
        status: { $in: ['active', 'pending'] },
        email: { $contains: '@example.com' }
    }
});
```

---

## UPDATE - Aggiornamento Oggetti

### Aggiorna Singolo Campo

```javascript
const result = await jsonRepository({
    entity: 'users',
    operation: 'UPDATE',
    data: {
        status: 'verified'
    },
    filters: {
        email: 'mario@example.com'
    }
});
```

### Aggiorna Multipli Campi

```javascript
const result = await jsonRepository({
    entity: 'products',
    operation: 'UPDATE',
    data: {
        price: 899,
        discount: 10,
        updated_at: new Date().toISOString()
    },
    filters: {
        category: 'electronics'
    }
});

// Aggiorna TUTTI i prodotti electronics
```

### Aggiorna Campi Annidati

```javascript
const result = await jsonRepository({
    entity: 'users',
    operation: 'UPDATE',
    data: {
        'address.city': 'MILANO',      // ⚠️ Questo SOSTITUISCE l'intera proprietà
        'address.verified': true
    },
    filters: {
        _id: 'user-123'
    }
});

// Metodo corretto per oggetti annidati:
const result = await jsonRepository({
    entity: 'users',
    operation: 'UPDATE',
    data: {
        address: {
            city: 'MILANO',
            street: 'Via Dante 5',
            verified: true
        }
    },
    filters: { _id: 'user-123' }
});
```

### ⚠️ Comportamento

- **Richiede filtri obbligatori** (misura di sicurezza)
- Il campo `_id` **NON viene mai sovrascritto**
- I campi non specificati in `data` **rimangono invariati**
- Aggiorna **tutti gli oggetti** che matchano i filtri

---

## DELETE - Eliminazione Oggetti

### Elimina con Filtro Semplice

```javascript
const result = await jsonRepository({
    entity: 'users',
    operation: 'DELETE',
    filters: {
        status: 'deleted'
    }
});
```

### Elimina con Operatori

```javascript
const result = await jsonRepository({
    entity: 'products',
    operation: 'DELETE',
    filters: {
        price: { $lt: 10 },
        stock: { $eq: 0 }
    }
});

// Elimina prodotti con prezzo < 10 E stock = 0
```

### Elimina per _id

```javascript
const result = await jsonRepository({
    entity: 'users',
    operation: 'DELETE',
    filters: {
        _id: 'abc-123-def'
    }
});
```

### ⚠️ Comportamento

- **Richiede filtri obbligatori** (misura di sicurezza)
- Elimina **permanentemente** gli oggetti
- Ritorna gli oggetti eliminati in `data`
- Impossibile eliminare **tutti** senza filtri

---

## 🔍 Sistema di Filtri

### Operatori di Confronto

| Operatore | Descrizione | Esempio |
|-----------|-------------|---------|
| `$eq` | Uguale a | `{ age: { $eq: 30 } }` |
| `$ne` | Diverso da | `{ status: { $ne: 'inactive' } }` |
| `$gt` | Maggiore di | `{ price: { $gt: 100 } }` |
| `$gte` | Maggiore o uguale | `{ price: { $gte: 100 } }` |
| `$lt` | Minore di | `{ age: { $lt: 18 } }` |
| `$lte` | Minore o uguale | `{ stock: { $lte: 10 } }` |

```javascript
// Esempio combinato
filters: {
    age: { $gte: 18, $lte: 65 },
    price: { $gt: 0 }
}
```

### Operatori su Array

| Operatore | Descrizione | Esempio |
|-----------|-------------|---------|
| `$in` | Valore in array | `{ role: { $in: ['admin', 'moderator'] } }` |
| `$nin` | Valore NON in array | `{ status: { $nin: ['deleted', 'banned'] } }` |

```javascript
// Cerca utenti admin O moderator
filters: {
    role: { $in: ['admin', 'moderator'] }
}

// Cerca prodotti NON electronics NÉ toys
filters: {
    category: { $nin: ['electronics', 'toys'] }
}
```

### Operatori su Stringhe

| Operatore | Descrizione | Esempio |
|-----------|-------------|---------|
| `$contains` | Contiene sottostringa | `{ name: { $contains: 'Mario' } }` |
| `$startsWith` | Inizia con | `{ email: { $startsWith: 'admin' } }` |
| `$endsWith` | Finisce con | `{ email: { $endsWith: '.com' } }` |

```javascript
// Cerca email aziendali
filters: {
    email: { $endsWith: '@company.com' }
}

// Cerca nomi che contengono "Rossi"
filters: {
    name: { $contains: 'Rossi' }
}
```

### Operatore Esistenza

| Operatore | Descrizione | Esempio |
|-----------|-------------|---------|
| `$exists` | Campo esiste/non esiste | `{ phone: { $exists: true } }` |

```javascript
// Trova utenti con numero di telefono
filters: {
    phone: { $exists: true }
}

// Trova utenti SENZA immagine profilo
filters: {
    avatar: { $exists: false }
}
```

### Operatori Logici

#### $and (AND - Implicito)

```javascript
// AND implicito (tutti i filtri devono matchare)
filters: {
    role: 'user',
    status: 'active',
    age: { $gte: 18 }
}

// AND esplicito
filters: {
    $and: [
        { role: 'user' },
        { status: 'active' },
        { age: { $gte: 18 } }
    ]
}
```

#### $or (OR)

```javascript
// Cerca utenti di VERONA O MILANO
filters: {
    $or: [
        { 'address.city': 'VERONA' },
        { 'address.city': 'MILANO' }
    ]
}

// Combinazione complessa
filters: {
    status: 'active',  // AND implicito
    $or: [             // con OR
        { role: 'admin' },
        { role: 'moderator' }
    ]
}
```

#### $not (NOT)

```javascript
// Trova utenti NON admin
filters: {
    $not: {
        role: 'admin'
    }
}

// Combinazione NOT + operatori
filters: {
    $not: {
        age: { $lt: 18 }
    }
}
// Equivalente a: age >= 18
```

### Combinazioni Avanzate

```javascript
// Query complessa: 
// (admin O moderator) E (città VERONA O MILANO) E età >= 18
filters: {
    $and: [
        {
            $or: [
                { role: 'admin' },
                { role: 'moderator' }
            ]
        },
        {
            $or: [
                { 'address.city': 'VERONA' },
                { 'address.city': 'MILANO' }
            ]
        },
        {
            age: { $gte: 18 }
        }
    ]
}
```

---

## 🎯 Campi Annidati

Il sistema supporta **dot notation** per accedere a campi annidati.

### Struttura Oggetto

```javascript
{
    _id: 'user-123',
    name: 'Mario Rossi',
    contact: {
        email: 'mario@example.com',
        phone: {
            mobile: '+39 123456789',
            home: '+39 987654321'
        }
    },
    address: {
        city: 'VERONA',
        street: 'Via Roma 10',
        zip: '37100'
    },
    metadata: {
        registered: '2024-01-15',
        verified: true
    }
}
```

### Query su Campi Annidati

```javascript
// Livello 1
filters: {
    'contact.email': 'mario@example.com'
}

// Livello 2
filters: {
    'contact.phone.mobile': '+39 123456789'
}

// Multipli campi annidati
filters: {
    'address.city': 'VERONA',
    'metadata.verified': true
}

// Con operatori
filters: {
    'address.zip': { $startsWith: '37' },
    'metadata.registered': { $gte: '2024-01-01' }
}
```

### ⚠️ Attenzione UPDATE con Campi Annidati

```javascript
// ❌ SBAGLIATO - Questo NON funziona come ci si aspetta
data: {
    'address.city': 'MILANO'  // Crea proprietà letterale 'address.city'
}

// ✅ CORRETTO - Aggiorna oggetto completo
data: {
    address: {
        city: 'MILANO',
        street: 'Via Dante 5',  // Specifica tutti i campi
        zip: '20100'
    }
}

// ✅ ALTERNATIVA - Leggi -> Modifica -> Scrivi
const user = await jsonRepository({
    entity: 'users',
    operation: 'GET',
    filters: { _id: 'user-123' }
});

user.data[0].address.city = 'MILANO';

await jsonRepository({
    entity: 'users',
    operation: 'UPDATE',
    data: user.data[0],
    filters: { _id: 'user-123' }
});
```

---

## 💡 Esempi Avanzati

### Esempio 1: Sistema di E-Commerce

```javascript
// Aggiungi prodotti
await jsonRepository({
    entity: 'products',
    operation: 'ADD',
    data: [
        {
            sku: 'LAPTOP-001',
            name: 'MacBook Pro 16"',
            price: 2499,
            stock: 15,
            category: 'electronics',
            tags: ['laptop', 'apple', 'premium']
        },
        {
            sku: 'MOUSE-001',
            name: 'Logitech MX Master 3',
            price: 99,
            stock: 50,
            category: 'accessories',
            tags: ['mouse', 'wireless']
        }
    ]
});

// Trova prodotti electronics sotto i €1000 con stock disponibile
const products = await jsonRepository({
    entity: 'products',
    operation: 'GET',
    filters: {
        category: 'electronics',
        price: { $lt: 1000 },
        stock: { $gt: 0 }
    }
});

// Applica sconto 10% a tutti gli accessories
await jsonRepository({
    entity: 'products',
    operation: 'UPDATE',
    data: {
        discount: 10,
        discount_until: '2026-12-31'
    },
    filters: {
        category: 'accessories'
    }
});

// Rimuovi prodotti esauriti da più di 30 giorni
await jsonRepository({
    entity: 'products',
    operation: 'DELETE',
    filters: {
        stock: { $eq: 0 },
        last_stock_date: { $lt: '2026-01-01' }
    }
});
```

### Esempio 2: Sistema CRM

```javascript
// Aggiungi clienti
await jsonRepository({
    entity: 'customers',
    operation: 'ADD',
    data: {
        company: 'Acme Corp',
        contact: {
            name: 'John Doe',
            email: 'john@acme.com',
            phone: '+1234567890'
        },
        address: {
            street: '123 Main St',
            city: 'NEW YORK',
            country: 'USA'
        },
        tier: 'premium',
        credit_limit: 50000,
        active: true
    }
});

// Trova clienti premium inattivi
const inactiveVIP = await jsonRepository({
    entity: 'customers',
    operation: 'GET',
    filters: {
        tier: 'premium',
        active: false
    }
});

// Aggiorna tier per clienti con alto credito
await jsonRepository({
    entity: 'customers',
    operation: 'UPDATE',
    data: { tier: 'platinum' },
    filters: {
        credit_limit: { $gte: 100000 },
        tier: { $ne: 'platinum' }
    }
});
```

### Esempio 3: Sistema di Logging

```javascript
// Aggiungi log entry
await jsonRepository({
    entity: 'logs',
    operation: 'ADD',
    data: {
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: 'Database connection failed',
        service: 'api-gateway',
        metadata: {
            endpoint: '/api/users',
            ip: '192.168.1.100',
            user_id: 'user-123'
        }
    }
});

// Trova tutti gli errori delle ultime 24h
const recentErrors = await jsonRepository({
    entity: 'logs',
    operation: 'GET',
    filters: {
        level: 'ERROR',
        timestamp: { $gte: '2026-02-05T00:00:00Z' }
    }
});

// Pulisci log vecchi (> 30 giorni)
await jsonRepository({
    entity: 'logs',
    operation: 'DELETE',
    filters: {
        timestamp: { $lt: '2026-01-06T00:00:00Z' }
    }
});
```

### Esempio 4: Gestione Utenti Multi-Ruolo

```javascript
// Trova utenti admin O moderator di città specifiche
const staff = await jsonRepository({
    entity: 'users',
    operation: 'GET',
    filters: {
        $or: [
            { role: 'admin' },
            { role: 'moderator' }
        ],
        $and: [
            {
                $or: [
                    { 'address.city': 'VERONA' },
                    { 'address.city': 'MILANO' },
                    { 'address.city': 'ROMA' }
                ]
            },
            {
                status: 'active',
                'metadata.verified': true
            }
        ]
    }
});

// Disattiva utenti non verificati dopo 30 giorni
await jsonRepository({
    entity: 'users',
    operation: 'UPDATE',
    data: {
        status: 'suspended',
        suspension_reason: 'Email not verified'
    },
    filters: {
        'metadata.verified': false,
        'metadata.registered': { $lt: '2026-01-06' }
    }
});
```

---

## 🔌 Integrazione Node-RED

### Metodo 1: Function Node Semplice

```javascript
// Ottieni repository dal context globale
const jsonRepository = global.get('jsonRepository');

// Esegui operazione
const result = await jsonRepository({
    entity: msg.entity || 'users',
    operation: msg.operation || 'GET',
    data: msg.payload,
    filters: msg.filters || {}
});

// Imposta output
msg.payload = result;
msg.statusCode = result.success ? 200 : 400;

return msg;
```

### Metodo 2: HTTP Endpoint REST-like

```javascript
// Function node per API REST
const jsonRepository = global.get('jsonRepository');

// Parse request
const entity = msg.req.params.entity;  // da URL /api/:entity
const operation = msg.req.method;      // GET, POST, PUT, DELETE

let op;
switch(operation) {
    case 'GET': op = 'GET'; break;
    case 'POST': op = 'ADD'; break;
    case 'PUT': op = 'UPDATE'; break;
    case 'DELETE': op = 'DELETE'; break;
    default:
        msg.statusCode = 405;
        msg.payload = { error: 'Method not allowed' };
        return msg;
}

try {
    const result = await jsonRepository({
        entity: entity,
        operation: op,
        data: msg.payload,
        filters: msg.req.query || {}
    });
    
    msg.statusCode = result.success ? 200 : 400;
    msg.payload = result;
    
} catch(error) {
    msg.statusCode = 500;
    msg.payload = { error: error.message };
}

return msg;
```

### Metodo 3: Flow Completo

```
[HTTP IN] → [Parse] → [Repository] → [Format] → [HTTP OUT]
```

**Nodo HTTP IN**: `GET /api/:entity`

**Nodo Parse** (Function):
```javascript
msg.entity = msg.req.params.entity;
msg.operation = 'GET';
msg.filters = msg.req.query;
return msg;
```

**Nodo Repository** (Function):
```javascript
const jsonRepository = global.get('jsonRepository');

msg.payload = await jsonRepository({
    entity: msg.entity,
    operation: msg.operation,
    filters: msg.filters
});

return msg;
```

**Nodo Format** (Function):
```javascript
msg.statusCode = msg.payload.success ? 200 : 404;
return msg;
```

### Metodo 4: Subflow Riutilizzabile

Crea un **Subflow** con:
- **Input**: `msg.entity`, `msg.operation`, `msg.data`, `msg.filters`
- **Output**: `msg.payload` con risultato

```javascript
// Subflow template
const jsonRepository = global.get('jsonRepository');

const result = await jsonRepository({
    entity: msg.entity,
    operation: msg.operation,
    data: msg.data,
    filters: msg.filters,
    config: msg.config
});

msg.payload = result;
msg.originalMessage = msg._msgid;

return msg;
```

---

## 📁 Struttura File

### Formato File JSON

Ogni entità è un **array di oggetti**:

```json
[
    {
        "_id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Mario Rossi",
        "email": "mario@example.com",
        "age": 35,
        "address": {
            "city": "VERONA",
            "street": "Via Roma 10"
        },
        "created_at": "2026-02-06T10:30:00Z"
    },
    {
        "_id": "650e8400-e29b-41d4-a716-446655440001",
        "name": "Luigi Verdi",
        "email": "luigi@example.com",
        "age": 28,
        "address": {
            "city": "MILANO",
            "street": "Via Dante 5"
        },
        "created_at": "2026-02-06T11:45:00Z"
    }
]
```

### Pretty Print vs Minified

**Pretty Print** (`prettyPrint: true`):
```json
[
  {
    "_id": "abc-123",
    "name": "Test"
  }
]
```

**Minified** (`prettyPrint: false`):
```json
[{"_id":"abc-123","name":"Test"}]
```

**Raccomandazione**: 
- Sviluppo/Debug: `prettyPrint: true`
- Produzione: `prettyPrint: false` (risparmio spazio ~30%)

---

## 🎓 Best Practices

### 1. Naming Convention Entità

```javascript
// ✅ CORRETTO - Plurale lowercase
entity: 'users'
entity: 'products'
entity: 'orders'

// ❌ EVITARE
entity: 'User'        // CamelCase
entity: 'PRODUCTS'    // Uppercase
entity: 'order-items' // Kebab-case (usa underscore)
```

### 2. Gestione _id

```javascript
// ✅ CORRETTO - Lascia generare automaticamente
data: { name: 'Mario' }  // _id sarà auto-generato

// ✅ OK - Specifica _id solo se necessario
data: { _id: 'user-mario-123', name: 'Mario' }

// ❌ EVITARE - _id duplicati
await jsonRepository({ operation: 'ADD', data: { _id: 'same-id' } });
await jsonRepository({ operation: 'ADD', data: { _id: 'same-id' } }); // ERRORE!
```

### 3. Filtri Sicuri

```javascript
// ✅ CORRETTO - Sempre specificare filtri per UPDATE/DELETE
filters: { _id: 'user-123' }
filters: { status: 'inactive' }

// ❌ PERICOLOSO - Evitare filtri troppo generici
filters: {}  // UPDATE/DELETE fallirà (protezione)

// ✅ CORRETTO - Per operazioni massive, usa filtri specifici
filters: {
    status: 'pending',
    created_at: { $lt: '2026-01-01' }
}
```

### 4. Validazione Input

```javascript
// ✅ CORRETTO - Valida prima di salvare
function validateUser(data) {
    if (!data.email || !data.email.includes('@')) {
        throw new Error('Invalid email');
    }
    if (!data.name || data.name.length < 2) {
        throw new Error('Name too short');
    }
    return true;
}

const userData = msg.payload;
validateUser(userData);

await jsonRepository({
    entity: 'users',
    operation: 'ADD',
    data: userData
});
```

### 5. Error Handling

```javascript
// ✅ CORRETTO - Sempre gestire errori
try {
    const result = await jsonRepository({
        entity: 'users',
        operation: 'GET'
    });
    
    if (!result.success) {
        console.error('Operation failed:', result.message);
        // Gestisci errore
    }
    
    if (result.count === 0) {
        console.warn('No results found');
    }
    
} catch (error) {
    console.error('Critical error:', error);
    // Notifica amministratore
}
```

### 6. Performance con Grandi Dataset

```javascript
// ✅ CORRETTO - Usa filtri specifici
filters: { 
    'address.city': 'VERONA',
    age: { $gte: 18, $lte: 65 }
}

// ❌ INEFFICIENTE - Evita GET completi su entità grandi
const all = await jsonRepository({ entity: 'users', operation: 'GET' });
const filtered = all.data.filter(u => u.city === 'VERONA'); // Filtraggio in memoria

// ✅ ALTERNATIVA - Filtra a livello repository
const filtered = await jsonRepository({
    entity: 'users',
    operation: 'GET',
    filters: { 'address.city': 'VERONA' }
});
```

### 7. Backup e Versioning

```javascript
// ✅ CORRETTO - Abilita backup per operazioni critiche
await jsonRepository({
    entity: 'financial_records',
    operation: 'UPDATE',
    data: { balance: newBalance },
    filters: { account_id: '123' },
    config: { backup: true }  // Crea .backup prima di modificare
});

// ✅ PATTERN - Versioning manuale
const timestamp = new Date().toISOString();
data.version = timestamp;
data.updated_by = currentUser;
```

### 8. Indici e Performance

```javascript
// ⚠️ LIMITAZIONE - Non ci sono indici reali
// Per dataset > 1000 oggetti, considera:

// Pattern 1: Cache in memoria
let usersCache = null;
let cacheTime = null;

async function getCachedUsers() {
    const now = Date.now();
    if (!usersCache || (now - cacheTime) > 60000) { // Cache 1 min
        const result = await jsonRepository({
            entity: 'users',
            operation: 'GET'
        });
        usersCache = result.data;
        cacheTime = now;
    }
    return usersCache;
}

// Pattern 2: Migra a MongoDB quando superi 500-600 oggetti per entità
```

---

## ⚡ Performance

### Limiti e Raccomandazioni

| Scenario | Oggetti | Performance | Raccomandazione |
|----------|---------|-------------|-----------------|
| **Ottimale** | < 100 | Eccellente | ✅ Usa JSON Repository |
| **Buono** | 100-500 | Buona | ✅ Usa con cache opzionale |
| **Accettabile** | 500-1000 | Media | ⚠️ Considera ottimizzazioni |
| **Limite** | > 1000 | Degradata | ❌ Migra a MongoDB |

### Test di Performance

```javascript
// Benchmark test
const iterations = 1000;
const start = Date.now();

for (let i = 0; i < iterations; i++) {
    await jsonRepository({
        entity: 'test',
        operation: 'GET',
        filters: { index: i }
    });
}

const duration = Date.now() - start;
console.log(`${iterations} GET operations in ${duration}ms`);
console.log(`Avg: ${duration/iterations}ms per operation`);
```

**Risultati Tipici** (Node.js 18, SSD):
- 100 oggetti: ~1-2ms per GET
- 500 oggetti: ~3-5ms per GET
- 1000 oggetti: ~8-15ms per GET

### Ottimizzazioni

```javascript
// 1. Usa filtri specifici
// ❌ Lento
const all = await jsonRepository({ entity: 'users', operation: 'GET' });
const user = all.data.find(u => u._id === 'user-123');

// ✅ Veloce
const user = await jsonRepository({
    entity: 'users',
    operation: 'GET',
    filters: { _id: 'user-123' }
});

// 2. Batch operations
// ❌ Lento - N query
for (let user of users) {
    await jsonRepository({ operation: 'ADD', data: user });
}

// ✅ Veloce - 1 query
await jsonRepository({
    operation: 'ADD',
    data: users  // Array
});

// 3. Disabilita pretty print in produzione
config: {
    prettyPrint: false  // -30% dimensione file, +20% velocità I/O
}
```

---

## 🔄 Migrazione MongoDB

Il sistema è progettato per facilitare la migrazione futura a MongoDB.

### Sintassi Compatibile

```javascript
// JSON Repository
await jsonRepository({
    entity: 'users',
    operation: 'GET',
    filters: {
        age: { $gte: 18 },
        status: { $in: ['active', 'pending'] }
    }
});

// MongoDB (equivalente)
await db.collection('users').find({
    age: { $gte: 18 },
    status: { $in: ['active', 'pending'] }
}).toArray();
```

### Script di Migrazione

```javascript
const fs = require('fs').promises;
const { MongoClient } = require('mongodb');

async function migrateToMongoDB() {
    const client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('mydb');
    
    // Leggi tutte le entità
    const entities = ['users', 'products', 'orders'];
    
    for (let entity of entities) {
        const filePath = `./data/db/${entity}.json`;
        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
        
        // Importa in MongoDB
        if (data.length > 0) {
            await db.collection(entity).insertMany(data);
            console.log(`✅ Migrated ${data.length} ${entity}`);
        }
    }
    
    await client.close();
    console.log('🎉 Migration completed!');
}

migrateToMongoDB();
```

### Wrapper per Transizione Graduale

```javascript
// repository-wrapper.js - Usa JSON o MongoDB in base a config
async function repository(options) {
    const useMongoDb = process.env.USE_MONGODB === 'true';
    
    if (useMongoDb) {
        return await mongoRepository(options);  // Implementazione MongoDB
    } else {
        return await jsonRepository(options);   // Implementazione JSON
    }
}

// Il codice applicativo rimane identico!
await repository({
    entity: 'users',
    operation: 'GET',
    filters: { status: 'active' }
});
```

---

## 🐛 Troubleshooting

### Problema: "ENOENT: no such file or directory"

**Causa**: Directory `basePath` non esiste

**Soluzione**:
```javascript
// Il sistema crea automaticamente la directory, ma verifica i permessi
config: {
    basePath: '/path/with/write/permissions'
}
```

### Problema: "Duplicate _id"

**Causa**: Tentativo di aggiungere oggetto con `_id` già esistente

**Soluzione**:
```javascript
// Non specificare _id (generazione automatica)
data: { name: 'Mario' }  // OK

// Oppure usa UPDATE invece di ADD
await jsonRepository({
    operation: 'UPDATE',
    data: { name: 'Mario Updated' },
    filters: { _id: 'existing-id' }
});
```

### Problema: "Filters are required for UPDATE/DELETE"

**Causa**: Tentativo di UPDATE/DELETE senza filtri (protezione)

**Soluzione**:
```javascript
// ❌ ERRORE
await jsonRepository({
    operation: 'DELETE',
    filters: {}
});

// ✅ CORRETTO
await jsonRepository({
    operation: 'DELETE',
    filters: { status: 'deleted' }
});
```

### Problema: Performance Degradata

**Causa**: Troppi oggetti in un'unica entità

**Soluzione**:
```javascript
// 1. Archivia dati vecchi
await jsonRepository({
    entity: 'logs_archive',
    operation: 'ADD',
    data: oldLogs
});

await jsonRepository({
    entity: 'logs',
    operation: 'DELETE',
    filters: { timestamp: { $lt: '2026-01-01' } }
});

// 2. Split entità
// users.json → users_active.json + users_inactive.json

// 3. Migra a MongoDB (> 1000 oggetti)
```

### Problema: Campi Annidati non Aggiornati

**Causa**: Uso scorretto di dot notation in UPDATE

**Soluzione**:
```javascript
// ❌ NON funziona
data: { 'address.city': 'MILANO' }

// ✅ Funziona
data: {
    address: {
        city: 'MILANO',
        street: existingStreet,  // Devi includere tutti i campi
        zip: existingZip
    }
}
```

### Problema: "Module not found: uuid"

**Causa**: Dipendenza `uuid` non installata

**Soluzione**:
```bash
npm install uuid
```

---

## ❓ FAQ

### Q: Posso usare questo in produzione?

**A**: Sì, ma con limitazioni:
- ✅ **OK per**: Prototipi, applicazioni con < 500 oggetti per entità, dati non critici
- ⚠️ **Attenzione per**: Applicazioni con scritture concorrenti, dati critici
- ❌ **NO per**: High-traffic apps, > 1000 oggetti, transazioni ACID

### Q: È thread-safe / concurrent-safe?

**A**: **NO**. Se più processi Node.js scrivono contemporaneamente, possono verificarsi race conditions. Per ambienti multi-istanza, usa MongoDB.

### Q: Come gestisco le relazioni (foreign keys)?

**A**: 
```javascript
// Embedding (dati annidati)
{
    _id: 'order-123',
    customer: {
        _id: 'customer-456',
        name: 'Mario Rossi'
    },
    items: [...]
}

// Referencing (ID reference)
{
    _id: 'order-123',
    customer_id: 'customer-456',
    items: [...]
}

// Query manuale
const order = await jsonRepository({
    entity: 'orders',
    operation: 'GET',
    filters: { _id: 'order-123' }
});

const customer = await jsonRepository({
    entity: 'customers',
    operation: 'GET',
    filters: { _id: order.data[0].customer_id }
});
```

### Q: Posso fare JOIN tra entità?

**A**: No, devi farlo manualmente in codice. Per query complesse, considera MongoDB con aggregation pipeline.

### Q: Come gestisco le transazioni?

**A**: Non ci sono transazioni atomiche. Pattern consigliato:

```javascript
// Pseudo-transazione
let rollbackData = null;

try {
    // Backup prima di modificare
    const backup = await jsonRepository({
        entity: 'accounts',
        operation: 'GET',
        filters: { _id: 'account-123' }
    });
    rollbackData = backup.data[0];
    
    // Operazione
    await jsonRepository({
        entity: 'accounts',
        operation: 'UPDATE',
        data: { balance: newBalance },
        filters: { _id: 'account-123' }
    });
    
} catch (error) {
    // Rollback manuale
    if (rollbackData) {
        await jsonRepository({
            entity: 'accounts',
            operation: 'UPDATE',
            data: rollbackData,
            filters: { _id: 'account-123' }
        });
    }
    throw error;
}
```

### Q: Posso usare TypeScript?

**A**: Sì! Esempio:

```typescript
interface RepositoryOptions {
    entity: string;
    operation: 'ADD' | 'GET' | 'UPDATE' | 'DELETE';
    data?: any | any[];
    filters?: Record<string, any>;
    config?: RepositoryConfig;
}

interface RepositoryConfig {
    basePath?: string;
    prettyPrint?: boolean;
    backup?: boolean;
    autoCreateEntity?: boolean;
}

interface RepositoryResponse<T = any> {
    success: boolean;
    operation: string;
    entity: string;
    data: T[];
    count: number;
    message: string;
    error?: string;
}

const jsonRepository: (options: RepositoryOptions) => Promise<RepositoryResponse>;
```

---

## 🤝 Contributing

Contributi benvenuti! Per favore:

1. **Fork** il repository
2. **Crea branch** feature (`git checkout -b feature/amazing-feature`)
3. **Commit** modifiche (`git commit -m 'Add amazing feature'`)
4. **Push** al branch (`git push origin feature/amazing-feature`)
5. **Apri Pull Request**

### Roadmap Futura

- [ ] Indici in-memory per performance
- [ ] Query builder chainable
- [ ] Validazione schema con JSON Schema
- [ ] Audit log integrato
- [ ] Encryption at rest
- [ ] Full-text search
- [ ] Aggregation pipeline (simil-MongoDB)
- [ ] Stream processing per file grandi

---

## 📄 License

**MIT License**

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🙏 Acknowledgments

- Ispirato dalla sintassi query di **MongoDB**
- Progettato per integrazione **Node-RED**
- Utilizza **UUID v4** per ID generation

---

**Made with ❤️ for the Node-RED Community**

---

## 📊 Appendice: Cheat Sheet

```javascript
// ========== QUICK REFERENCE ==========

// ADD Singolo
await jsonRepository({
    entity: 'users',
    operation: 'ADD',
    data: { name: 'Mario' }
});

// ADD Multipli
await jsonRepository({
    entity: 'users',
    operation: 'ADD',
    data: [{ name: 'Mario' }, { name: 'Luigi' }]
});

// GET Tutti
await jsonRepository({
    entity: 'users',
    operation: 'GET'
});

// GET con Filtro
await jsonRepository({
    entity: 'users',
    operation: 'GET',
    filters: { 'address.city': 'VERONA' }
});

// GET con Operatori
await jsonRepository({
    entity: 'users',
    operation: 'GET',
    filters: {
        age: { $gte: 18, $lte: 65 },
        status: { $in: ['active', 'pending'] }
    }
});

// UPDATE
await jsonRepository({
    entity: 'users',
    operation: 'UPDATE',
    data: { status: 'verified' },
    filters: { _id: 'user-123' }
});

// DELETE
await jsonRepository({
    entity: 'users',
    operation: 'DELETE',
    filters: { status: 'inactive' }
});

// ========== OPERATORI ==========
// $eq, $ne, $gt, $gte, $lt, $lte
// $in, $nin
// $contains, $startsWith, $endsWith
// $exists
// $and, $or, $not

// ========== CONFIG ==========
config: {
    basePath: '/data/db',
    prettyPrint: true,
    backup: false,
    autoCreateEntity: true
}
```

---

**Versione**: 1.0.0  
**Ultimo aggiornamento**: 2026-02-06  
**Compatibilità**: Node.js >= 14, Node-RED >= 2.0