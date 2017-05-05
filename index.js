'use strict';

var assert = require('assert');
var ApiClient = require('apiapi');

module.exports = function buildClient (baseUrl) {
    assert(typeof baseUrl === 'string', 'baseUrl must be string');

    return new ApiClient({
        baseUrl: baseUrl,
        methods: {
            auth: 'post /private/api/auth.php?type=json',

            getCurrentAccount: 'get /private/api/v2/json/accounts/current',

            getTasksList: 'get /private/api/v2/json/tasks/list',
            createTask: 'post /private/api/v2/json/tasks/set',

            getContactsList: 'get /private/api/v2/json/contacts/list',
            createContact: 'post /private/api/v2/json/contacts/set',

            createLead: 'post /private/api/v2/json/leads/set',
            getLeads: 'get /private/api/v2/json/leads/list',

            createNote: 'post /private/api/v2/json/notes/set',

            getPipelines: 'get /private/api/v2/json/pipelines/list',

            registerWebhook: 'post /private/api/v2/json/webhooks/subscribe'
        },

        transformRequest: {
            createTask: prepareCreateTask,
            createContact: prepareCreateContact,
            createLead: prepareCreateLead,
            createNote: prepareCreateNote,
            registerWebhook: prepareRegisterWebhook
        },
        transformResponse: {
            auth: storeAuth,
            createTask: parseCreateTask,
            getCurrentAccount: parseGetCurrentAccount,
            getContactsList: parseContactsList,
            createLead: parseCreateLead,
            createContact: parseCreateContact,
            createNote: parseCreateNote,
            getPipelines: parseGetPipelines,
            getLeads: parseGetLeads
        }
    });
};

function storeAuth (res) {
    var cookies = res.headers['set-cookie'];

    if (!cookies) {
        throw new Error('AmoCRM auth failed');
    }

    this.headers.Cookie = cookies.map(parseCookie).join('; ');
    return res.data;

    function parseCookie (cookieHeader) {
        return cookieHeader.split(';')[0];
    }
}

function prepareRegisterWebhook (params, requestBody, opts) {
    requestBody = {request: {webhooks: {subscribe: [params]}}};
    return [params, requestBody, opts];
}

function prepareCreateTask (params, requestBody, opts) {
    requestBody = { request: { tasks: { add: [params] } } };
    return [params, requestBody, opts];
}

function prepareCreateContact (params, requestBody, opts) {
    requestBody = { request: { contacts: { add: [params] } } };
    return [params, requestBody, opts];
}

function parseCreateTask (res) {
    assert(res.data.response.tasks.add.length && res.status === 200, 'Task is not added due to some error');
    return res.data.response.tasks.add[0];
}

function parseCreateContact (res) {
    assert(res.data.response.contacts.add.length && res.status === 200, 'Contact is not created due to some error');
    return res.data.response.contacts.add[0];
}

function parseGetCurrentAccount (res) {
    assert(res.data.response.account && res.status === 200, 'Can\'t get current account info for some reason');
    return res.data.response.account;
}

function parseContactsList (res) {
    assert(res.data.response.contacts && res.status === 200, 'Contacts list query error');
    return res.data.response.contacts;
}

function parseGetPipelines (res) {
    return res.data.response.pipelines;
}

function parseGetLeads (res) {
    return res.data.response ? res.data.response.leads : [];
}

function prepareCreateLead (params, requestBody, opts) {
    requestBody = { request: { leads: { add: [params] } } };
    return [params, requestBody, opts];
}

function parseCreateLead (res) {
    assert(res.data.response.leads.add.length && res.status === 200, 'Lead is not added due to some error');
    return res.data.response.leads.add[0];
}

function prepareCreateNote (params, requestBody, opts) {
    requestBody = { request: { notes: { add: [params] } } };
    return [params, requestBody, opts];
}

function parseCreateNote (res) {
    assert(res.data.response.notes.add.length && res.status === 200, 'Note is not added due to some error');
    return res.data.response.notes.add[0];
}
