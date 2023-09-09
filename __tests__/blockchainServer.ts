import request from "supertest";
import { describe, test, expect } from '@jest/globals';
import { app } from '../src/server/blockchainServer';

jest.mock('../src/lib/block');
jest.mock('../src/lib/blockchain');

describe ('BlockchainServer Tests', () => {
    test('GET/status', async () => {
        const response = await request(app)
            .get('/status');
        
        expect (response.status).toEqual(200);
        expect (response.body.isValid.success).toEqual(true);
    })
})