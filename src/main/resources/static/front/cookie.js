'use strict';

class Cookie {
  static getValue(name) {
    const search = name+'=';
    for(const s of document.cookie.split(';')) {
      if(s.trim().startsWith(search))
        return s.substr(search.length);
    }
  }
  static set(name, value) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    document.cookie = name+'='+value+';expires='+date.toUTCString();
  }
}