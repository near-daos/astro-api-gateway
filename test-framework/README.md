# SPUTNIK API TEST FRAMEWORK
This framework is intended to be used for testing of Sputnik v2 API

[![Launch API Autotests On Schedule](https://github.com/near-daos/astro-api-gateway/actions/workflows/launch-autotests-on-schedule.yaml/badge.svg)](https://github.com/near-daos/astro-api-gateway/actions/workflows/launch-autotests-on-schedule.yaml)
[![Manual API Autotests run](https://github.com/near-daos/astro-api-gateway/actions/workflows/run-autotests.yaml/badge.svg)](https://github.com/near-daos/astro-api-gateway/actions/workflows/run-autotests.yaml)

## Test execution reports
- [API test coverage and Allure reports - **testnet** environment](https://automation-report.app.astrodao.com/test/)


## Tests Execution

### Global preconditions
1. JDK 11 must be installed 
2. Place NEAR CLI credentials file (testdao2.testnet.json) from ./src/test/resources folder to ~/.near-credentials/testnet

### Preconditions for running tests from IntelliJ IDEA
1. Install IntelliJ IDEA.
2. Clone project from [repository](https://github.com/near-daos/astro-api-gateway)    
3. Open project in IDEA    
4. Go to Settings / Preferences | Build, Execution, Deployment | Build Tools | Gradle in IntelliJ IDEA
5. Generate Open API models in CLI by executing following command: `./gradlew clean generateOpenApiModels`
6. Select IntelliJ IDEA in Run tests using dropdown

### Git Configuration (User Settings)
1. Go to *sputnik-api-gateway* project folder in CLI (terminal or so)
2. Enter next command: **git config --local user.name "{Username from GitHub}"**
3. Enter next command: **git config --local user.email {email}**

### Env (Test Environments)
- `testnet` - run tests against testnet environment -Dtest.env=testnet (default option)

### Tags (Test Suites)
- `all` - runs all tests by setting -DincludeTags=all
- `debug` - runs all tests by setting -DincludeTags=debug

## How to Run in CLI
1. Clone project from [repository](https://github.com/near-daos/astro-api-gateway)
2. Go to the folder
3. Execute desired Gradle task from CLI (see examples below)

### Examples of CLI Commands
 ```bash
 $ ./gradlew clean test -DincludeTags=all
 ```
 ```bash
 $ ./gradlew clean test -DincludeTags=daoApiTests
 ```

## Test Reports
To generate and open report execute command below
 ```bash
 $ ./gradlew allureReport allureServe
 ```

## To generate test coverage report for Swagger
To generate test coverage report for Swagger execute command below
 ```bash
 $ ./gradlew generateCoverage
 ```

Coverage reports are here _build/swagger-coverage-commandline-1.5.0/bin_.
Open .html files with your browser
