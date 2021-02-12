declare interface Cookie {
  getValue(name : string) : string;
  set(name : string, value : string) : void;
}

declare const Cookie : Cookie;