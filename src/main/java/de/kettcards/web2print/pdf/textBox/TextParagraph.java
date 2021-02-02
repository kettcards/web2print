package de.kettcards.web2print.pdf.textBox;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * immutable p tag representation
 */
public class TextParagraph {

    private final List<TextSpan> textSpans;

    private final transient float largestFontSize;

    public TextParagraph(List<TextSpan> textSpans) {
        this.textSpans = new ArrayList<>(textSpans);
        this.largestFontSize = getLargestFontSize(textSpans);
    }

    /**
     *
     * @return the largest font size present inside the current paragraph
     */
    public float getLargestFontSize() {
        return largestFontSize;
    }

    /**
     *
     * @param textSpans spans
     * @return the largest font size present in the given spans
     */
    public static float getLargestFontSize(List<TextSpan> textSpans) {
        float size = 0;
        for (var textSpan : textSpans) {
            var newSize = textSpan.getFontSize();
            if (newSize > size)
                size = newSize;
        }
        return size;
    }

    /**
     *
     * @return spans inside this paragraph
     */
    public List<TextSpan> iterator() {
        return Collections.unmodifiableList(textSpans);
    }

}
