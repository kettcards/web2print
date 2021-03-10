package de.kettcards.web2print.pdf.textBox;

import de.kettcards.web2print.model.fonts.SpanDimension;
import de.kettcards.web2print.pdf.Document;
import org.apache.fontbox.ttf.TrueTypeFont;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * immutable p tag representation
 */
public class TextParagraph {

    private final List<TextSpan> textSpans;

    public TextParagraph(List<TextSpan> textSpans){
        this.textSpans = new ArrayList<>(textSpans);
    }

    /**
     *
     * @param doc document to obtain the Fonts
     * @return the largest font size present in the given spans
     */
    public SpanDimension getLargestFontSize(Document doc, float currentLineHeight) throws IOException {
        SpanDimension largestDim = SpanDimension.getZeroInstance();
        for (var textSpan : textSpans) {
            TrueTypeFont ttf = doc.getFont(textSpan.getFontName(),textSpan.getFontStyle()).getValue();
            var hhea = ttf.getHorizontalHeader();
            var head = ttf.getHeader();
            SpanDimension currentDim = new SpanDimension(hhea.getAscender(), hhea.getDescender(), head.getUnitsPerEm(), textSpan.getFontSize(), currentLineHeight);
            if (currentDim.getActualClientHeight() * currentLineHeight > largestDim.getActualClientHeight() * currentLineHeight)
                largestDim = currentDim;
        }
        return largestDim;
    }

    /**
     *
     * @return spans inside this paragraph
     */
    public List<TextSpan> iterator() {
        return Collections.unmodifiableList(textSpans);
    }

}
