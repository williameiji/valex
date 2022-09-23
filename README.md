# <p align = "center"> Valex Backend </p>


##  :clipboard: Description

Benefits Card API. The API will be responsible for creating, reloading, activating, as well as processing purchases.

***

## :computer:	 Technologies and Concepts

- REST APIs
- JWTs 
- Node.js
- TypeScript
- Postgres
- Cryptr
- Joi
- Nodemon
- Faker

***

## :rocket: Routes

```yml
POST /cards (authenticated)
    - Route to register a new card
    - headers: { 
          "x-api-key": "$token"         
    }
    - body: {
        "type": "groceries" | "restaurants" | "transport" | "education" | "health",
        "id": 1,
}
```
    
```yml 
PUT /activate
    - Route to activate card
    - headers: {}
    - body: {
        "id": 1,
        "password": "lorelore",
        "cvc": 123
    }
```

```yml
GET /cards/all/:id
    - Route to list balance and transactions
```
    
```yml 
GET /cards/:id
    - Route to list balance and transactions from a card
    - headers: {}
    - body: {
        "id": 1,
        "passwordList": ["lorelore"]
    }
```

```yml
PUT /cards/block
    - Route to block a card
    - headers: {}
    - body: {
        "id": 1,
        "password": "lorelore"
    }
``` 

```yml
PUT /cards/unlock
    - Route to unlock a card
    - headers: {}
    - body: {
        "id": 1,
        "password": "lorelore"
    }
``` 

```yml
POST /virtualcards
    - Route to create a virtual card
    - headers: {}
    - body: {
        "id": 1,
        "password": "lorelore"
    }
``` 

```yml
DELETE /virtualcards/:id
    - Route to delete a virtual card
    - headers: {}
    - body: {
        "password": "lorelore"
    }
``` 

```yml
POST /recharge/:id
    - Route to recharge a card
    - headers: {
         "x-api-key": "$token"  
    }
    - body: {
        "value": 100
    }
``` 

```yml
POST /payments/:id
    - Route to make payments
    - headers: {}
    - body: {
        "idCard": 1,
        "password": "lorelore",
        "value": 500
    }
``` 

```yml
POST /payments/online/:id
    - Route to make online payments
    - headers: {}
    - body: {
        "idCard": 1,
        "cvc": 123,
        "name": "Lore Ips",
        "expeditionDate": "08/25",
        "value": 500
    }
``` 

## 🏁 Running the application

This project was started with the [Express](https://www.npmjs.com/package/express), so make sure you have the latest stable version of [Node.js](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/) running locally.


First, clone this repository on your machine:

```
git clone https://github.com/williameiji/valex
```

Then, inside the folder, run the following command to install the dependencies.

```
npm install
```

Finished the process, just start the server
```
npm run dev
```
