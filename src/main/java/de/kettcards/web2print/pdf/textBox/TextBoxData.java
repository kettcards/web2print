package de.kettcards.web2print.pdf.textBox;

import de.kettcards.web2print.pdf.BoxData;
import de.kettcards.web2print.pdf.Document;

import java.io.IOException;
import java.util.List;

/**
 * abstract representation for text field
 */
public abstract class TextBoxData extends BoxData {

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
        for (var current = firstP;; current = paragraphIterator.next()) {
            writeParagraph(doc, current);
            if (!paragraphIterator.hasNext())
                break;
        }
        doc.stream().endText();
    }

    public abstract void setInitialBoxPosition(Document doc, TextParagraph firstParagraph) throws IOException;

    public abstract void setParagraphBeginPosition(Document doc, float paragraphWidth) throws IOException;

    public abstract void setParagraphEndPosition(Document doc, float paragraphWidth) throws IOException;


    public void writeParagraph(Document doc, TextParagraph paragraph) throws IOException {
        doc.stream().setLeading(paragraph.getLargestFontSize());
        doc.stream().newLine();
        float paragraphWidth = 0;
        for(var current : paragraph.iterator()) { //calculate total width
            var font = doc.getFont(current.getFontName(), current.getFontStyle());
            var runWidth = current.getFontSize() * font.getStringWidth(current.getText()) / 1000;
            paragraphWidth += runWidth;
        }
        setParagraphBeginPosition(doc, paragraphWidth);
        for(var current : paragraph.iterator()) {
            writeSpan(doc, current);
        }
        setParagraphEndPosition(doc, paragraphWidth);
    }

    public void writeSpan(Document doc, TextSpan textSpan) throws IOException {
        var font = doc.getFont(textSpan.getFontName(), textSpan.getFontStyle());
        doc.stream().setFont(font, textSpan.getFontSize());
        doc.stream().showText(textSpan.getText());
    }

}
