export interface SignInCognitoProps {
  userName: string;
  password: string;
}




export interface ResendConfirmationCodeProps {
  userName: string;
}


export interface RegisterAuthProps {
  userName: string;
  email: string;
  password: string;
  role: 'USER' | 'EXPERT' | 'ADMIN';
  firstName?: string; // Nullable field
  lastName?: string; // Nullable field
  phone?: string; // Nullable field
}

export interface ForgotPasswordProps {
  userName: string;
}


export interface ConfirmSignUpProps {
  userName: string;
  code: string;
}

export interface ConfirmForgotPasswordProps {
  userName: string;
  confirmationCode: string;
  newPassword: string;
}

