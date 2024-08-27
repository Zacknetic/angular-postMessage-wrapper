export class PostMessageError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'PostMessageError';
    }
  
    toJSON() {
      return {
        name: this.name,
        message: this.message,
      };
    }
  }
  
  export class InvalidRequestError extends PostMessageError {
    constructor(message: string, public invalidFields: string[], public missingFields: string[]) {
      super(message);
      this.name = 'InvalidRequestError';
    }
  
    override toJSON() {
      return {
        ...super.toJSON(),
        invalidFields: this.invalidFields,
        missingFields: this.missingFields,
      };
    }
  }
  
  export class InternalError extends PostMessageError {
    constructor(message: string, public context: Record<string, any>) {
      super(message);
      this.name = 'InternalError';
    }
  
    override toJSON() {
      return {
        ...super.toJSON(),
        context: this.context,
      };
    }
  }
  
  export function isPostMessageError(error: any): error is PostMessageError {
    return error && typeof error === 'object' && 'name' in error && 'message' in error;
  }
  
  export function reconstructError(errorData: any): PostMessageError {
    if (errorData.name === 'InvalidRequestError') {
      return new InvalidRequestError(errorData.message, errorData.invalidFields, errorData.missingFields);
    } else if (errorData.name === 'InternalError') {
      return new InternalError(errorData.message, errorData.context);
    } else {
      return new PostMessageError(errorData.message);
    }
  }