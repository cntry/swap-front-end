"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMintCache = exports.useMint = exports.useOwnedTokenAccount = exports.TokenContextProvider = void 0;
var react_1 = __importStar(require("react"));
var assert = __importStar(require("assert"));
var react_async_hook_1 = require("react-async-hook");
var anchor_1 = require("@project-serum/anchor");
var web3_js_1 = require("@solana/web3.js");
var spl_token_1 = require("@solana/spl-token");
var tokens_1 = require("../utils/tokens");
var pubkeys_1 = require("../utils/pubkeys");
var _TokenContext = react_1.default.createContext(null);
function TokenContextProvider(props) {
    var provider = props.provider;
    var _a = react_1.useState(0), setRefresh = _a[1];
    // Fetch all the owned token accounts for the wallet.
    react_1.useEffect(function () {
        if (!provider.wallet.publicKey) {
            _OWNED_TOKEN_ACCOUNTS_CACHE.length = 0;
            setRefresh(function (r) { return r + 1; });
            return;
        }
        // Fetch SPL tokens.
        tokens_1.getOwnedAssociatedTokenAccounts(provider.connection, provider.wallet.publicKey).then(function (accs) {
            if (accs) {
                // @ts-ignore
                _OWNED_TOKEN_ACCOUNTS_CACHE.push.apply(_OWNED_TOKEN_ACCOUNTS_CACHE, accs);
                setRefresh(function (r) { return r + 1; });
            }
        });
        // Fetch SOL balance.
        provider.connection
            .getAccountInfo(provider.wallet.publicKey)
            .then(function (acc) {
            if (acc) {
                _OWNED_TOKEN_ACCOUNTS_CACHE.push({
                    publicKey: provider.wallet.publicKey,
                    // @ts-ignore
                    account: {
                        amount: new anchor_1.BN(acc.lamports),
                        mint: pubkeys_1.SOL_MINT,
                    },
                });
                setRefresh(function (r) { return r + 1; });
            }
        });
    }, [provider.wallet.publicKey, provider.connection]);
    return (react_1.default.createElement(_TokenContext.Provider, { value: {
            provider: provider,
        } }, props.children));
}
exports.TokenContextProvider = TokenContextProvider;
function useTokenContext() {
    var ctx = react_1.useContext(_TokenContext);
    if (ctx === null) {
        throw new Error("Context not available");
    }
    return ctx;
}
// Null => none exists.
// Undefined => loading.
function useOwnedTokenAccount(mint) {
    var provider = useTokenContext().provider;
    var _a = react_1.useState(0), setRefresh = _a[1];
    var tokenAccounts = _OWNED_TOKEN_ACCOUNTS_CACHE.filter(function (account) { return mint && account.account.mint.equals(mint); });
    // Take the account with the most tokens in it.
    tokenAccounts.sort(function (a, b) {
        return a.account.amount > b.account.amount
            ? -1
            : a.account.amount < b.account.amount
                ? 1
                : 0;
    });
    var tokenAccount = tokenAccounts[0];
    var isSol = mint === null || mint === void 0 ? void 0 : mint.equals(pubkeys_1.SOL_MINT);
    // Stream updates when the balance changes.
    react_1.useEffect(function () {
        var listener;
        // SOL is special cased since it's not an SPL token.
        if (tokenAccount && isSol) {
            listener = provider.connection.onAccountChange(provider.wallet.publicKey, function (info) {
                var token = {
                    amount: new anchor_1.BN(info.lamports),
                    mint: pubkeys_1.SOL_MINT,
                };
                if (token.amount !== tokenAccount.account.amount) {
                    var index = _OWNED_TOKEN_ACCOUNTS_CACHE.indexOf(tokenAccount);
                    assert.ok(index >= 0);
                    _OWNED_TOKEN_ACCOUNTS_CACHE[index].account = token;
                    setRefresh(function (r) { return r + 1; });
                }
            });
        }
        // SPL tokens.
        else if (tokenAccount) {
            listener = provider.connection.onAccountChange(tokenAccount.publicKey, function (info) {
                if (info.data.length !== 0) {
                    try {
                        var token = tokens_1.parseTokenAccountData(info.data);
                        if (token.amount !== tokenAccount.account.amount) {
                            var index = _OWNED_TOKEN_ACCOUNTS_CACHE.indexOf(tokenAccount);
                            assert.ok(index >= 0);
                            _OWNED_TOKEN_ACCOUNTS_CACHE[index].account = token;
                            setRefresh(function (r) { return r + 1; });
                        }
                    }
                    catch (error) {
                        console.log("Failed to decode token AccountInfo");
                    }
                }
            });
        }
        return function () {
            if (listener) {
                provider.connection.removeAccountChangeListener(listener);
            }
        };
    }, [provider.connection, tokenAccount]);
    if (mint === undefined) {
        return undefined;
    }
    if (!isSol && tokenAccounts.length === 0) {
        return null;
    }
    return tokenAccount;
}
exports.useOwnedTokenAccount = useOwnedTokenAccount;
function useMint(mint) {
    var _this = this;
    var provider = useTokenContext().provider;
    // Lazy load the mint account if needeed.
    var asyncMintInfo = react_async_hook_1.useAsync(function () { return __awaiter(_this, void 0, void 0, function () {
        var mintClient, mintInfo;
        return __generator(this, function (_a) {
            if (!mint) {
                return [2 /*return*/, undefined];
            }
            if (_MINT_CACHE.get(mint.toString())) {
                return [2 /*return*/, _MINT_CACHE.get(mint.toString())];
            }
            mintClient = new spl_token_1.Token(provider.connection, mint, spl_token_1.TOKEN_PROGRAM_ID, new web3_js_1.Account());
            mintInfo = mintClient.getMintInfo();
            _MINT_CACHE.set(mint.toString(), mintInfo);
            return [2 /*return*/, mintInfo];
        });
    }); }, [provider.connection, mint]);
    if (asyncMintInfo.result) {
        return asyncMintInfo.result;
    }
    return undefined;
}
exports.useMint = useMint;
function setMintCache(pk, account) {
    _MINT_CACHE.set(pk.toString(), new Promise(function (resolve) { return resolve(account); }));
}
exports.setMintCache = setMintCache;
// Cache storing all token accounts for the connected wallet provider.
var _OWNED_TOKEN_ACCOUNTS_CACHE = [];
// Cache storing all previously fetched mint infos.
// @ts-ignore
var _MINT_CACHE = new Map([
    [pubkeys_1.SOL_MINT.toString(), { decimals: 9 }],
]);
