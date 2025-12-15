import { QueryFailedError, TypeORMError } from 'typeorm';

export enum PostgresErrorCodes {
  UniqueViolation = '23505',
  CheckViolation = '23514',
  NotNullViolation = '23502',
  ForeignKeyViolation = '23503',
}

export class DbError extends Error {
  public constructor(message = 'Unknown database error') {
    super(message);
  }
}

export class DbConfigError extends DbError {
  public constructor(message = 'Database configuration error') {
    super(message);
  }
}

interface PostgresDriverError {
  code: string;
  detail?: string;
}

const handleQueryFailedError = (error: QueryFailedError): DbError => {
  const postgresDriverError =
    error.driverError as unknown as PostgresDriverError;

  switch (postgresDriverError.code) {
    case PostgresErrorCodes.UniqueViolation:
      return new DbError(postgresDriverError.detail);
    // case PostgresErrorCodes.CheckViolation:
    //   return handleCheckViolation(error);
    // case PostgresErrorCodes.NotNullViolation:
    //   return handleNotNullViolation(error);
    // case PostgresErrorCodes.ForeignKeyViolation:
    //   return handleForeignKeyViolation(error);
    default:
      return error as DbError;
  }
};

export default (error: TypeORMError): DbError => {
  switch (error.name) {
    case 'QueryFailedError':
      return handleQueryFailedError(error as QueryFailedError);
    default:
      return error;
  }
};
