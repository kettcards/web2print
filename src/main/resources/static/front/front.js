'use strict';
const make = function (spec, child) {
    const s = spec.split('.');
    const e = document.createElement(s[0]);
    if (s.length > 1) {
        s.shift();
        e.classList.add(s);
    }
    if (child)
        e.appendChild(child);
    return e;
};
const makeT = document.createTextNode.bind(document);
const makeR = document.createRange.bind(document);
const get = document.getElementById.bind(document);
const getSel = document.getSelection.bind(document);
const stopPropagation = function (e) { e.stopPropagation(); };
const falsify = function () { return false; };
// (lucas) the remainder function in js does not work like the mathematical modulo,
//         this function does.
const mod = function (a, n) { return ((a % n) + n) % n; };
Node.prototype.isA = function (n) { return this.nodeName === n; };
const Parameters = (function () {
    const ret = {}, url = window.location.search;
    if (url) {
        let split = url.substr(1).split('&'), subSplit;
        for (let s of split) {
            subSplit = s.split('=');
            ret[subSplit[0]] = subSplit[1] || 'no_value';
        }
    }
    return ret;
})();
class Cookie {
    static getValue(name) {
        const search = name + '=';
        for (const s of document.cookie.split(';')) {
            if (s.trim().startsWith(search))
                return s.substr(search.length);
        }
    }
    static set(name, value) {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        document.cookie = name + '=' + value + ';expires=' + date.toUTCString();
    }
}
const getSelectedNodes = function (range) {
    console.log('get', range);
    let startEl, endEl;
    let startOffs, endOffs;
    if (range.commonAncestorContainer.isA('#text')) {
        startEl = endEl = range.startContainer.parentNode;
        startOffs = range.startOffset;
        endOffs = range.endOffset;
    }
    else if (range.commonAncestorContainer.isA('P') || range.commonAncestorContainer.className === 'text') {
        if (range.startContainer.isA('#text')) {
            startEl = range.startContainer.parentNode;
            startOffs = range.startOffset;
        }
        else if (range.startContainer.isA('P')) {
            startEl = range.startContainer.childNodes[range.startOffset];
            startOffs = 0;
        }
        else if (range.startContainer.isA('SPAN')) {
            console.assert(range.startOffset === 0, "start offset should be 0 but is ", range.startOffset);
            startEl = range.startContainer;
            startOffs = 0;
        }
        else if (range.startContainer.isA('DIV')) {
            startEl = range.startContainer.childNodes[range.startOffset].childNodes[0];
            startOffs = 0;
        }
        else
            console.warn('cant handle start', range);
        if (range.endContainer.isA('#text')) {
            endEl = range.endContainer.parentNode;
            endOffs = range.endOffset;
        }
        else if (range.endContainer.isA('P')) {
            console.assert(range.endContainer.childNodes.length > 0, 'there must be at least one child', range);
            endEl = range.endContainer.childNodes[range.endOffset]
                || range.endContainer.childNodes[range.endContainer.childNodes.length - 1];
            endOffs = endEl.textContent.length;
        }
        else if (range.endContainer.isA('SPAN')) {
            console.error('how did we get here', range);
        }
        else if (range.endContainer.isA('DIV')) {
            const pars = range.endContainer.childNodes;
            endEl = (pars[range.endOffset] || pars[pars.length - 1]).childNodes[0];
            endOffs = endEl.textContent.length;
        }
        else
            console.warn('cant handle end', range);
    }
    else
        console.warn('cant handle', range);
    return [startEl, startOffs, endEl, endOffs];
};
const makeNodesFromSelection = function (range, foreachAction) {
    let [startEl, startOffs, endEl, endOffs] = getSelectedNodes(range);
    let par = startEl.parentNode;
    if (startEl === endEl && startOffs === endOffs) {
        startEl = par.firstChild;
        startOffs = 0;
        endEl = par.childNodes[par.childNodes.length - 1];
        endOffs = endEl.textContent.length;
    }
    if (startEl === endEl) {
        const text = startEl.textContent;
        let sliced = false;
        if (startOffs > 0) {
            const before = startEl.cloneNode();
            before.appendChild(makeT(text.substr(0, startOffs)));
            par.insertBefore(before, startEl);
            sliced = true;
        }
        if (endOffs < text.length) {
            const after = startEl.cloneNode();
            after.appendChild(makeT(text.substr(endOffs)));
            par.insertBefore(after, startEl.nextSibling);
            sliced = true;
        }
        if (sliced) {
            const txt = makeT(text.substr(startOffs, endOffs - startOffs));
            startEl.firstChild.replaceWith(txt);
            range.setStart(txt, 0);
            range.setEnd(txt, endOffs - startOffs);
        }
        else {
            range.setStart(startEl.firstChild, 0);
            range.setEnd(startEl.firstChild, text.length);
        }
        if (foreachAction)
            foreachAction(startEl);
    }
    else {
        if (startOffs > 0) {
            const firstText = startEl.textContent;
            const before = startEl.cloneNode();
            before.appendChild(makeT(firstText.substr(0, startOffs)));
            par.insertBefore(before, startEl);
            const firstTxt = makeT(firstText.substr(startOffs));
            startEl.firstChild.replaceWith(firstTxt);
        }
        range.setStart(startEl.firstChild, 0);
        if (foreachAction)
            foreachAction(startEl);
        let curr = startEl;
        do {
            if (curr.nextSibling === null) {
                curr = curr.parentNode.nextSibling.firstChild;
                par = curr.parentNode;
            }
            else {
                curr = curr.nextSibling;
            }
            if (curr === endEl)
                break;
            console.assert(curr.isA('SPAN') && curr.childNodes.length === 1 && curr.firstChild.isA('#text'), 'illegal p child ', curr, range);
            if (foreachAction)
                foreachAction(curr);
        } while (true);
        if (endOffs < endEl.textContent.length) {
            const lastText = endEl.textContent;
            const after = endEl.cloneNode();
            after.appendChild(makeT(lastText.substr(endOffs)));
            par.insertBefore(after, endEl.nextSibling);
            const lastTxt = makeT(lastText.substr(0, endOffs));
            endEl.firstChild.replaceWith(lastTxt);
        }
        range.setEnd(endEl.firstChild, endEl.textContent.length);
        if (foreachAction)
            foreachAction(endEl);
    }
    return [startEl, endEl];
};
const createFold = function (fold) {
    if (fold.x1 === fold.x2) {
        //vFold
        let vFold = $('<div class="vFold"></div>');
        vFold.css('left', fold.x1 + 'mm');
        return vFold;
    }
    else if (fold.y1 === fold.y2) {
        //hFold
        let hFold = $('<div class="hFold"></div>');
        hFold.css('top', fold.y1 + 'mm');
        return hFold;
    }
    else {
        throw new Error("can't display diagonal folds for now");
    }
};
{
    Card;
}
from;
"../types/card";
const RenderStyles = [{
        name: 'Simple',
        condition: function (card) { return true; },
        BgStretchObjs: {
            stretch: {
                'background-size': 'cover',
                'background-repeat': 'no-repeat ',
                'background-position': 'center center',
            },
        },
        pageGen: function (card) {
            const width = card.cardFormat.width;
            const height = card.cardFormat.height;
            // 55 additional pixels for the rulers
            EditorTransform.scale = Math.min($editorArea.width() * MMPerPx.x / (width + 55), $editorArea.height() * MMPerPx.x / (height + 55)) * 0.9;
            EditorTransform.apply();
            const $bundle = $(get('page-template').content.firstElementChild.cloneNode(true));
            $bundle.css({
                width: width + 'mm',
                height: height + 'mm',
            });
            $bundle.children().css(Object.assign({
                'background-image': 'url("' + web2print.links.materialUrl + card.material.textureSlug + '")',
            }, this.BgStretchObjs[card.material.tiling]));
            for (let fold of card.cardFormat.folds) {
                $bundle.find('.folds-layer').append(createFold(fold));
            }
            let mFront, mBack;
            for (const motive of card.motive) {
                switch (motive.side) {
                    case 'FRONT':
                        mFront = motive.textureSlug;
                        break;
                    case 'BACK':
                        mBack = motive.textureSlug;
                        break;
                    default: throw new Error("unknown motive side '" + motive.side + "'");
                }
            }
            if (mBack)
                $bundle.find('.back>.motive-layer')[0].src = web2print.links.motiveUrl + mBack;
            if (mFront)
                $bundle.find('.front>.motive-layer')[0].src = web2print.links.motiveUrl + mFront;
            createRuler(width, height);
            this.data.rot = 0;
            this.data.$bundle = $bundle;
            return $bundle;
        },
        pageLabels: [
            'Inside',
            'Outside'
        ],
        initialDotIndex: 0,
        hPageChanged: function (direction) {
            this.data.rot += direction * 180;
            this.data.$bundle.css('transform', 'rotateY(' + this.data.rot + 'deg)');
        },
        data: {
            $bundle: undefined,
            rot: 0
        }
    }, {
        name: 'simple_foldable',
        condition: function (card) {
            const folds = card.cardFormat.folds;
            return folds.length === 1 && folds[0].x1 === folds[0].x2;
        },
        BgStretchObjs: {
            stretch: function (xOffset) {
                return {
                    'background-size': 'cover',
                    'background-repeat': 'no-repeat ',
                    'background-position': 'center center',
                };
            },
        },
        pageGen: function (card) {
            const cardWidth = card.cardFormat.width;
            const cardHeight = card.cardFormat.height;
            const w1 = card.cardFormat.folds[0].x1;
            const w2 = cardWidth - w1;
            const template = get('page-template').content.firstElementChild;
            const $page1 = this.data.$page1 = $(template.cloneNode(true)).css({
                width: w1 + 'mm',
                height: card.cardFormat.height + 'mm',
                'transform-origin': 'right center',
            });
            const $page2 = this.data.$page2 = $(template.cloneNode(true)).css({
                width: w2 + 'mm',
                height: card.cardFormat.height + 'mm',
                'transform-origin': 'left center',
            });
            $page2[0].dataset.xOffset = w1;
            $page1.add($page2).children().css(Object.assign({
                'background-image': 'url("' + web2print.links.materialUrl + card.material.textureSlug + '")'
            }, this.BgStretchObjs[card.material.tiling]));
            let mFront, mBack;
            for (const motive of card.motive) {
                switch (motive.side) {
                    case 'FRONT':
                        mFront = motive.textureSlug;
                        break;
                    case 'BACK':
                        mBack = motive.textureSlug;
                        break;
                    default: throw new Error("unknown motive side '" + motive.side + "'");
                }
            }
            if (mFront) {
                $page1.find('.front>.motive-layer').css({ left: 0, width: cardWidth + 'mm' })[0].src = web2print.links.motiveUrl + mFront;
                $page2.find('.front>.motive-layer').css({ left: '-' + w1 + 'mm', width: cardWidth + 'mm' })[0].src = web2print.links.motiveUrl + mFront;
            }
            if (mBack) {
                $page1.find('.back>.motive-layer').css({ left: 0, width: cardWidth + 'mm' })[0].src = web2print.links.motiveUrl + mBack;
                $page2.find('.back>.motive-layer').css({ left: '-' + w1 + 'mm', width: cardWidth + 'mm' })[0].src = web2print.links.motiveUrl + mBack;
            }
            this.data.p1r = 0;
            this.data.p2r = 0;
            this.data.state = 1;
            createRuler(cardWidth, cardHeight);
            return $(document.createDocumentFragment()).append($page1, $page2);
        },
        pageLabels: [
            'Back',
            'Inside',
            'Front'
        ],
        initialDotIndex: 1,
        hPageChanged: function (direction) {
            this.data.state = mod(this.data.state + direction, 3);
            let p1z = 0, p2z = 0;
            if (direction === 1) {
                switch (this.data.state) {
                    case 0:
                        this.data.p1r += 180;
                        this.data.p2r += 180;
                        p2z = 1;
                        break;
                    case 1:
                        this.data.p2r += 180;
                        break;
                    case 2:
                        this.data.p1r += 180;
                        p1z = 1;
                        break;
                }
            }
            else if (direction === -1) {
                switch (this.data.state) {
                    case 0:
                        this.data.p2r += -180;
                        p2z = 1;
                        break;
                    case 1:
                        this.data.p1r += -180;
                        break;
                    case 2:
                        this.data.p1r += -180;
                        this.data.p2r += -180;
                        p1z = 1;
                        break;
                }
            }
            this.data.$page1.css({
                transform: 'rotateY(' + this.data.p1r + 'deg)',
                'z-index': p1z
            });
            this.data.$page2.css({
                transform: 'rotateY(' + this.data.p2r + 'deg)',
                'z-index': p2z
            });
        },
        data: {
            state: 1,
            $page1: undefined,
            $page2: undefined,
            p1r: 0,
            p2r: 0
        }
    }];
