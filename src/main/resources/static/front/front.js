'use strict';
const make = function (spec, child) {
    const s = spec.split('.');
    const e = document.createElement(s[0]);
    if (s.length > 1) {
        s.shift();
        e.classList.add(...s);
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
const MMPerPx = (function () {
    const $resTester = $('<div style="height:100mm;width:100mm;visibility:collapse;"></div>');
    $('body').append($resTester);
    const ret = { x: 100 / $resTester.width(), y: 100 / $resTester.height() };
    $resTester.remove();
    return ret;
})();
const Editor = {
    loadedCard: undefined,
    $transformAnchor: $('#transform-anchor'),
    $editorArea: $("#editor-area"),
    $zoomLabel: $('#zoom-val'),
    scale: 1,
    translate: { x: 0, y: 0 },
    rotate: 0,
    apply() {
        this.$zoomLabel.text(Math.round(this.scale * 100));
        this.$transformAnchor.css('transform', `scale(${this.scale}) translate(${this.translate.x}px,${this.translate.y}px) rotateY(${this.rotate}deg)`);
    },
    fitToContainer() {
        this.scale = Math.min(this.$editorArea.width() * MMPerPx.x / (this.loadedCard.cardFormat.width + 55), this.$editorArea.height() * MMPerPx.x / (this.loadedCard.cardFormat.height + 55)) * 0.9;
        this.translate.x = 0;
        this.translate.y = 0;
        this.rotate = 0;
        this.apply();
    },
    createRuler() {
        const $topRuler = $('.ruler.top');
        for (let i = 0; i < this.loadedCard.cardFormat.width; i += 5)
            $topRuler.append($(make('li')).css('left', i + 'mm').attr('data-val', i / 10));
        const $leftRuler = $('.ruler.left');
        for (let i = 0; i < this.loadedCard.cardFormat.height; i += 5)
            $leftRuler.append($(make('li')).css('top', i + 'mm').attr('data-val', i / 10));
    },
    isDragging: false,
    translateStore: { x: 0, y: 0 },
    deltaStore: { x: 0, y: 0 },
    beginDrag() {
        this.deltaStore.x = 0;
        this.deltaStore.y = 0;
        this.translateStore.x = this.translate.x;
        this.translateStore.y = this.translate.y;
        this.isDragging = true;
        document.body.style.cursor = 'move';
    },
    drag(dx, dy) {
        this.deltaStore.x += dx;
        this.deltaStore.y += dy;
        this.translate.x = this.translateStore.x + this.deltaStore.x / this.scale;
        this.translate.y = this.translateStore.y + this.deltaStore.y / this.scale;
    },
    endDrag() {
        this.isDragging = false;
        document.body.style.cursor = 'default';
    },
    scroll(steps) {
        this.scale = Math.min(Math.max(this.scale + this.scale * steps * -0.01, 0.1), 5);
    },
    enableTransition(enable) {
        this.$transformAnchor.css('transition', enable ? 'transform 1s' : '');
    }
};
const ElementSpawners = {
    TEXT: function (p) {
        return $('<div class="text" contenteditable="true"><p><span>Ihr Text Hier!</span></p></div>')
            .mousedown(hTxtMDown)
            .mouseup(hTxtMUp)
            .click(hTxtClick)
            .on('paste', hTxtPaste)
            .on('keydown', hTxtKeyDown)
            .on('keyup', hTxtKeyUp)
            .on("dragstart", falsify)
            .on("drop", falsify)
            .css(Object.assign({
            'font-family': Fonts.defaultFont,
            'font-size': '16pt'
        }, p));
    },
    IMAGE: function (p) {
        return $("<img class='logo' src='" + web2print.links.apiUrl + "content/" + logoContentId + "' alt='" + logoContentId + "' draggable='false'>")
            .mousedown(function (e) {
            state.target = $(e.delegateTarget);
            state.addOnClick = undefined;
            state.dragging = true;
            $toolBox.css(Object.assign({
                visibility: 'hidden'
            }));
        })
            .click(imgClick)
            .css(p);
    }
};
const hTxtMDown = function (e) {
    state.target = $(e.delegateTarget);
    state.addOnClick = undefined;
};
const hTxtMUp = function () {
    const [startEl, _, endEl, __] = getSelectedNodes(getSel().getRangeAt(0));
    let fontFam = $(startEl).css('font-family');
    let fontSize = +$(startEl).css('font-size').slice(0, -2);
    let index;
    for (let n = startEl;;) {
        const nextFam = $(n).css('font-family');
        const nextSize = +$(n).css('font-size').slice(0, -2);
        if (fontFam !== nextFam) {
            index = -1;
        }
        if (nextSize < fontSize) {
            fontSize = nextSize;
        }
        if (n === endEl)
            break;
        if (n.nextSibling === null) {
            n = n.parentNode.nextSibling.firstChild;
        }
        else {
            n = n.nextSibling;
        }
    }
    $fontSelect[0].selectedIndex = index || Fonts.FontNames.indexOf(fontFam);
    $fontSizeSelect.val(Math.round(fontSize / 96 * 72));
};
const hTxtClick = function (e) {
    e.stopPropagation();
    const $target = $(e.delegateTarget);
    $toolBox.css(Object.assign({
        visibility: 'visible'
    }, $target.offset()));
};
const hTxtKeyDown = function (e) {
    const ev = e.originalEvent;
    const key = ev.keyCode;
    if (ev.shiftKey && key === 13) {
        e.preventDefault();
    }
    else if (ev.ctrlKey && key === 90) {
        e.preventDefault();
    }
};
const hTxtKeyUp = function (e) {
    e.preventDefault();
    const key = e.originalEvent.keyCode;
    const range = getSel().getRangeAt(0);
    if (range.collapsed && range.startContainer.isA("#text")) {
        if (range.startContainer.parentNode.isA('P')) {
            const p = range.startContainer.parentNode;
            const insertTarget = range.startContainer.nextSibling;
            const txt = p.removeChild(range.startContainer);
            const w = make('span', txt);
            p.insertBefore(w, insertTarget);
            range.setEnd(txt, txt.textContent.length);
            range.collapse();
        }
        else if (range.startContainer.parentNode.isA('DIV')) {
            const box = range.startContainer.parentNode;
            const insertTarget = range.startContainer.nextSibling;
            const txt = box.removeChild(range.startContainer);
            const span = make('span', txt);
            box.insertBefore(make('p', span), insertTarget);
            if (insertTarget && insertTarget.isA('BR'))
                box.removeChild(insertTarget);
            range.setEnd(txt, txt.textContent.length);
            range.collapse();
        }
    }
    if ((key >= 37 && key <= 40) || (key >= 33 && key <= 36)) {
        hTxtMUp();
    }
};
const hTxtPaste = async function (e) {
    e.preventDefault();
};
const hFontChanged = function (e) {
    const range = getSel().getRangeAt(0);
    const fName = $fontSelect.val();
    makeNodesFromSelection(range, function (curr) {
        $(curr).css('font-family', fName);
    });
};
let logoContentId;
const hFileUploadChanged = function (e) {
    let file = e.target.files[0];
    console.log(file.type);
    let fd = new FormData();
    fd.append("file", file);
    let req = jQuery.ajax({
        url: web2print.links.apiUrl + "content",
        method: "POST",
        data: fd,
        processData: false,
        contentType: false
    });
    req.then(function (response) {
        logoContentId = JSON.parse(response).contentId;
    }, function (xhr) {
        console.error('failed to fetch xhr', xhr);
    });
};
const $fileUpBtn = $('#fileUpload').change(hFileUploadChanged);
const imgClick = function (e) {
    e.stopPropagation();
    const target = $(e.delegateTarget);
    imgTool.css(Object.assign({
        visibility: 'visible',
    }, target.offset()));
};
const getRotation = function () {
    let transformMatrix = state.target.css('transform');
    let angle = 0;
    if (transformMatrix !== "none") {
        let mat = transformMatrix.split('(')[1].split(')')[0].split(',');
        let a = +mat[0];
        let b = +mat[1];
        let radians = Math.atan2(b, a);
        if (radians < 0) {
            radians += (2 * Math.PI);
        }
        angle = Math.round(radians * (180 / Math.PI));
    }
    return angle;
};
const Fonts = {
    FontNames: undefined,
    defaultFont: undefined,
    FontStyleValues: {
        b: 0b001,
        i: 0b010,
        u: 0b100
    },
    FontAttributeMap: {},
    loadFonts(fontNames) {
        Fonts.FontNames = fontNames;
        let $options = new Array(fontNames.length);
        for (let i = 0; i < fontNames.length; i++) {
            const fName = fontNames[i];
            $options[i] = $('<option value="' + fName + '" style="font-family: ' + fName + ';">' + fName + '</option>');
            Fonts.beginLoadFont(fName);
        }
        Fonts.defaultFont = fontNames[0];
        return $options;
    },
    beginLoadFont: function (name) {
        return $.get(web2print.links.apiUrl + 'font/' + name)
            .then(Fonts.loadFont)
            .catch(function (e) {
            alert('[error] could not load font: ' + JSON.stringify(e));
        });
    },
    loadFont: function (font) {
        let attribs = {};
        let promises = new Array(font.faces.length);
        for (let i = 0; i < font.faces.length; i++) {
            const face = font.faces[i];
            promises[i] = new FontFace(font.name, 'url(' + web2print.links.fontUrl + face.s + ')', {
                style: face.fs,
                weight: String(face.fw)
            })
                .load()
                .then(function (f) {
                document.fonts.add(f);
                attribs[face.v] = face.fw;
            })
                .catch(function (e) {
                alert('[error] could not load font: ' + JSON.stringify(e));
            });
        }
        return Promise.allSettled(promises).then(function () {
            Fonts.FontAttributeMap[font.name] = attribs;
        });
    },
};
const serialize = function () {
    const data = {
        v: '0.2',
        card: Parameters.card,
        outerEls: [],
        innerEls: []
    };
    const $bundles = $cardContainer.children();
    for (let i = 0; i < $bundles.length; i++) {
        const $b = $bundles.eq(i);
        const offs = +$b[0].dataset.xOffset;
        serializeSide($b.find('.front>.elements-layer').children(), offs, data.outerEls);
        serializeSide($b.find('.back>.elements-layer').children(), offs, data.innerEls);
    }
    console.log("sending", data);
    const _export = true;
    $.post(web2print.links.apiUrl + 'save/' + (Parameters.sId || '') + '?export=' + _export, 'data=' + btoa(JSON.stringify(data)))
        .then(function () {
        alert('Sent data!');
    }).catch(function (e) {
        alert('Send failed: \n' + JSON.stringify(e));
    });
};
const serializeSide = function ($els, xOffs, target) {
    for (let j = 0; j < $els.length; j++) {
        const $el = $els.eq(j);
        const bounds = {
            x: xOffs + $el[0].offsetLeft * MMPerPx.x,
            y: ($el.parent().height() - ($el[0].offsetTop + $el.height())) * MMPerPx.y,
            w: $el.width() * MMPerPx.x,
            h: $el.height() * MMPerPx.y
        };
        switch ($el[0].nodeName) {
            case 'DIV':
                {
                    let align = $el.css('text-align');
                    switch (align) {
                        case 'justify':
                            align = 'j';
                            break;
                        case 'right':
                            align = 'r';
                            break;
                        case 'center':
                            align = 'c';
                            break;
                        default: align = 'l';
                    }
                    let box = Object.assign({
                        t: "t",
                        a: align,
                        r: []
                    }, bounds);
                    let $innerChildren = $el.children();
                    for (let j = 0; j < $innerChildren.length; j++) {
                        let $iel = $innerChildren.eq(j);
                        if ($iel[0].isA('P')) {
                            const $spans = $iel.children();
                            for (let k = 0; k < $spans.length; k++) {
                                const $span = $spans.eq(k);
                                if ($span[0].isA('SPAN')) {
                                    let attributes = 0;
                                    for (const [c, v] of Object.entries(Fonts.FontStyleValues))
                                        if ($span.hasClass(c))
                                            attributes |= v;
                                    box.r.push({
                                        f: $span.css('font-family'),
                                        s: Math.round((+$span.css('font-size').slice(0, -2)) / 96 * 72),
                                        a: attributes,
                                        t: $span.text()
                                    });
                                }
                                else {
                                    console.warn('cannot serialize element', $span[0]);
                                }
                            }
                            box.r.push('br');
                        }
                        else {
                            console.warn('cannot serialize element', $iel[0]);
                        }
                    }
                    target.push(box);
                }
                break;
            case 'IMG':
                {
                    let box = Object.assign({
                        t: "i",
                        s: $el[0].alt,
                    }, bounds);
                    target.push(box);
                }
                break;
            default: console.warn('cannot serialize element', $el[0]);
        }
    }
};
const createFold = function (fold) {
    if (fold.x1 === fold.x2) {
        let vFold = $('<div class="vFold"></div>');
        vFold.css('left', fold.x1 + 'mm');
        return vFold;
    }
    else if (fold.y1 === fold.y2) {
        let hFold = $('<div class="hFold"></div>');
        hFold.css('top', fold.y1 + 'mm');
        return hFold;
    }
    else {
        throw new Error("can't display diagonal folds for now");
    }
};
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
            $page2[0].dataset.xOffset = String(w1);
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
const $toolBox = $('#toolBox');
const imgTool = $('#imgTool');
const $cardContainer = $('#card-container');
const rsContainer = get('render-styles-container');
const $navDotsUl = $('.floater.bottom>ul');
const $pageLabel = $('.floater.bottom>span');
const loadCard = function (card) {
    if (!card)
        return false;
    console.log('loading', card);
    document.querySelector('#preview-container>img').src
        = web2print.links.thumbnailUrl + card.thumbSlug;
    for (let i = 0; i < RenderStyles.length; i++) {
        const renderStyle = RenderStyles[i];
        if (!renderStyle.condition(card))
            continue;
        const frag = make('button.render-select');
        $(frag).text(renderStyle.name).attr('onclick', 'hRenderStyleChanged(' + i + ');');
        rsContainer.appendChild(frag);
    }
    Editor.loadedCard = card;
    Editor.fitToContainer();
    Editor.createRuler();
    Editor.enableTransition(true);
    hRenderStyleChanged(0);
};
const hElementsLayerClick = function (e, target) {
    if (!state.addOnClick)
        return;
    const el = state.addOnClick({ left: e.offsetX, top: e.offsetY });
    $(target).append(el);
    state.addOnClick = undefined;
};
const state = {
    addOnClick: undefined,
    target: undefined,
    dragging: false,
    resizing: false,
    dx: 0,
    dy: 0,
    range: undefined
};
const hAddElClick = function (e) {
    spawnNewEl($(e.target).attr('data-enum'));
};
const spawnNewEl = function (objectType) {
    state.addOnClick = ElementSpawners[objectType];
    if (objectType === 'IMAGE') {
        $fileUpBtn.click();
    }
};
const hChangeFontType = function () {
    const classToAdd = $(this).val();
    const range = getSel().getRangeAt(0);
    let shouldRemoveClass = true;
    const [startEl, endEl] = makeNodesFromSelection(range, function (curr) {
        if (shouldRemoveClass && !$(curr).hasClass(classToAdd))
            shouldRemoveClass = false;
    });
    for (let curr = startEl;;) {
        console.assert(curr.isA('SPAN') && curr.childNodes.length === 1 && curr.firstChild.isA('#text'), 'illegal p child ', curr, range);
        $(curr)[shouldRemoveClass ? 'removeClass' : 'addClass'](classToAdd);
        if (curr === endEl)
            break;
        if (curr.nextSibling === null) {
            curr = curr.parentNode.nextSibling.firstChild;
        }
        else {
            curr = curr.nextSibling;
        }
    }
};
let $body = $('body')
    .mousedown(function (e) {
    if (e.which === 2) {
        Editor.enableTransition(false);
        Editor.beginDrag();
        return false;
    }
})
    .mousemove(function (e) {
    const ev = e.originalEvent;
    const dx = ev.movementX;
    const dy = ev.movementY;
    if (Editor.isDragging) {
        Editor.drag(dx, dy);
        Editor.apply();
    }
    if (!state.dragging && !state.resizing)
        return;
    state.dx += dx;
    state.dy += dy;
    if (state.resizing) {
        state.target.css({
            width: '+=' + dx,
            height: '+=' + dy,
        });
    }
    else if (state.dragging) {
        state.target.css('transform', 'translate(' + state.dx / Editor.scale + 'px, ' + state.dy / Editor.scale + 'px) rotate(' + getRotation() + 'deg)');
        $toolBox.css('transform', 'translate(' + state.dx + 'px, calc(-100% + ' + state.dy + 'px))');
        imgTool.css('transform', 'translate(' + state.dx + 'px, ' + state.dy + 'px)');
    }
}).mouseup(function () {
    if (Editor.isDragging) {
        Editor.endDrag();
        Editor.enableTransition(true);
    }
    else if (state.dragging) {
        if (state.dx !== 0 || state.dy !== 0) {
            state.target.css({
                left: '+=' + state.dx / Editor.scale,
                top: '+=' + state.dy / Editor.scale,
                transform: 'translate(' + 0 + 'px, ' + 0 + 'px) rotate(' + getRotation() + 'deg)',
            });
            $toolBox.css({
                left: '+=' + state.dx,
                top: '+=' + state.dy,
                transform: '',
            });
            imgTool.css({
                left: '+=' + state.dx,
                top: '+=' + state.dy,
                transform: '',
            });
            state.dx = 0;
            state.dy = 0;
        }
        state.dragging = false;
    }
    else if (state.resizing) {
        state.resizing = false;
        state.dx = 0;
        state.dy = 0;
    }
    else {
        $toolBox.css('visibility', 'collapse');
        imgTool.css('visibility', 'collapse');
    }
});
$(document)
    .keydown(function (e) {
    if (e.ctrlKey) {
        if (e.key === '-') {
            e.preventDefault();
            Editor.scroll(10);
            Editor.apply();
        }
        else if (e.key === '+') {
            e.preventDefault();
            Editor.scroll(-10);
            Editor.apply();
        }
    }
});
function preventScroll(e) {
    if (e.ctrlKey) {
        e.preventDefault();
        Editor.scroll(Math.sign(e.deltaY) * 10);
        Editor.apply();
        return false;
    }
}
document.addEventListener('wheel', preventScroll, { passive: false });
document.addEventListener('mousewheel', preventScroll, { passive: false });
document.addEventListener('DOMMouseScroll', preventScroll, { passive: false });
const renderStyleState = {
    style: undefined,
    currentDotIndex: undefined,
    dots: undefined,
    getActiveDot: function () {
        return this.dots[this.currentDotIndex];
    },
    getActiveLabel: function () {
        return this.style.pageLabels[this.currentDotIndex];
    }
};
const hRenderStyleChanged = function (index) {
    renderStyleState.style = RenderStyles[index];
    renderStyleState.currentDotIndex = renderStyleState.style.initialDotIndex;
    renderStyleState.dots = new Array(renderStyleState.style.pageLabels.length);
    const range = makeR();
    range.selectNodeContents($navDotsUl[0]);
    range.deleteContents();
    for (let i = 0; i < renderStyleState.dots.length; i++) {
        const $el = $(make('li'));
        if (i === renderStyleState.currentDotIndex) {
            $el.addClass('active');
            $pageLabel.text(renderStyleState.getActiveLabel());
        }
        renderStyleState.dots[i] = $el;
        $navDotsUl.append($el);
    }
    range.selectNodeContents($cardContainer[0]);
    range.deleteContents();
    $cardContainer.append(renderStyleState.style.pageGen(Editor.loadedCard));
};
const hPageSwitch = function (direction) {
    renderStyleState.style.hPageChanged(direction);
    renderStyleState.getActiveDot().removeClass('active');
    renderStyleState.currentDotIndex = mod(renderStyleState.currentDotIndex + direction, renderStyleState.dots.length);
    renderStyleState.getActiveDot().addClass('active');
    $pageLabel.text(renderStyleState.getActiveLabel());
};
$('.addElBtn').click(hAddElClick);
$("#resize").mousedown(function (e) {
    state.resizing = true;
});
$("#logoRotation").change(function (e) {
    state.target.css('transform', 'rotate(' + $(this).val() + 'deg)');
}).mouseup(stopPropagation);
$(".alignmentBtn").click(function () {
    state.target.css('text-align', $(this).val());
}).mouseup(stopPropagation);
$(".fontTypeButton").click(hChangeFontType).mouseup(stopPropagation);
$('#moveBtn').mousedown(function () {
    state.dragging = true;
});
$('#submitBtn').click(serialize);
$('#tutorial').click(showTutorial);
const $fontSelect = $('#fontSelect')
    .mouseup(stopPropagation)
    .change(hFontChanged);
const $fontSizeSelect = $('#fontSizeSelect')
    .mousedown(function (e) {
    const s = getSel();
    if (s.rangeCount === 1)
        state.range = s.getRangeAt(0).cloneRange();
})
    .mouseup(stopPropagation)
    .change(function (e) {
    const fontSize = e.target.value;
    const sel = getSel();
    sel.removeAllRanges();
    sel.addRange(state.range);
    makeNodesFromSelection(sel.getRangeAt(0), function (curr) {
        $(curr).css('font-size', fontSize + 'pt');
    });
});
$('.right>.nav-btn-inner').click(function () {
    hPageSwitch(+1);
});
$('.left>.nav-btn-inner').click(function () {
    hPageSwitch(-1);
});
$('#recenter-btn').click(function () {
    Editor.fitToContainer();
});
$.get(web2print.links.apiUrl + 'card/' + Parameters.card)
    .then(loadCard)
    .catch(function () {
    alert(Parameters.card
        ? 'Die Karte "' + Parameters.card + '" konnte nicht geladen werden!'
        : 'Es wurde keine Karte gefunden!');
    location.href = web2print.links.basePath + 'tileview/tileview.html';
});
$.get(web2print.links.apiUrl + 'fonts')
    .then(Fonts.loadFonts)
    .then(function (fonts) {
    $fontSelect.append(fonts);
})
    .catch(function (e) {
    alert('[fatal] something went wrong loading fonts: ' + JSON.stringify(e));
});
if (Cookie.getValue('tutorial') !== 'no') {
    showTutorial();
}
function showTutorial() {
    const $tutOver = $('<div style="position:absolute; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.66)">' +
        '<div class="center" style="white-space: normal; overflow: auto; max-width:70%; max-height:70%; background-color:lightgray; padding:5px 5px 15px 5px;">' +
        '<div>' +
        '<h3>Hinzufügen von Text:</h3>' +
        '<img src="./TextTut.gif" alt="tut" width="45%" height="45%" style="float: left; padding-right: 5px">' +
        '<p>Um Text hinzuzufügen klicken Sie zuerst auf "Text".<br>' +
        'Danach können Sie den Text mit einem klick auf der Karte platzieren.</p>' +
        '</div>' +
        '<br style="clear: left">' +
        '<div>' +
        '<h3>Bearbeiten von Text:</h3>' +
        '<img src="./TextEditTut.gif" alt="tut" width="45%" height="45%" style="float: left; padding-right: 5px">' +
        '<p>Um Text zu bearbeiten klicken Sie zu erst auf den Text.<br>' +
        'Es öffnet sich eine Toolbox mit den Werkzeugen zur Textbearbeitung.</p>' +
        '</div>' +
        '<br style="clear: left">' +
        '<div>' +
        '<h3>Hinzufügen von Bildern:</h3>' +
        '<img src="./ImageTut.gif" alt="tut" width="45%" height="45%" style="float: left; padding-right: 5px">' +
        '<p>Um ein Bild zu laden klicken Sie zuerst auf "Bild/Logo".<br>' +
        'Es öffnet sich eine Dateiauswahl, wählen Sie hier die gewünschte Datei aus.<br>' +
        'Um schließlich das Bild zu platzieren klicken Sie auf die Karte.</p>' +
        '</div>' +
        '<br style="clear: left">' +
        '<div>' +
        '<h3>Zoomen und Bewegen der Karte:</h3>' +
        '<p>Durch gedrückt halten vom Mausrad (Maustaste 3) kann die Karte im Editor bewegt werden.<br>' +
        'Halten Sie die Steuerungstaste (STRG/CTRL) und scrollen Sie gleichzeitig, so können Sie in der Karte zoomen.<br>' +
        'Um auf den Anfangszustand zu kommen können Sie auf "Zentrieren" drücken.</p>' +
        '</div>' +
        '<input type="checkbox" id="dont-show-again" style="margin:10px 2px 0 0;">' +
        '<label for="dont-show-again">nicht erneut anzeigen</label>' +
        '<button style="margin:5px 0 0 0;float: right;">Ok</button></div></div>');
    const dontShowAgain = $tutOver.find('input')[0];
    $tutOver.find('button').click(function () {
        if (dontShowAgain.checked) {
            Cookie.set('tutorial', 'no');
        }
        $tutOver.remove();
    });
    $body.append($tutOver);
}
