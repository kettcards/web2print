package de.kettcards.web2print.pdf.textBox;

import de.kettcards.web2print.pdf.Document;

import java.io.IOException;
import java.util.List;

/**
 * applies center alignment for each paragraph
 */
public class CenterAlignedTextBoxData extends TextBoxData {

    /**
     * {@inheritDoc}
     */
    public CenterAlignedTextBoxData(float x, float y, float width, float height, List<TextParagraph> textParagraphs) {
        super(x, y, width, height, textParagraphs);
    }

    @Override
    public void setInitialBoxPosition(Document doc, TextParagraph firstParagraph) throws IOException {
        doc.stream().newLineAtOffset(x, y + height);

    }

    @Override
    public void setParagraphBeginPosition(Document doc, float paragraphWidth) throws IOException {
        doc.stream().newLineAtOffset((width -paragraphWidth) / 2, 0);
    }

    @Override
    public void setParagraphEndPosition(Document doc, float paragraphWidth) throws IOException {
        doc.stream().newLineAtOffset(-((width -paragraphWidth) / 2), 0);
    }

}
