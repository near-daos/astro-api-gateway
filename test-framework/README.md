# SPUTNIK API TEST FRAMEWORK
This framework is intended to be used for testing of Sputnik v2 API

## Tests Execution

### Global preconditions
1. JDK 11 must be installed 
2. Place NEAR CLI credentials file (testdao2.testnet.json) from ./src/test/resources folder to ~/.near-credentials/testnet

### Preconditions for running tests from IntelliJ IDEA
1. Install IntelliJ IDEA.
2. Clone project from [repository](https://bitbucket.org/magicpowered/sputnik-api-test-framework/src/master/)    
3. Open project in IDEA    
4. Go to Settings / Preferences | Build, Execution, Deployment | Build Tools | Gradle in IntelliJ IDEA
5. Select IntelliJ IDEA in Run tests using dropdown

### Git Configuration (User Settings)
1. Go to *sputnik-api-gateway* project folder in CLI (terminal or so)
2. Enter next command: **git config --local user.name "{Username from GitHub}"**
3. Enter next command: **git config --local user.email {email}**

### Env (Test Environments)
- `testnet` - run tests against testnet environment -Dtest.env=testnet (default option)
- `dev` - run tests against dev environment -Dtest.env=dev

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
 $ ./gradlew clean test -DincludeTags=all -Dtest.env=testnet
 ```
 ```bash
 $ ./gradlew clean test -DincludeTags=debug -Dtest.env=dev
 ```

## Test Reports
To generate and open report execute command below
 ```bash
 $ ./gradlew allureReport allureServe
 ```