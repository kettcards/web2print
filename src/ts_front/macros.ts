function make(spec : string, child ?: Node) : HTMLElement {
  const s = spec.split('.');
  const e = document.createElement(s[0]);
  if(s.length > 1){
    s.shift();
    e.classList.add(...s);
  }
  if(child)
    e.appendChild(child);
  return e;
}
const makeT  = document.createTextNode.bind(document);
const makeR  = document.createRange.bind(document);
const get    = document.getElementById.bind(document);
const getSel = document.getSelection.bind(document);
function stopPropagation(e : JQuery.Event) : void {e.stopPropagation();};
function falsify() : boolean {return false;};
// (lucas) the remainder function in js does not work like the mathematical modulo,
//         this function does.
function mod(a : number, n : number) : number {return ((a % n) + n) % n;};

declare interface Node {
  isA(n: string) : boolean;
}
Node.prototype.isA = function(n : string) : boolean {return this.nodeName === n;};

function pxToNum(pxs) { return +pxs.slice(0, -2); }