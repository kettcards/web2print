package de.kettcards.web2print.pdf.textBox;

import de.kettcards.web2print.pdf.Document;

import java.io.IOException;
import java.util.List;

/**
 * applies center alignment for each paragraph
 */
public class CenterAlignedTextBoxData extends TextBoxData {

    public CenterAlignedTextBoxData(float x, float y, float width, float height, List<TextParagraph> textParagraphs, float lineHeight) {
        super(x, y, width, height, textParagraphs, lineHeight);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void setInitialBoxPosition(Document doc, TextParagraph firstParagraph) throws IOException {
        doc.stream().newLineAtOffset(x, y + height);

    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void setParagraphBeginPosition(Document doc, float paragraphWidth) throws IOException {
        doc.stream().newLineAtOffset((width - paragraphWidth) / 2, 0);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void setParagraphEndPosition(Document doc, float paragraphWidth) throws IOException {
        doc.stream().newLineAtOffset(-((width - paragraphWidth) / 2), 0);
    }

}
