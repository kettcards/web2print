type ParametersObj = { [p: string]: string | 'no_value'; }

function stringifyParameters() : string {
  let s = '?';
  for(const [k, v] of Object.entries(Parameters)) {
    if(s.length > 2)
      s += '&';
    s += k + '=' + v;
  }
  return s;
}

const Parameters : ParametersObj = (function() : any {
  const url = window.location.search;
  const ret : ParametersObj = {};
  if(url){
    let split = url.substr(1).split('&'), subSplit;
    for(let s of split){
      subSplit = s.split('=');
      ret[subSplit[0]] = subSplit[1] || 'no_value';
    }
  }
  return ret;
})();