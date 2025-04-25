"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//// @ts-ignore // this ignores the error the below line is showing, but it is a bad way to solve the problem
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = __importDefault(require("zod"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./db");
const JWT_SECRET = "secret";
const app = (0, express_1.default)();
app.use(express_1.default.json());
mongoose_1.default.connect('mongodb+srv://andyDev:Nikansh%402023@andydev.vkssu.mongodb.net/BrainlyBackend');
app.post('/api/v1/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredBody = zod_1.default.object({
        username: zod_1.default.string(),
        password: zod_1.default.string(),
    });
    const parsedDataWithSuccess = requiredBody.safeParse(req.body);
    if (!parsedDataWithSuccess.success) {
        res.status(400).send(parsedDataWithSuccess.error);
        return;
    }
    const username = req.body.username;
    const password = req.body.password;
    const user = yield db_1.UserModel.findOne({
        username: username
    });
    if (user) {
        res.status(400).json({
            message: "User Already Exists"
        });
        return;
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 5);
    yield db_1.UserModel.create({
        username,
        password: hashedPassword,
    });
    res.json({
        message: "User Created Successfully",
    });
}));
app.post('/api/v1/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    const response = yield db_1.UserModel.findOne({
        username: username
    });
    if (!response) {
        res.status(400).json({
            message: "User not found"
        });
    }
    const isPasswordValid = response && (yield bcrypt_1.default.compare(password, response.password));
    if (!isPasswordValid) {
        res.status(400).json({
            message: "Invalid Password"
        });
    }
    const token = jsonwebtoken_1.default.sign({
        username: username
    }, JWT_SECRET);
    res.json({
        token: token
    });
}));
app.post('/api/v1/content', (req, res) => {
});
app.get('/api/v1/content', (req, res) => {
});
app.delete('/api/v1/content', (req, res) => {
});
app.post("/api/v1/brain/share", (req, res) => {
});
app.get("/api/v1/brain/:shareLink", (req, res) => {
});
app.listen(3000);
