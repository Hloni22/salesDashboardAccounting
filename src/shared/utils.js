'use strict';
// const express = require('express');
// const session = require('express-session');
const request = require('request');

const setupXeroOAuth2 = async (clientId, clientSecret, redirectUri, xeroApiUrl, scopes, client) => {
    console.log('Starting')
    try {
        console.log('Setting up OAuth2 client access!!!!!!')
        let consentUrl = client.authorizationUrl({
            redirect_uri: redirectUri,
            scope: scopes,
        });
        return consentUrl;
    } catch (error) {
        return 'error';
    }
};


const getToken = async (client, redirectUrl, query, req, res, ret) => {
    try {
        client.CLOCK_TOLERANCE = 5;
        Issuer.defaultHttpOptions = { timeout: 20000 };

        const token = await client.authorizationCallback(redirectUrl, ret);
        inMemoryToken = token;
        let accessToken = token.access_token;
        ret.session.accessToken = accessToken;
        console.log('\nOAuth successful...\n\naccess token: \n' + accessToken + '\n');
        let idToken = token.id_token;
        console.log('\id token: \n' + idToken + '\n');
        console.log('\nid token claims: \n' + JSON.stringify(token.claims, null, 2));
        let refreshToken = token.refresh_token;
        console.log('\nrefresh token: \n' + refreshToken);
        req.session.save();
        var connectionsRequestOptions = {
            url: 'https://api.xero.com/connections',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            auth: {
                'bearer': req.session.accessToken
            },
            timeout: 10000
        };
        request.get(connectionsRequestOptions, function (error, response, body) {
            if (error) {
                console.log('error from connectionsRequest: ' + error);
            }
            let data = JSON.parse(body);
            let tenant = data[0];
            let tenantId = tenant['tenantId'];
            req.session.xeroTenantId = tenantId;
            console.log('\nRetrieving connections...\n\ntenantId: \n' + tenantId);
            req.session.save();
        });

    } catch (e) {
        console.log('ERROR: ' + e);
    } finally {

    }
};


const getOrganisation = (req, res) => {
    const organisationRequestOptions = {
        url: 'https://api.xero.com/api.xro/2.0/organisation',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'xero-tenant-id': req.session.xeroTenantId
        },
        auth: {
            'bearer': req.session.accessToken
        }
    };

    request.get(organisationRequestOptions, function (error, response, body) {
        if (error) {
            console.log('Error from organisationRequest: ' + error);
        } else {
            console.log('Response body: ' + body);
        }
    });
};

const getInvoices = (req, res) => {
    const invoicesRequestOptions = {
        url: 'https://api.xero.com/api.xro/2.0/invoices',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'xero-tenant-id': req.session.xeroTenantId
        },
        auth: {
            'bearer': req.session.accessToken
        }
    };

    request.get(invoicesRequestOptions, function (error, response, body) {
        if (error) {
            console.log('Error from invoicesRequest: ' + error);
        } else {
            console.log('Response body: ' + body);
        }
    });
};

const refreshToken = async () => {
    try {
        client.CLOCK_TOLERANCE = 5;
        Issuer.defaultHttpOptions = { timeout: 20000 };
        let newToken = await client.refresh(inMemoryToken.refresh_token);
        req.session.accessToken = newToken.access_token;
        req.session.save();
        inMemoryToken = newToken;
        console.log('\nRefresh successful...\n\nNew access token: \n' + newToken.access_token + '\n');
        console.log('New refresh token: \n' + newToken.refresh_token);
    } catch (e) {
        console.log('refreshToken error: ' + e);
    } finally {

    }
};


module.exports = {
    setupXeroOAuth2,
    handleCallback,
    getOrganisation,
    getInvoices,
    refreshToken,
};
