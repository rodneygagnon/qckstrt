"use strict";
/**
 * Relational Database Provider Package
 *
 * Strategy Pattern + Dependency Injection for relational database connections.
 * Supports PostgreSQL (via Supabase).
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationalDBError = exports.RelationalDBType = void 0;
// Re-export types from common
var common_1 = require("@qckstrt/common");
Object.defineProperty(exports, "RelationalDBType", {
  enumerable: true,
  get: function () {
    return common_1.RelationalDBType;
  },
});
Object.defineProperty(exports, "RelationalDBError", {
  enumerable: true,
  get: function () {
    return common_1.RelationalDBError;
  },
});
// Provider implementations
__exportStar(require("./providers/postgres.provider.js"), exports);
// NestJS Module
__exportStar(require("./relationaldb.module.js"), exports);
//# sourceMappingURL=index.js.map
