import {
  SignInCognitoProps,
  ResendConfirmationCodeProps,
  RegisterAuthProps,
  ForgotPasswordProps,
  ConfirmSignUpProps,
  ConfirmForgotPasswordProps,
} from "../types/Request/Auth";

import { createItem } from "./base";

import { AUTH_ENDPOINTS } from "../types/Endpoint/auth";

import { SignInResponse } from "@/types/Response/Auth";

const AUTH_BASE_URL =
  "https://hatq2x0ujg.execute-api.us-east-1.amazonaws.com/auth";
console.log(AUTH_BASE_URL);
export class AuthService {
  private baseUrl: string;
  private accessToken: string;

  constructor() {
    (this.baseUrl = AUTH_BASE_URL),
      (this.accessToken = localStorage.getItem("accessToken"));
  }

  registerAccount = async (data: RegisterAuthProps) => {
    return createItem<RegisterAuthProps, any>(
      this.baseUrl,
      AUTH_ENDPOINTS.REGISTER,
      data
    );
  };

  signIn = async (data: SignInCognitoProps) => {
    return createItem<SignInCognitoProps, SignInResponse>(
      this.baseUrl,
      AUTH_ENDPOINTS.SIGN_IN,
      data
    );
  };

  confirmCode = async (data: ConfirmSignUpProps) => {
    return createItem<ConfirmSignUpProps, any>(
      this.baseUrl,
      AUTH_ENDPOINTS.CONFIRM_SIGN_UP,
      data
    );
  };

  forgotPassword = async (data: ForgotPasswordProps) => {
    return createItem<ForgotPasswordProps, any>(
      this.baseUrl,
      AUTH_ENDPOINTS.FORGOT_PASSWORD,
      data
    );
  };

  confirmForgotPassword = async (data: ConfirmForgotPasswordProps) => {
    return createItem<ConfirmForgotPasswordProps, any>(
      this.baseUrl,
      AUTH_ENDPOINTS.CONFIRM_FORGOT_PASSWORD,
      data
    );
  };

  refreshToken = async () => {
    return createItem(this.baseUrl, AUTH_ENDPOINTS.REFRESH_TOKEN, {});
  };
}
