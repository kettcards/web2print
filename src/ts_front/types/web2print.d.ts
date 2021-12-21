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
  ref_data : {
    attributes : {};
    referUrl   : string;
  };
};

declare const web2print : Web2print;
