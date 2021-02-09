interface Web2print {
  links: {
        basePath : string;

    thumbnailUrl : string;
     materialUrl : string;
       motiveUrl : string;
         fontUrl : string;
          apiUrl : string;
  };
}

declare var web2print: Web2print;
declare module "web2print" {
  export = web2print;
}
