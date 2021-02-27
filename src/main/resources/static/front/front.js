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
function stringifyParameters() {
    let s = '?';
    for (const [k, v] of Object.entries(Parameters)) {
        if (s.length > 2)
            s += '&';
        s += k + '=' + v;
    }
    return s;
}
const Parameters = (function () {
    const url = window.location.search;
    const ret = {};
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
class SelectEx {
    constructor($target, onChange) {
        const This = this;
        This.$target = $target;
        This.$options = $target.children('.select-ex-options');
        const $p = $target.children('p')
            .click(function (e) {
            e.stopPropagation();
            This.$options.css('visibility', 'visible');
        });
        This.$label = $p.children('.select-ex-label');
        This.$options
            .mousedown(stopPropagation)
            .click(function (e) {
            if (e.target.nodeName !== 'P')
                return;
            if (onChange)
                onChange(This.value);
            This.value = e.target.textContent;
            This.$label.text(This.value);
        });
    }
    close() {
        this.$options.css('visibility', 'collapse');
    }
}
class ResizeBars {
    static setBoundsToTarget() {
        const eStorage = Editor.storage;
        const $target = eStorage.$target;
        eStorage.x = +$target.css('left').slice(0, -2);
        eStorage.y = +$target.css('top').slice(0, -2);
        eStorage.dx = 0;
        eStorage.dy = 0;
        ResizeBars.storage.bounds = {
            left: eStorage.x + +$target.parents('.page-bundle').attr('data-x-offset') / MMPerPx.x,
            width: $target.width(),
            top: eStorage.y,
            height: $target.height()
        };
    }
    static show(preserveRatio) {
        const rStorage = ResizeBars.storage;
        rStorage.preserveRatio = preserveRatio;
        ResizeBars.setBoundsToTarget();
        ResizeBars.$handles.css(Object.assign({
            visibility: 'visible',
            transform: ''
        }, rStorage.bounds))[rStorage.preserveRatio ? 'addClass' : 'removeClass']('preserve-ratio');
        ResizeBars.visible = true;
        rStorage.$target = ResizeBars.$handles.add(Editor.storage.$target);
        rStorage.aspectRatio = +Editor.storage.target.dataset.aspectRatio;
    }
    static hBarMDown(e) {
        Editor.state = EditorStates.EL_RESIZING;
        ResizeBars.setBoundsToTarget();
        const rStorage = ResizeBars.storage;
        const id = $(e.delegateTarget).attr('id');
        switch (id) {
            case 'handle-top':
                rStorage.lockDir = 0b0001;
                Editor.setCursor('ns-resize');
                break;
            case 'handle-right':
                rStorage.lockDir = 0b0010;
                Editor.setCursor('ew-resize');
                break;
            case 'handle-bottom':
                rStorage.lockDir = 0b0100;
                Editor.setCursor('ns-resize');
                break;
            case 'handle-left':
                rStorage.lockDir = 0b1000;
                Editor.setCursor('ew-resize');
                break;
        }
        if (rStorage.preserveRatio) {
            rStorage.lockDir |= (rStorage.lockDir >> 1) || 0b1000;
            switch (id) {
                case 'handle-top':
                    Editor.setCursor('nw-resize');
                    break;
                case 'handle-right':
                    Editor.setCursor('ne-resize');
                    break;
                case 'handle-bottom':
                    Editor.setCursor('se-resize');
                    break;
                case 'handle-left':
                    Editor.setCursor('sw-resize');
                    break;
            }
        }
    }
    static resizeEl(dx, dy) {
        const eStorage = Editor.storage;
        const scale = Editor.transform.scale;
        const rStorage = ResizeBars.storage;
        const bounds = rStorage.bounds;
        const css = {};
        if (rStorage.preserveRatio) {
            if (Math.abs(dx) > Math.abs(dy)) {
                dy = dx / rStorage.aspectRatio;
                if (rStorage.lockDir === 0b0011 || rStorage.lockDir === 0b1100) {
                    dy *= -1;
                }
            }
            else {
                dx = dy * rStorage.aspectRatio;
                if (rStorage.lockDir === 0b0011 || rStorage.lockDir === 0b1100) {
                    dx *= -1;
                }
            }
        }
        if (rStorage.lockDir & 0b0001) {
            eStorage.dy += dy;
            Object.assign(css, {
                top: eStorage.y + eStorage.dy / scale,
                height: bounds.height - eStorage.dy / scale
            });
        }
        else if (rStorage.lockDir & 0b0100) {
            eStorage.dy += dy;
            Object.assign(css, { height: bounds.height + eStorage.dy / scale });
        }
        if (rStorage.lockDir & 0b0010) {
            eStorage.dx += dx;
            Object.assign(css, { width: bounds.width + eStorage.dx / scale });
        }
        else if (rStorage.lockDir & 0b1000) {
            eStorage.dx += dx;
            Object.assign(css, {
                left: eStorage.x + eStorage.dx / scale,
                width: bounds.width - eStorage.dx / scale
            });
        }
        ResizeBars.storage.$target.css(css);
    }
    static endResizeEl() {
        Editor.setCursor('auto');
        Editor.state = EditorStates.EL_FOCUSED;
    }
    static hide() {
        ResizeBars.$handles.css('visibility', 'collapse');
        ResizeBars.visible = false;
    }
}
ResizeBars.$handles = $('#resize-handles');
ResizeBars.visible = false;
ResizeBars.storage = {
    bounds: {
        left: 0,
        width: 0,
        top: 0,
        height: 0
    },
    aspectRatio: 1,
    preserveRatio: false,
    lockDir: 0,
    $target: undefined,
};
ResizeBars.$handles.children().mousedown(ResizeBars.hBarMDown);
class El {
    static hMDown(e) {
        switch (Editor.state) {
            case EditorStates.NONE:
                Editor.state = EditorStates.EL_BEGIN_FOCUS;
                Editor.setTarget(e.delegateTarget);
                Editor.showHandlesOnTarget();
                break;
            case EditorStates.EL_FOCUSED:
            case EditorStates.TXT_EDITING:
                if (Editor.storage.target !== e.delegateTarget) {
                    Editor.state = EditorStates.EL_BEGIN_FOCUS;
                    Editor.setTarget(e.delegateTarget);
                    Editor.showHandlesOnTarget();
                    break;
                }
        }
    }
    static hMUp(e) {
        switch (Editor.state) {
            case EditorStates.EL_BEGIN_FOCUS:
                if (Editor.storage.target === e.delegateTarget) {
                    Editor.state = EditorStates.EL_FOCUSED;
                    e.stopPropagation();
                }
                break;
        }
    }
}
var EditorStates;
(function (EditorStates) {
    EditorStates[EditorStates["NONE"] = 0] = "NONE";
    EditorStates[EditorStates["SELF_DRAGGING"] = 1] = "SELF_DRAGGING";
    EditorStates[EditorStates["EL_BEGIN_FOCUS"] = 2] = "EL_BEGIN_FOCUS";
    EditorStates[EditorStates["EL_FOCUSED"] = 3] = "EL_FOCUSED";
    EditorStates[EditorStates["EL_DRAGGING"] = 4] = "EL_DRAGGING";
    EditorStates[EditorStates["EL_RESIZING"] = 5] = "EL_RESIZING";
    EditorStates[EditorStates["TXT_EDITING"] = 6] = "TXT_EDITING";
})(EditorStates || (EditorStates = {}));
class Editor {
    static setTarget(t) {
        Editor.storage.target = t;
        Editor.storage.$target = $(t);
    }
    static clearTarget() {
        Editor.storage.target = undefined;
        Editor.storage.$target = undefined;
        ResizeBars.hide();
        Editor.state = EditorStates.NONE;
        console.log('clear target');
    }
    static beginDragEl() {
        Editor.storage.dx = 0;
        Editor.storage.dy = 0;
        Editor.state = EditorStates.EL_DRAGGING;
        Editor.setCursor('move');
        Editor.storage.$target.addClass('no-select');
    }
    static dragEl(dx, dy) {
        Editor.storage.dx += dx;
        Editor.storage.dy += dy;
        ResizeBars.storage.$target.css('transform', `translate(${Editor.storage.dx / Editor.transform.scale}px, ${Editor.storage.dy / Editor.transform.scale}px)`);
    }
    static endDragEl() {
        Editor.state = EditorStates.EL_FOCUSED;
        Editor.setCursor('auto');
        const storage = Editor.storage;
        if (storage.dx === 0 && storage.dy === 0)
            return;
        ResizeBars.storage.$target.css({
            top: `+=${storage.dy / Editor.transform.scale}`,
            left: `+=${storage.dx / Editor.transform.scale}`,
            transform: 'rotate(' + getRotation() + 'deg)',
        });
        storage.dx = 0;
        storage.dy = 0;
        Editor.storage.$target.removeClass('no-select');
    }
    static beginDragSelf() {
        const storage = Editor.storage;
        storage.x = Editor.transform.translateX;
        storage.y = Editor.transform.translateY;
        storage.dx = 0;
        storage.dy = 0;
        Editor.state = EditorStates.SELF_DRAGGING;
        Editor.setCursor('move');
    }
    static dragSelf(dx, dy) {
        const storage = Editor.storage;
        storage.dx += dx;
        storage.dy += dy;
        const transform = Editor.transform;
        transform.translateX = storage.x + storage.dx / transform.scale;
        transform.translateY = storage.y + storage.dy / transform.scale;
        Editor.applyTransform();
    }
    static endDragSelf() {
        Editor.state = EditorStates.NONE;
        Editor.setCursor('auto');
    }
    static zoom(steps) {
        const scale = Editor.transform.scale;
        Editor.transform.scale = Math.min(Math.max(scale + scale * steps * -0.01, 0.1), 5);
        Editor.applyTransform();
        Editor.displayZoom();
    }
    static fitToContainer() {
        Editor.transform.scale = Math.min(Editor.$editorArea.width() * MMPerPx.x / (Editor.storage.loadedCard.cardFormat.width + 55), Editor.$editorArea.height() * MMPerPx.x / (Editor.storage.loadedCard.cardFormat.height + 55)) * 0.9;
        Editor.transform.translateX = 0;
        Editor.transform.translateY = 0;
        Editor.transform.rotate = 0;
        Editor.applyTransform();
        Editor.displayZoom();
    }
    static applyTransform() {
        const transform = Editor.transform;
        Editor.$transformAnchor.css('transform', `scale(${transform.scale}) translate(${transform.translateX}px,${transform.translateY}px) rotateY(${transform.rotate}deg)`);
    }
    static showHandlesOnTarget() {
        ResizeBars.show(Editor.storage.target.isA('IMG'));
    }
    static setCursor(cursor) {
        document.body.style.cursor = cursor;
    }
    static displayZoom() {
        Editor.$zoomLabel.text(Math.round(Editor.transform.scale * 100));
    }
    static enableTransition(enable) {
        this.$transformAnchor.css('transition', enable ? 'transform 1s' : '');
    }
    static createRuler() {
        const $topRuler = $('.ruler.top');
        for (let i = 0; i < Editor.storage.loadedCard.cardFormat.width; i += 5)
            $topRuler.append($(make('li')).css('left', i + 'mm').attr('data-val', i / 10));
        const $leftRuler = $('.ruler.left');
        for (let i = 0; i < Editor.storage.loadedCard.cardFormat.height; i += 5)
            $leftRuler.append($(make('li')).css('top', i + 'mm').attr('data-val', i / 10));
    }
    static saveSelection() {
        const s = getSel();
        if (s.rangeCount === 1)
            Editor.storage.range = s.getRangeAt(0).cloneRange();
    }
    static loadSelection() {
        const sel = getSel();
        sel.removeAllRanges();
        sel.addRange(Editor.storage.range);
        return sel;
    }
    static deleteElement() {
        switch (Editor.state) {
            case EditorStates.EL_FOCUSED:
            case EditorStates.TXT_EDITING:
                if (confirm("Wollen Sie das Element wirklich löschen?")) {
                    const target = Editor.storage.target;
                    target.parentElement.removeChild(target);
                    ResizeBars.hide();
                    Editor.state = EditorStates.NONE;
                    break;
                }
        }
    }
    static displayLineheight() {
        $lhSpinner[0].value = Editor.storage.target.style.lineHeight;
    }
}
Editor.$transformAnchor = $('#transform-anchor');
Editor.$editorArea = $('#editor-area');
Editor.$zoomLabel = $('#zoom-val');
Editor.transform = {
    scale: 1,
    translateX: 0,
    translateY: 1,
    rotate: 0
};
Editor.state = EditorStates.NONE;
Editor.storage = {
    loadedCard: undefined,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    target: undefined,
    $target: undefined,
    addOnClick: undefined,
    range: undefined,
};
const Elements = {
    TEXT: {
        displayName: 'Text',
        spawn(css) {
            return $('<div class="text" contenteditable="true" style="line-height: 1.2;"><p><span>Ihr Text Hier!</span></p></div>')
                .mousedown(TextEl.hMDown)
                .mouseup(TextEl.hMUp)
                .click(stopPropagation)
                .on('paste', hTxtPaste)
                .on('keydown', hTxtKeyDown)
                .on('keyup', hTxtKeyUp)
                .on("dragstart", falsify)
                .on("drop", falsify)
                .css(Object.assign({
                'font-family': Fonts.defaultFont,
                'font-size': '16pt'
            }, css));
        },
        serialize($instance) {
            let align = $instance.css('text-align');
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
            let data = {
                t: "t",
                a: align,
                lh: +$instance[0].style.lineHeight,
                r: [],
            };
            let $innerChildren = $instance.children();
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
                            data.r.push({
                                f: $span.css('font-family'),
                                s: Math.round((+$span.css('font-size').slice(0, -2)) / 96 * 72),
                                a: attributes,
                                t: $span.text(),
                                c: $span.css('color'),
                            });
                        }
                        else {
                            console.warn('cannot serialize element', $span[0]);
                        }
                    }
                    data.r.push('br');
                }
                else {
                    console.warn('cannot serialize element', $iel[0]);
                }
            }
            return data;
        },
        restore($ownInstance, data) {
            $ownInstance.html('');
            let align;
            switch (data.a) {
                case 'j':
                    align = 'justify';
                    break;
                case 'r':
                    align = 'right';
                    break;
                case 'c':
                    align = 'center';
                    break;
            }
            if (align)
                $ownInstance.css('text-align', align);
            let $currentP = $(make('p'));
            for (const run of data.r) {
                if (run === 'br') {
                    if ($currentP.children().length < 1)
                        $currentP.append(make('span'));
                    $ownInstance.append($currentP);
                    $currentP = $(make('p'));
                }
                else {
                    let classString = '';
                    for (const [c, v] of Object.entries(Fonts.FontStyleValues))
                        if (run.a & v)
                            classString += '.' + c;
                    $currentP.append($(make('span' + classString, makeT(run.t))).css({
                        'font-family': run.f,
                        'font-size': run.s + 'pt',
                        'color': run.c,
                    }));
                }
            }
        }
    },
    IMAGE: {
        displayName: 'Bild / Logo',
        spawn(p) {
            return $(`<img class="logo" src="${web2print.links.apiUrl}content/${ImageEl.contentId}" alt="${ImageEl.contentId}" data-aspect-ratio="${ImageEl.imgAR}" draggable="false">`)
                .mousedown(ImageEl.hMDown)
                .mouseup(El.hMUp)
                .on("dragstart", falsify)
                .on("drop", falsify)
                .click(stopPropagation)
                .css(p);
        },
        serialize($instance) {
            return {
                t: "i",
                s: $instance[0].alt,
                r: +$instance[0].dataset.aspectRatio,
            };
        },
        restore($ownInstance, data) {
            const img = $ownInstance[0];
            img.src = `${web2print.links.apiUrl}content/${data.s}`;
            img.alt = data.s;
            img.setAttribute("data-aspect-ratio", String(data.r));
        }
    }
};
class TextEl {
    static hMDown(e) {
        switch (Editor.state) {
            case EditorStates.EL_FOCUSED:
            case EditorStates.TXT_EDITING:
                if (Editor.storage.target === e.delegateTarget) {
                    Editor.state = EditorStates.TXT_EDITING;
                    e.stopPropagation();
                    break;
                }
            default:
                El.hMDown(e);
        }
    }
    static hMUp(e) {
        switch (Editor.state) {
            case EditorStates.TXT_EDITING:
                break;
            case EditorStates.EL_DRAGGING:
            case EditorStates.EL_BEGIN_FOCUS:
                Editor.displayLineheight();
                TextEl.displaySelectedProperties();
            default:
                El.hMUp(e);
        }
    }
    static displaySelectedProperties() {
        const [startEl, _, endEl, __] = getSelectedNodes(getSel().getRangeAt(0));
        let fontFam = $(startEl).css('font-family');
        let fontSize = +$(startEl).css('font-size').slice(0, -2);
        for (let n = startEl;;) {
            const nextFam = $(n).css('font-family');
            const nextSize = +$(n).css('font-size').slice(0, -2);
            if (fontFam !== nextFam) {
                fontFam = '';
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
        Fonts.currentSelection = fontFam;
        Fonts.displaySelected();
        $fontSizeSelect.val(Math.round(fontSize / 96 * 72));
    }
}
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
        TextEl.displaySelectedProperties();
    }
};
const hTxtPaste = async function (e) {
    e.preventDefault();
};
const hFontChanged = function () {
    const range = getSel().getRangeAt(0);
    const fName = Fonts.currentSelection;
    makeNodesFromSelection(range, function (curr) {
        $(curr).css('font-family', fName);
    });
};
class ImageEl {
    static hMDown(e) {
        switch (Editor.state) {
            case EditorStates.EL_FOCUSED:
                if (Editor.storage.target === e.delegateTarget) {
                    Editor.beginDragEl();
                    break;
                }
            default:
                El.hMDown(e);
        }
    }
}
ImageEl.contentId = undefined;
ImageEl.imgAR = 1;
function hFileUploadChanged(e) {
    const file = e.target.files[0];
    const fd = new FormData();
    fd.append("file", file);
    $.post({
        url: web2print.links.apiUrl + "content",
        data: fd,
        processData: false,
        contentType: false,
    }).then(function (response) {
        ImageEl.contentId = response.contentId;
        const img = new Image();
        img.onload = function () {
            ImageEl.imgAR = img.width / img.height;
        };
        img.src = `${web2print.links.apiUrl}content/${ImageEl.contentId}`;
    }).catch(function (e) {
        Editor.storage.addOnClick = undefined;
        $fileUpBtn.val(null);
        console.error('failed to fetch xhr', e);
        alert("Could not send Image to server:\n" + JSON.stringify(e));
    });
}
const $fileUpBtn = $('#fileUpload').change(hFileUploadChanged);
const getRotation = function () {
    let transformMatrix = Editor.storage.$target.css('transform');
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
    $options: $('#font-options'),
    $label: $('#font-label'),
    currentSelection: undefined,
    FontStyleValues: {
        b: 0b001,
        i: 0b010,
        u: 0b100
    },
    FontAttributeMap: {},
    loadFonts(fontNames) {
        Fonts.FontNames = fontNames;
        for (let i = 0; i < fontNames.length; i++) {
            const fName = fontNames[i];
            Fonts.$options.append($(`<p style="font-family: ${fName};">${fName}</p>`));
            Fonts.beginLoadFont(fName);
        }
        Fonts.defaultFont = fontNames[0];
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
    displaySelected() {
        const fName = Fonts.currentSelection;
        Fonts.$label.text(fName).css('font-family', fName);
    }
};
function submit(_export) {
    const data = serialize();
    console.log("sending", data);
    $.post(`${web2print.links.apiUrl}save/${Parameters.sId || ''}?export=${_export}`, 'data=' + btoa(JSON.stringify(data)))
        .then(function (response) {
        Parameters.sId = response;
        window.history.replaceState({}, Editor.storage.loadedCard.name + " - Web2Print", stringifyParameters());
        let txt = 'Daten erfolgreich gesendet!';
        if (!_export)
            txt += ` Sie befinden sich nun auf \n${window.location}\n Besuchen Sie diese Addresse später erneut wird das gespeicherte Design automatisch geladen.`;
        alert(txt);
    }).catch(function (e) {
        alert('Fehler beim Senden der Daten!\n' + JSON.stringify(e));
    });
}
function download() {
    const data = serialize();
    const fileName = `${data.card}.des`;
    const file = new Blob([btoa(JSON.stringify(data))], { type: 'text/plain' });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file, fileName);
    }
    else {
        const a = make("a");
        const url = URL.createObjectURL(file);
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }
}
function serialize() {
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
    return data;
}
function serializeSide($els, xOffs, target) {
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
                target.push(Object.assign(Elements.TEXT.serialize($el), bounds));
                break;
            case 'IMG':
                target.push(Object.assign(Elements.IMAGE.serialize($el), bounds));
                break;
            default: console.warn('cannot serialize element', $el[0]);
        }
    }
}
function hUpload(e) {
    const file = e.target.files[0];
    if (!file)
        return;
    file.text().then(loadElementsCompressed.bind(null, true));
}
function loadElementsCompressed(fileSource, b64data) {
    const data = JSON.parse(atob(b64data));
    if (Parameters.card !== data.card) {
        alert(`Das Design kann nicht geladen werden, da es zu einer anderen Karte gehört (${data.card}).`);
        throw new Error('invalid card format');
    }
    if (fileSource) {
        renderStyleState.style.clear();
        delete Parameters.sId;
    }
    window.history.replaceState({}, Editor.storage.loadedCard.name + " - Web2Print", stringifyParameters());
    loadElements(data);
}
function loadElements(data) {
    console.log('loading data', data);
    loadSide('front', data.outerEls);
    loadSide('back', data.innerEls);
}
function loadSide(side, boxes) {
    const cardHeight = Editor.storage.loadedCard.cardFormat.height / MMPerPx.y;
    for (const box of boxes) {
        const bounds = {
            left: box.x / MMPerPx.x,
            width: box.w / MMPerPx.x,
            top: cardHeight - (box.y + box.h) / MMPerPx.y,
            height: box.h / MMPerPx.y
        };
        const page = renderStyleState.style.assocPage(side, bounds);
        let el;
        switch (box.t) {
            case "i":
                {
                    el = Elements.IMAGE.spawn(bounds);
                    Elements.IMAGE.restore(el, box);
                }
                break;
            case "t":
                {
                    el = Elements.TEXT.spawn(bounds);
                    Elements.TEXT.restore(el, box);
                }
                break;
            default: throw new Error(`Can't deserialize box of type '${box['t']}'.`);
        }
        page.children('.elements-layer').append(el);
    }
}
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
        name: 'Druckbogen',
        condition(card) { return true; },
        BgStretchObjs: {
            stretch: {
                'background-size': 'cover',
                'background-repeat': 'no-repeat ',
                'background-position': 'center center',
            },
        },
        pageGen(card) {
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
        clear() {
            this.data.$bundle.find('.elements-layer').html('');
        },
        assocPage(side, _) {
            return this.data.$bundle.children('.' + side);
        },
        pageLabels: [
            'Innenseite',
            'Außenseite'
        ],
        initialDotIndex: 0,
        hPageChanged(direction) {
            this.data.rot += direction * 180;
            this.data.$bundle.css('transform', 'rotateY(' + this.data.rot + 'deg)');
        },
        data: {
            $bundle: undefined,
            rot: 0
        }
    }, {
        name: 'einzelne Seiten',
        condition(card) {
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
        pageGen(card) {
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
        clear() {
            this.data.$page1.add(this.data.$page2).find('.elements-layer').html('');
        },
        assocPage(side, bounds) {
            let leftPage, rightPage;
            if (side === 'back') {
                leftPage = this.data.$page1;
                rightPage = this.data.$page2;
            }
            else {
                rightPage = this.data.$page1;
                leftPage = this.data.$page2;
            }
            const fold = Editor.storage.loadedCard.cardFormat.folds[0].x1 / MMPerPx.x;
            if (bounds.left > fold) {
                bounds.left -= fold;
                return rightPage.children('.' + side);
            }
            else {
                return leftPage.children('.' + side);
            }
        },
        pageLabels: [
            'Rückseite',
            'Innenseite',
            'Vorderseite'
        ],
        initialDotIndex: 1,
        hPageChanged(direction) {
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
const $cardContainer = $('#card-container');
const rsContainer = get('render-styles-container');
const $navDotsUl = $('.floater.bottom>ul');
const $pageLabel = $('.floater.bottom>span');
const loadCard = function (card) {
    if (!card)
        throw new Error("Keine Karte ausgewählt.");
    console.log('loading', card);
    window.history.replaceState({}, card.name + " - Web2Print", stringifyParameters());
    document.querySelector('#preview-container>img').src
        = web2print.links.thumbnailUrl + card.thumbSlug;
    for (let i = 0; i < RenderStyles.length; i++) {
        const renderStyle = RenderStyles[i];
        if (!renderStyle.condition(card))
            continue;
        const frag = make('button.render-select');
        $(frag).text(renderStyle.name).attr('onclick', 'hRenderStyleBtnClick(' + i + ');');
        rsContainer.appendChild(frag);
    }
    Editor.storage.loadedCard = card;
    Editor.fitToContainer();
    Editor.createRuler();
    Editor.enableTransition(true);
    changeRenderStyle(0);
    if (Parameters.sId)
        $.get(`${web2print.links.apiUrl}load/${Parameters.sId}`)
            .then(loadElementsCompressed.bind(null, false))
            .catch(function (e) {
            alert('Es gab einen Fehler beim laden der Elemente!\n' + JSON.stringify(e));
        });
};
const hElementsLayerClick = function (e, target) {
    if (!Editor.storage.addOnClick)
        return;
    e.stopPropagation();
    const el = Editor.storage.addOnClick({ left: e.offsetX, top: e.offsetY });
    $(target).append(el);
    Editor.storage.addOnClick = undefined;
};
const spawnNewEl = function (objectType) {
    Editor.storage.addOnClick = Elements[objectType].spawn;
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
    ResizeBars.show(false);
};
let $body = $('body')
    .click(function () {
    Fonts.$options.css('visibility', 'collapse');
    saveSelect.close();
})
    .mousedown(function (e) {
    if (e.which === 2) {
        switch (Editor.state) {
            case EditorStates.EL_BEGIN_FOCUS:
            case EditorStates.EL_FOCUSED:
            case EditorStates.NONE:
                Editor.enableTransition(false);
                Editor.beginDragSelf();
                return false;
        }
    }
    else
        switch (Editor.state) {
            case EditorStates.TXT_EDITING:
                Editor.state = EditorStates.EL_FOCUSED;
                break;
        }
}).mousemove(function (e) {
    const ev = e.originalEvent;
    const dx = ev.movementX;
    const dy = ev.movementY;
    switch (Editor.state) {
        case EditorStates.SELF_DRAGGING:
            Editor.dragSelf(dx, dy);
            break;
        case EditorStates.EL_BEGIN_FOCUS:
            Editor.beginDragEl();
        case EditorStates.EL_DRAGGING:
            Editor.dragEl(dx, dy);
            break;
        case EditorStates.EL_RESIZING:
            ResizeBars.resizeEl(dx, dy);
            break;
    }
}).mouseup(function () {
    switch (Editor.state) {
        case EditorStates.SELF_DRAGGING:
            Editor.endDragSelf();
            Editor.enableTransition(true);
            break;
        case EditorStates.EL_DRAGGING:
            Editor.endDragEl();
            break;
        case EditorStates.EL_RESIZING:
            ResizeBars.endResizeEl();
            break;
        case EditorStates.TXT_EDITING:
            TextEl.displaySelectedProperties();
            break;
        case EditorStates.NONE:
            break;
        default:
            Editor.clearTarget();
    }
});
$(document)
    .keydown(function (e) {
    if (e.keyCode === 46) {
        Editor.deleteElement();
    }
    if (e.ctrlKey) {
        if (e.key === '-') {
            e.preventDefault();
            Editor.zoom(10);
        }
        else if (e.key === '+') {
            e.preventDefault();
            Editor.zoom(-10);
        }
    }
});
function preventScroll(e) {
    if (e.ctrlKey) {
        e.preventDefault();
        Editor.zoom(Math.sign(e.deltaY) * 10);
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
function hRenderStyleBtnClick(index) {
    const data = serialize();
    changeRenderStyle(index);
    loadElements(data);
}
function changeRenderStyle(newIndex) {
    renderStyleState.style = RenderStyles[newIndex];
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
    $cardContainer.append(renderStyleState.style.pageGen(Editor.storage.loadedCard));
}
const hPageSwitch = function (direction) {
    renderStyleState.style.hPageChanged(direction);
    renderStyleState.getActiveDot().removeClass('active');
    renderStyleState.currentDotIndex = mod(renderStyleState.currentDotIndex + direction, renderStyleState.dots.length);
    renderStyleState.getActiveDot().addClass('active');
    $pageLabel.text(renderStyleState.getActiveLabel());
};
{
    const $addBtnContainer = $('#add-el-btns');
    for (const [k, v] of Object.entries(Elements)) {
        $addBtnContainer.append($(`<button class="addElBtn" onclick="spawnNewEl('${k}')">${v.displayName}</button>`));
    }
}
$('#removeResize').mousedown(function (e) {
    Editor.storage.$target.css({
        width: "",
        height: "",
    }).mouseup(stopPropagation);
});
$("#logoRotation").change(function (e) {
    Editor.storage.$target.css('transform', 'rotate(' + $(this).val() + 'deg)');
}).mouseup(stopPropagation);
$(".alignmentBtn").click(function () {
    Editor.storage.$target.css('text-align', $(this).val());
}).mouseup(stopPropagation);
$(".fontTypeButton").click(hChangeFontType).mouseup(stopPropagation);
$('#save-btn').click(function () {
    if (saveSelect.value === 'Server') {
        submit(false);
    }
    else {
        download();
    }
});
const saveSelect = new SelectEx($('#save-select-ex'));
saveSelect.value = 'Server';
$('#tutorial').click(showTutorial);
$('#del-btn')
    .mouseup(stopPropagation)
    .click(Editor.deleteElement);
const $colorpicker = $('#colorpicker').mousedown(Editor.saveSelection).change(function (e) {
    const sel = Editor.loadSelection();
    const color = $colorpicker.val();
    makeNodesFromSelection(sel.getRangeAt(0), function (curr) {
        $(curr).css('color', color + '');
    });
});
const $fontSelect = $('#font-select')
    .mousedown(Editor.saveSelection)
    .mouseup(stopPropagation);
Fonts.$options
    .mousedown(stopPropagation)
    .click(function (e) {
    if (e.target.nodeName !== 'P')
        return;
    Fonts.currentSelection = e.target.textContent;
    Fonts.displaySelected();
    Editor.loadSelection();
    hFontChanged();
});
$fontSelect.children('p').click(function (e) {
    e.stopPropagation();
    Fonts.$options.css('visibility', 'visible');
});
const $fontSizeSelect = $('#fontSizeSelect')
    .mousedown(Editor.saveSelection)
    .mouseup(stopPropagation)
    .change(function (e) {
    const fontSize = e.target.value;
    const sel = Editor.loadSelection();
    makeNodesFromSelection(sel.getRangeAt(0), function (curr) {
        $(curr).css('font-size', fontSize + 'pt');
    });
});
const $lhSpinner = $('#lh-spinner')
    .mousedown(Editor.saveSelection)
    .mouseup(stopPropagation)
    .change(function (e) {
    const lineHeight = e.target.value;
    Editor.loadSelection();
    Editor.storage.$target.css('line-height', lineHeight);
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
$.get(`${web2print.links.apiUrl}card/${Parameters.card}`)
    .then(loadCard)
    .catch(function () {
    alert(Parameters.card
        ? 'Die Karte "' + Parameters.card + '" konnte nicht geladen werden!'
        : 'Es wurde keine Karte gefunden!');
    location.href = web2print.links.basePath + 'tileview/tileview.html';
});
$.get(web2print.links.apiUrl + 'fonts')
    .then(Fonts.loadFonts)
    .catch(function (e) {
    alert('[fatal] something went wrong loading fonts: ' + JSON.stringify(e));
});
if (Cookie.getValue('tutorial') !== 'no') {
    showTutorial();
}
function showTutorial() {
    const $tutOver = $('<div style="position:absolute; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.66)">' +
        '<div class="center" style="white-space: normal; overflow: auto; width: 700px; max-width:70%; max-height:70%; background-color:lightgray; padding:5px 5px 15px 5px;">' +
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
        '<p>Um Text zu bewegen klicken Sie auf das Textfeld und lassen die linke Maustate gerückt. Nun können Sie den Text mit der Maus bewegen.<br>' +
        'Wenn Sie in das Textfeld rein klicken wird ein Rahmen um das Feld angezeigt. Nun können Sie die Textbearbeitungswerkzeuge aus der Werkzeugleiste nutzen.</p>' +
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
        '<h3>Bearbeiten von Bildern:</h3>' +
        '<img src="./ImageResizeTut.gif" alt="tut" width="45%" height="45%" style="float: left; padding-right: 5px">' +
        '<p>Um ein Bild zu verschieben klicken Sie auf das Bild und halten Sie die linke Maustaste gedrückt.<br>' +
        'Nun können Sie das Bild verschieben.<br>' +
        'Um ein Bild zu vergrößern/verkleinern klicken Sie auf das Bild. Es erscheint ein Rahmen mit Kästchen an den Ecken.<br>' +
        'Klicken Sie auf eines der Kästchen und halten Sie die linke Maustaste gedrückt, bewegen Sie nun die Maus wird das Bild größer/kleiner.</p>' +
        '</div><br style="clear: left">' +
        '<div>' +
        '<h3>Bewegen und Zoomen der Karte:</h3>' +
        '<img src="./CardMoveTut.gif" alt="tut" width="45%" height="45%" style="float: left; padding-right: 5px">' +
        '<p>Durch gedrückt halten vom Mausrad (Maustaste 3) kann die Karte im Editor bewegt werden.<br>' +
        'Um auf den Anfangszustand zu kommen können Sie auf "Zentrieren" drücken.</p>' +
        '<br style="clear: left">' +
        '<img src="./ScrollTut.gif" alt="tut" width="45%" height="45%" style="float: left; padding-right: 5px">' +
        '<p>Halten Sie die Steuerungstaste (STRG/CTRL) und scrollen Sie gleichzeitig, so können Sie in der Karte zoomen.<br>' +
        'Um auf den Anfangszustand zu kommen können Sie auf "Zentrieren" drücken.</p>' +
        '</div>' +
        '<br style="clear: left">' +
        '<div>' +
        '<h3>Ändern der Ansicht:</h3>' +
        '<img src="./ViewsTut.gif" alt="tut" width="45%" height="45%" style="float: left; padding-right: 5px">' +
        '<p>Mit den dem entsprechenden Knöpfen können Sie die Ansicht ändern.<br>' +
        '"Druckbogen" - Die Seite wird als Druckbogen angezeigt (Innen- und Außenseite)<br>' +
        '"einzelne Seiten" - Die Karte kann im Editor auf geklappt werden.</p>' +
        '</div><br style="clear: left">' +
        '<div>' +
        '<h3>Abschließen des Editierens</h3>' +
        '<p>Wenn Sie mit dem Editieren der Karte fertig sind können Sie mit dem "PDF erzeugen" Knopf ihr Nutzer-Design' +
        'zu Kettcards abschicken.</p>' +
        '</div>' +
        '<input type="checkbox" id="dont-show-again" style="margin:10px 2px 0 0;">' +
        '<label for="dont-show-again">nicht erneut anzeigen</label>' +
        '<button style="padding: 16px 16px; margin:5px 0 0 0;float: right;">Ok</button></div></div>');
    const dontShowAgain = $tutOver.find('#dont-show-again')[0];
    dontShowAgain.checked = Cookie.getValue('tutorial') === 'no';
    $tutOver.find('button').click(function () {
        if (dontShowAgain.checked) {
            Cookie.set('tutorial', 'no');
        }
        $tutOver.remove();
    });
    $body.append($tutOver);
}
