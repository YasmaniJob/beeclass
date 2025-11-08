// src/domain/shared/types.ts
export type Result<T, E> = Success<T> | Failure<E>;

export class Success<T> {
  readonly isSuccess: true = true;
  readonly isFailure: false = false;

  constructor(public readonly value: T) {}

  map<U>(fn: (value: T) => U): Result<U, never> {
    return new Success(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Result<U, any>): Result<U, any> {
    return fn(this.value);
  }

  fold<U>(onSuccess: (value: T) => U, onFailure: (error: any) => U): U {
    return onSuccess(this.value);
  }
}

export class Failure<E> {
  readonly isSuccess: false = false;
  readonly isFailure: true = true;

  constructor(public readonly error: E) {}

  map<U>(fn: (value: any) => U): Result<never, E> {
    return this;
  }

  flatMap<U>(fn: (value: any) => Result<U, any>): Result<never, E> {
    return this;
  }

  fold<U>(onSuccess: (value: any) => U, onFailure: (error: E) => U): U {
    return onFailure(this.error);
  }
}

export function success<T>(value: T): Result<T, never> {
  return new Success(value);
}

export function failure<E>(error: E): Result<never, E> {
  return new Failure(error);
}

// Domain Error class
export class DomainError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'DomainError';
  }
}
