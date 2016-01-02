# Website Kraken Tentacle Service
[![Build Status](https://travis-ci.org/code-arcs/kraken-tentacle-website-screenshot.svg?branch=master)](https://travis-ci.org/code-arcs/kraken-tentacle-website-screenshot)
 
This service is capable of taking screenshots of any website one has free access to.

## Routes
**Take a screenshot**   
`POST    /screenshot`

_Body_  
```application/json
{
    "url": "codearcs.de"
}
```

## NPM commands
`npm start` starts the service on port 3000.


# Tests

## Unit tests
`npm test`

## Integration tests
Run ArangoDB Docker Container:  
`docker run -p 8529:8529 -d arangodb`
 
Run integration tests  
`npm run integration-test`

# License
Copyright 2016 CodeArcs.de

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.