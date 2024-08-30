

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
    this.name = "Incorrect Password"
  }
}

export class DBErrUserSignedUpWithGoogle extends Error {
  constructor() {
    super();
    this.name = "You signed up using Google. Please use 'Sign In with Google' to log in"
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
    this.name = "Task cannot be created or updated for a past time"
  }
}

export class DBErrTaskNotFound extends Error{
  constructor(){
    super();
    this.name = "Task Not Found"
  }
}

export class DBErrOTPUserSignedUpByGoogle extends Error{
  constructor(){
    super();
    this.name = "user signed up by google"
  }
}

export class DBErrInternal extends Error {
  constructor(message: string) {
    super(message);
    this.name = message
  }
}