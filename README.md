# wallet-app

## Description

Demo Credit is a mobile lending app that requires wallet functionality. This is needed as borrowers need a wallet to receive the loans they have been granted and also send the money for repayments.


- This is an MVP (Minimum viable product)  wallet service where:

- A user can create an account
- A user can fund their account
- A user can transfer funds to another user’s account
- A user can withdraw funds from their account

## ERD
[database diagram](https://dbdesigner.page.link/NrAFgybVrPrQqhUR6)

## Installation

```bash
$ npm install
```

## Setup
 - create and .env using .env.example as sample
 - Set up a mysql database according to or update your .env db variable accordingly
  - Alternatively, if you have docker installed, you can run the following command
    - `docker compose up` start a mysql docker container, you may need to use sudo privilege

## Running the app

```bash
# development
$ npm run start
# Accessible the docs at localhost:<PORT>/api/docs
# Before using the docs to make request make sure that your mysql database configured and is running 

# database migration should only be run once

# watch mode
$ npm run start:dev
# Run migrations
npx knex migrate:latest

# production mode
$ npm run start:prod
# Run migrations
npx knex migrate:latest --env production
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
## More about database migration
Check [Knexjs Migrations](https://knexjs.org/guide/migrations.html#migration-cli)

## Documentation
Available at: `http://<your-host>/api/docs` e.g: `http://localhost:9092/api/docs`
This app is available at: `https://wallet-app-production.up.railway.app/docs`

## Endpoint description
- `/auth` create a new account - if successful, a new wallet address is created for you as well
- `/wallets` endpoint - allow you to create a new wallet and access your existing wallets
- `/transactions` endpoint - allow you to transfer/receive funds to/from other users 
- `/payments` endpoint - allow you to withdraw from or fund your wallets

## Support


## Stay in touch

- Author - [Ezeh Livinus](https://linkedin.com/in/ezehlivinus)

## License

