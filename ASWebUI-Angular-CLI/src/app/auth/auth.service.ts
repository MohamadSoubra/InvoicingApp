import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import {
  Observable,
  of,
  throwError,
  BehaviorSubject,
  observable,
  Subscription,
} from "rxjs";
import { authUser } from "src/app/models/authUser.model";
import { Token } from "../models/token.model";
import { User } from "../models/User.model";
import { mapTo, tap, catchError, count } from "rxjs/operators";
import { Router } from "@angular/router";
import { AuthResponse } from "./auth-response.model";
import { accessToken } from "./accessToken.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  rootUrl: string = "https://localhost/AccountingSoftwareApi";
  user = new BehaviorSubject<User>(null);
  tokenExpirationTimer: any;
  offset = new Date().getTimezoneOffset();
  today = new Date().getUTCDate();
  TodayUTC = new Date(this.today.toString());
  accessToken: accessToken = null;
  // stringtoken: string;
  redirectURL: string;
  refreshTokenString: string;

  constructor(private http: HttpClient, private router: Router) {}

  loginUser(email: string, password: string) {
    let options = {
      headers: new HttpHeaders().set(
        "Content-Type",
        "application/x-www-form-urlencoded"
      ),
      withCredentials: true,
    };
    let params = new HttpParams({});
    params = params.append("email", email);
    params = params.append("password", password);

    return this.http
      .post<AuthResponse>(this.rootUrl + "/token", params, options)
      .pipe(
        tap((tokens) => {
          //console.log(tokens);

          //this.accessToken = JSON.parse(atob(tokens.token.split(".")[1]));
          const decodedToken = this.decodeToken(tokens.token);

          this.refreshTokenString = tokens.refreshToken;

          const user = new User(decodedToken.email, tokens.token);

          this.user.next(user);

          //this.storeToken(tokens.token);
          this.tokenExpirationTimer = this.getTokenDuration(+decodedToken.exp);
          //console.log(`Token duration timer is ${this.tokenExpirationTimer}`);

          //this.autoRefreshToken(this.tokenExpirationTimer, tokens.token);

          this.autoRefreshToken(
            this.getTokenDuration(+decodedToken.exp),
            tokens.token // + 7200000
          );
          localStorage.setItem("token", tokens.token);
          //localStorage.setItem("userData", JSON.stringify(user));
        }),
        catchError((errorRes) => {
          console.log(errorRes);
          let errorMessage = "An Error Occured";
          if (errorRes.status == 0) {
            errorMessage = "Could not connect to the server";
            return throwError(errorMessage);
          } else if (
            errorRes.status == 401 ||
            errorRes.status == 404 ||
            errorRes.status == 400
          ) {
            errorMessage = errorRes.error;
          }
          //errorMessage = errorRes.error;
          //console.log(errorMessage + " errorMessage from auth service");
          //console.log(errorRes.error + " errorRes from auth service");
          return throwError(errorMessage);
        })
      );
  }

  getTokenDuration(date: number) {
    //console.log(`date is ${date}`);

    const tokenExpiryDate = new Date(date * 1000).getTime();
    const now = new Date().getTime();
    // const expiry = new Date(
    //   tokenExpiryDate.setMinutes(tokenExpiryDate.getMinutes() - this.offset)
    // ).getTime();
    let result = tokenExpiryDate - now;
    //console.log(`getTimeDuration result ${result}`);
    return result;
  }

  autologin() {
    const storedToken = localStorage.getItem("token");
    if (this.isTokenValid(storedToken)) {
      const token = this.decodeToken(storedToken);
      const user = new User(token.email, storedToken);
      this.user.next(user);
    } else {
      this.user.next(null);
    }
    //const storedtoken = localStorage.getItem("token");
    //const token = JSON.parse(atob(storedtoken.split(".")[1]));
    //const loadedUser = new User(userData.email, token);
    //this.user.next(loadedUser);
    //localStorage.setItem("userData", JSON.stringify(loadedUser));
    //utcDate = new Date().
    // const expirationDration = this.getTokenDuration(
    //   userData._tokenExpirationDate
    // );
    //localStorage.setItem("token", token);
  }

  autoRefreshToken(expirationDration: number, accessToken: string) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.refreshToken({ token: accessToken }).subscribe(
        (tokens) => {
          //this.storeToken(tokens.token);

          // this.stringtoken = tokens.token;
          // const decodedtoken = this.decodeToken(tokens.token);
          // const user = new User(decodedtoken.email, tokens.token);
          // this.user.next(user);
          // //this.autoRefreshToken(tokens.token);
          // localStorage.setItem("token", tokens.token);
          // //this.autoRefreshToken(+decodedtoken.exp, tokens.token);

          console.log("Token refreshed");
        },
        (error) => {
          console.log(error);
          console.log("cant refresh token");
        }
      );
    }, expirationDration);
  }

  logout() {
    this.user.next(null);

    this.router.navigate(["/login"]);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;

    // this.revokeToken().subscribe(() => {

    //   console.log("Logged Out");
    // });

    localStorage.removeItem("token");
    console.log("Logged Out");
  }

  refreshToken(token: any) {
    return this.http
      .post<any>(this.rootUrl + "/refresh-token", token, {
        withCredentials: true,
      })
      .pipe(
        tap((tokens) => {
          // this.stringtoken = tokens.token;
          //console.log(tokens);
          const decodedtoken = this.decodeToken(tokens.token);
          const user = new User(decodedtoken.email, tokens.token);
          this.user.next(user);

          // this.autoRefreshToken(
          //   this.getTokenDuration(+decodedtoken.exp),
          //   tokens.token
          // );
          localStorage.setItem("token", tokens.token);
        }),
        catchError((error) => {
          this.logout();
          console.log("refresh token error");

          console.log(error);

          return throwError(error);
        })
      );
  }

  testRefreshTokenforProducts() {
    this.refreshToken(this.accessToken).subscribe();
  }

  revokeToken() {
    return this.http
      .post(
        this.rootUrl + "/revoke-token",
        {
          Token: localStorage.getItem("token"),
          RefreshToken: this.refreshTokenString,
        },
        {
          responseType: "text",
          withCredentials: true,
        }
      )
      .pipe(
        catchError((e) => {
          console.log(e);
          return throwError(e);
        })
      );
  }

  isTokenValid(token: string): boolean {
    //console.log(storedtoken);

    if (token != null || token != undefined) {
      const decodedToken = this.decodeToken(token);
      //console.log(token);

      if (+decodedToken.exp * 1000 > new Date().getTime()) {
        return true;
      }
    }
    return false;
  }

  decodeToken(token: string): accessToken {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    return decodedToken;
  }

  redirecttoLogin() {
    this.router.navigate["/login"];
  }
  // storeToken(token: Token) {
  //   return localStorage.setItem("JWT", token.access_token);
  // }

  // doLoginUser(email: string, token: Token) {
  //   this.storeToken(token);
  // }

  // getJwtToken() {
  //   return localStorage.getItem("JWT");
  // }

  // isLoggedin() {
  //   return !!this.getJwtToken();
  // }
}
