

export class DBErrUserAlreadyExist extends Error {
  constructor() {
    super();
    this.name = "User Already Exist"
  }
}

export class DBErrTaskAlreadyExist extends Error {
  constructor() {
    super();
    this.name = "Task Already Exist"
  }
}

export class DBErrUserNotFound extends Error {
  constructor() {
    super();
    this.name = "User Not Found"
  }
}

export class DBErrCredentialsMismatch extends Error {
  constructor() {
    super();
    this.name = "Password is not correct"
  }
}

export class DBErrTokenExpired extends Error {
  constructor() {
    super();
    this.name = "Token has expired"
  }
}

export class DBErrTaskTimeElapsed extends Error{
  constructor(){
    super();
    this.name = "Task cannot be created for a past time"
  }
}

export class DBErrTaskNotFound extends Error{
  constructor(){
    super();
    this.name = "Task Not Found"
  }
}

export class DBErrOTPUserSignedUpByEmail extends Error{
  constructor(){
    super();
    this.name = "user signed up by email"
  }
}

export class DBErrInternal extends Error {
  constructor(message: string) {
    super(message);
    this.name = message
  }
}