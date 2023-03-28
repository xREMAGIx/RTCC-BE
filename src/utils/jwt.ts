import * as fs from 'fs';
import { JwtPayload, sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken';
import * as path from 'path';

/**
 * generates JWT used for local testing
 */
export function generateLocalToken() {
    // information to be encoded in the JWT
    const payload = {
        name: 'Andrés Reales',
        userId: 123,
        accessTypes: [
            'getTeams',
            'addTeams',
            'updateTeams',
            'deleteTeams'
        ]
    };
    // read private key value
    const privateKey = fs.readFileSync(path.join(__dirname, './../../private.key'));

    const signInOptions: SignOptions = {
        // RS256 uses a public/private key pair. The API provides the private key 
        // to generate the JWT. The client gets a public key to validate the 
        // signature
        algorithm: 'RS256',
        expiresIn: '1h'
    };

    // generate JWT
    return sign(payload, privateKey, signInOptions);
};

interface TokenPayload {
    exp: number;
    accessTypes: string[];
    name: string;
    userId: number;
}

export interface TokenPayloadParams {
    username: string;
    id: number;
}

/**
 * generates JWT 
 */
export function generateToken(payload: TokenPayloadParams) {
    // read private key value
    const privateKey = fs.readFileSync(path.join(__dirname, './../../private.key'));

    const signInOptions: SignOptions = {
        // RS256 uses a public/private key pair. The API provides the private key 
        // to generate the JWT. The client gets a public key to validate the 
        // signature
        algorithm: 'RS256',
        expiresIn: '1h'
    };

    // generate JWT
    return sign(payload, privateKey, signInOptions);
};

/**
 * checks if JWT token is valid
 *
 * @param token the expected token payload
 */
export function validateToken(token: string): Promise<string | JwtPayload | undefined> {
    const publicKey = fs.readFileSync(path.join(__dirname, './../../public.key'));

    const verifyOptions: VerifyOptions = {
        algorithms: ['RS256'],
    };

    return new Promise((resolve, reject) => {
        verify(token, publicKey, { ...verifyOptions, complete: false }, (error, decoded) => {
            if (error) return reject(error);

            resolve(decoded);
        })
    });
}