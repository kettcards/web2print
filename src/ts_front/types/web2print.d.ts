type Web2print = {
  links: {
        basePath : string;

    thumbnailUrl : string;
      textureUrl : string;
       motiveUrl : string;
         fontUrl : string;
          apiUrl : string;
     redirectUrl : string;
  };
  editorConfiguration: {
    maxFileSize : number;
    maxRequestSize : number;
  };
};

declare const web2print : Web2print;
