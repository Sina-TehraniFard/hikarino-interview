// types/express/index.d.ts
import { Buffer } from "buffer";

declare global {
    namespace Express {
        interface Request {
            rawBody: Buffer;
        }
    }
}