const request = require('supertest');


function is_object(val) {
    return val?.constructor === Object;
}

function is_blank(values) {
    if (!Array.isArray(values)) {
        throw 'is_blank function accepts an array of values';
    }

    if (values.length === 0){
        return true;
    }

    for (let value of values) {
        if (value === '' || value === undefined) {
            return true
        }
    }
    return false;
}

function fail_with_json(response, status=400, expectedResponse="") {
    if (!(response.body.hasOwnProperty('errDesc')) && response.status > 400) {
        console.log('Received body: ', response.body);
        throw 'Error description is missing in the response';
    }
    expect(response.status).toEqual(status);
    expect(response.headers["content-type"]).toMatch(/json/);
    if (expectedResponse) {
        expect(response.body.errDesc).toEqual(expectedResponse); 
    } else {
        expect(response.body.errDesc).toEqual('Bad request'); 
    }
}

async function check_type_blank(correctRequest, route, operation, server, db) {
    /* Takes a valid object of a server request, and a route as an argument.
    Checks for missing keys and blank & invalid type values */

    async function perform_crud(route, req) {
        let response;
        if (operation === 'post') {
            response =  await request(server(db))
            .post(route)
            .send(req);
        } else if (operation === 'put') {
            response =  await request(server(db))
            .put(route)
            .send(req);
        } else if (operation === 'delete') {
            response =  await request(server(db))
            .delete(route)
            .send(req);
        } else {
            throw 'Unknown CRUD operation';
        }
        return response;
    }

    const allKeys = Object.keys(correctRequest);
    
    // Fail on missing values
    for (let i = 0; i < allKeys.length; i++) {
        const dummyRequest = {...correctRequest};
        delete dummyRequest[allKeys[i]];
        
        const response = await perform_crud(route, dummyRequest);
        expect(fail_with_json(response, 400, "Missing or extra body"));
    }

    // Fail on extra values
    let extraDummy = {...correctRequest};
    extraDummy['un!qu*3eKeH^'] = 'tesing extra key';

    const extraResponse = await perform_crud(route, extraDummy);
    expect(fail_with_json(extraResponse, 400, "Missing or extra body"));


    // Fail on type mismatch
    const counterTypes = {
        'string': ['yeah'],
        'number': '6',
        'float': 6,
        'object': ['3'],
        'array': {'words': ['yes']},
        'boolean': 'not really',
        'null': '6',
        'undefined': 'should work'
    }

    for (let i = 0; i < allKeys.length; i++) {
        let dummyRequest = {...correctRequest};
        const value = correctRequest[allKeys[i]];
        let keyType = typeof value;

        if (keyType === 'object') {
            if (value === null) {
                keyType = 'null';
            } else if (Array.isArray(value)) {
                keyType = 'array'
            }
        }

        dummyRequest[allKeys[i]] = counterTypes[keyType];
        
        const response = await perform_crud(route, dummyRequest);
        expect(fail_with_json(response, 400, "Type mismatch"));            
    }

    // Fail on blank values
    for (let i = 0; i < allKeys.length; i++) {
        let dummyRequest = {...correctRequest};

        if (typeof dummyRequest[allKeys[i]] !== 'string') {
            continue
        }

        // Space & tabs & new line
        dummyRequest[allKeys[i]] = '\n\t  ';
        
        const spaceResponse = await perform_crud(route, dummyRequest);
        expect(fail_with_json(spaceResponse, 400, "Blank value"));
    }
}

module.exports = {
    is_object, check_type_blank, fail_with_json, is_blank
};