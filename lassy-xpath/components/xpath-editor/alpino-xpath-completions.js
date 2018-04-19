"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.functionCompletions = {
    'fn:replace()': { meta: 'Replace', hasArguments: true },
    'not()': { meta: 'Negation', hasArguments: true },
    'position()': { meta: 'Position of node', hasArguments: false },
    'last()': { meta: 'Last node position', hasArguments: false },
    'number()': { meta: 'Parse number', hasArguments: true },
};
exports.pathCompletions = [
    { value: 'node', meta: '', score: 500 },
    { value: 'and', meta: '', score: 500 },
    { value: 'or', meta: '', score: 500 },
    { value: "ancestor-or-self::", meta: '', score: 500 },
    { value: "ancestor::", meta: '', score: 500 },
    { value: "child::", meta: '', score: 500 },
    { value: "descendant-or-self::", meta: '', score: 500 },
    { value: "descendant::", meta: '', score: 500 },
    { value: "following-sibling::", meta: '', score: 500 },
    { value: "following::", meta: '', score: 500 },
    { value: "parent::", meta: '', score: 500 },
    { value: "preceding-sibling::", meta: '', score: 500 },
    { value: "preceding::", meta: '', score: 500 },
    { value: "self::", meta: '', score: 500 },
    { value: 'following-sibling::', meta: '', score: 500 }
];
