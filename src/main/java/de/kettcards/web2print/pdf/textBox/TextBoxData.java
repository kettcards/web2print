package de.kettcards.web2print.pdf.textBox;

import de.kettcards.web2print.model.fonts.SpanDimension;
import de.kettcards.web2print.pdf.BoxData;
import de.kettcards.web2print.pdf.Document;

import java.io.IOException;
import java.util.List;

/**
 * abstract representation for text field
 */
public abstract class TextBoxData extends BoxData {

    /**
     * list of paragraphs inside this text box
     */
    protected final List<TextParagraph> textParagraphs;

    /**
     * @param x              x position in pt
     * @param y              y position in pt
     * @param width          box width
     * @param height         box height
     * @param textParagraphs text paragraphs
     */
    public TextBoxData(float x, float y, float width, float height, List<TextParagraph> textParagraphs) {
        super(x, y, width, height);
        this.textParagraphs = textParagraphs;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void apply(Document doc) throws IOException {
        doc.stream().beginText();
        doc.stream().newLineAtOffset(doc.getXOffset(), doc.getYOffset());
        var paragraphIterator = textParagraphs.iterator();
        TextParagraph firstP;
        if (paragraphIterator.hasNext()) {
            firstP = paragraphIterator.next();
        } else
            return;

        setInitialBoxPosition(doc, firstP);
        SpanDimension lastLineDim = null;
        for (var current = firstP;; current = paragraphIterator.next()) {
            lastLineDim = writeParagraph(doc, current, lastLineDim);
            if (!paragraphIterator.hasNext())
                break;
        }
        doc.stream().endText();
    }

    public abstract void setInitialBoxPosition(Document doc, TextParagraph firstParagraph) throws IOException;

    public abstract void setParagraphBeginPosition(Document doc, float paragraphWidth) throws IOException;

    public abstract void setParagraphEndPosition(Document doc, float paragraphWidth) throws IOException;

    /**
     * writes paragraph into given document
     * @param doc document
     * @param paragraph p
     * @param lastLineDim dim
     * @return last dim
     * @throws IOException if writing to doc is not possible
     */
    public SpanDimension writeParagraph(Document doc, TextParagraph paragraph, SpanDimension lastLineDim) throws IOException {
        SpanDimension largestDim = paragraph.getLargestFontSize(doc);
        float leading;
        if(lastLineDim == null) {
            leading = largestDim.getFirstLineBaseline(SpanDimension.LINE_HEIGHT);
        }else{
            leading = largestDim.getNextLineBaseline(lastLineDim, SpanDimension.LINE_HEIGHT, SpanDimension.LINE_HEIGHT);
        }
        doc.stream().setLeading(leading);
        doc.stream().newLine();
        float paragraphWidth = 0;
        for(var current : paragraph.iterator()) { //calculate total width
            var font = doc.getFont(current.getFontName(), current.getFontStyle());
            var runWidth = current.getFontSize() * font.getKey().getStringWidth(current.getText()) / 1000;
            paragraphWidth += runWidth;
        }
        setParagraphBeginPosition(doc, paragraphWidth);
        for(var current : paragraph.iterator()) {
            writeSpan(doc, current);
        }
        setParagraphEndPosition(doc, paragraphWidth);

        return largestDim;
    }

    /**
     * writes span to given document
     * @param doc document
     * @param textSpan span
     * @throws IOException if span cant be written into given document
     */
    public void writeSpan(Document doc, TextSpan textSpan) throws IOException {
        var font = doc.getFont(textSpan.getFontName(), textSpan.getFontStyle());
        doc.stream().setFont(font.getKey(), textSpan.getFontSize());
        doc.stream().showText(textSpan.getText());
    }

}
