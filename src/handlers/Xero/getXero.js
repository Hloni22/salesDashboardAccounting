const axios = require('axios');
const jwt = require('jsonwebtoken');
// const { setupXeroOAuth2, handleCallback, getInvoices } = require('./shared/utils.js');
// const express = require('express');
// const session = require('express-session');
// const request = require('request');
const { Issuer } = require('openid-client');
const utils = require('../../shared/utils.js')

// const issuer = await Issuer.discover('https://identity.xero.com');

exports.getXero = async (event) => {
  try {
    const issuer = await Issuer.discover('https://identity.xero.com');

    const clientId = "0CB7D89398F14A079C594A80FCDF86FF";
    const clientSecret = "nonH9mUi8NScYIv9N5-SemZ2knf6AYefC0AmRiJJxjhEvd_k";
    const redirectUri = "http://localhost:7062/api/getxerotoken";
    const xeroApiUrl = 'https://api.xero.com';
    const scopes = "offline_access accounting.transactions";

    const client = new issuer.Client({
      client_id: clientId,
      client_secret: clientSecret
    });
    console.log('Start setUp')
    const oauth = await utils.setupXeroOAuth2(clientId, clientSecret, redirectUri, xeroApiUrl, scopes, client);
    console.log('End setUp');

    if (oauth) {
      console.log('Oauth Res', oauth)
      return {
        statusCode: 302,
        headers: {
          "Location": oauth,
        },
        body: JSON.stringify({ success: true, OAuth: oauth }),
      };
    } else {
      console.log('Oauth Error')
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ success: false, error: 'OAuth process unsuccessful' }),
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ success: false, error: 'Internal server error' }),
    };
  }
};


