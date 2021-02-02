package de.kettcards.web2print.pdf.textBox;

import de.kettcards.web2print.pdf.Document;

import java.io.IOException;
import java.util.List;

/**
 * applies right alignment for each paragraph
 */
public class RightAlignedTextBoxData extends TextBoxData {

    /**
     * {@inheritDoc}
     */
    public RightAlignedTextBoxData(float x, float y, float width, float height, List<TextParagraph> textParagraphs) {
        super(x, y, width, height, textParagraphs);
    }

    @Override
    public void setInitialBoxPosition(Document doc, TextParagraph firstParagraph) throws IOException {
        doc.stream().newLineAtOffset(x + width, y + height);
    }

    @Override
    public void setParagraphBeginPosition(Document doc, float paragraphWidth) throws IOException {
        doc.stream().newLineAtOffset(-paragraphWidth, 0);
    }

    @Override
    public void setParagraphEndPosition(Document doc, float paragraphWidth) throws IOException {
        doc.stream().newLineAtOffset(paragraphWidth, 0);

    }

}
