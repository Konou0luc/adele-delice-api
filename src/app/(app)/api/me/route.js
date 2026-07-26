"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
exports.GET = GET;
exports.PATCH = PATCH;
var server_1 = require("next/server");
var prisma_1 = require("@/lib/prisma");
var auth_helpers_1 = require("@/lib/auth-helpers");
function buildName(firstName, lastName) {
    return "".concat(firstName !== null && firstName !== void 0 ? firstName : '', " ").concat(lastName !== null && lastName !== void 0 ? lastName : '').trim() || null;
}
function normalizePhone(phone) {
    return (phone === null || phone === void 0 ? void 0 : phone.replace(/\s+/g, '').trim()) || null;
}
function isValidTogolesePhone(phone) {
    if (!phone) {
        return false;
    }
    var normalized = normalizePhone(phone);
    return typeof normalized === 'string' && /^\+228\d{8}$/.test(normalized);
}
function findCurrentUser(user) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, prisma_1.default.user.findFirst({
                    where: {
                        OR: [{ id: user.id }, { email: user.email }],
                    },
                })];
        });
    });
}
function buildFallbackUser(session) {
    var _a, _b;
    return {
        id: session.user.id,
        email: session.user.email,
        name: buildName(session.user.firstName, session.user.lastName),
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        phone: null,
        image: (_a = session.user.image) !== null && _a !== void 0 ? _a : null,
        role: (_b = session.user.role) !== null && _b !== void 0 ? _b : 'EMPLOYEE',
        isActive: true,
        createdAt: session.expires,
        updatedAt: session.expires,
    };
}
function GET() {
    return __awaiter(this, void 0, void 0, function () {
        var authResult, session, user, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, auth_helpers_1.requireAuth)()];
                case 1:
                    authResult = _b.sent();
                    if (authResult.response) {
                        return [2 /*return*/, authResult.response];
                    }
                    session = authResult.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ erreur: 'Authentification requise' }, { status: 401 })];
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, findCurrentUser(session.user)];
                case 3:
                    user = _b.sent();
                    if (!user) {
                        return [2 /*return*/, server_1.NextResponse.json(buildFallbackUser(session))];
                    }
                    return [2 /*return*/, server_1.NextResponse.json(user)];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ erreur: 'Impossible de récupérer le profil' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function PATCH(request) {
    return __awaiter(this, void 0, void 0, function () {
        var authResult, session, currentUser, body, firstName, lastName, rawPhone, phone, user, _a;
        var _b, _c, _d, _e, _f, _g, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0: return [4 /*yield*/, (0, auth_helpers_1.requireAuth)()];
                case 1:
                    authResult = _k.sent();
                    if (authResult.response) {
                        return [2 /*return*/, authResult.response];
                    }
                    session = authResult.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ erreur: 'Authentification requise' }, { status: 401 })];
                    }
                    _k.label = 2;
                case 2:
                    _k.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, findCurrentUser(session.user)];
                case 3:
                    currentUser = _k.sent();
                    return [4 /*yield*/, request.json()];
                case 4:
                    body = _k.sent();
                    firstName = typeof body.firstName === 'string' ? body.firstName.trim() : undefined;
                    lastName = typeof body.lastName === 'string' ? body.lastName.trim() : undefined;
                    rawPhone = typeof body.phone === 'string' ? body.phone.trim() : undefined;
                    phone = rawPhone ? normalizePhone(rawPhone) : undefined;
                    if (rawPhone && !isValidTogolesePhone(rawPhone)) {
                        return [2 /*return*/, server_1.NextResponse.json({ erreur: 'Le numéro de téléphone doit être togolais et respecter le format +228XXXXXXXX.' }, { status: 400 })];
                    }
                    return [4 /*yield*/, prisma_1.default.user.upsert({
                            where: { email: session.user.email },
                            create: {
                                id: (_b = currentUser === null || currentUser === void 0 ? void 0 : currentUser.id) !== null && _b !== void 0 ? _b : session.user.id,
                                email: session.user.email,
                                firstName: (_c = firstName !== null && firstName !== void 0 ? firstName : currentUser === null || currentUser === void 0 ? void 0 : currentUser.firstName) !== null && _c !== void 0 ? _c : session.user.firstName,
                                lastName: (_d = lastName !== null && lastName !== void 0 ? lastName : currentUser === null || currentUser === void 0 ? void 0 : currentUser.lastName) !== null && _d !== void 0 ? _d : session.user.lastName,
                                phone: (_e = phone !== null && phone !== void 0 ? phone : currentUser === null || currentUser === void 0 ? void 0 : currentUser.phone) !== null && _e !== void 0 ? _e : undefined,
                                name: buildName((_f = firstName !== null && firstName !== void 0 ? firstName : currentUser === null || currentUser === void 0 ? void 0 : currentUser.firstName) !== null && _f !== void 0 ? _f : session.user.firstName, (_g = lastName !== null && lastName !== void 0 ? lastName : currentUser === null || currentUser === void 0 ? void 0 : currentUser.lastName) !== null && _g !== void 0 ? _g : session.user.lastName),
                                role: ((_h = session.user.role) !== null && _h !== void 0 ? _h : 'EMPLOYEE'),
                                isActive: true,
                                image: (_j = currentUser === null || currentUser === void 0 ? void 0 : currentUser.image) !== null && _j !== void 0 ? _j : undefined,
                            },
                            update: __assign(__assign(__assign(__assign({}, (firstName !== undefined ? { firstName: firstName } : {})), (lastName !== undefined ? { lastName: lastName } : {})), (phone !== undefined ? { phone: phone } : {})), (firstName !== undefined || lastName !== undefined
                                ? { name: buildName(firstName !== null && firstName !== void 0 ? firstName : currentUser === null || currentUser === void 0 ? void 0 : currentUser.firstName, lastName !== null && lastName !== void 0 ? lastName : currentUser === null || currentUser === void 0 ? void 0 : currentUser.lastName) }
                                : {})),
                        })];
                case 5:
                    user = _k.sent();
                    return [2 /*return*/, server_1.NextResponse.json(user)];
                case 6:
                    _a = _k.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ erreur: 'Impossible de mettre à jour le profil' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
