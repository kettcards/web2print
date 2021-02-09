const make = function(spec : string, child ?: Node) : Element {
  const s = spec.split('.');
  const e = document.createElement(s[0]);
  if(s.length > 1){
    s.shift();
    e.classList.add(s);
  }
  if(child)
    e.appendChild(child);
  return e;
}
const makeT = document.createTextNode.bind(document);
const makeR = document.createRange.bind(document);
const get = document.getElementById.bind(document);
const getSel = document.getSelection.bind(document);
const stopPropagation = function(e : Event) : void {e.stopPropagation();};
const falsify = function() : boolean {return false;};
// (lucas) the remainder function in js does not work like the mathematical modulo,
//         this function does.
const mod = function(a : number, n : number) : number {return ((a % n) + n) % n;};

declare interface Node {
  isA(n: string) : boolean;
}
Node.prototype.isA = function(n : string) : boolean {return this.nodeName === n;};